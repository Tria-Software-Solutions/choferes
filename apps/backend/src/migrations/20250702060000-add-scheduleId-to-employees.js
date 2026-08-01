"use strict";

// Reconstruida (2026-07-31): el archivo original se perdió; se dedujo del
// esquema final de la BD (FK employees_scheduleId_fkey ON UPDATE CASCADE
// ON DELETE SET NULL) y del modelo HoursWorked.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("employees", "scheduleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "schedule", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("employees", "scheduleId");
  },
};
