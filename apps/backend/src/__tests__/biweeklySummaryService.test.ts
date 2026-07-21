// Mock BiweeklySummary model — service uses: import { BiweeklySummary } from "../models/BiweeklySummary" (named import)
jest.mock("../models/BiweeklySummary", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, BiweeklySummary: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const BiweeklySummary = require("../models/BiweeklySummary").default;
import * as biweeklySummaryService from "../services/biweeklySummaryService";

const mockSummary = {
  id: 1,
  employeeId: 1,
  biweekNumber: 1,
  month: 7,
  year: 2026,
  totalHours: 80,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getBiweeklySummaries", () => {
  it("debería devolver resúmenes paginados ordenados por year DESC, biweekNumber DESC", async () => {
    BiweeklySummary.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockSummary] });

    const result = await biweeklySummaryService.getBiweeklySummaries({});

    expect(BiweeklySummary.findAndCountAll).toHaveBeenCalledTimes(1);
    const callArgs = BiweeklySummary.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["year", "DESC"], ["biweekNumber", "DESC"]]);
    expect(result.data).toEqual([mockSummary]);
    expect(result.pagination.page).toBe(1);
  });

  it("debería manejar paginación personalizada", async () => {
    BiweeklySummary.findAndCountAll.mockResolvedValue({ count: 50, rows: Array(10).fill(mockSummary) });

    const result = await biweeklySummaryService.getBiweeklySummaries({ page: "2", limit: "10" });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(5);
  });
});

describe("getBiweeklySummaryById", () => {
  it("debería devolver resumen por id", async () => {
    BiweeklySummary.findByPk.mockResolvedValue(mockSummary);

    const result = await biweeklySummaryService.getBiweeklySummaryById(1);

    expect(BiweeklySummary.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSummary);
  });

  it("debería devolver null si no existe", async () => {
    BiweeklySummary.findByPk.mockResolvedValue(null);

    const result = await biweeklySummaryService.getBiweeklySummaryById(999);

    expect(result).toBeNull();
  });
});

describe("getBiweeklySummariesByEmployee", () => {
  it("debería devolver resúmenes por employeeId", async () => {
    BiweeklySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await biweeklySummaryService.getBiweeklySummariesByEmployee(1);

    expect(BiweeklySummary.findAll).toHaveBeenCalledWith({ where: { employeeId: 1 } });
    expect(result).toEqual([mockSummary]);
  });
});

describe("getBiweeklySummariesByPeriod", () => {
  it("debería devolver resúmenes por período y año", async () => {
    BiweeklySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await biweeklySummaryService.getBiweeklySummariesByPeriod(1, 2026);

    expect(BiweeklySummary.findAll).toHaveBeenCalledWith({
      where: { biweekNumber: 1, year: 2026 },
    });
    expect(result).toEqual([mockSummary]);
  });
});

describe("getCurrentBiweeklySummary", () => {
  it("debería buscar por employeeId, biweekNumber, month, year", async () => {
    BiweeklySummary.findOne.mockResolvedValue(mockSummary);

    const result = await biweeklySummaryService.getCurrentBiweeklySummary(1, 1, 7, 2026);

    expect(BiweeklySummary.findOne).toHaveBeenCalledWith({
      where: { employeeId: 1, biweekNumber: 1, month: 7, year: 2026 },
    });
    expect(result).toEqual(mockSummary);
  });
});

describe("createBiweeklySummary", () => {
  it("debería crear con upsert", async () => {
    const newData = {
      employeeId: 2,
      biweekNumber: 2,
      month: 7,
      year: 2026,
      totalHours: 85,
    };
    const created = { id: 2, ...newData };

    BiweeklySummary.upsert.mockResolvedValue([created, true]);

    const result = await biweeklySummaryService.createBiweeklySummary(newData as never);

    expect(BiweeklySummary.upsert).toHaveBeenCalledWith(newData);
    expect(result).toEqual(created);
  });
});

describe("updateBiweeklySummary", () => {
  it("debería actualizar y devolver el resumen actualizado", async () => {
    const updateData = { totalHours: 90 };
    BiweeklySummary.update.mockResolvedValue([1]);
    BiweeklySummary.findByPk.mockResolvedValue({ ...mockSummary, totalHours: 90 });

    const result = await biweeklySummaryService.updateBiweeklySummary(1, updateData as never);

    expect(BiweeklySummary.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(result).toHaveProperty("totalHours", 90);
  });
});

describe("deleteBiweeklySummary", () => {
  it("debería eliminar por id", async () => {
    BiweeklySummary.destroy.mockResolvedValue(1);

    const result = await biweeklySummaryService.deleteBiweeklySummary(1);

    expect(BiweeklySummary.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});

describe("deleteAllBiweeklySummaries", () => {
  it("debería eliminar todos los resúmenes", async () => {
    BiweeklySummary.destroy.mockResolvedValue(5);

    const result = await biweeklySummaryService.deleteAllBiweeklySummaries();

    expect(BiweeklySummary.destroy).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(5);
  });
});
