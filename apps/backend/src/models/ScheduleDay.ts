import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// ScheduleDay model: stores per-day hours for each schedule
export class ScheduleDay extends Model {
  public id!: number;

  public scheduleId!: number;

  public day!: string; // day name: monday, tuesday, etc.

  public hours!: number; // hours for this specific day
}

ScheduleDay.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "schedule", key: "id" },
      onDelete: "CASCADE",
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ScheduleDay",
    tableName: "schedule_day",
    indexes: [
      {
        unique: true,
        fields: ["scheduleId", "day"],
      },
    ],
  },
);

export default ScheduleDay;
