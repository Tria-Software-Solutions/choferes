import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Vacation model: an employee's vacation request. Approving it deducts
// daysRequested from the employee's vacationDays balance.
export class Vacation extends Model {
  public id!: number; // Unique identifier for the vacation request

  public employeeId!: number; // Employee requesting the vacation

  public startDate!: string; // First day off (YYYY-MM-DD)

  public endDate!: string; // Last day off (YYYY-MM-DD)

  public daysRequested!: number; // Business days requested (computed server-side)

  public status!: "pending" | "approved" | "rejected"; // Request status

  public reason?: string | null; // Employee's reason

  public approvedBy?: number | null; // User who approved/rejected it

  public approvedAt?: Date | null; // When it was approved

  public createdAt!: Date; // Record creation timestamp

  public updatedAt!: Date; // Record update timestamp
}

Vacation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    daysRequested: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Vacation",
    tableName: "vacations",
  },
);

export default Vacation;
