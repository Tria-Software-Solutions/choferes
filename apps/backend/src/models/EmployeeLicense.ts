import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

// Licencia de conducir del empleado (categorías del COSEVI en Costa Rica).
export class EmployeeLicense extends Model {
  public id!: number;

  public employeeId!: number;

  public licenseType!: string; // A1..A3, B1..B3, C1..C3, D1..D3, E

  public licenseNumber?: string | null;

  public issuedAt?: string | null; // YYYY-MM-DD

  public expiresAt?: string | null; // YYYY-MM-DD

  public notes?: string | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

EmployeeLicense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    licenseType: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    issuedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmployeeLicense",
    tableName: "employee_licenses",
  },
);

export default EmployeeLicense;
