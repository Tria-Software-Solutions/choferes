"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiweeklySummary = void 0;
const sequelize_1 = require("sequelize");
const Employee_1 = require("./Employee");
const database_1 = __importDefault(require("../config/database"));
class BiweeklySummary extends sequelize_1.Model {
}
exports.BiweeklySummary = BiweeklySummary;
BiweeklySummary.init({
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
    biweekNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    month: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    totalHours: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: "BiweeklySummary",
    tableName: "biweekly_summary",
});
BiweeklySummary.belongsTo(Employee_1.Employee, { foreignKey: "employeeId", onDelete: 'CASCADE' });
//# sourceMappingURL=BiweeklySummary.js.map