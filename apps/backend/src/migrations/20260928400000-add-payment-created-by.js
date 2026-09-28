"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "createdBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_created_by
       ON payments ("createdBy") WHERE "createdBy" IS NOT NULL`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_payments_created_by`);
    await queryInterface.removeColumn("payments", "createdBy");
  },
};
