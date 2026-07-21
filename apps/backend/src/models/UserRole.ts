import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User";
import { Role } from "./Role";

// UserRole model definition for Sequelize ORM
export class UserRole extends Model {
  public id!: number;

  public userId!: number; // Reference to the user

  public roleId!: number; // Reference to the role
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "UserRole",
    tableName: "user_role",
  },
);

export default UserRole;
