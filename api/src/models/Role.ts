import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database";
import { Permission } from "./Permission";

export class Role extends Model {
  public id!: number;
  public name!: string;

  public Permissions?: Permission[];

  public static associations: {
    Roles: Association<Role, Permission>;
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
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
  }
);
