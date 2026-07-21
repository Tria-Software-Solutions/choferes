import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Schedule model definition for Sequelize ORM
export class Schedule extends Model {
  public id!: number; // Unique identifier for the schedule

  public days!: string[]; // Days of the week for the schedule

  public label!: string; // Label or name for the schedule

  public hours!: number; // Number of hours for the schedule

  public specialSchedule!: boolean; // Indicates if this is a special schedule
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    specialSchedule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Schedule",
    tableName: "schedule",
  },
);

export default Schedule;
