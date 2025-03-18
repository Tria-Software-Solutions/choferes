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
exports.deleteUserRole = exports.updateUserRole = exports.createUserRole = exports.getUserRoleByUserId = exports.getUserRoles = void 0;
const Role_1 = require("../models/Role");
const UserRole_1 = require("../models/UserRole");
const getUserRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.findAll();
});
exports.getUserRoles = getUserRoles;
const getUserRoleByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield UserRole_1.UserRole.findOne({
        where: {
            userId: userId,
        },
    });
});
exports.getUserRoleByUserId = getUserRoleByUserId;
const createUserRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newUserRole = yield UserRole_1.UserRole.create(data);
    yield newUserRole.reload();
    return newUserRole;
});
exports.createUserRole = createUserRole;
// export const updateUserRole = async (userId: number, newRoleId: number) => {
//   await UserRole.update(
//     { roleId: newRoleId },
//     {
//       where: { userId },
//     }
//   );
//   return UserRole.findOne({ where: { userId } });
// };
const updateUserRole = (userId, newRoleId) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield Role_1.Role.findByPk(newRoleId);
    if (!role) {
        throw new Error("Role not found");
    }
    const updated = yield UserRole_1.UserRole.update({ roleId: newRoleId }, { where: { userId } });
    if (updated[0] > 0) {
        return UserRole_1.UserRole.findOne({ where: { userId } });
    }
    else {
        throw new Error("Failed to update UserRole");
    }
});
exports.updateUserRole = updateUserRole;
const deleteUserRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.destroy({ where: { id } });
});
exports.deleteUserRole = deleteUserRole;
