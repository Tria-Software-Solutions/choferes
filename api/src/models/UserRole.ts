import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class UserRole extends Model {
  public userId!: number;
  public roleId!: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRole",
    tableName: "user_role",
  }
);
