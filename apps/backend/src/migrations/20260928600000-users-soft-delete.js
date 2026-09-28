"use strict";

// Adds soft-delete support to users via a deletedAt timestamp.
// Hard deletes cascade-delete all child data (tasks, notifications, etc.).
// Soft-deleting preserves the audit trail and keeps FKs intact.
//
// The existing isActive=false gate still blocks login; deletedAt is the
// canonical "this account no longer exists" marker that filters users out of
// all listings without touching associated records.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_users_deleted_at
       ON users ("deletedAt") WHERE "deletedAt" IS NOT NULL`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_users_deleted_at`);
    await queryInterface.removeColumn("users", "deletedAt");
  },
};
