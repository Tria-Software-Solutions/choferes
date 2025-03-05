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
exports.deleteUser = exports.createUser = exports.getUserByUsername = exports.getUserById = exports.getUsers = exports.authenticateUser = void 0;
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret";
const authenticateUser = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!SECRET_KEY)
        throw new Error("JWT_SECRET_KEY is not set");
    const user = yield User_1.User.findOne({
        where: { username },
        include: [
            {
                model: Role_1.Role,
                through: { attributes: [] },
            },
        ],
    });
    if (!user)
        throw new Error("User not found");
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Incorrect password");
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "1h",
    });
    return { user, token };
});
exports.authenticateUser = authenticateUser;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findAll({
        include: [
            {
                model: Role_1.Role,
                through: { attributes: [] },
            },
        ],
    });
});
exports.getUsers = getUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByPk(id, { include: Role_1.Role });
});
exports.getUserById = getUserById;
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findOne({
        where: { username },
        include: Role_1.Role,
    });
});
exports.getUserByUsername = getUserByUsername;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
    return yield User_1.User.create(Object.assign(Object.assign({}, data), { password: hashedPassword }), { returning: true });
});
exports.createUser = createUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.destroy({ where: { id } });
});
exports.deleteUser = deleteUser;
