import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class Permission extends Model {
  public id!: number;

  public name!: string;
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
