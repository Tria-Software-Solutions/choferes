import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

export class MonthlySummary extends Model {
  public id!: number;
  public employeeId!: number;
  public month!: number;
  public year!: number;
  public totalHours!: number;
}

MonthlySummary.init(
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
    modelName: "MonthlySummary",
    tableName: "monthly_summary",
  }
);

MonthlySummary.belongsTo(Employee, { foreignKey: "employeeId", onDelete: 'CASCADE' });