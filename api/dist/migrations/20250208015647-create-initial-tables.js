'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.createTable("employees", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            firstName: { type: Sequelize.STRING, allowNull: false },
            lastName: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("schedule", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            day: { type: Sequelize.STRING, allowNull: false },
            label: { type: Sequelize.STRING, allowNull: false },
            hours: { type: Sequelize.INTEGER, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("hours_worked", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            employeeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "employees", key: "id" },
                onDelete: "CASCADE"
            },
            date: { type: Sequelize.DATE, allowNull: false },
            scheduleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "schedule", key: "id" }
            },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("weekly_summary", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            employeeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "employees", key: "id" },
                onDelete: "CASCADE"
            },
            weekNumber: { type: Sequelize.INTEGER, allowNull: false },
            month: { type: Sequelize.INTEGER, allowNull: false },
            year: { type: Sequelize.INTEGER, allowNull: false },
            totalHours: { type: Sequelize.INTEGER, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("biweekly_summary", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            employeeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "employees", key: "id" },
                onDelete: "CASCADE"
            },
            biweekNumber: { type: Sequelize.INTEGER, allowNull: false },
            month: { type: Sequelize.INTEGER, allowNull: false },
            year: { type: Sequelize.INTEGER, allowNull: false },
            totalHours: { type: Sequelize.INTEGER, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("monthly_summary", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            employeeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "employees", key: "id" },
                onDelete: "CASCADE"
            },
            month: { type: Sequelize.INTEGER, allowNull: false },
            year: { type: Sequelize.INTEGER, allowNull: false },
            totalHours: { type: Sequelize.INTEGER, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        yield queryInterface.createTable("vehicles", {
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
    }),
    down: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable("vehicles");
        yield queryInterface.dropTable("monthly_summary");
        yield queryInterface.dropTable("biweekly_summary");
        yield queryInterface.dropTable("weekly_summary");
        yield queryInterface.dropTable("hours_worked");
        yield queryInterface.dropTable("schedule");
        yield queryInterface.dropTable("employees");
    })
};
