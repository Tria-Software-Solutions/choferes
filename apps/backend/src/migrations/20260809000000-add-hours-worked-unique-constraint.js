"use strict";

// Deduplicates hours_worked and enforces a unique index per employee + calendar
// day. The frontend expects at most one schedule per employee per day; race
// conditions used to create duplicates, which inflated the hours totals.
//
// The unique index groups by calendar day via (("date" AT TIME ZONE 'UTC')::date).
// NOTE: DATE("date") on a timestamptz column is NOT IMMUTABLE in Postgres (it
// depends on the session timezone), so Postgres rejects it in an index — the
// explicit UTC cast is required. Also, inside CREATE INDEX the cast must be
// double-wrapped in parentheses: ((expr)::date) — a single pair fails with
// "syntax error at or near ::". The app normalizes every date to local
// midnight and the backend runs on UTC, so the UTC calendar day matches the
// calendar day the UI shows.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Both statements run in one transaction: if the index creation fails, the
    // deduplication DELETE is rolled back too (raw sequelize.query calls are
    // otherwise executed outside the migration's implicit transaction).
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove duplicate rows keeping the LATEST one (max id) — the record the
      // UI displays (it sorts by id DESC). Older duplicates were stale states.
      await queryInterface.sequelize.query(
        `
        DELETE FROM hours_worked
        WHERE id NOT IN (
          SELECT MAX(id) FROM hours_worked
          GROUP BY "employeeId", (("date" AT TIME ZONE 'UTC')::date)
        )
      `,
        { transaction },
      );

      // Prevent future duplicates at the database level.
      await queryInterface.sequelize.query(
        `
        CREATE UNIQUE INDEX IF NOT EXISTS "hours_worked_employeeId_date_unique"
          ON hours_worked ("employeeId", (("date" AT TIME ZONE 'UTC')::date))
      `,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "hours_worked_employeeId_date_unique"
    `);
  },
};
