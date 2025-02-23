"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoursWorked = void 0;
const sequelize_1 = require("sequelize");
const Employee_1 = require("./Employee");
const Schedule_1 = require("./Schedule");
const database_1 = __importDefault(require("../config/database"));
class HoursWorked extends sequelize_1.Model {
}
exports.HoursWorked = HoursWorked;
HoursWorked.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employeeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee_1.Employee,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    scheduleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Schedule_1.Schedule,
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    modelName: "HoursWorked",
    tableName: 'hours_worked',
});
