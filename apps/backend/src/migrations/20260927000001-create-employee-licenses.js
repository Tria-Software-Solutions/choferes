"use strict";

// Licencias de conducir del empleado (categorías del COSEVI en Costa Rica),
// con número y fecha de vencimiento para poder alertar las próximas a vencer.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employee_licenses", {
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
      licenseType: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      licenseNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      issuedAt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("employee_licenses", ["employeeId"], {
      name: "employee_licenses_employee_id",
    });
    await queryInterface.addIndex("employee_licenses", ["expiresAt"], {
      name: "employee_licenses_expires_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("employee_licenses");
  },
};
