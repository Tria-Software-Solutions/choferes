import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

export class WeeklySummary extends Model {
  public id!: number;
  public employeeId!: number;
  public weekNumber!: number;
  public month!: number;
  public year!: number;
  public totalHours!: number;
}

WeeklySummary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Employee,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "WeeklySummary",
    tableName: "weekly_summary",
  }
);

WeeklySummary.belongsTo(Employee, { foreignKey: "employeeId", onDelete: 'CASCADE' });
