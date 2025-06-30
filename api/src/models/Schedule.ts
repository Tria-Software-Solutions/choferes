import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Schedule extends Model {
  public id!: number;

  public days!: string[];

  public label!: string;

  public hours!: number;

  public specialSchedule!: boolean;
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
