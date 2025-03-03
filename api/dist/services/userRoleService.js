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
exports.deleteUserRole = exports.createUserRole = exports.getUserRoles = void 0;
const UserRole_1 = require("../models/UserRole");
const getUserRoles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.findAll({ where: { userId } });
});
exports.getUserRoles = getUserRoles;
const createUserRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.create(data);
});
exports.createUserRole = createUserRole;
const deleteUserRole = (userId, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return UserRole_1.UserRole.destroy({ where: { userId, roleId } });
});
exports.deleteUserRole = deleteUserRole;
