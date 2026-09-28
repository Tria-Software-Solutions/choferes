import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database";
import { EmployeeLicense } from "./EmployeeLicense";
import { Schedule } from "./Schedule";
import { User } from "./User";

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

  public scheduledTerminationDate?: string | null; // Future date when the employee will be deactivated automatically

  public scheduledTerminationReason?: string | null; // Reason to carry over when the scheduled date is processed

  public position?: string | null; // Job position / cargo

  public gender?: string | null; // "Masculino" | "Femenino"

  public nationalId?: string | null; // Cédula de identidad (solo dígitos)

  public primaryPhone?: string | null; // Teléfono principal (solo dígitos)

  public secondaryPhone?: string | null; // Teléfono secundario (solo dígitos)

  public isActive!: boolean; // false once a termination date is registered

  public scheduleId?: number | null; // Assigned schedule (FK → schedule.id, SET NULL on delete)

  public static associations: {
    licenses: Association<Employee, EmployeeLicense>;
    user: Association<Employee, User>;
    schedule: Association<Employee, Schedule>;
  };
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
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nationalId: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    primaryPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    secondaryPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    scheduledTerminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    scheduledTerminationReason: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "schedule", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
  },
);

export default Employee;
