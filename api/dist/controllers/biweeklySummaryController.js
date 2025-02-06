"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const biweeklySummaryService = __importStar(require("../services/biweeklySummaryService"));
const createBiweeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBiweeklySummary = yield biweeklySummaryService.createBiweeklySummary(req.body);
        return res.status(201).json(newBiweeklySummary);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error creating BiweeklySummary", error });
    }
});
exports.createBiweeklySummary = createBiweeklySummary;
const getAllBiweeklySummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summaries = yield biweeklySummaryService.getAllBiweeklySummaries();
        return res.status(200).json(summaries);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching BiweeklySummaries", error });
    }
});
exports.getAllBiweeklySummaries = getAllBiweeklySummaries;
const getBiweeklySummaryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const summary = yield biweeklySummaryService.getBiweeklySummaryById(id);
        if (summary) {
            return res.status(200).json(summary);
        }
        else {
            return res.status(404).json({ message: "BiweeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching BiweeklySummary", error });
    }
});
exports.getBiweeklySummaryById = getBiweeklySummaryById;
const updateBiweeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedSummary = yield biweeklySummaryService.updateBiweeklySummary(id, req.body);
        if (updatedSummary) {
            return res.status(200).json(updatedSummary);
        }
        else {
            return res.status(404).json({ message: "BiweeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error updating BiweeklySummary", error });
    }
});
exports.updateBiweeklySummary = updateBiweeklySummary;
const deleteBiweeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield biweeklySummaryService.deleteBiweeklySummary(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "BiweeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error deleting BiweeklySummary", error });
    }
});
exports.deleteBiweeklySummary = deleteBiweeklySummary;
