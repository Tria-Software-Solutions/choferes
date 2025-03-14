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
exports.deleteWeeklySummary = exports.updateWeeklySummary = exports.hasWorkedCurrenWeeklySummary = exports.getCurrentWeeklySummary = exports.createWeeklySummary = exports.getWeeklySummaries = void 0;
const weeklySummaryService = __importStar(require("../services/weeklySummaryService"));
const getWeeklySummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summaries = yield weeklySummaryService.getWeeklySummaries();
        return res.status(200).json(summaries);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching WeeklySummaries", error });
    }
});
exports.getWeeklySummaries = getWeeklySummaries;
const createWeeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newWeeklySummary = yield weeklySummaryService.createWeeklySummary(req.body);
        return res.status(201).json(newWeeklySummary);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error creating WeeklySummary", error });
    }
});
exports.createWeeklySummary = createWeeklySummary;
const getCurrentWeeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield weeklySummaryService.getCurrentWeeklySummary(Number(req.params.id), Number(req.query.weekNumber), Number(req.query.month), Number(req.query.year));
        if (summary) {
            return res.status(200).json(summary);
        }
        else {
            return res.status(404).json({ message: "WeeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching WeeklySummary", error });
    }
});
exports.getCurrentWeeklySummary = getCurrentWeeklySummary;
const hasWorkedCurrenWeeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hasWorked = yield weeklySummaryService.hasWorkedCurrenWeeklySummary(Number(req.params.id), Number(req.query.weekNumber), Number(req.query.month), Number(req.query.year));
        return res.status(200).json({ hasWorked });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error checking work status", error });
    }
});
exports.hasWorkedCurrenWeeklySummary = hasWorkedCurrenWeeklySummary;
const updateWeeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedSummary = yield weeklySummaryService.updateWeeklySummary(id, req.body);
        if (updatedSummary) {
            return res.status(200).json(updatedSummary);
        }
        else {
            return res.status(404).json({ message: "WeeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error updating WeeklySummary", error });
    }
});
exports.updateWeeklySummary = updateWeeklySummary;
const deleteWeeklySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield weeklySummaryService.deleteWeeklySummary(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "WeeklySummary not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error deleting WeeklySummary", error });
    }
});
exports.deleteWeeklySummary = deleteWeeklySummary;
