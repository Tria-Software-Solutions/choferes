"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserTemporalPassword = exports.updateUserPassword = exports.updateUserStatus = exports.updateUser = exports.createUser = exports.getUserPermissions = exports.getUserByUsername = exports.getUserByEmail = exports.getUserById = exports.getUsers = exports.authenticateUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const generateSecret_1 = require("../utils/generateSecret");
const sequelize_1 = require("sequelize");
const authenticateUser = async (identifier, password, res) => {
    const user = await User_1.User.findOne({
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
    if (!user.isActive) {
        throw new Error("User is inactive");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        if (user.temporalPassword) {
            const isMatchWithTemporalPassword = await bcrypt_1.default.compare(password, user.temporalPassword);
            if (!isMatchWithTemporalPassword) {
                throw new Error("Incorrect password and temporary password");
            }
        }
        else {
            throw new Error("Incorrect password");
        }
    }
    const { accessToken, refreshToken } = (0, generateSecret_1.generateTokens)(user.id.toString(), res);
    return { user, accessToken, refreshToken };
};
exports.authenticateUser = authenticateUser;
const getUsers = async () => {
    return await User_1.User.findAll({
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    return await User_1.User.findByPk(id, {
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getUserById = getUserById;
const getUserByEmail = async (email) => {
    return await User_1.User.findOne({
        where: { email },
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = async (username) => {
    return await User_1.User.findOne({
        where: { username },
        include: [
            {
                model: Role_1.Role,
                as: "roles",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getUserByUsername = getUserByUsername;
const getUserPermissions = async (userId) => {
    const user = await User_1.User.findByPk(userId, {
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
    const permissions = user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name)) || [];
    return Array.from(new Set(permissions));
};
exports.getUserPermissions = getUserPermissions;
const createUser = async (data) => {
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    return await User_1.User.create({
        ...data,
        password: hashedPassword,
    }, { returning: true });
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    await User_1.User.update(data, { where: { id } });
    return User_1.User.findByPk(id);
};
exports.updateUser = updateUser;
const updateUserStatus = async (id, status) => {
    await User_1.User.update({ isActive: status }, { where: { id } });
    return User_1.User.findByPk(id);
};
exports.updateUserStatus = updateUserStatus;
const updateUserPassword = async (id, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await User_1.User.update({ password: hashedPassword }, { where: { id } });
    return User_1.User.findByPk(id);
};
exports.updateUserPassword = updateUserPassword;
const updateUserTemporalPassword = async (id, temporalPassword) => {
    const hashedTemporalPassword = await bcrypt_1.default.hash(temporalPassword, 10);
    await User_1.User.update({ temporalPassword: hashedTemporalPassword }, { where: { id } });
    return User_1.User.findByPk(id);
};
exports.updateUserTemporalPassword = updateUserTemporalPassword;
const deleteUser = async (id) => {
    return await User_1.User.destroy({ where: { id } });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userService.js.map