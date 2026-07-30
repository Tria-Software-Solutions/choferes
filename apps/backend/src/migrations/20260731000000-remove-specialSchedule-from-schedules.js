"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("schedule", "specialSchedule");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("schedule", "specialSchedule", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
