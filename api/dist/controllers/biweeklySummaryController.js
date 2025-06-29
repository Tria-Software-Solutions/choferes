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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBiweeklySummary = exports.updateBiweeklySummary = exports.createBiweeklySummary = exports.getCurrentBiweeklySummary = exports.getBiweeklySummaries = void 0;
const biweeklySummaryService = __importStar(require("../services/biweeklySummaryService"));
const getBiweeklySummaries = async (req, res) => {
    try {
        const summaries = await biweeklySummaryService.getBiweeklySummaries();
        return res.status(200).json(summaries);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching BiweeklySummaries", error });
    }
};
exports.getBiweeklySummaries = getBiweeklySummaries;
const getCurrentBiweeklySummary = async (req, res) => {
    try {
        const summary = await biweeklySummaryService.getCurrentBiweeklySummary(Number(req.params.id), Number(req.query.biweekNumber), Number(req.query.month), Number(req.query.year));
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
};
exports.getCurrentBiweeklySummary = getCurrentBiweeklySummary;
const createBiweeklySummary = async (req, res) => {
    try {
        const newBiweeklySummary = await biweeklySummaryService.createBiweeklySummary(req.body);
        return res.status(201).json(newBiweeklySummary);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error creating BiweeklySummary", error });
    }
};
exports.createBiweeklySummary = createBiweeklySummary;
const updateBiweeklySummary = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedSummary = await biweeklySummaryService.updateBiweeklySummary(id, req.body);
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
};
exports.updateBiweeklySummary = updateBiweeklySummary;
const deleteBiweeklySummary = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await biweeklySummaryService.deleteBiweeklySummary(id);
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
};
exports.deleteBiweeklySummary = deleteBiweeklySummary;
//# sourceMappingURL=biweeklySummaryController.js.map