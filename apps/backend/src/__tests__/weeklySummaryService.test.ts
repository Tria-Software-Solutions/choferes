// Mock WeeklySummary model — service uses: import { WeeklySummary } from "../models/WeeklySummary" (named import)
jest.mock("../models/WeeklySummary", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, WeeklySummary: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const WeeklySummary = require("../models/WeeklySummary").default;
import * as weeklySummaryService from "../services/weeklySummaryService";

const mockSummary = {
  id: 1,
  employeeId: 1,
  weekNumber: 29,
  month: 7,
  year: 2026,
  totalHours: 40,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getWeeklySummaries", () => {
  it("debería devolver resúmenes paginados ordenados por year DESC, weekNumber DESC", async () => {
    WeeklySummary.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockSummary] });

    const result = await weeklySummaryService.getWeeklySummaries({});

    expect(WeeklySummary.findAndCountAll).toHaveBeenCalledTimes(1);
    const callArgs = WeeklySummary.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["year", "DESC"], ["weekNumber", "DESC"]]);
    expect(result.data).toEqual([mockSummary]);
    expect(result.pagination.page).toBe(1);
  });

  it("debería manejar paginación personalizada", async () => {
    WeeklySummary.findAndCountAll.mockResolvedValue({ count: 50, rows: Array(10).fill(mockSummary) });

    const result = await weeklySummaryService.getWeeklySummaries({ page: "2", limit: "10" });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(5);
  });
});

describe("getWeeklySummaryById", () => {
  it("debería devolver resumen por id", async () => {
    WeeklySummary.findByPk.mockResolvedValue(mockSummary);

    const result = await weeklySummaryService.getWeeklySummaryById(1);

    expect(WeeklySummary.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSummary);
  });

  it("debería devolver null si no existe", async () => {
    WeeklySummary.findByPk.mockResolvedValue(null);

    const result = await weeklySummaryService.getWeeklySummaryById(999);

    expect(result).toBeNull();
  });
});

describe("getWeeklySummariesByEmployee", () => {
  it("debería devolver resúmenes por employeeId", async () => {
    WeeklySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await weeklySummaryService.getWeeklySummariesByEmployee(1);

    expect(WeeklySummary.findAll).toHaveBeenCalledWith({ where: { employeeId: 1 } });
    expect(result).toEqual([mockSummary]);
  });
});

describe("getWeeklySummariesByWeek", () => {
  it("debería devolver resúmenes por semana y año", async () => {
    WeeklySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await weeklySummaryService.getWeeklySummariesByWeek(29, 2026);

    expect(WeeklySummary.findAll).toHaveBeenCalledWith({
      where: { week: 29, year: 2026 },
    });
    expect(result).toEqual([mockSummary]);
  });
});

describe("getCurrentWeeklySummary", () => {
  it("debería buscar por employeeId, week, year", async () => {
    WeeklySummary.findOne.mockResolvedValue(mockSummary);

    const result = await weeklySummaryService.getCurrentWeeklySummary(1, 29, 2026);

    expect(WeeklySummary.findOne).toHaveBeenCalledWith({
      where: { employeeId: 1, week: 29, year: 2026 },
    });
    expect(result).toEqual(mockSummary);
  });
});

describe("hasWorkedCurrenWeeklySummary", () => {
  it("debería devolver true si existe el resumen semanal", async () => {
    WeeklySummary.findOne.mockResolvedValue(mockSummary);

    const result = await weeklySummaryService.hasWorkedCurrenWeeklySummary(1, 29, 7, 2026);

    expect(WeeklySummary.findOne).toHaveBeenCalledWith({
      where: { employeeId: 1, weekNumber: 29, month: 7, year: 2026 },
    });
    expect(result).toBe(true);
  });

  it("debería devolver false si no existe", async () => {
    WeeklySummary.findOne.mockResolvedValue(null);

    const result = await weeklySummaryService.hasWorkedCurrenWeeklySummary(1, 99, 1, 2025);

    expect(result).toBe(false);
  });
});

describe("createWeeklySummary", () => {
  it("debería crear con upsert", async () => {
    const newData = {
      employeeId: 2,
      weekNumber: 30,
      month: 7,
      year: 2026,
      totalHours: 45,
    };
    const created = { id: 2, ...newData };

    WeeklySummary.upsert.mockResolvedValue([created, true]);

    const result = await weeklySummaryService.createWeeklySummary(newData as never);

    expect(WeeklySummary.upsert).toHaveBeenCalledWith(newData);
    expect(result).toEqual(created);
  });
});

describe("updateWeeklySummary", () => {
  it("debería actualizar y devolver el resumen actualizado", async () => {
    const updateData = { totalHours: 50 };
    WeeklySummary.update.mockResolvedValue([1]);
    WeeklySummary.findByPk.mockResolvedValue({ ...mockSummary, totalHours: 50 });

    const result = await weeklySummaryService.updateWeeklySummary(1, updateData as never);

    expect(WeeklySummary.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(result).toHaveProperty("totalHours", 50);
  });
});

describe("deleteWeeklySummary", () => {
  it("debería eliminar por id", async () => {
    WeeklySummary.destroy.mockResolvedValue(1);

    const result = await weeklySummaryService.deleteWeeklySummary(1);

    expect(WeeklySummary.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});

describe("deleteAllWeeklySummaries", () => {
  it("debería eliminar todos los resúmenes", async () => {
    WeeklySummary.destroy.mockResolvedValue(10);

    const result = await weeklySummaryService.deleteAllWeeklySummaries();

    expect(WeeklySummary.destroy).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(10);
  });
});
