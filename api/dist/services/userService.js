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
exports.getUserById = exports.getUsers = exports.authenticateUser = exports.createUser = void 0;
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET || "secret";
const createUser = (firstName, lastName, email, username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield User_1.User.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
    });
    return user;
});
exports.createUser = createUser;
const authenticateUser = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
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
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, secretKey, {
        expiresIn: "1h",
    });
    return { user, token };
});
exports.authenticateUser = authenticateUser;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.User.findAll({ include: Role_1.Role });
    return users;
});
exports.getUsers = getUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findByPk(id, { include: Role_1.Role });
    return user;
});
exports.getUserById = getUserById;
