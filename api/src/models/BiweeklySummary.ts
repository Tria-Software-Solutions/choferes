import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

export class BiweeklySummary extends Model {
  public id!: number;

  public employeeId!: number;

  public biweekNumber!: number;

  public month!: number;

  public year!: number;

  public totalHours!: number;
}

BiweeklySummary.init(
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
        key: "id",
      },
      onDelete: "CASCADE",
    },
    biweekNumber: {
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
    modelName: "BiweeklySummary",
    tableName: "biweekly_summary",
  },
);

BiweeklySummary.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});
