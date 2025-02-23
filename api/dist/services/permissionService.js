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
exports.getPermissionById = exports.getPermissions = exports.createPermission = void 0;
const Permission_1 = require("../models/Permission");
const createPermission = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = yield Permission_1.Permission.create({ name });
    return permission;
});
exports.createPermission = createPermission;
const getPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    const permissions = yield Permission_1.Permission.findAll();
    return permissions;
});
exports.getPermissions = getPermissions;
const getPermissionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = yield Permission_1.Permission.findByPk(id);
    return permission;
});
exports.getPermissionById = getPermissionById;
