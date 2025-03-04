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
    return Vehicle_1.Vehicle.findAll();
});
exports.getVehicles = getVehicles;
const getVehicleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Vehicle_1.Vehicle.findByPk(id);
});
exports.getVehicleById = getVehicleById;
const getVehiclesByDate = (createdAt) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(createdAt);
    endOfDay.setHours(23, 59, 59, 999);
    return Vehicle_1.Vehicle.findAll({
        where: {
            createdAt: {
                [sequelize_1.Op.between]: [startOfDay, endOfDay],
            },
        },
    });
});
exports.getVehiclesByDate = getVehiclesByDate;
const createVehicle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newVehicle = yield Vehicle_1.Vehicle.create(data);
    yield newVehicle.reload();
    return newVehicle;
});
exports.createVehicle = createVehicle;
const updateVehicle = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield Vehicle_1.Vehicle.update(data, { where: { id } });
    return Vehicle_1.Vehicle.findByPk(id);
});
exports.updateVehicle = updateVehicle;
const deleteVehicle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Vehicle_1.Vehicle.destroy({ where: { id } });
});
exports.deleteVehicle = deleteVehicle;
