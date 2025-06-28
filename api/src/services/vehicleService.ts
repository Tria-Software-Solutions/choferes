import { Op } from "sequelize";
import { Vehicle } from "../models/Vehicle";

export const getVehicles = async () => {
  return Vehicle.findAll({
    order: [['parkingDate', 'DESC']],
    attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
  });
};

export const getVehicleById = async (id: number) => {
  return Vehicle.findByPk(id, {
    attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
  });
};

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
    order: [['parkingDate', 'DESC']],
    attributes: ['id', 'ticket', 'licensePlate', 'brand', 'color', 'parkingLot', 'notes', 'parkingDate', 'createdAt', 'updatedAt']
  });
};

export const createVehicle = async (data: Omit<Vehicle, "id">) => {
  const vehicleData = {
    ...data,
    parkingDate: data.parkingDate || new Date()
  };
  
  const newVehicle = await Vehicle.create(vehicleData);
  return newVehicle;
};

export const updateVehicle = async (id: number, data: Partial<Vehicle>) => {
  const [updatedRows] = await Vehicle.update(data, { 
    where: { id },
    returning: true
  });
  
  if (updatedRows === 0) {
    throw new Error('Vehicle not found');
  }
  
  return Vehicle.findByPk(id);
};

export const deleteVehicle = async (id: number) => {
  const deletedRows = await Vehicle.destroy({ where: { id } });
  
  if (deletedRows === 0) {
    throw new Error('Vehicle not found');
  }
  
  return { success: true, deletedRows };
};
