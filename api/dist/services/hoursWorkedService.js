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
exports.deleteHoursWorked = exports.updateHoursWorked = exports.getHoursWorkedById = exports.getAllHoursWorked = exports.createHoursWorked = void 0;
const HoursWorked_1 = require("../models/HoursWorked");
const Employee_1 = require("../models/Employee");
const Schedule_1 = require("../models/Schedule");
const createHoursWorked = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield HoursWorked_1.HoursWorked.create(data);
});
exports.createHoursWorked = createHoursWorked;
const getAllHoursWorked = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield HoursWorked_1.HoursWorked.findAll({
        include: [
            { model: Employee_1.Employee, attributes: ["firstName", "lastName"] },
            { model: Schedule_1.Schedule, attributes: ["day", "label", "hours"] },
        ],
    });
});
exports.getAllHoursWorked = getAllHoursWorked;
const getHoursWorkedById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield HoursWorked_1.HoursWorked.findByPk(id, {
        include: [
            { model: Employee_1.Employee, attributes: ["firstName", "lastName"] },
            { model: Schedule_1.Schedule, attributes: ["day", "label", "hours"] },
        ],
    });
});
exports.getHoursWorkedById = getHoursWorkedById;
const updateHoursWorked = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield HoursWorked_1.HoursWorked.update(data, { where: { id } });
    return HoursWorked_1.HoursWorked.findByPk(id);
});
exports.updateHoursWorked = updateHoursWorked;
const deleteHoursWorked = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield HoursWorked_1.HoursWorked.destroy({ where: { id } });
});
exports.deleteHoursWorked = deleteHoursWorked;
