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
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehiclesByDate = exports.getVehicleById = exports.getVehicles = void 0;
const vehicleService = __importStar(require("../services/vehicleService"));
const date_fns_1 = require("date-fns");
const getVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleService.getVehicles();
        return res.status(200).json(vehicles);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Vehicles", error });
    }
};
exports.getVehicles = getVehicles;
const getVehicleById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vehicle = await vehicleService.getVehicleById(id);
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
};
exports.getVehicleById = getVehicleById;
const getVehiclesByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ message: "Date parameter is required" });
        }
        const parsedDate = (0, date_fns_1.parseISO)(date);
        if (!(0, date_fns_1.isValid)(parsedDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        const vehicles = await vehicleService.getVehiclesByDate(parsedDate);
        return res.status(200).json(vehicles);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Vehicles by date", error });
    }
};
exports.getVehiclesByDate = getVehiclesByDate;
const createVehicle = async (req, res) => {
    try {
        const vehicleData = {
            ...req.body,
            parkingDate: req.body.parkingDate ? (0, date_fns_1.parseISO)(req.body.parkingDate) : new Date()
        };
        const newVehicle = await vehicleService.createVehicle(vehicleData);
        return res.status(201).json(newVehicle);
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating Vehicle", error });
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updateData = { ...req.body };
        if (req.body.parkingDate) {
            updateData.parkingDate = (0, date_fns_1.parseISO)(req.body.parkingDate);
        }
        const updatedVehicle = await vehicleService.updateVehicle(id, updateData);
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
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await vehicleService.deleteVehicle(id);
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
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicleController.js.map