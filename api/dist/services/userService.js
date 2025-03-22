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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserPermissions = exports.getUserByUsername = exports.getUserById = exports.getUsers = exports.authenticateUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const generateSecret_1 = require("../utils/generateSecret");
const sequelize_1 = require("sequelize");
const authenticateUser = (identifier, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({
        where: { [sequelize_1.Op.or]: [{ username: identifier }, { email: identifier }] },
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                include: [
                    { model: Permission_1.Permission, as: "permissions", through: { attributes: [] } },
                ],
            },
        ],
    });
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Incorrect password");
    const { accessToken, refreshToken } = (0, generateSecret_1.generateTokens)(user.id.toString(), res);
    return { user, accessToken, refreshToken };
});
exports.authenticateUser = authenticateUser;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findAll({
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
});
exports.getUsers = getUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByPk(id, {
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
});
exports.getUserById = getUserById;
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findOne({
        where: { username },
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
});
exports.getUserByUsername = getUserByUsername;
const getUserPermissions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield User_1.User.findByPk(userId, {
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                include: [
                    {
                        model: Permission_1.Permission,
                        as: "permissions",
                        through: { attributes: [] },
                    },
                ],
            },
        ],
    });
    if (!user)
        return null;
    const permissions = ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.flatMap((role) => { var _a; return (_a = role.permissions) === null || _a === void 0 ? void 0 : _a.map((permission) => permission.name); })) || [];
    return Array.from(new Set(permissions));
});
exports.getUserPermissions = getUserPermissions;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
    return yield User_1.User.create(Object.assign(Object.assign({}, data), { password: hashedPassword }), { returning: true });
});
exports.createUser = createUser;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_1.User.update(data, { where: { id } });
    return User_1.User.findByPk(id);
});
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.destroy({ where: { id } });
});
exports.deleteUser = deleteUser;
