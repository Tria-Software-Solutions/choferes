import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { HoursWorked } from "../models/HoursWorked";

// Relación User - Role
User.belongsToMany(Role, { through: "user_role", foreignKey: "userId" });
Role.belongsToMany(User, { through: "user_role", foreignKey: "roleId" });

// Relación Role - Permission
Role.belongsToMany(Permission, {
  through: "role_permission",
  foreignKey: "roleId",
});
Permission.belongsToMany(Role, {
  through: "role_permission",
  foreignKey: "permissionId",
});

// Relación Employee - HoursWorked
HoursWorked.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});
Employee.hasMany(HoursWorked, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});

// Relación Schedule - HoursWorked
HoursWorked.belongsTo(Schedule, { foreignKey: "scheduleId" });
Schedule.hasMany(HoursWorked, { foreignKey: "scheduleId" });

export default function setupAssociations() {
  console.log("Associations have been set up!");
}
