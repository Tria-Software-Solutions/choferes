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
exports.deleteHoursWorked = exports.updateHoursWorked = exports.getHoursWorkedById = exports.getAllHoursWorked = exports.createHoursWorked = void 0;
const hoursWorkedService = __importStar(require("../services/hoursWorkedService"));
const createHoursWorked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hoursWorked = yield hoursWorkedService.createHoursWorked(req.body);
        return res.status(201).json(hoursWorked);
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating HoursWorked", error });
    }
});
exports.createHoursWorked = createHoursWorked;
const getAllHoursWorked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hoursWorked = yield hoursWorkedService.getAllHoursWorked();
        return res.status(200).json(hoursWorked);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching HoursWorked", error });
    }
});
exports.getAllHoursWorked = getAllHoursWorked;
const getHoursWorkedById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const hoursWorked = yield hoursWorkedService.getHoursWorkedById(id);
        if (hoursWorked) {
            return res.status(200).json(hoursWorked);
        }
        else {
            return res.status(404).json({ message: "HoursWorked entry not found" });
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching HoursWorked by ID", error });
    }
});
exports.getHoursWorkedById = getHoursWorkedById;
const updateHoursWorked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedHoursWorked = yield hoursWorkedService.updateHoursWorked(id, req.body);
        if (updatedHoursWorked) {
            return res.status(200).json(updatedHoursWorked);
        }
        else {
            return res.status(404).json({ message: "HoursWorked entry not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating HoursWorked", error });
    }
});
exports.updateHoursWorked = updateHoursWorked;
const deleteHoursWorked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield hoursWorkedService.deleteHoursWorked(Number(id));
        if (deleted) {
            return res.status(204).send();
        }
        else {
            return res.status(404).json({ message: "HoursWorked entry not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting HoursWorked", error });
    }
});
exports.deleteHoursWorked = deleteHoursWorked;
