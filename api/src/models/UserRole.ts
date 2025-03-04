import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User";
import { Role } from "./Role";

export class UserRole extends Model {
  public userId!: number;
  public roleId!: number;
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
  }
);
