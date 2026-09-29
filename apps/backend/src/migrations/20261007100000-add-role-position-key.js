"use strict";

/**
 * Los roles de acceso dejan de depender del nombre para saber a qué puesto
 * siguen: se agrega `roles.positionKey`, que apunta a la clave del puesto
 * (ver POSITION_ROLE_NAMES en @choferes/shared).
 *
 * Con esto, renombrar o borrar un rol de puesto deja de romper en silencio a
 * todos los empleados que lo tienen: la API lo rechaza con 409 y sólo se pueden
 * editar sus permisos.
 *
 * El backfill es por nombre, una vez, y de forma idempotente. Los roles
 * personalizados quedan con `positionKey` NULL.
 */

const { QueryTypes } = require("sequelize");
const { POSITION_ROLE_NAMES } = require("@choferes/shared");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `ALTER TABLE roles ADD COLUMN IF NOT EXISTS "positionKey" VARCHAR(255)`,
        { transaction },
      );

      for (const [positionKey, roleName] of Object.entries(POSITION_ROLE_NAMES)) {
        await sequelize.query(
          `UPDATE roles SET "positionKey" = :positionKey
           WHERE name = :roleName AND "positionKey" IS NULL`,
          { replacements: { positionKey, roleName }, transaction },
        );
      }

      // Un puesto no puede tener dos roles: la columna es única.
      await sequelize.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS roles_position_key_unique
         ON roles ("positionKey")`,
        { transaction },
      );

      // Si algún rol de puesto no existe con ese nombre (se renombró a mano, o la
      // base no pasó por 20261006100000), su gente se queda sin la protección de
      // esta columna sin que nada lo diga. Se aborta la migración en vez de
      // dejar el sistema a medio proteger.
      const [{ missing }] = await sequelize.query(
        `SELECT ARRAY_AGG(expected."roleName") AS missing
         FROM unnest(ARRAY[:names]::text[]) AS expected("roleName")
         WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.name = expected."roleName")`,
        {
          replacements: { names: Object.values(POSITION_ROLE_NAMES) },
          transaction,
          type: QueryTypes.SELECT,
        },
      );
      if (missing?.length) {
        throw new Error(
          `No se puede rellenar roles."positionKey": faltan los roles ${missing.join(", ")}. ` +
            "Revisa la tabla roles antes de migrar.",
        );
      }
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(`DROP INDEX IF EXISTS roles_position_key_unique`, { transaction });
      await sequelize.query(`ALTER TABLE roles DROP COLUMN IF EXISTS "positionKey"`, { transaction });
    });
  },
};
