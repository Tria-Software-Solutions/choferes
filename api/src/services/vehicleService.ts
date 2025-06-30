import { Op } from "sequelize";
import { Vehicle } from "../models/Vehicle";

export const getVehicles = async () =>
  Vehicle.findAll({
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

export const getVehicleById = async (id: number) =>
  Vehicle.findByPk(id, {
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

export const getVehiclesByDate = async (parkingDate: Date) => {
  const startOfDay = new Date(parkingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parkingDate);
  endOfDay.setHours(23, 59, 59, 999);

  return Vehicle.findAll({
    where: {
      parkingDate: {
        [Op.between]: [startOfDay, endOfDay],
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

export const createVehicle = async (data: Omit<Vehicle, "id">) => {
  const newVehicle = await Vehicle.create(data);
  await newVehicle.reload();
  return newVehicle;
};

export const updateVehicle = async (id: number, data: Omit<Vehicle, "id">) => {
  await Vehicle.update(data, { where: { id } });
  return Vehicle.findByPk(id);
};

export const deleteVehicle = async (id: number) => Vehicle.destroy({ where: { id } });
