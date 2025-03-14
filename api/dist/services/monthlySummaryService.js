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
exports.deleteMonthlySummary = exports.updateMonthlySummary = exports.createMonthlySummary = exports.getCurrentMonthlySummary = exports.getMonthlySummaries = void 0;
const MonthlySummary_1 = require("../models/MonthlySummary");
const getMonthlySummaries = () => __awaiter(void 0, void 0, void 0, function* () {
    return MonthlySummary_1.MonthlySummary.findAll();
});
exports.getMonthlySummaries = getMonthlySummaries;
const getCurrentMonthlySummary = (employeeId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    return MonthlySummary_1.MonthlySummary.findOne({
        where: { employeeId, month, year },
    });
});
exports.getCurrentMonthlySummary = getCurrentMonthlySummary;
const createMonthlySummary = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield MonthlySummary_1.MonthlySummary.create(data);
});
exports.createMonthlySummary = createMonthlySummary;
const updateMonthlySummary = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield MonthlySummary_1.MonthlySummary.update(data, { where: { id } });
    return MonthlySummary_1.MonthlySummary.findByPk(id);
});
exports.updateMonthlySummary = updateMonthlySummary;
const deleteMonthlySummary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return MonthlySummary_1.MonthlySummary.destroy({ where: { id } });
});
exports.deleteMonthlySummary = deleteMonthlySummary;
