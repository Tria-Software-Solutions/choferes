// Mock Schedule model - service uses named import: import { Schedule } from "../models/Schedule"
jest.mock("../models/Schedule", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  return {
    __esModule: true,
    Schedule: mockFunctions,
    default: mockFunctions,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Schedule = require("../models/Schedule").default;
import * as scheduleService from "../services/scheduleService";

const mockSchedule = {
  id: 1,
  label: "Diurno",
  days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  hours: 8,
  specialSchedule: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getSchedules", () => {
  it("debería llamar a findAndCountAll con paginación por defecto", async () => {
    Schedule.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [mockSchedule],
    });

    const result = await scheduleService.getSchedules({});

    expect(Schedule.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockSchedule]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(50);
    expect(result.pagination.totalItems).toBe(1);
  });

  it("debería ordenar por label ASC", async () => {
    Schedule.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await scheduleService.getSchedules({});

    const callArgs = Schedule.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["label", "ASC"]]);
  });

  it("debería pasar search query", async () => {
    Schedule.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await scheduleService.getSchedules({ search: "diurno" });

    const callArgs = Schedule.findAndCountAll.mock.calls[0][0];
    expect(callArgs.where).toBeDefined();
  });

  it("debería manejar paginación personalizada", async () => {
    Schedule.findAndCountAll.mockResolvedValue({
      count: 50,
      rows: Array(10).fill(mockSchedule),
    });

    const result = await scheduleService.getSchedules({
      page: "2",
      limit: "10",
    });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(5);
  });
});

describe("getScheduleById", () => {
  it("debería llamar a findByPk con el id correcto", async () => {
    Schedule.findByPk.mockResolvedValue(mockSchedule);

    const result = await scheduleService.getScheduleById(1);

    expect(Schedule.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSchedule);
  });

  it("debería devolver null si no existe", async () => {
    Schedule.findByPk.mockResolvedValue(null);

    const result = await scheduleService.getScheduleById(999);

    expect(result).toBeNull();
  });
});

describe("createSchedule", () => {
  it("debería crear y recargar el horario", async () => {
    const newData = {
      label: "Nocturno",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      hours: 6,
      specialSchedule: false,
    };
    const createdSchedule = { id: 2, ...newData, reload: jest.fn() };

    Schedule.create.mockResolvedValue(createdSchedule);

    const result = await scheduleService.createSchedule(
      newData as Parameters<typeof scheduleService.createSchedule>[0],
    );

    expect(Schedule.create).toHaveBeenCalledWith(newData);
    expect(createdSchedule.reload).toHaveBeenCalled();
    expect(result).toEqual(createdSchedule);
  });
});

describe("updateSchedule", () => {
  it("debería actualizar y devolver el horario actualizado", async () => {
    const updateData = { hours: 10 };
    Schedule.update.mockResolvedValue([1]);
    Schedule.findByPk.mockResolvedValue({
      ...mockSchedule,
      hours: 10,
    });

    const result = await scheduleService.updateSchedule(
      1,
      updateData as Parameters<typeof scheduleService.updateSchedule>[1],
    );

    expect(Schedule.update).toHaveBeenCalledWith(updateData, {
      where: { id: 1 },
    });
    expect(Schedule.findByPk).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty("hours", 10);
  });
});

describe("deleteSchedule", () => {
  it("debería eliminar por id", async () => {
    Schedule.destroy.mockResolvedValue(1);

    const result = await scheduleService.deleteSchedule(1);

    expect(Schedule.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
