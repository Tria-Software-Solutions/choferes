// Service for business logic and database operations related to vehicles
// Note: Sequelize v3 uses string operators. Using inline types instead.
import { Vehicle } from "../models/Vehicle";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

// Get all vehicles (paginated, searchable), ordered by parking date
export const getVehicles = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, [
    "ticket",
    "licensePlate",
    "brand",
    "color",
    "parkingLot",
  ]);

  const options: Record<string, any> = {
    where: searchWhere,
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
  };
  return paginate<Vehicle>(Vehicle, options, params);
};

// Get a vehicle by its ID
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

// Get vehicles by a specific parking date
export const getVehiclesByDate = async (parkingDate: Date) => {
  const startOfDay = new Date(parkingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parkingDate);
  endOfDay.setHours(23, 59, 59, 999);

  return Vehicle.findAll({
    where: {
      parkingDate: {
        $between: [startOfDay, endOfDay],
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

// Create a new vehicle
export const createVehicle = async (data: Omit<Vehicle, "id">) => {
  const newVehicle = await Vehicle.create(data);
  await newVehicle.reload();
  return newVehicle;
};

// Update a vehicle by its ID
export const updateVehicle = async (id: number, data: Omit<Vehicle, "id">) => {
  await Vehicle.update(data, { where: { id } });
  return Vehicle.findByPk(id);
};

// Delete a vehicle by its ID
export const deleteVehicle = async (id: number) => Vehicle.destroy({ where: { id } });

// Delete all vehicles
export const deleteAllVehicles = async () => Vehicle.destroy({ where: {} });
