import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Employee model definition for Sequelize ORM
export class Employee extends Model {
  public id!: number; // Unique identifier for the employee

  public firstName!: string; // Employee's first name

  public lastName!: string; // Employee's last name

  public email!: string; // Employee's email address

  public avatar?: string; // Avatar image as base64 data URL

  public hourlyRate?: number | null; // Hourly rate used to calculate pay slips

  public vacationDays?: number | null; // Manual vacation balance (adjusted on approval)

  public contractStartDate?: string | null; // Hire date (YYYY-MM-DD)

  public terminationDate?: string | null; // Last working day (YYYY-MM-DD)

  public terminationReason?: string | null; // renuncia | despido | ...

  public terminationNotes?: string | null; // Free-form termination notes

  public position?: string | null; // Job position / cargo

  public nationalId?: string | null; // Cédula de identidad

  public isActive!: boolean; // false once a termination date is registered
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    vacationDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contractStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    terminationReason: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    terminationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nationalId: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
  },
);

export default Employee;
