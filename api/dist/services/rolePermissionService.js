"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRolePermission = exports.updateRolePermission = exports.createRolePermission = exports.getRolePermissions = void 0;
const RolePermission_1 = require("../models/RolePermission");
const getRolePermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    return RolePermission_1.RolePermission.findAll();
});
exports.getRolePermissions = getRolePermissions;
const createRolePermission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newRolePermission = yield RolePermission_1.RolePermission.create(data);
    yield newRolePermission.reload();
    return newRolePermission;
});
exports.createRolePermission = createRolePermission;
const updateRolePermission = (roleId, permissionIds) => __awaiter(void 0, void 0, void 0, function* () {
    yield RolePermission_1.RolePermission.destroy({ where: { roleId } });
    const newPermissions = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
    }));
    yield RolePermission_1.RolePermission.bulkCreate(newPermissions);
    return yield RolePermission_1.RolePermission.findAll({ where: { roleId } });
});
exports.updateRolePermission = updateRolePermission;
const deleteRolePermission = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return RolePermission_1.RolePermission.destroy({ where: { id } });
});
exports.deleteRolePermission = deleteRolePermission;
