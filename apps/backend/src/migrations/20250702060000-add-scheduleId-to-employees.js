"use strict";

// Reconstruida (2026-07-31): el archivo original se perdió; se dedujo del
// esquema final de la BD (FK employees_scheduleId_fkey ON UPDATE CASCADE
// ON DELETE SET NULL) y del modelo HoursWorked.
// Idempotente: segura aunque el SequelizeMeta de la BD ya contenga (o no)
// la entrada y la columna/FK ya existan (p. ej. BD de producción).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE employees ADD COLUMN IF NOT EXISTS "scheduleId" integer',
    );
    const [fk] = await queryInterface.sequelize.query(
      `SELECT 1 FROM pg_constraint
       WHERE conname IN ('employees_scheduleId_fkey', 'employees_scheduleid_fkey')`,
    );
    if (fk.length === 0) {
      await queryInterface.sequelize.query(
        `ALTER TABLE employees ADD CONSTRAINT employees_scheduleId_fkey
         FOREIGN KEY ("scheduleId") REFERENCES schedule(id)
         ON UPDATE CASCADE ON DELETE SET NULL`,
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_scheduleId_fkey',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE employees DROP COLUMN IF EXISTS "scheduleId"',
    );
  },
};
