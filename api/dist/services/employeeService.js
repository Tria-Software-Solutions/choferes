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
exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getAllEmployees = exports.createEmployee = void 0;
const Employee_1 = require("../models/Employee");
const createEmployee = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Employee_1.Employee.create(data);
});
exports.createEmployee = createEmployee;
const getAllEmployees = () => __awaiter(void 0, void 0, void 0, function* () {
    return Employee_1.Employee.findAll();
});
exports.getAllEmployees = getAllEmployees;
const getEmployeeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Employee_1.Employee.findByPk(id);
});
exports.getEmployeeById = getEmployeeById;
const updateEmployee = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield Employee_1.Employee.update(data, { where: { id } });
    return Employee_1.Employee.findByPk(id);
});
exports.updateEmployee = updateEmployee;
const deleteEmployee = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Employee_1.Employee.destroy({ where: { id } });
});
exports.deleteEmployee = deleteEmployee;
