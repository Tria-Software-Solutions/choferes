"use strict";

// Converts hours_worked.date from TIMESTAMPTZ to DATE (DATEONLY).
//
// The old functional unique index used (date AT TIME ZONE 'UTC')::date to
// normalise the timestamp to a calendar day. With DATEONLY the column IS the
// calendar day, so the unique index simplifies to ("employeeId", "date").
//
// Backfill uses the same UTC normalisation to keep the data consistent with
// what the old index enforced.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add the new DATEONLY column beside the old one.
    await queryInterface.addColumn("hours_worked", "_date_new", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // 2. Backfill using the same UTC normalisation the old unique index used.
    await queryInterface.sequelize.query(
      `UPDATE hours_worked SET "_date_new" = ("date" AT TIME ZONE 'UTC')::date`,
    );

    // 3. Drop the old functional unique index (references the TIMESTAMPTZ column).
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS hours_worked_employeeId_date_unique`,
    );

    // 4. Drop the plain timestamp index added by the previous migration.
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_hours_worked_date`);

    // 5. Remove the old TIMESTAMPTZ column.
    await queryInterface.removeColumn("hours_worked", "date");

    // 6. Rename the new column to "date".
    await queryInterface.renameColumn("hours_worked", "_date_new", "date");

    // 7. Enforce NOT NULL now that all rows have a value.
    await queryInterface.sequelize.query(
      `ALTER TABLE hours_worked ALTER COLUMN "date" SET NOT NULL`,
    );

    // 8. Recreate the unique constraint as a simple two-column index.
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX hours_worked_employeeId_date_unique
       ON hours_worked ("employeeId", "date")`,
    );

    // 9. Recreate the general date index (now a plain DATE, no cast needed).
    await queryInterface.sequelize.query(
      `CREATE INDEX idx_hours_worked_date ON hours_worked ("date")`,
    );
  },

  async down(queryInterface, Sequelize) {
    // Reverse: restore TIMESTAMPTZ column from the DATE column.
    await queryInterface.addColumn("hours_worked", "_date_ts", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE hours_worked SET "_date_ts" = ("date"::timestamp AT TIME ZONE 'UTC')`,
    );

    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS hours_worked_employeeId_date_unique`,
    );
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_hours_worked_date`);

    await queryInterface.removeColumn("hours_worked", "date");
    await queryInterface.renameColumn("hours_worked", "_date_ts", "date");

    await queryInterface.sequelize.query(
      `ALTER TABLE hours_worked ALTER COLUMN "date" SET NOT NULL`,
    );

    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX hours_worked_employeeId_date_unique
       ON hours_worked ("employeeId", (("date" AT TIME ZONE 'UTC')::date))`,
    );
    await queryInterface.sequelize.query(
      `CREATE INDEX idx_hours_worked_date ON hours_worked ("date")`,
    );
  },
};
