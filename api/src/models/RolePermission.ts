import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class RolePermission extends Model {
  public roleId!: number;
  public permissionId!: number;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permission",
  }
);
