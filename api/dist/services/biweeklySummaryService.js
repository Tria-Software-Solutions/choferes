"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBiweeklySummary = exports.updateBiweeklySummary = exports.createBiweeklySummary = exports.getCurrentBiweeklySummary = exports.getBiweeklySummaries = void 0;
const BiweeklySummary_1 = require("../models/BiweeklySummary");
const getBiweeklySummaries = async () => {
    return BiweeklySummary_1.BiweeklySummary.findAll();
};
exports.getBiweeklySummaries = getBiweeklySummaries;
const getCurrentBiweeklySummary = async (employeeId, biweekNumber, month, year) => {
    return BiweeklySummary_1.BiweeklySummary.findOne({
        where: { employeeId, biweekNumber, month, year },
    });
};
exports.getCurrentBiweeklySummary = getCurrentBiweeklySummary;
const createBiweeklySummary = async (data) => {
    const newBiweeklySummary = await BiweeklySummary_1.BiweeklySummary.create(data);
    await newBiweeklySummary.reload();
    return newBiweeklySummary;
};
exports.createBiweeklySummary = createBiweeklySummary;
const updateBiweeklySummary = async (id, data) => {
    await BiweeklySummary_1.BiweeklySummary.update(data, { where: { id } });
    return BiweeklySummary_1.BiweeklySummary.findByPk(id);
};
exports.updateBiweeklySummary = updateBiweeklySummary;
const deleteBiweeklySummary = async (id) => {
    return BiweeklySummary_1.BiweeklySummary.destroy({ where: { id } });
};
exports.deleteBiweeklySummary = deleteBiweeklySummary;
//# sourceMappingURL=biweeklySummaryService.js.map