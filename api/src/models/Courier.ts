import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Courier extends Model {
  public id!: number;

  public driver!: string;

  public route!: string;

  public distance!: number;

  public trackingNumber!: string;

  public status!: string;
}

Courier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    driver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Courier",
    tableName: "couriers",
  },
);

export default Courier;
