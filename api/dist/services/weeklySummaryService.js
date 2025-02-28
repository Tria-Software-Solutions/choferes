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
exports.deleteWeeklySummary = exports.updateWeeklySummary = exports.getWeeklySummaryById = exports.getAllWeeklySummaries = exports.createWeeklySummary = void 0;
const WeeklySummary_1 = require("../models/WeeklySummary");
const createWeeklySummary = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newWeeklySummary = yield WeeklySummary_1.WeeklySummary.create(data);
    yield newWeeklySummary.reload();
    return newWeeklySummary;
});
exports.createWeeklySummary = createWeeklySummary;
const getAllWeeklySummaries = () => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.findAll();
});
exports.getAllWeeklySummaries = getAllWeeklySummaries;
const getWeeklySummaryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.findByPk(id);
});
exports.getWeeklySummaryById = getWeeklySummaryById;
const updateWeeklySummary = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield WeeklySummary_1.WeeklySummary.update(data, { where: { id } });
    return WeeklySummary_1.WeeklySummary.findByPk(id);
});
exports.updateWeeklySummary = updateWeeklySummary;
const deleteWeeklySummary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return WeeklySummary_1.WeeklySummary.destroy({ where: { id } });
});
exports.deleteWeeklySummary = deleteWeeklySummary;
