import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database";
import { Role } from "./Role";

export class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public username!: string;
  public email!: string;
  public password!: string;

  public roles?: Role[]; 

  public static associations: {
    roles: Association<User, Role>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);
