import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database";
import { Permission } from "./Permission";

// Role model definition for Sequelize ORM
export class Role extends Model {
  public id!: number; // Unique identifier for the role

  public name!: string; // Name of the role

  public description!: string;

  public permissions?: Permission[]; // Associated permissions for the role

  public static associations: {
    permissions: Association<Role, Permission>; // Association with permissions
  };
}

Role.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
  },
);

export default Role;
