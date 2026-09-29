"use strict";

/**
 * Los únicos puestos válidos pasan a ser:
 *   chofer · chofer_coordinador · recepcionista · supervisor
 *
 * Los valores anteriores se convierten así:
 *   cajero / cajera / recepción…      → recepcionista
 *   coordinador / chofer coordinador  → chofer_coordinador
 *   conductor                         → chofer
 *   supervisora                       → supervisor
 *   "polivalente" y cualquier otro    → NULL (sin puesto, para que un administrador lo elija)
 *
 * Antes de tocar nada se guarda el puesto original de cada empleado que cambia
 * en `employees_position_backup`, para poder revisarlo o revertir (`down`).
 * Al final la restricción CHECK se recrea ya validada.
 */

const NEW_POSITIONS = ["chofer", "chofer_coordinador", "recepcionista", "supervisor"];
const OLD_POSITIONS = ["chofer", "cajero", "supervisor", "polivalente"];

// [valor normalizado (minúsculas, sin espacios extremos), puesto nuevo]
const MAPPINGS = [
  [["cajero", "cajera", "cajero/a", "recepcion", "recepción", "recepcionista"], "recepcionista"],
  [
    ["coordinador", "coordinadora", "chofer coordinador", "chofer coordinadora", "chofer_coordinador"],
    "chofer_coordinador",
  ],
  [["chofer", "conductor", "conductora"], "chofer"],
  [["supervisor", "supervisora"], "supervisor"],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS employees_position_backup (
           "employeeId" INTEGER PRIMARY KEY,
           "position" TEXT,
           "backedUpAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
         )`,
        { transaction },
      );

      // Solo los empleados cuyo puesto va a cambiar (o quedar vacío).
      await sequelize.query(
        `INSERT INTO employees_position_backup ("employeeId", "position")
         SELECT id, position FROM employees
         WHERE position IS NOT NULL AND position NOT IN (:valid)
         ON CONFLICT ("employeeId") DO NOTHING`,
        { replacements: { valid: NEW_POSITIONS }, transaction },
      );

      // La restricción anterior no admite los puestos nuevos.
      await sequelize.query(`ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_position`, {
        transaction,
      });

      for (const [variants, position] of MAPPINGS) {
        await sequelize.query(
          `UPDATE employees SET position = :position
           WHERE lower(btrim(position)) IN (:variants) AND position <> :position`,
          { replacements: { position, variants }, transaction },
        );
      }

      // Lo que no se reconoce queda sin puesto (el respaldo conserva el original).
      await sequelize.query(
        `UPDATE employees SET position = NULL
         WHERE position IS NOT NULL AND position NOT IN (:valid)`,
        { replacements: { valid: NEW_POSITIONS }, transaction },
      );

      await sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT chk_employees_position
         CHECK (position IS NULL OR position IN (:valid))`,
        { replacements: { valid: NEW_POSITIONS }, transaction },
      );
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(`ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_position`, {
        transaction,
      });

      await sequelize.query(
        `UPDATE employees e SET position = b."position"
         FROM employees_position_backup b
         WHERE e.id = b."employeeId"`,
        { transaction },
      );
      await sequelize.query(`DROP TABLE IF EXISTS employees_position_backup`, { transaction });

      // Como estaba: sin validar las filas existentes.
      await sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT chk_employees_position
         CHECK (position IS NULL OR position IN (:old))
         NOT VALID`,
        { replacements: { old: OLD_POSITIONS }, transaction },
      );
    });
  },
};
