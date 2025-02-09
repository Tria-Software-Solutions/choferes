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
exports.deleteVehicle = exports.updateVehicle = exports.getVehiclesByDate = exports.getVehicleById = exports.getAllVehicles = exports.createVehicle = void 0;
const vehicleService = __importStar(require("../services/vehicleService"));
const date_fns_1 = require("date-fns");
const createVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newVehicle = yield vehicleService.createVehicle(req.body);
        return res.status(201).json(newVehicle);
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating Vehicle", error });
    }
});
exports.createVehicle = createVehicle;
const getAllVehicles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicles = yield vehicleService.getAllVehicles();
        return res.status(200).json(vehicles);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Vehicles", error });
    }
});
exports.getAllVehicles = getAllVehicles;
const getVehicleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const vehicle = yield vehicleService.getVehicleById(id);
        if (vehicle) {
            return res.status(200).json(vehicle);
        }
        else {
            return res.status(404).json({ message: "Vehicle not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Vehicle", error });
    }
});
exports.getVehicleById = getVehicleById;
const getVehiclesByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }
        const createdAt = (0, date_fns_1.parseISO)(date);
        if (!(0, date_fns_1.isValid)(createdAt)) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        const vehicles = yield vehicleService.getVehiclesByDate(createdAt);
        return res.status(200).json(vehicles);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Vehicles", error });
    }
});
exports.getVehiclesByDate = getVehiclesByDate;
const updateVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedVehicle = yield vehicleService.updateVehicle(id, req.body);
        if (updatedVehicle) {
            return res.status(200).json(updatedVehicle);
        }
        else {
            return res.status(404).json({ message: "Vehicle not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating Vehicle", error });
    }
});
exports.updateVehicle = updateVehicle;
const deleteVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield vehicleService.deleteVehicle(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "Vehicle not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting Vehicle", error });
    }
});
exports.deleteVehicle = deleteVehicle;
