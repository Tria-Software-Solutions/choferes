"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("employees", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("schedule", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      day: { type: Sequelize.STRING, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      hours: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("hours_worked", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onDelete: "CASCADE",
      },
      date: { type: Sequelize.DATE, allowNull: false },
      scheduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "schedule", key: "id" },
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("weekly_summary", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onDelete: "CASCADE",
      },
      weekNumber: { type: Sequelize.INTEGER, allowNull: false },
      month: { type: Sequelize.INTEGER, allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      totalHours: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("biweekly_summary", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onDelete: "CASCADE",
      },
      biweekNumber: { type: Sequelize.INTEGER, allowNull: false },
      month: { type: Sequelize.INTEGER, allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      totalHours: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("monthly_summary", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onDelete: "CASCADE",
      },
      month: { type: Sequelize.INTEGER, allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      totalHours: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("vehicles", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ticket: { type: Sequelize.STRING, allowNull: false, unique: true },
      licensePlate: { type: Sequelize.STRING, allowNull: false },
      brand: { type: Sequelize.STRING, allowNull: false },
      color: { type: Sequelize.STRING, allowNull: false },
      parkingLot: { type: Sequelize.STRING, allowNull: false },
      notes: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("vehicles");
    await queryInterface.dropTable("monthly_summary");
    await queryInterface.dropTable("biweekly_summary");
    await queryInterface.dropTable("weekly_summary");
    await queryInterface.dropTable("hours_worked");
    await queryInterface.dropTable("schedule");
    await queryInterface.dropTable("employees");
  },
};
