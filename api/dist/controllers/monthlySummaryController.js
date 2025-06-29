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
exports.deleteMonthlySummary = exports.updateMonthlySummary = exports.createMonthlySummary = exports.getCurrentMonthlySummary = exports.getMonthlySummaries = void 0;
const monthlySummaryService = __importStar(require("../services/monthlySummaryService"));
const getMonthlySummaries = async (req, res) => {
    try {
        const summaries = await monthlySummaryService.getMonthlySummaries();
        return res.status(200).json(summaries);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching MonthlySummaries", error });
    }
};
exports.getMonthlySummaries = getMonthlySummaries;
const getCurrentMonthlySummary = async (req, res) => {
    try {
        const summary = await monthlySummaryService.getCurrentMonthlySummary(Number(req.params.id), Number(req.query.month), Number(req.query.year));
        if (summary) {
            return res.status(200).json(summary);
        }
        else {
            return res.status(404).json({ message: "MonthlySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching MonthlySummary", error });
    }
};
exports.getCurrentMonthlySummary = getCurrentMonthlySummary;
const createMonthlySummary = async (req, res) => {
    try {
        const newMonthlySummary = await monthlySummaryService.createMonthlySummary(req.body);
        return res.status(201).json(newMonthlySummary);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error creating MonthlySummary", error });
    }
};
exports.createMonthlySummary = createMonthlySummary;
const updateMonthlySummary = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedSummary = await monthlySummaryService.updateMonthlySummary(id, req.body);
        if (updatedSummary) {
            return res.status(200).json(updatedSummary);
        }
        else {
            return res.status(404).json({ message: "MonthlySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error updating MonthlySummary", error });
    }
};
exports.updateMonthlySummary = updateMonthlySummary;
const deleteMonthlySummary = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await monthlySummaryService.deleteMonthlySummary(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "MonthlySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error deleting MonthlySummary", error });
    }
};
exports.deleteMonthlySummary = deleteMonthlySummary;
//# sourceMappingURL=monthlySummaryController.js.map