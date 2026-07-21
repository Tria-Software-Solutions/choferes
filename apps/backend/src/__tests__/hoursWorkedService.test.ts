
// Mock HoursWorked model - service uses named import: import { HoursWorked } from "../models/HoursWorked"
jest.mock("../models/HoursWorked", () => {
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
    HoursWorked: mockFunctions,
    default: mockFunctions,
  };
});

// Mock Employee model - needed by hoursWorkedService for the include association
jest.mock("../models/Employee", () => {
  const mockFunctions = {};

  return {
    __esModule: true,
    Employee: mockFunctions,
    default: mockFunctions,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const HoursWorked = require("../models/HoursWorked").default;
import * as hoursWorkedService from "../services/hoursWorkedService";

const mockHoursWorked = {
  id: 1,
  employeeId: 1,
  date: new Date("2026-07-20"),
  scheduleId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getHoursWorked", () => {
  it("debería llamar a findAndCountAll con paginación por defecto", async () => {
    HoursWorked.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [mockHoursWorked],
    });

    const result = await hoursWorkedService.getHoursWorked({});

    expect(HoursWorked.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockHoursWorked]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(50);
    expect(result.pagination.totalItems).toBe(1);
  });

  it("debería ordenar por date DESC", async () => {
    HoursWorked.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await hoursWorkedService.getHoursWorked({});

    const callArgs = HoursWorked.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["date", "DESC"]]);
  });

  it("debería incluir Employee en la consulta", async () => {
    HoursWorked.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await hoursWorkedService.getHoursWorked({});

    const callArgs = HoursWorked.findAndCountAll.mock.calls[0][0];
    expect(callArgs.include).toBeDefined();
    expect(callArgs.include).toHaveLength(1);
    expect(callArgs.include[0].model).toBeDefined();
  });

  it("debería pasar search query al include de Employee", async () => {
    HoursWorked.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await hoursWorkedService.getHoursWorked({ search: "Juan" });

    const callArgs = HoursWorked.findAndCountAll.mock.calls[0][0];

    // When search is provided, the include should have a where clause with Op.or
    const includeWhere = callArgs.include[0].where;
    expect(includeWhere).toBeDefined();
    const orClause = includeWhere["$or"] as unknown[];
    expect(orClause).toHaveLength(2);
  });

  it("debería manejar paginación personalizada", async () => {
    HoursWorked.findAndCountAll.mockResolvedValue({
      count: 100,
      rows: Array(25).fill(mockHoursWorked),
    });

    const result = await hoursWorkedService.getHoursWorked({
      page: "3",
      limit: "25",
    });

    expect(result.pagination.page).toBe(3);
    expect(result.pagination.limit).toBe(25);
    expect(result.pagination.totalPages).toBe(4);
  });
});

describe("getHoursWorkedById", () => {
  it("debería llamar a findByPk con el id correcto", async () => {
    HoursWorked.findByPk.mockResolvedValue(mockHoursWorked);

    const result = await hoursWorkedService.getHoursWorkedById(1);

    expect(HoursWorked.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(result).toEqual(mockHoursWorked);
  });

  it("debería devolver null si no existe", async () => {
    HoursWorked.findByPk.mockResolvedValue(null);

    const result = await hoursWorkedService.getHoursWorkedById(999);

    expect(result).toBeNull();
  });
});

describe("getHoursWorkedByEmployee", () => {
  it("debería buscar por employeeId", async () => {
    HoursWorked.findAll.mockResolvedValue([mockHoursWorked]);

    const result = await hoursWorkedService.getHoursWorkedByEmployee(1);

    expect(HoursWorked.findAll).toHaveBeenCalledWith({
      where: { employeeId: 1 },
      include: [expect.any(Object)],
    });
    expect(result).toEqual([mockHoursWorked]);
  });

  it("debería devolver array vacío si no hay registros", async () => {
    HoursWorked.findAll.mockResolvedValue([]);

    const result = await hoursWorkedService.getHoursWorkedByEmployee(999);

    expect(result).toEqual([]);
  });
});

describe("getHoursWorkedByDate", () => {
  it("debería filtrar por fecha usando Op.between", async () => {
    const testDate = new Date("2026-07-20");
    HoursWorked.findAll.mockResolvedValue([mockHoursWorked]);

    const result = await hoursWorkedService.getHoursWorkedByDate(testDate);

    expect(HoursWorked.findAll).toHaveBeenCalledTimes(1);
    const callArgs = HoursWorked.findAll.mock.calls[0][0];

    const betweenRange = callArgs.where.date["$between"] as Date[];
    expect(betweenRange).toBeDefined();
    expect(betweenRange).toHaveLength(2);
    expect(result).toEqual([mockHoursWorked]);
  });

  it("debería establecer el rango de fecha correcto", async () => {
    const testDate = new Date("2026-07-20T15:30:00");
    HoursWorked.findAll.mockResolvedValue([mockHoursWorked]);

    await hoursWorkedService.getHoursWorkedByDate(testDate);

    const callArgs = HoursWorked.findAll.mock.calls[0][0];
    const betweenRange = callArgs.where.date["$between"] as Date[];

    expect(betweenRange[0].getHours()).toBe(0);
    expect(betweenRange[0].getMinutes()).toBe(0);
    expect(betweenRange[1].getHours()).toBe(23);
    expect(betweenRange[1].getMinutes()).toBe(59);
  });

  it("debería incluir Employee en la consulta", async () => {
    const testDate = new Date("2026-07-20");
    HoursWorked.findAll.mockResolvedValue([mockHoursWorked]);

    await hoursWorkedService.getHoursWorkedByDate(testDate);

    const callArgs = HoursWorked.findAll.mock.calls[0][0];
    expect(callArgs.include).toHaveLength(1);
  });
});

describe("getHoursWorkedByDateRange", () => {
  it("debería filtrar por rango de fechas", async () => {
    const startDate = new Date("2026-07-01");
    const endDate = new Date("2026-07-31");
    HoursWorked.findAll.mockResolvedValue([mockHoursWorked]);

    const result = await hoursWorkedService.getHoursWorkedByDateRange(
      startDate,
      endDate,
    );

    expect(HoursWorked.findAll).toHaveBeenCalledTimes(1);
    const callArgs = HoursWorked.findAll.mock.calls[0][0];

    const betweenRange = callArgs.where.date["$between"] as Date[];
    expect(betweenRange[0]).toEqual(startDate);
    expect(betweenRange[1]).toEqual(endDate);
    expect(result).toEqual([mockHoursWorked]);
  });

  it("debería devolver array vacío si no hay registros en el rango", async () => {
    HoursWorked.findAll.mockResolvedValue([]);

    const result = await hoursWorkedService.getHoursWorkedByDateRange(
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result).toEqual([]);
  });
});

describe("createHoursWorked", () => {
  it("debería crear y recargar el registro", async () => {
    const newData = {
      employeeId: 1,
      date: new Date("2026-07-21"),
      scheduleId: 2,
    };
    const createdRecord = { id: 3, ...newData, reload: jest.fn() };

    HoursWorked.create.mockResolvedValue(createdRecord);

    const result = await hoursWorkedService.createHoursWorked(
      newData as Parameters<typeof hoursWorkedService.createHoursWorked>[0],
    );

    expect(HoursWorked.create).toHaveBeenCalledWith(newData);
    expect(createdRecord.reload).toHaveBeenCalled();
    expect(result).toEqual(createdRecord);
  });
});

describe("updateHoursWorked", () => {
  it("debería actualizar y devolver el registro actualizado", async () => {
    const updateData = { scheduleId: 3 };
    HoursWorked.update.mockResolvedValue([1]);
    HoursWorked.findByPk.mockResolvedValue({
      ...mockHoursWorked,
      scheduleId: 3,
    });

    const result = await hoursWorkedService.updateHoursWorked(
      1,
      updateData as Parameters<typeof hoursWorkedService.updateHoursWorked>[1],
    );

    expect(HoursWorked.update).toHaveBeenCalledWith(updateData, {
      where: { id: 1 },
    });
    expect(HoursWorked.findByPk).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty("scheduleId", 3);
  });
});

describe("deleteHoursWorked", () => {
  it("debería eliminar por id", async () => {
    HoursWorked.destroy.mockResolvedValue(1);

    const result = await hoursWorkedService.deleteHoursWorked(1);

    expect(HoursWorked.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});

describe("deleteAllHoursWorked", () => {
  it("debería eliminar todos los registros", async () => {
    HoursWorked.destroy.mockResolvedValue(10);

    const result = await hoursWorkedService.deleteAllHoursWorked();

    expect(HoursWorked.destroy).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(10);
  });
});
