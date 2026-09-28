"use strict";

// Adds CHECK constraints to string columns that hold a fixed set of values.
// This protects data integrity at the DB level — no invalid value can enter
// through direct queries, migrations, or backend bugs.
//
// NOTE: employees.position is intentionally excluded because the column
// accepts legacy free-text values stored before the EmployeePosition type
// was introduced. Adding a CHECK there would reject those existing rows.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      // employees.terminationReason
      await queryInterface.sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT chk_employees_termination_reason
         CHECK ("terminationReason" IN (
           'renuncia','despido','mutuo_acuerdo','fin_contrato',
           'jubilacion','fallecimiento','otro'
         ))`,
        { transaction: t },
      );

      // employees.gender
      await queryInterface.sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT chk_employees_gender
         CHECK ("gender" IN ('Masculino','Femenino'))`,
        { transaction: t },
      );

      // employees.scheduledTerminationReason (same set as terminationReason)
      await queryInterface.sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT chk_employees_scheduled_termination_reason
         CHECK ("scheduledTerminationReason" IN (
           'renuncia','despido','mutuo_acuerdo','fin_contrato',
           'jubilacion','fallecimiento','otro'
         ))`,
        { transaction: t },
      );

      // payments.status
      await queryInterface.sequelize.query(
        `ALTER TABLE payments
         ADD CONSTRAINT chk_payments_status
         CHECK (status IN ('pending','sent','cancelled'))`,
        { transaction: t },
      );

      // payments.payPeriod
      await queryInterface.sequelize.query(
        `ALTER TABLE payments
         ADD CONSTRAINT chk_payments_pay_period
         CHECK ("payPeriod" IN ('biweekly'))`,
        { transaction: t },
      );

      // vacations.status
      await queryInterface.sequelize.query(
        `ALTER TABLE vacations
         ADD CONSTRAINT chk_vacations_status
         CHECK (status IN ('pending','approved','rejected'))`,
        { transaction: t },
      );

      // disciplinary_actions.type
      await queryInterface.sequelize.query(
        `ALTER TABLE disciplinary_actions
         ADD CONSTRAINT chk_disciplinary_type
         CHECK (type IN (
           'llamada_atencion','amonestacion_verbal','amonestacion_escrita',
           'suspension','otra'
         ))`,
        { transaction: t },
      );

      // disciplinary_actions.severity
      await queryInterface.sequelize.query(
        `ALTER TABLE disciplinary_actions
         ADD CONSTRAINT chk_disciplinary_severity
         CHECK (severity IN ('leve','grave','muy_grave'))`,
        { transaction: t },
      );

      // employee_licenses.licenseType (COSEVI categories)
      await queryInterface.sequelize.query(
        `ALTER TABLE employee_licenses
         ADD CONSTRAINT chk_license_type
         CHECK ("licenseType" IN (
           'A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','D3','E'
         ))`,
        { transaction: t },
      );

      // notifications.type
      await queryInterface.sequelize.query(
        `ALTER TABLE notifications
         ADD CONSTRAINT chk_notifications_type
         CHECK (type IN ('info','success','warning','error'))`,
        { transaction: t },
      );

      // notifications.priority
      await queryInterface.sequelize.query(
        `ALTER TABLE notifications
         ADD CONSTRAINT chk_notifications_priority
         CHECK (priority IN ('low','medium','high'))`,
        { transaction: t },
      );
    });
  },

  async down(queryInterface) {
    const drops = [
      ["employees", "chk_employees_termination_reason"],
      ["employees", "chk_employees_gender"],
      ["employees", "chk_employees_scheduled_termination_reason"],
      ["payments", "chk_payments_status"],
      ["payments", "chk_payments_pay_period"],
      ["vacations", "chk_vacations_status"],
      ["disciplinary_actions", "chk_disciplinary_type"],
      ["disciplinary_actions", "chk_disciplinary_severity"],
      ["employee_licenses", "chk_license_type"],
      ["notifications", "chk_notifications_type"],
      ["notifications", "chk_notifications_priority"],
    ];
    for (const [table, name] of drops) {
      await queryInterface.sequelize.query(
        `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${name}`,
      );
    }
  },
};
