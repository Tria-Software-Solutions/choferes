import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database";
import { Role } from "./Role";

// User model definition for Sequelize ORM
export class User extends Model {
  public id!: number; // Unique identifier for the user

  public firstName!: string; // User's first name

  public lastName!: string; // User's last name

  public username!: string; // Username for login

  public email!: string; // User's email address

  public password!: string; // Hashed password

  public temporalPassword?: string; // Optional temporary password

  public isActive!: boolean; // Indicates if the user is active

  public roles?: Role[]; // Associated roles for the user

  public static associations: {
    roles: Association<User, Role>; // Association with roles
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
    temporalPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  },
);

export default User;
