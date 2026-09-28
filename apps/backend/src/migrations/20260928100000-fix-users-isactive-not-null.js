"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Backfill NULL rows inserted before the column had a DEFAULT.
    await queryInterface.sequelize.query(
      `UPDATE users SET "isActive" = true WHERE "isActive" IS NULL`
    );
    // Now the column can safely be NOT NULL.
    await queryInterface.changeColumn("users", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },
};
