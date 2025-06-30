import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import { Schedule } from "./Schedule";
import sequelize from "../config/database";

export class HoursWorked extends Model {
  public id!: number;

  public employeeId!: number;

  public date!: Date;

  public scheduleId!: number;
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
