"use strict";

// Datos de contrato y egreso del empleado:
//  - contractStartDate: fecha de ingreso (base para la acumulación de vacaciones)
//  - terminationDate / terminationReason / terminationNotes: despido o renuncia
//  - position / nationalId: puesto y cédula (expediente básico)
//  - isActive: true mientras no haya fecha de finalización
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("employees", "contractStartDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "terminationDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "terminationReason", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "terminationNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "position", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "nationalId", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addIndex("employees", ["isActive"], {
      name: "employees_is_active",
    });
    await queryInterface.addIndex("employees", ["terminationDate"], {
      name: "employees_termination_date",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("employees", "employees_is_active");
    await queryInterface.removeIndex("employees", "employees_termination_date");
    await queryInterface.removeColumn("employees", "contractStartDate");
    await queryInterface.removeColumn("employees", "terminationDate");
    await queryInterface.removeColumn("employees", "terminationReason");
    await queryInterface.removeColumn("employees", "terminationNotes");
    await queryInterface.removeColumn("employees", "position");
    await queryInterface.removeColumn("employees", "nationalId");
    await queryInterface.removeColumn("employees", "isActive");
  },
};
