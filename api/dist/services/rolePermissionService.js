"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRolePermission = exports.updateRolePermission = exports.createRolePermission = exports.getRolePermissions = void 0;
const RolePermission_1 = require("../models/RolePermission");
const getRolePermissions = async () => {
    return RolePermission_1.RolePermission.findAll();
};
exports.getRolePermissions = getRolePermissions;
const createRolePermission = async (data) => {
    const newRolePermission = await RolePermission_1.RolePermission.create(data);
    await newRolePermission.reload();
    return newRolePermission;
};
exports.createRolePermission = createRolePermission;
const updateRolePermission = async (roleId, permissionIds) => {
    await RolePermission_1.RolePermission.destroy({ where: { roleId } });
    const newPermissions = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
    }));
    await RolePermission_1.RolePermission.bulkCreate(newPermissions);
    return await RolePermission_1.RolePermission.findAll({ where: { roleId } });
};
exports.updateRolePermission = updateRolePermission;
const deleteRolePermission = async (id) => {
    return RolePermission_1.RolePermission.destroy({ where: { id } });
};
exports.deleteRolePermission = deleteRolePermission;
//# sourceMappingURL=rolePermissionService.js.map