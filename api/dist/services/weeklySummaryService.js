"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWeeklySummary = exports.updateWeeklySummary = exports.createWeeklySummary = exports.hasWorkedCurrenWeeklySummary = exports.getCurrentWeeklySummary = exports.getWeeklySummaries = void 0;
const WeeklySummary_1 = require("../models/WeeklySummary");
const getWeeklySummaries = async () => {
    return WeeklySummary_1.WeeklySummary.findAll();
};
exports.getWeeklySummaries = getWeeklySummaries;
const getCurrentWeeklySummary = async (employeeId, weekNumber, month, year) => {
    return WeeklySummary_1.WeeklySummary.findOne({
        where: { employeeId, weekNumber, month, year },
    });
};
exports.getCurrentWeeklySummary = getCurrentWeeklySummary;
const hasWorkedCurrenWeeklySummary = async (employeeId, weekNumber, month, year) => {
    const summary = await WeeklySummary_1.WeeklySummary.findOne({
        where: { employeeId, weekNumber, month, year },
    });
    return !!summary;
};
exports.hasWorkedCurrenWeeklySummary = hasWorkedCurrenWeeklySummary;
const createWeeklySummary = async (data) => {
    const newWeeklySummary = await WeeklySummary_1.WeeklySummary.create(data);
    await newWeeklySummary.reload();
    return newWeeklySummary;
};
exports.createWeeklySummary = createWeeklySummary;
const updateWeeklySummary = async (id, data) => {
    await WeeklySummary_1.WeeklySummary.update(data, { where: { id } });
    return WeeklySummary_1.WeeklySummary.findByPk(id);
};
exports.updateWeeklySummary = updateWeeklySummary;
const deleteWeeklySummary = async (id) => {
    return WeeklySummary_1.WeeklySummary.destroy({ where: { id } });
};
exports.deleteWeeklySummary = deleteWeeklySummary;
//# sourceMappingURL=weeklySummaryService.js.map