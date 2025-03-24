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
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermissionsByNames = exports.getPermissionById = exports.getPermissions = void 0;
const sequelize_1 = require("sequelize");
const Permission_1 = require("../models/Permission");
const getPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield Permission_1.Permission.findAll();
});
exports.getPermissions = getPermissions;
const getPermissionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Permission_1.Permission.findByPk(id);
});
exports.getPermissionById = getPermissionById;
const getPermissionsByNames = (names) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Permission_1.Permission.findAll({
        where: {
            name: {
                [sequelize_1.Op.in]: names,
            },
        },
    });
});
exports.getPermissionsByNames = getPermissionsByNames;
const createPermission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newPermission = yield Permission_1.Permission.create(data);
    yield newPermission.reload();
    return newPermission;
});
exports.createPermission = createPermission;
const updatePermission = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield Permission_1.Permission.update(data, { where: { id } });
    return Permission_1.Permission.findByPk(id);
});
exports.updatePermission = updatePermission;
const deletePermission = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Permission_1.Permission.destroy({ where: { id } });
});
exports.deletePermission = deletePermission;
