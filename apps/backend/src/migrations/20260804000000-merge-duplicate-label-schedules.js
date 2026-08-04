"use strict";

/* eslint-disable no-console */

// Consolida horarios que comparten el mismo label normalizado (p. ej. dos
// filas "Avenida Escazú": una entre semana y otra los domingos) en un solo
// horario que cubre la unión de días con horas por día.
//
// - Sobreviviente: el horario con el id menor.
// - Días: unión de días en orden canónico (lunes a domingo).
// - Horas por día: entrada de schedule_day del horario que cubre el día
//   (prioriza horas configuradas por día; fallback al valor plano `hours`).
// - Las referencias (hours_worked, employees) se reasignan al sobreviviente
//   ANTES de borrar los absorbidos, porque hours_worked.scheduleId tiene
//   ON DELETE CASCADE y borrar el horario destruiría su historial.
// - Idempotente: tras ejecutarse no quedan labels duplicados, así que
//   volver a correrla es un no-op. Se aplica localmente con `npm run
//   migrate:dev` y automáticamente en el pre-deploy de Render.
//
// down no restaura datos (consolidación destructiva): solo elimina la tabla
// de backup de auditoría, donde quedan las filas absorbidas para referencia.

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const normalizeLabel = (label) =>
  String(label || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS schedule_merge_backup (
        id serial PRIMARY KEY,
        norm_label text NOT NULL,
        survivor_id integer NOT NULL,
        absorbed_ids integer[] NOT NULL,
        survivor_original_days text[],
        survivor_original_schedule_days jsonb,
        absorbed_schedule_rows jsonb
      )
    `);

    const [sdTable] = await sequelize.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'schedule_day'`,
      { type: sequelize.QueryTypes.SELECT },
    );
    const hasScheduleDayTable = Boolean(sdTable);

    const schedules = await sequelize.query(
      "SELECT id, label, days, hours FROM schedule ORDER BY id",
      { type: sequelize.QueryTypes.SELECT },
    );

    const scheduleDaysBySchedule = new Map();
    if (hasScheduleDayTable) {
      const scheduleDayRows = await sequelize.query(
        'SELECT "scheduleId", day, hours FROM schedule_day',
        { type: sequelize.QueryTypes.SELECT },
      );
      for (const row of scheduleDayRows) {
        if (!scheduleDaysBySchedule.has(row.scheduleId)) {
          scheduleDaysBySchedule.set(row.scheduleId, []);
        }
        scheduleDaysBySchedule.get(row.scheduleId).push({ day: row.day, hours: row.hours });
      }
    }

    const groups = new Map();
    for (const s of schedules) {
      const key = normalizeLabel(s.label);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(s);
    }

    let mergedGroups = 0;

    for (const [normLabel, group] of groups) {
      if (group.length < 2) {
        continue;
      }

      mergedGroups += 1;

      const sorted = [...group].sort((a, b) => a.id - b.id);
      const survivor = sorted[0];
      const absorbed = sorted.slice(1);
      const absorbedIds = absorbed.map((a) => a.id);

      // Unión de días en orden canónico (lunes a domingo)
      const daySet = new Set();
      for (const s of group) {
        for (const d of s.days || []) {
          daySet.add(d);
        }
      }
      const mergedDays = DAYS_OF_WEEK.filter((d) => daySet.has(d));

      // Horas por día: prioriza el horario con schedule_day configurado para
      // ese día; empate resuelto por el id menor. Fallback al `hours` plano.
      const mergedScheduleDays = mergedDays.map((day) => {
        const covering = group.filter((s) => (s.days || []).includes(day));
        const withPerDay = covering.filter((s) =>
          (scheduleDaysBySchedule.get(s.id) || []).some((sd) => sd.day === day),
        );
        const pool = withPerDay.length > 0 ? withPerDay : covering;
        const chosen = [...pool].sort((a, b) => a.id - b.id)[0];
        const perDay = (scheduleDaysBySchedule.get(chosen.id) || []).find((sd) => sd.day === day);
        return { day, hours: perDay ? perDay.hours : chosen.hours || 0 };
      });

      // Snapshot de auditoría (absorbidos + estado original del sobreviviente)
      const survivorOrigDays = survivor.days || [];
      const survivorOrigSd = (scheduleDaysBySchedule.get(survivor.id) || []).map((sd) => ({ ...sd }));
      const absorbedRows = absorbed.map((a) => ({
        id: a.id,
        label: a.label,
        days: a.days,
        hours: a.hours,
        scheduleDays: (scheduleDaysBySchedule.get(a.id) || []).map((sd) => ({ ...sd })),
      }));

      await sequelize.transaction(async (t) => {
        await sequelize.query(
          `INSERT INTO schedule_merge_backup
             (norm_label, survivor_id, absorbed_ids, survivor_original_days,
              survivor_original_schedule_days, absorbed_schedule_rows)
           VALUES ($1, $2, $3::int[], $4::text[], $5::jsonb, $6::jsonb)`,
          {
            bind: [normLabel, survivor.id, absorbedIds, survivorOrigDays, JSON.stringify(survivorOrigSd), JSON.stringify(absorbedRows)],
            transaction: t,
          },
        );

        await sequelize.query(
          "UPDATE schedule SET days = $1::text[] WHERE id = $2",
          { bind: [mergedDays, survivor.id], transaction: t },
        );

        if (hasScheduleDayTable) {
          await sequelize.query(
            'DELETE FROM schedule_day WHERE "scheduleId" = $1',
            { bind: [survivor.id], transaction: t },
          );

          if (mergedScheduleDays.length > 0) {
            const now = new Date();
            await queryInterface.bulkInsert(
              "schedule_day",
              mergedScheduleDays.map((sd) => ({
                scheduleId: survivor.id,
                day: sd.day,
                hours: sd.hours,
                createdAt: now,
                updatedAt: now,
              })),
              { transaction: t },
            );
          }
        }

        await sequelize.query(
          'UPDATE hours_worked SET "scheduleId" = $1 WHERE "scheduleId" = ANY($2::int[])',
          { bind: [survivor.id, absorbedIds], transaction: t },
        );
        await sequelize.query(
          'UPDATE employees SET "scheduleId" = $1 WHERE "scheduleId" = ANY($2::int[])',
          { bind: [survivor.id, absorbedIds], transaction: t },
        );
        await sequelize.query(
          "DELETE FROM schedule WHERE id = ANY($1::int[])",
          { bind: [absorbedIds], transaction: t },
        );
      });

      console.log(
        `[merge-schedules] "${survivor.label}" (id=${survivor.id}) absorbió los ids ${absorbedIds.join(", ")} → días: ${mergedDays.join(", ")}, horas/día: ${mergedScheduleDays.map((sd) => `${sd.day}=${sd.hours}`).join(", ")}`,
      );
    }

    if (mergedGroups === 0) {
      console.log("[merge-schedules] No hay horarios duplicados por label. Nada que fusionar.");
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DROP TABLE IF EXISTS schedule_merge_backup");
  },
};
