"use strict";

/**
 * Los puestos válidos pasan a ser los mismos que los roles de acceso, menos el
 * genérico "Usuario" (que no es un puesto):
 *
 *   chofer · chofer_coordinador · recepcionista · supervisor · administrativo · gerencia
 *
 * Se añaden los dos últimos porque Gerencia y Administrativo son roles reales
 * y sus titulares pueden tener ficha de empleado. No hay nada que normalizar:
 * son valores nuevos, no renombrados. La restricción CHECK se recrea con el
 * conjunto nuevo y `down` la deja como estaba.
 */

const NEW_POSITIONS = [
  "chofer",
  "chofer_coordinador",
  "recepcionista",
  "supervisor",
  "administrativo",
  "gerencia",
];
const OLD_POSITIONS = ["chofer", "chofer_coordinador", "recepcionista", "supervisor"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(`ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_position`, {
        transaction,
      });

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
      // Los dos puestos nuevos no existían antes: sus empleados quedan sin puesto
      // (el respaldo de 20261006000000 no los cubre, así que se pierden aquí).
      await sequelize.query(
        `UPDATE employees SET position = NULL WHERE position IN ('administrativo', 'gerencia')`,
        { transaction },
      );

      await sequelize.query(`ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_position`, {
        transaction,
      });

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
