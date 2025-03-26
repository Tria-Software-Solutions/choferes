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
exports.deleteUserRole = exports.updateUserRole = exports.createUserRole = exports.getUserRoleByRoleId = exports.getUserRoleByUserId = exports.getUserRoles = void 0;
const UserRole_1 = require("../models/UserRole");
const getUserRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.findAll();
});
exports.getUserRoles = getUserRoles;
const getUserRoleByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield UserRole_1.UserRole.findOne({
        where: {
            userId,
        },
    });
});
exports.getUserRoleByUserId = getUserRoleByUserId;
const getUserRoleByRoleId = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield UserRole_1.UserRole.findOne({
        where: {
            roleId,
        },
    });
});
exports.getUserRoleByRoleId = getUserRoleByRoleId;
const createUserRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newUserRole = yield UserRole_1.UserRole.create(data);
    yield newUserRole.reload();
    return newUserRole;
});
exports.createUserRole = createUserRole;
const updateUserRole = (userId, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    yield UserRole_1.UserRole.update({ userId, roleId }, { where: { userId } });
    return yield UserRole_1.UserRole.findOne({ where: { userId } });
});
exports.updateUserRole = updateUserRole;
const deleteUserRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.destroy({ where: { id } });
});
exports.deleteUserRole = deleteUserRole;
