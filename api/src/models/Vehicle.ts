import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Vehicle extends Model {
  public id!: number;
  public ticket!: string;
  public licensePlate!: string;
  public brand!: string;
  public color!: string;
  public parkingLot!: string;
  public notes!: string;
  public parkingDate!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parkingLot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parkingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Vehicle",
    tableName: "vehicles",
  }
);
