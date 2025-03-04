import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Schedule extends Model {
  public id!: number;
  public day!: string;
  public label!: string;
  public hours!: number;
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    day: {
      type: DataTypes.STRING,
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
  },
  {
    sequelize,
    modelName: "Schedule",
    tableName: "schedule",
  }
);