"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle =
  exports.updateVehicle =
  exports.createVehicle =
  exports.getVehiclesByDate =
  exports.getVehicleById =
  exports.getVehicles =
    void 0;
const sequelize_1 = require("sequelize");
const Vehicle_1 = require("../models/Vehicle");
const getVehicles = async () => {
  return Vehicle_1.Vehicle.findAll({
    order: [["parkingDate", "DESC"]],
    attributes: [
      "id",
      "ticket",
      "licensePlate",
      "brand",
      "color",
      "parkingLot",
      "notes",
      "parkingDate",
      "createdAt",
      "updatedAt",
    ],
  });
};
exports.getVehicles = getVehicles;
const getVehicleById = async (id) => {
  return Vehicle_1.Vehicle.findByPk(id, {
    attributes: [
      "id",
      "ticket",
      "licensePlate",
      "brand",
      "color",
      "parkingLot",
      "notes",
      "parkingDate",
      "createdAt",
      "updatedAt",
    ],
  });
};
exports.getVehicleById = getVehicleById;
const getVehiclesByDate = async (parkingDate) => {
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
    order: [["parkingDate", "DESC"]],
    attributes: [
      "id",
      "ticket",
      "licensePlate",
      "brand",
      "color",
      "parkingLot",
      "notes",
      "parkingDate",
      "createdAt",
      "updatedAt",
    ],
  });
};
exports.getVehiclesByDate = getVehiclesByDate;
const createVehicle = async (data) => {
  const vehicleData = {
    ...data,
    parkingDate: data.parkingDate || new Date(),
  };
  const newVehicle = await Vehicle_1.Vehicle.create(vehicleData);
  return newVehicle;
};
exports.createVehicle = createVehicle;
const updateVehicle = async (id, data) => {
  const [updatedRows] = await Vehicle_1.Vehicle.update(data, {
    where: { id },
    returning: true,
  });
  if (updatedRows === 0) {
    throw new Error("Vehicle not found");
  }
  return Vehicle_1.Vehicle.findByPk(id);
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (id) => {
  const deletedRows = await Vehicle_1.Vehicle.destroy({ where: { id } });
  if (deletedRows === 0) {
    throw new Error("Vehicle not found");
  }
  return { success: true, deletedRows };
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicleService.js.map
