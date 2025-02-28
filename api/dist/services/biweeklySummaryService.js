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
exports.deleteBiweeklySummary = exports.updateBiweeklySummary = exports.getBiweeklySummaryById = exports.getAllBiweeklySummaries = exports.createBiweeklySummary = void 0;
const BiweeklySummary_1 = require("../models/BiweeklySummary");
const createBiweeklySummary = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newBiweeklySummary = yield BiweeklySummary_1.BiweeklySummary.create(data);
    yield newBiweeklySummary.reload();
    return newBiweeklySummary;
});
exports.createBiweeklySummary = createBiweeklySummary;
const getAllBiweeklySummaries = () => __awaiter(void 0, void 0, void 0, function* () {
    return BiweeklySummary_1.BiweeklySummary.findAll();
});
exports.getAllBiweeklySummaries = getAllBiweeklySummaries;
const getBiweeklySummaryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return BiweeklySummary_1.BiweeklySummary.findByPk(id);
});
exports.getBiweeklySummaryById = getBiweeklySummaryById;
const updateBiweeklySummary = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield BiweeklySummary_1.BiweeklySummary.update(data, { where: { id } });
    return BiweeklySummary_1.BiweeklySummary.findByPk(id);
});
exports.updateBiweeklySummary = updateBiweeklySummary;
const deleteBiweeklySummary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return BiweeklySummary_1.BiweeklySummary.destroy({ where: { id } });
});
exports.deleteBiweeklySummary = deleteBiweeklySummary;
