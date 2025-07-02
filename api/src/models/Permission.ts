import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

// Permission model definition for Sequelize ORM
export class Permission extends Model {
  public id!: number; // Unique identifier for the permission
  public name!: string; // Name of the permission
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
  },
);

export default Permission;
