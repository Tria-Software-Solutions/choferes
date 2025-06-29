"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMonthlySummary = exports.updateMonthlySummary = exports.createMonthlySummary = exports.getCurrentMonthlySummary = exports.getMonthlySummaries = void 0;
const MonthlySummary_1 = require("../models/MonthlySummary");
const getMonthlySummaries = async () => {
    return MonthlySummary_1.MonthlySummary.findAll();
};
exports.getMonthlySummaries = getMonthlySummaries;
const getCurrentMonthlySummary = async (employeeId, month, year) => {
    return MonthlySummary_1.MonthlySummary.findOne({
        where: { employeeId, month, year },
    });
};
exports.getCurrentMonthlySummary = getCurrentMonthlySummary;
const createMonthlySummary = async (data) => {
    const newMonthlySummary = await MonthlySummary_1.MonthlySummary.create(data);
    await newMonthlySummary.reload();
    return newMonthlySummary;
};
exports.createMonthlySummary = createMonthlySummary;
const updateMonthlySummary = async (id, data) => {
    await MonthlySummary_1.MonthlySummary.update(data, { where: { id } });
    return MonthlySummary_1.MonthlySummary.findByPk(id);
};
exports.updateMonthlySummary = updateMonthlySummary;
const deleteMonthlySummary = async (id) => {
    return MonthlySummary_1.MonthlySummary.destroy({ where: { id } });
};
exports.deleteMonthlySummary = deleteMonthlySummary;
//# sourceMappingURL=monthlySummaryService.js.map