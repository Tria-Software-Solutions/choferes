"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      // employees: búsquedas por nombre (listado, filtro de texto)
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_employees_name
         ON employees ("firstName", "lastName")`,
        { transaction: t },
      );

      // employees: búsqueda por cédula (campo único de hecho, no declarado como tal)
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_employees_national_id
         ON employees ("nationalId")
         WHERE "nationalId" IS NOT NULL`,
        { transaction: t },
      );

      // payments: reportes y listados por año + quincena
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_payments_year_biweek
         ON payments ("year", "biweekNumber")`,
        { transaction: t },
      );

      // vacations: detección de solapamiento de fechas por empleado
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_vacations_employee_dates
         ON vacations ("employeeId", "startDate", "endDate")`,
        { transaction: t },
      );

      // hours_worked: consultas por fecha sin filtro de empleado (informes globales, scheduler).
      // Plain index on the timestamp column — service queries use BETWEEN on the full timestamp.
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_hours_worked_date
         ON hours_worked ("date")`,
        { transaction: t },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_employees_name`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_employees_national_id`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_payments_year_biweek`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_vacations_employee_dates`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_hours_worked_date`);
  },
};
