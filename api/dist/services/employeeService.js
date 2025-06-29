"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeesWithRelations = exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getEmployees = void 0;
const sequelize_1 = require("sequelize");
const Employee_1 = require("../models/Employee");
const HoursWorked_1 = require("../models/HoursWorked");
const getEmployees = async (page = 1, limit = 25, search) => {
    const offset = (page - 1) * limit;
    const whereClause = search ? {
        [sequelize_1.Op.or]: [
            { firstName: { [sequelize_1.Op.iLike]: `%${search}%` } },
            { lastName: { [sequelize_1.Op.iLike]: `%${search}%` } }
        ]
    } : {};
    const { count, rows } = await Employee_1.Employee.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        attributes: ['id', 'firstName', 'lastName', 'createdAt', 'updatedAt'],
    });
    return {
        employees: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
    };
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (id) => {
    return Employee_1.Employee.findByPk(id, {
        attributes: ['id', 'firstName', 'lastName', 'createdAt', 'updatedAt']
    });
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (data) => {
    const newEmployee = await Employee_1.Employee.create(data);
    return newEmployee;
};
exports.createEmployee = createEmployee;
const updateEmployee = async (id, data) => {
    const [updatedRows] = await Employee_1.Employee.update(data, {
        where: { id },
        returning: true
    });
    if (updatedRows === 0) {
        throw new Error('Employee not found');
    }
    return Employee_1.Employee.findByPk(id);
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (id) => {
    const deletedRows = await Employee_1.Employee.destroy({ where: { id } });
    if (deletedRows === 0) {
        throw new Error('Employee not found');
    }
    return { success: true, deletedRows };
};
exports.deleteEmployee = deleteEmployee;
const getEmployeesWithRelations = async (includeHoursWorked = false) => {
    const include = [];
    if (includeHoursWorked) {
        include.push({
            model: HoursWorked_1.HoursWorked,
            as: 'hoursWorked',
            attributes: ['id', 'date', 'scheduleId'],
            separate: true,
            limit: 100
        });
    }
    return Employee_1.Employee.findAll({
        include,
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        attributes: ['id', 'firstName', 'lastName']
    });
};
exports.getEmployeesWithRelations = getEmployeesWithRelations;
//# sourceMappingURL=employeeService.js.map