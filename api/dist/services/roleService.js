"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleByName = exports.getRoleById = exports.getRoles = void 0;
const Permission_1 = require("../models/Permission");
const Role_1 = require("../models/Role");
const getRoles = async () => {
    return await Role_1.Role.findAll({
        include: [
            {
                model: Permission_1.Permission,
                as: "permissions",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getRoles = getRoles;
const getRoleById = async (id) => {
    return await Role_1.Role.findByPk(id, {
        include: [
            {
                model: Permission_1.Permission,
                as: "permissions",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getRoleById = getRoleById;
const getRoleByName = async (name) => {
    return await Role_1.Role.findOne({
        where: { name },
        include: [
            {
                model: Permission_1.Permission,
                as: "permissions",
                through: { attributes: [] },
            },
        ],
    });
};
exports.getRoleByName = getRoleByName;
const createRole = async (data) => {
    const newRole = await Role_1.Role.create(data);
    await newRole.reload();
    return newRole;
};
exports.createRole = createRole;
const updateRole = async (id, data) => {
    await Role_1.Role.update(data, { where: { id } });
    return Role_1.Role.findByPk(id);
};
exports.updateRole = updateRole;
const deleteRole = async (id) => {
    return await Role_1.Role.destroy({ where: { id } });
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleService.js.map