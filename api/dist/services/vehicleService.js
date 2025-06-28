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
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehiclesByDate = exports.getVehicleById = exports.getVehicles = void 0;
const sequelize_1 = require("sequelize");
const Vehicle_1 = require("../models/Vehicle");
const getVehicles = () => __awaiter(void 0, void 0, void 0, function* () {
    return Vehicle_1.Vehicle.findAll({
        order: [['parkingDate', 'DESC']],
        attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
    });
});
exports.getVehicles = getVehicles;
const getVehicleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Vehicle_1.Vehicle.findByPk(id, {
        attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
    });
});
exports.getVehicleById = getVehicleById;
const getVehiclesByDate = (parkingDate) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfDay = new Date(parkingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parkingDate);
    endOfDay.setHours(23, 59, 59, 999);
    return Vehicle_1.Vehicle.findAll({
        where: {
            parkingDate: {
                [sequelize_1.Op.between]: [startOfDay, endOfDay],
            },
        },
        order: [['parkingDate', 'DESC']],
        attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
    });
});
exports.getVehiclesByDate = getVehiclesByDate;
const createVehicle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicleData = Object.assign(Object.assign({}, data), { parkingDate: data.parkingDate || new Date() });
    const newVehicle = yield Vehicle_1.Vehicle.create(vehicleData);
    return newVehicle;
});
exports.createVehicle = createVehicle;
const updateVehicle = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const [updatedRows] = yield Vehicle_1.Vehicle.update(data, {
        where: { id },
        returning: true
    });
    if (updatedRows === 0) {
        throw new Error('Vehicle not found');
    }
    return Vehicle_1.Vehicle.findByPk(id);
});
exports.updateVehicle = updateVehicle;
const deleteVehicle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedRows = yield Vehicle_1.Vehicle.destroy({ where: { id } });
    if (deletedRows === 0) {
        throw new Error('Vehicle not found');
    }
    return { success: true, deletedRows };
});
exports.deleteVehicle = deleteVehicle;
