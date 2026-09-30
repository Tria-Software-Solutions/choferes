// Service for business logic and database operations related to vehicles
// Note: Sequelize v3 uses string operators. Using inline types instead.
import { Vehicle } from "../models/Vehicle";
import { notifyManagementRoles } from "./notificationService";
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
// The vehicle identifier that people recognise in a message: the plate when
// there is one, otherwise the parking ticket.
const vehicleLabel = (vehicle: Partial<Vehicle>): string =>
  vehicle.licensePlate?.trim() || vehicle.ticket?.trim() || `#${vehicle.id}`;

export const createVehicle = async (data: Omit<Vehicle, "id">) => {
  const newVehicle = await Vehicle.create(data);
  await newVehicle.reload();
  await notifyManagementRoles({
    source: `vehicle-created:${newVehicle.id}`,
    title: "Vehículo registrado",
    message: `Se registró el vehículo ${vehicleLabel(newVehicle)}.`,
    type: "info",
    category: "vehicle",
    priority: "medium",
    actionUrl: "/vehicles",
    actionText: "Ver vehículos",
  });
  return newVehicle;
};

// Update a vehicle by its ID
export const updateVehicle = async (id: number, data: Omit<Vehicle, "id">) => {
  await Vehicle.update(data, { where: { id } });
  const updated = await Vehicle.findByPk(id);
  if (updated) {
    await notifyManagementRoles({
      source: `vehicle-updated:${id}:${Date.now()}`,
      title: "Vehículo actualizado",
      message: `Se actualizó el vehículo ${vehicleLabel(updated)}.`,
      type: "info",
      category: "vehicle",
      priority: "low",
      actionUrl: "/vehicles",
      actionText: "Ver vehículos",
    });
  }
  return updated;
};

// Delete a vehicle by its ID
export const deleteVehicle = async (id: number) => {
  const vehicle = await Vehicle.findByPk(id);
  const deleted = await Vehicle.destroy({ where: { id } });
  if (deleted > 0) {
    await notifyManagementRoles({
      source: `vehicle-deleted:${id}`,
      title: "Vehículo eliminado",
      message: `Se eliminó el vehículo ${vehicle ? vehicleLabel(vehicle) : `#${id}`}.`,
      type: "warning",
      category: "vehicle",
      priority: "medium",
      actionUrl: "/vehicles",
      actionText: "Ver vehículos",
    });
  }
  return deleted;
};

// Delete all vehicles
export const deleteAllVehicles = async () => Vehicle.destroy({ where: {} });
