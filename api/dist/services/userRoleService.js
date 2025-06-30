"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRole =
  exports.updateUserRole =
  exports.createUserRole =
  exports.getUserRoleByRoleId =
  exports.getUserRoleByUserId =
  exports.getUserRoles =
    void 0;
const UserRole_1 = require("../models/UserRole");
const getUserRoles = async () => {
  return UserRole_1.UserRole.findAll();
};
exports.getUserRoles = getUserRoles;
const getUserRoleByUserId = async (userId) => {
  return await UserRole_1.UserRole.findOne({
    where: {
      userId,
    },
  });
};
exports.getUserRoleByUserId = getUserRoleByUserId;
const getUserRoleByRoleId = async (roleId) => {
  return await UserRole_1.UserRole.findOne({
    where: {
      roleId,
    },
  });
};
exports.getUserRoleByRoleId = getUserRoleByRoleId;
const createUserRole = async (data) => {
  const newUserRole = await UserRole_1.UserRole.create(data);
  await newUserRole.reload();
  return newUserRole;
};
exports.createUserRole = createUserRole;
const updateUserRole = async (userId, roleId) => {
  await UserRole_1.UserRole.update({ userId, roleId }, { where: { userId } });
  return await UserRole_1.UserRole.findOne({ where: { userId } });
};
exports.updateUserRole = updateUserRole;
const deleteUserRole = async (id) => {
  return UserRole_1.UserRole.destroy({ where: { id } });
};
exports.deleteUserRole = deleteUserRole;
//# sourceMappingURL=userRoleService.js.map
