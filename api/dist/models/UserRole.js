"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = require("./User");
const Role_1 = require("./Role");
class UserRole extends sequelize_1.Model {
}
exports.UserRole = UserRole;
UserRole.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role_1.Role,
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize: database_1.default,
    modelName: "UserRole",
    tableName: "user_role",
});
