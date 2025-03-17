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
exports.deleteWeeklySummary = exports.updateWeeklySummary = exports.createWeeklySummary = exports.hasWorkedCurrenWeeklySummary = exports.getCurrentWeeklySummary = exports.getWeeklySummaries = void 0;
const WeeklySummary_1 = require("../models/WeeklySummary");
const getWeeklySummaries = () => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.findAll();
});
exports.getWeeklySummaries = getWeeklySummaries;
const getCurrentWeeklySummary = (employeeId, weekNumber, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.findOne({
        where: { employeeId, weekNumber, month, year },
    });
});
exports.getCurrentWeeklySummary = getCurrentWeeklySummary;
const hasWorkedCurrenWeeklySummary = (employeeId, weekNumber, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    const summary = yield WeeklySummary_1.WeeklySummary.findOne({
        where: { employeeId, weekNumber, month, year },
    });
    return !!summary;
});
exports.hasWorkedCurrenWeeklySummary = hasWorkedCurrenWeeklySummary;
const createWeeklySummary = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newWeeklySummary = yield WeeklySummary_1.WeeklySummary.create(data);
    yield newWeeklySummary.reload();
    return newWeeklySummary;
});
exports.createWeeklySummary = createWeeklySummary;
const updateWeeklySummary = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield WeeklySummary_1.WeeklySummary.update(data, { where: { id } });
    return WeeklySummary_1.WeeklySummary.findByPk(id);
});
exports.updateWeeklySummary = updateWeeklySummary;
const deleteWeeklySummary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.destroy({ where: { id } });
});
exports.deleteWeeklySummary = deleteWeeklySummary;
