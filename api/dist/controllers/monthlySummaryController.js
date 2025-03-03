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
exports.deleteMonthlySummary = exports.updateMonthlySummary = exports.createMonthlySummary = exports.getMonthlySummaryById = exports.getMonthlySummaries = void 0;
const monthlySummaryService = __importStar(require("../services/monthlySummaryService"));
const getMonthlySummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summaries = yield monthlySummaryService.getMonthlySummaries();
        return res.status(200).json(summaries);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching MonthlySummaries', error });
    }
});
exports.getMonthlySummaries = getMonthlySummaries;
const getMonthlySummaryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const summary = yield monthlySummaryService.getMonthlySummaryById(id);
        if (summary) {
            return res.status(200).json(summary);
        }
        else {
            return res.status(404).json({ message: 'MonthlySummary not found' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching MonthlySummary', error });
    }
});
exports.getMonthlySummaryById = getMonthlySummaryById;
const createMonthlySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newMonthlySummary = yield monthlySummaryService.createMonthlySummary(req.body);
        return res.status(201).json(newMonthlySummary);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating MonthlySummary', error });
    }
});
exports.createMonthlySummary = createMonthlySummary;
const updateMonthlySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedSummary = yield monthlySummaryService.updateMonthlySummary(id, req.body);
        if (updatedSummary) {
            return res.status(200).json(updatedSummary);
        }
        else {
            return res.status(404).json({ message: 'MonthlySummary not found' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating MonthlySummary', error });
    }
});
exports.updateMonthlySummary = updateMonthlySummary;
const deleteMonthlySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield monthlySummaryService.deleteMonthlySummary(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: 'MonthlySummary not found' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Error deleting MonthlySummary', error });
    }
});
exports.deleteMonthlySummary = deleteMonthlySummary;
