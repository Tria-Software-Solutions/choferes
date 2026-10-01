"use strict";

// Solicitudes de cambio de licencia que envía el propio empleado desde su
// expediente. Quedan pendientes hasta que Gerencia/Administrativo las aprueba
// (entonces se aplican a `employee_licenses`) o las rechaza.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("license_requests", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      licenseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "employee_licenses", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reviewNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("license_requests", ["employeeId"], {
      name: "license_requests_employee_id",
    });
    await queryInterface.addIndex("license_requests", ["status"], {
      name: "license_requests_status",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("license_requests");
  },
};
