"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission =
  exports.updatePermission =
  exports.createPermission =
  exports.getPermissionsByNames =
  exports.getPermissionById =
  exports.getPermissions =
    void 0;
const sequelize_1 = require("sequelize");
const Permission_1 = require("../models/Permission");
const getPermissions = async () => {
  return await Permission_1.Permission.findAll();
};
exports.getPermissions = getPermissions;
const getPermissionById = async (id) => {
  return await Permission_1.Permission.findByPk(id);
};
exports.getPermissionById = getPermissionById;
const getPermissionsByNames = async (names) => {
  return await Permission_1.Permission.findAll({
    where: {
      name: {
        [sequelize_1.Op.in]: names,
      },
    },
  });
};
exports.getPermissionsByNames = getPermissionsByNames;
const createPermission = async (data) => {
  const newPermission = await Permission_1.Permission.create(data);
  await newPermission.reload();
  return newPermission;
};
exports.createPermission = createPermission;
const updatePermission = async (id, data) => {
  await Permission_1.Permission.update(data, { where: { id } });
  return Permission_1.Permission.findByPk(id);
};
exports.updatePermission = updatePermission;
const deletePermission = async (id) => {
  return await Permission_1.Permission.destroy({ where: { id } });
};
exports.deletePermission = deletePermission;
//# sourceMappingURL=permissionService.js.map
