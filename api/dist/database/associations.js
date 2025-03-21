"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupAssociations;
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const Employee_1 = require("../models/Employee");
const Schedule_1 = require("../models/Schedule");
const HoursWorked_1 = require("../models/HoursWorked");
const UserRole_1 = require("../models/UserRole");
const RolePermission_1 = require("../models/RolePermission");
// Relación User - Role (Mediante UserRole)
User_1.User.belongsToMany(Role_1.Role, {
    through: UserRole_1.UserRole,
    foreignKey: "userId",
    as: "roles",
});
Role_1.Role.belongsToMany(User_1.User, {
    through: UserRole_1.UserRole,
    foreignKey: "roleId",
    as: "users",
});
// Relación Role - Permission (Mediante RolePermission)
Role_1.Role.belongsToMany(Permission_1.Permission, {
    through: RolePermission_1.RolePermission,
    foreignKey: "roleId",
    as: "permissions",
});
Permission_1.Permission.belongsToMany(Role_1.Role, {
    through: RolePermission_1.RolePermission,
    foreignKey: "permissionId",
    as: "roles",
});
// Relación Employee - HoursWorked
HoursWorked_1.HoursWorked.belongsTo(Employee_1.Employee, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
});
Employee_1.Employee.hasMany(HoursWorked_1.HoursWorked, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
});
// Relación Schedule - HoursWorked
HoursWorked_1.HoursWorked.belongsTo(Schedule_1.Schedule, { foreignKey: "scheduleId" });
Schedule_1.Schedule.hasMany(HoursWorked_1.HoursWorked, { foreignKey: "scheduleId" });
function setupAssociations() {
    console.log("Associations have been set up!");
}
