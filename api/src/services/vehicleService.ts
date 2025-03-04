import { Op } from "sequelize";
import { Vehicle } from "../models/Vehicle";

export const getVehicles = async () => {
  return Vehicle.findAll();
};

export const getVehicleById = async (id: number) => {
  return Vehicle.findByPk(id);
};

export const getVehiclesByDate = async (createdAt: Date) => {
  const startOfDay = new Date(createdAt);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(createdAt);
  endOfDay.setHours(23, 59, 59, 999);

  return Vehicle.findAll({
    where: {
      createdAt: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
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

export const deleteVehicle = async (id: number) => {
  return Vehicle.destroy({ where: { id } });
};
