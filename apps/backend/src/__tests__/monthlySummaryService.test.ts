// Mock MonthlySummary model — service uses: import { MonthlySummary } from "../models/MonthlySummary" (named import)
jest.mock("../models/MonthlySummary", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, MonthlySummary: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MonthlySummary = require("../models/MonthlySummary").default;
import * as monthlySummaryService from "../services/monthlySummaryService";

const mockSummary = {
  id: 1,
  employeeId: 1,
  month: 7,
  year: 2026,
  totalHours: 160,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getMonthlySummaries", () => {
  it("debería devolver resúmenes paginados ordenados por year DESC, month DESC", async () => {
    MonthlySummary.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockSummary] });

    const result = await monthlySummaryService.getMonthlySummaries({});

    expect(MonthlySummary.findAndCountAll).toHaveBeenCalledTimes(1);
    const callArgs = MonthlySummary.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["year", "DESC"], ["month", "DESC"]]);
    expect(result.data).toEqual([mockSummary]);
    expect(result.pagination.page).toBe(1);
  });

  it("debería manejar paginación personalizada", async () => {
    MonthlySummary.findAndCountAll.mockResolvedValue({ count: 24, rows: Array(10).fill(mockSummary) });

    const result = await monthlySummaryService.getMonthlySummaries({ page: "2", limit: "10" });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(3);
  });
});

describe("getCurrentMonthlySummary", () => {
  it("debería buscar por employeeId, month, year", async () => {
    MonthlySummary.findOne.mockResolvedValue(mockSummary);

    const result = await monthlySummaryService.getCurrentMonthlySummary(1, 7, 2026);

    expect(MonthlySummary.findOne).toHaveBeenCalledWith({
      where: { employeeId: 1, month: 7, year: 2026 },
    });
    expect(result).toEqual(mockSummary);
  });

  it("debería devolver null si no existe", async () => {
    MonthlySummary.findOne.mockResolvedValue(null);

    const result = await monthlySummaryService.getCurrentMonthlySummary(1, 12, 2025);

    expect(result).toBeNull();
  });
});

describe("getMonthlySummariesByEmployee", () => {
  it("debería devolver resúmenes por employeeId", async () => {
    MonthlySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await monthlySummaryService.getMonthlySummariesByEmployee(1);

    expect(MonthlySummary.findAll).toHaveBeenCalledWith({ where: { employeeId: 1 } });
    expect(result).toEqual([mockSummary]);
  });
});

describe("getMonthlySummariesByMonth", () => {
  it("debería devolver resúmenes por mes y año", async () => {
    MonthlySummary.findAll.mockResolvedValue([mockSummary]);

    const result = await monthlySummaryService.getMonthlySummariesByMonth(7, 2026);

    expect(MonthlySummary.findAll).toHaveBeenCalledWith({
      where: { month: 7, year: 2026 },
    });
    expect(result).toEqual([mockSummary]);
  });
});

describe("createMonthlySummary", () => {
  it("debería crear con upsert", async () => {
    const newData = {
      employeeId: 2,
      month: 8,
      year: 2026,
      totalHours: 170,
    };
    const created = { id: 2, ...newData };

    MonthlySummary.upsert.mockResolvedValue([created, true]);

    const result = await monthlySummaryService.createMonthlySummary(newData as never);

    expect(MonthlySummary.upsert).toHaveBeenCalledWith(newData);
    expect(result).toEqual(created);
  });
});

describe("updateMonthlySummary", () => {
  it("debería actualizar y devolver el resumen actualizado", async () => {
    const updateData = { totalHours: 180 };
    MonthlySummary.update.mockResolvedValue([1]);
    MonthlySummary.findByPk.mockResolvedValue({ ...mockSummary, totalHours: 180 });

    const result = await monthlySummaryService.updateMonthlySummary(1, updateData as never);

    expect(MonthlySummary.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(result).toHaveProperty("totalHours", 180);
  });
});

describe("deleteMonthlySummary", () => {
  it("debería eliminar por id", async () => {
    MonthlySummary.destroy.mockResolvedValue(1);

    const result = await monthlySummaryService.deleteMonthlySummary(1);

    expect(MonthlySummary.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});

describe("deleteAllMonthlySummaries", () => {
  it("debería eliminar todos los resúmenes", async () => {
    MonthlySummary.destroy.mockResolvedValue(12);

    const result = await monthlySummaryService.deleteAllMonthlySummaries();

    expect(MonthlySummary.destroy).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(12);
  });
});
