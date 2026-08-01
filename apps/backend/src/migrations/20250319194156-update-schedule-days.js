"use strict";

// Reconstruida (2026-07-31): el archivo original se perdió; se dedujo del
// esquema final de la BD y de los modelos (schedule.days, sin columna day).
// Aplicada localmente el 2025-03-19.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("schedule", "days", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    });
    await queryInterface.removeColumn("schedule", "day");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("schedule", "day", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "weekday",
    });
    await queryInterface.removeColumn("schedule", "days");
  },
};
