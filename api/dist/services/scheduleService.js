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
exports.deleteSchedule = exports.updateSchedule = exports.createSchedule = exports.getScheduleById = exports.getSchedules = void 0;
const Schedule_1 = require("../models/Schedule");
const getSchedules = () => __awaiter(void 0, void 0, void 0, function* () {
    return Schedule_1.Schedule.findAll();
});
exports.getSchedules = getSchedules;
const getScheduleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Schedule_1.Schedule.findByPk(id);
});
exports.getScheduleById = getScheduleById;
const createSchedule = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Schedule_1.Schedule.create(data);
});
exports.createSchedule = createSchedule;
const updateSchedule = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield Schedule_1.Schedule.update(data, { where: { id } });
    return Schedule_1.Schedule.findByPk(id);
});
exports.updateSchedule = updateSchedule;
const deleteSchedule = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Schedule_1.Schedule.destroy({ where: { id } });
});
exports.deleteSchedule = deleteSchedule;
