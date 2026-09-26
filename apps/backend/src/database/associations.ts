// Defines all Sequelize model associations/relationships between entities
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { ScheduleDay } from "../models/ScheduleDay";
import { HoursWorked } from "../models/HoursWorked";
import { UserRole } from "../models/UserRole";
import { RolePermission } from "../models/RolePermission";
import { Notification } from "../models/Notification";
import { Payment } from "../models/Payment";
import { Vacation } from "../models/Vacation";
import { EmployeeLicense } from "../models/EmployeeLicense";
import { DisciplinaryAction } from "../models/DisciplinaryAction";

// User <-> Notification (One-to-Many)
Notification.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
User.hasMany(Notification, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

// User <-> Role (Many-to-Many)
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

// Role <-> Permission (Many-to-Many)
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

// Employee <-> HoursWorked (One-to-Many)
HoursWorked.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});
Employee.hasMany(HoursWorked, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});

// Schedule <-> ScheduleDay (One-to-Many)
ScheduleDay.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE",
  as: "schedule",
});
Schedule.hasMany(ScheduleDay, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE",
  as: "scheduleDays",
});

// Schedule <-> HoursWorked (One-to-Many)
HoursWorked.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE",
});
Schedule.hasMany(HoursWorked, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE",
});

// Employee <-> Payment (One-to-Many)
Payment.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "employee",
});
Employee.hasMany(Payment, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "payments",
});

// Employee <-> Vacation (One-to-Many)
Vacation.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "employee",
});
Employee.hasMany(Vacation, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "vacations",
});

// Vacation <-> User (approver)
Vacation.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approvedByUser",
  onDelete: "SET NULL",
});
User.hasMany(Vacation, {
  foreignKey: "approvedBy",
  as: "approvedVacations",
  onDelete: "SET NULL",
});

// Employee <-> EmployeeLicense (One-to-Many)
EmployeeLicense.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "employee",
});
Employee.hasMany(EmployeeLicense, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "licenses",
});

// Employee <-> DisciplinaryAction (One-to-Many)
DisciplinaryAction.belongsTo(Employee, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "employee",
});
Employee.hasMany(DisciplinaryAction, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "disciplinaryActions",
});

// DisciplinaryAction <-> User (registrar)
DisciplinaryAction.belongsTo(User, {
  foreignKey: "createdBy",
  as: "createdByUser",
  onDelete: "SET NULL",
});
User.hasMany(DisciplinaryAction, {
  foreignKey: "createdBy",
  as: "createdDisciplinaryActions",
  onDelete: "SET NULL",
});

// Function to ensure associations are set up (for import side effects)
export default function setupAssociations() {}
