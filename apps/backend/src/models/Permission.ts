import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

// Permission model definition for Sequelize ORM.
// `code` is the stable authorization identity (e.g. "employees:view"); the
// server authorizes against it. `name` keeps the Spanish display label and
// `module` drives UI grouping.
export class Permission extends Model {
  public id!: number; // Unique identifier for the permission

  public code!: string; // Stable machine identity used for authorization

  public module!: string; // UI grouping (e.g. "Empleados")

  public name!: string; // Display label shown to users
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
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
