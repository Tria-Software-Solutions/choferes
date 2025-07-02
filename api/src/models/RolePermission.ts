import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { Role } from "./Role";
import { Permission } from "./Permission";

// RolePermission model definition for Sequelize ORM
export class RolePermission extends Model {
  public roleId!: number; // Reference to the role
  public permissionId!: number; // Reference to the permission
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permission",
  },
);

export default RolePermission;
