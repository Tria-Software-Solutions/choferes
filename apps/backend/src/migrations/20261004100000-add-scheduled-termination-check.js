"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Idempotent: if a database already applied the previous version of
    // 20260928300000-add-enum-check-constraints (which also created this
    // constraint), the bare ADD CONSTRAINT below would abort the whole
    // migration run. Drop first so this is safe to apply anywhere.
    await queryInterface.sequelize.query(
      `ALTER TABLE employees
       DROP CONSTRAINT IF EXISTS chk_employees_scheduled_termination_reason`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE employees
       ADD CONSTRAINT chk_employees_scheduled_termination_reason
       CHECK ("scheduledTerminationReason" IN (
         'renuncia','despido','mutuo_acuerdo','fin_contrato',
         'jubilacion','fallecimiento','otro'
       ))`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_scheduled_termination_reason`,
    );
  },
};
