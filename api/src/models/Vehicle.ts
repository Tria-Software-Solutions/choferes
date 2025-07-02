import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Vehicle model definition for Sequelize ORM
export class Vehicle extends Model {
  public id!: number; // Unique identifier for the vehicle

  public ticket!: string; // Ticket number for the vehicle

  public licensePlate!: string; // License plate of the vehicle

  public brand!: string; // Brand of the vehicle

  public color!: string; // Color of the vehicle

  public parkingLot!: string; // Parking lot identifier

  public notes!: string; // Optional notes about the vehicle

  public parkingDate!: Date; // Date when the vehicle was parked

  public createdAt!: Date; // Record creation timestamp

  public updatedAt!: Date; // Record update timestamp
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
      unique: true,
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
  },
);

export default Vehicle;
