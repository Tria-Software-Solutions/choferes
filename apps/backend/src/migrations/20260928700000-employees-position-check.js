"use strict";

// Adds a CHECK constraint on employees.position for new inserts/updates.
// NOT VALID skips validation of existing rows — legacy free-text values
// written before the EmployeePosition type was introduced are left in place.
//
// Once legacy rows have been cleaned up, run in psql:
//   ALTER TABLE employees VALIDATE CONSTRAINT chk_employees_position;
// That will fail if any row still has a non-enum value, making it easy to
// spot what needs fixing before enforcing the constraint fully.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE employees
       ADD CONSTRAINT chk_employees_position
       CHECK (position IS NULL OR position IN ('chofer','cajero','supervisor','polivalente'))
       NOT VALID`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_position`,
    );
  },
};
