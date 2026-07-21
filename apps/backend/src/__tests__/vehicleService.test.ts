
// Mock Vehicle model - Vehicle is both a named AND default export
// The service uses: import { Vehicle } from "../models/Vehicle" (named import)
jest.mock("../models/Vehicle", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  return {
    __esModule: true,
    Vehicle: mockFunctions,
    default: mockFunctions,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Vehicle = require("../models/Vehicle").default;
import * as vehicleService from "../services/vehicleService";

const mockVehicle = {
  id: 1,
  ticket: "12345",
  licensePlate: "ABC-123",
  brand: "Toyota",
  color: "Rojo",
  parkingLot: "A1",
  notes: "",
  parkingDate: new Date("2026-07-20"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getVehicles", () => {
  it("debería llamar a findAndCountAll con paginación por defecto", async () => {
    Vehicle.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [mockVehicle],
    });

    const result = await vehicleService.getVehicles({});

    expect(Vehicle.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockVehicle]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(50);
    expect(result.pagination.totalItems).toBe(1);
  });

  it("debería ordenar por parkingDate DESC", async () => {
    Vehicle.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await vehicleService.getVehicles({});

    const callArgs = Vehicle.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["parkingDate", "DESC"]]);
  });

  it("debería incluir atributos específicos", async () => {
    Vehicle.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await vehicleService.getVehicles({});

    const callArgs = Vehicle.findAndCountAll.mock.calls[0][0];
    expect(callArgs.attributes).toContain("id");
    expect(callArgs.attributes).toContain("licensePlate");
    expect(callArgs.attributes).toContain("brand");
  });
});

describe("getVehicleById", () => {
  it("debería llamar a findByPk con el id correcto", async () => {
    Vehicle.findByPk.mockResolvedValue(mockVehicle);

    const result = await vehicleService.getVehicleById(1);

    expect(Vehicle.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(result).toEqual(mockVehicle);
  });

  it("debería devolver null si no existe", async () => {
    Vehicle.findByPk.mockResolvedValue(null);

    const result = await vehicleService.getVehicleById(999);

    expect(result).toBeNull();
  });
});

describe("getVehiclesByDate", () => {
  it("debería filtrar vehículos por fecha usando Op.between", async () => {
    const testDate = new Date("2026-07-20");
    Vehicle.findAll.mockResolvedValue([mockVehicle]);

    const result = await vehicleService.getVehiclesByDate(testDate);

    expect(Vehicle.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Vehicle.findAll.mock.calls[0][0];

    const betweenRange = callArgs.where.parkingDate["$between"];
    expect(betweenRange).toBeDefined();
    expect(betweenRange).toHaveLength(2);
    expect(result).toEqual([mockVehicle]);
  });

  it("debería establecer el rango de fecha correcto (start/end of day)", async () => {
    const testDate = new Date("2026-07-20T15:30:00");
    Vehicle.findAll.mockResolvedValue([mockVehicle]);

    await vehicleService.getVehiclesByDate(testDate);

    const callArgs = Vehicle.findAll.mock.calls[0][0];
    const betweenRange = callArgs.where.parkingDate["$between"] as Date[];

    // Start of day should be 00:00:00.000
    expect(betweenRange[0].getHours()).toBe(0);
    expect(betweenRange[0].getMinutes()).toBe(0);
    expect(betweenRange[0].getSeconds()).toBe(0);

    // End of day should be 23:59:59.999
    expect(betweenRange[1].getHours()).toBe(23);
    expect(betweenRange[1].getMinutes()).toBe(59);
    expect(betweenRange[1].getSeconds()).toBe(59);
  });
});

describe("createVehicle", () => {
  it("debería crear y recargar el vehículo", async () => {
    const newData = {
      ticket: "99999",
      licensePlate: "XYZ-789",
      brand: "Honda",
      color: "Azul",
      parkingLot: "B2",
      notes: "",
      parkingDate: new Date(),
    };
    const createdVehicle = { id: 2, ...newData, reload: jest.fn() };

    Vehicle.create.mockResolvedValue(createdVehicle);

    const result = await vehicleService.createVehicle(newData as never);

    expect(Vehicle.create).toHaveBeenCalledWith(newData);
    expect(createdVehicle.reload).toHaveBeenCalled();
    expect(result).toEqual(createdVehicle);
  });
});

describe("updateVehicle", () => {
  it("debería actualizar y devolver el vehículo actualizado", async () => {
    const updateData = { color: "Negro" };
    Vehicle.update.mockResolvedValue([1]);
    Vehicle.findByPk.mockResolvedValue({
      ...mockVehicle,
      color: "Negro",
    });

    const result = await vehicleService.updateVehicle(1, updateData as never);

    expect(Vehicle.update).toHaveBeenCalledWith(updateData, {
      where: { id: 1 },
    });
    expect(result).toHaveProperty("color", "Negro");
  });
});

describe("deleteVehicle", () => {
  it("debería eliminar por id", async () => {
    Vehicle.destroy.mockResolvedValue(1);

    const result = await vehicleService.deleteVehicle(1);

    expect(Vehicle.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
