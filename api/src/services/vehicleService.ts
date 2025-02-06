import { Op, Sequelize } from "sequelize";
import { Vehicle } from "../models/Vehicle";

export const createVehicle = async (data: {
  ticket: string;
  licensePlate: string;
  brand: string;
  color: string;
  parkingLot: string;
  notes?: string;
}) => {
  return Vehicle.create(data);
};

export const getAllVehicles = async () => {
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

export const updateVehicle = async (
  id: number,
  data: Partial<{
    ticket: string;
    licensePlate: string;
    brand: string;
    color: string;
    parkingLot: string;
    notes: string;
  }>
) => {
  await Vehicle.update(data, { where: { id } });
  return Vehicle.findByPk(id);
};

export const deleteVehicle = async (id: number) => {
  return Vehicle.destroy({ where: { id } });
};
