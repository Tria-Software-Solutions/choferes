"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.createSchedule = exports.getScheduleById = exports.getSchedules = void 0;
const Schedule_1 = require("../models/Schedule");
const getSchedules = async () => {
    return Schedule_1.Schedule.findAll();
};
exports.getSchedules = getSchedules;
const getScheduleById = async (id) => {
    return Schedule_1.Schedule.findByPk(id);
};
exports.getScheduleById = getScheduleById;
const createSchedule = async (data) => {
    const newSchedule = await Schedule_1.Schedule.create(data);
    await newSchedule.reload();
    return newSchedule;
};
exports.createSchedule = createSchedule;
const updateSchedule = async (id, data) => {
    await Schedule_1.Schedule.update(data, { where: { id } });
    return Schedule_1.Schedule.findByPk(id);
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (id) => {
    return Schedule_1.Schedule.destroy({ where: { id } });
};
exports.deleteSchedule = deleteSchedule;
//# sourceMappingURL=scheduleService.js.map