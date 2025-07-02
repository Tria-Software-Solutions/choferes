import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import { Schedule } from "./Schedule";
import sequelize from "../config/database";

// HoursWorked model definition for Sequelize ORM
export class HoursWorked extends Model {
  public id!: number; // Unique identifier for the hours worked record

  public employeeId!: number; // Reference to the employee

  public date!: Date; // Date of the worked hours

  public scheduleId!: number; // Reference to the schedule
}

HoursWorked.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Schedule,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "HoursWorked",
    tableName: "hours_worked",
  },
);

export default HoursWorked;
