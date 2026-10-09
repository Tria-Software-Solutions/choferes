"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Monotonic session counter. Bumping it invalidates every JWT already
    // issued for the user (used on password change / forced logout).
    await queryInterface.addColumn("users", "tokenVersion", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "tokenVersion");
  },
};
