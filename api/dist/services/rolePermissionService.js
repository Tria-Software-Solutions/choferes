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
exports.removePermissionFromRole = exports.getPermissionsByRole = exports.assignPermissionToRole = void 0;
const RolePermission_1 = require("../models/RolePermission");
const assignPermissionToRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return RolePermission_1.RolePermission.create(data);
});
exports.assignPermissionToRole = assignPermissionToRole;
const getPermissionsByRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return RolePermission_1.RolePermission.findAll({ where: { roleId } });
});
exports.getPermissionsByRole = getPermissionsByRole;
const removePermissionFromRole = (roleId, permissionId) => __awaiter(void 0, void 0, void 0, function* () {
    return RolePermission_1.RolePermission.destroy({ where: { roleId, permissionId } });
});
exports.removePermissionFromRole = removePermissionFromRole;
