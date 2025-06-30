"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoursWorked =
  exports.Schedule =
  exports.Employee =
  exports.RolePermission =
  exports.UserRole =
  exports.Permission =
  exports.Role =
  exports.User =
    void 0;
const User_1 = require("../models/User");
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function () {
    return User_1.User;
  },
});
const Role_1 = require("../models/Role");
Object.defineProperty(exports, "Role", {
  enumerable: true,
  get: function () {
    return Role_1.Role;
  },
});
const Permission_1 = require("../models/Permission");
Object.defineProperty(exports, "Permission", {
  enumerable: true,
  get: function () {
    return Permission_1.Permission;
  },
});
const UserRole_1 = require("../models/UserRole");
Object.defineProperty(exports, "UserRole", {
  enumerable: true,
  get: function () {
    return UserRole_1.UserRole;
  },
});
const RolePermission_1 = require("../models/RolePermission");
Object.defineProperty(exports, "RolePermission", {
  enumerable: true,
  get: function () {
    return RolePermission_1.RolePermission;
  },
});
const Employee_1 = require("../models/Employee");
Object.defineProperty(exports, "Employee", {
  enumerable: true,
  get: function () {
    return Employee_1.Employee;
  },
});
const Schedule_1 = require("../models/Schedule");
Object.defineProperty(exports, "Schedule", {
  enumerable: true,
  get: function () {
    return Schedule_1.Schedule;
  },
});
const HoursWorked_1 = require("../models/HoursWorked");
Object.defineProperty(exports, "HoursWorked", {
  enumerable: true,
  get: function () {
    return HoursWorked_1.HoursWorked;
  },
});
const associations_1 = __importDefault(require("./associations"));
(0, associations_1.default)();
//# sourceMappingURL=models.js.map
