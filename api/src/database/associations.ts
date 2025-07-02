import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { HoursWorked } from "../models/HoursWorked";
import { UserRole } from "../models/UserRole";
import { RolePermission } from "../models/RolePermission";

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  as: "roles",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  as: "users",
});

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  as: "roles",
});

HoursWorked.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});
Employee.hasMany(HoursWorked, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});

HoursWorked.belongsTo(Schedule, { foreignKey: "scheduleId" });
Schedule.hasMany(HoursWorked, { foreignKey: "scheduleId" });

export default function setupAssociations() {}
