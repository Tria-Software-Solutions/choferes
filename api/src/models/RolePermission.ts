import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { Role } from "./Role";
import { Permission } from "./Permission";

export class RolePermission extends Model {
  public roleId!: number;
  public permissionId!: number;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permission",
  }
);
