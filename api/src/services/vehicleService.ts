import { Sequelize } from "sequelize";
import { Vehicle } from "../models/Vehicle";

export const createVehicle = async (data: {
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

export const getVehiclesGroupedByDate = async () => {
  const vehicles = await Vehicle.findAll({
    attributes: [
      [Sequelize.fn("DATE", Sequelize.col("createdAt")), "createdDate"], 
      [Sequelize.fn("COUNT", Sequelize.col("id")), "vehicleCount"], 
    ],
    group: ["createdDate"], 
    order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "ASC"]],
  });

  return vehicles.map((row: any) => ({
    createdDate: row.get("createdDate"),
    vehicleCount: row.get("vehicleCount"),
  }));
};

export const updateVehicle = async (
  id: number,
  data: Partial<{
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
