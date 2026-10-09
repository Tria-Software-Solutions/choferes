// Mocks for the vacation service layer.
jest.mock("../services/notificationService", () => ({
  notifyManagementRoles: jest.fn(),
  notifyEmployeeUser: jest.fn(),
  createNotification: jest.fn(),
}));
jest.mock("../models/Vacation", () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("../models/Employee", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../models/User", () => ({
  __esModule: true,
  default: {},
  User: {
    findOne: jest.fn().mockResolvedValue(null),
  },
}));

// Managed transaction: runs the callback with a fake transaction handle.
jest.mock("../config/database", () => ({
  __esModule: true,
  default: { transaction: jest.fn((callback: (t: unknown) => unknown) => callback("tx")) },
}));

import Vacation from "../models/Vacation";
import Employee from "../models/Employee";
import * as vacationService from "../services/vacationService";
import { ServiceError } from "../utils/errors";

const mockFindAndCountAll = Vacation.findAndCountAll as jest.Mock;
const mockVacationFindByPk = Vacation.findByPk as jest.Mock;
const mockCreate = Vacation.create as jest.Mock;
const mockEmployeeFindByPk = Employee.findByPk as jest.Mock;

const makeVacation = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    id: 1,
    employeeId: 7,
    startDate: "2026-10-05",
    endDate: "2026-10-09",
    daysRequested: 5,
    status: "pending",
    reason: "Viaje",
    approvedBy: null,
    approvedAt: null,
    employee: { id: 7, firstName: "Juan", lastName: "Pérez", vacationDays: 10 },
    ...overrides,
  };

  const instance = {
    ...state,
    update: jest.fn((updates: Record<string, unknown>) => {
      Object.assign(state, updates);
      Object.assign(instance, updates);
      return Promise.resolve(instance);
    }),
    destroy: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => ({ ...state })),
  };

  return { state, instance };
};

const makeEmployee = (vacationDays: number | null) => {
  const state: Record<string, unknown> = { id: 7, vacationDays };
  const instance = {
    ...state,
    update: jest.fn((updates: Record<string, unknown>) => {
      Object.assign(state, updates);
      Object.assign(instance, updates);
      return Promise.resolve();
    }),
  };
  return { state, instance };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("countBusinessDays", () => {
  it("cuenta solo días hábiles (lun-vie)", () => {
    // Lunes 05/10/2026 → viernes 09/10/2026 = 5 días
    expect(vacationService.countBusinessDays("2026-10-05", "2026-10-09")).toBe(5);
  });

  it("excluye fines de semana", () => {
    // Viernes 02/10 → lunes 05/10 = 2 días hábiles
    expect(vacationService.countBusinessDays("2026-10-02", "2026-10-05")).toBe(2);
  });

  it("acepta un solo día", () => {
    expect(vacationService.countBusinessDays("2026-10-07", "2026-10-07")).toBe(1);
  });

  it("falla si la fecha final es anterior a la inicial", () => {
    expect(() => vacationService.countBusinessDays("2026-10-09", "2026-10-05")).toThrow(
      ServiceError,
    );
  });

  it("falla si el rango no incluye días hábiles", () => {
    expect(() => vacationService.countBusinessDays("2026-10-03", "2026-10-04")).toThrow(
      ServiceError,
    );
  });

  it("falla con formato de fecha inválido", () => {
    expect(() => vacationService.countBusinessDays("05/10/2026", "2026-10-09")).toThrow(
      ServiceError,
    );
  });
});

describe("createVacation", () => {
  it("falla con 404 si el empleado no existe", async () => {
    mockEmployeeFindByPk.mockResolvedValue(null);

    await expect(
      vacationService.createVacation({
        employeeId: 999,
        startDate: "2026-10-05",
        endDate: "2026-10-09",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("crea la solicitud pendiente con los días calculados en el servidor", async () => {
    mockEmployeeFindByPk.mockResolvedValue(makeEmployee(10).instance);
    mockCreate.mockResolvedValue(makeVacation().instance);

    const result = await vacationService.createVacation({
      employeeId: 7,
      startDate: "2026-10-05",
      endDate: "2026-10-09",
      reason: "Viaje familiar",
    });

    const created = mockCreate.mock.calls[0][0];
    expect(created.daysRequested).toBe(5);
    expect(created.status).toBe("pending");
    expect(result.status).toBe("pending");
    expect(result.daysRequested).toBe(5);
  });

  it("ignora los días enviados por el cliente y usa los del servidor", async () => {
    mockEmployeeFindByPk.mockResolvedValue(makeEmployee(10).instance);
    mockCreate.mockResolvedValue(makeVacation().instance);

    await vacationService.createVacation({
      employeeId: 7,
      startDate: "2026-10-05",
      endDate: "2026-10-09",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daysRequested: 99,
    } as any);

    expect(mockCreate.mock.calls[0][0].daysRequested).toBe(5);
  });
});

describe("updateVacation — approve/reject", () => {
  it("devuelve null si no existe", async () => {
    mockVacationFindByPk.mockResolvedValue(null);
    expect(await vacationService.updateVacation(999, { status: "approved" })).toBeNull();
  });

  it("al aprobar descuenta los días del saldo del empleado", async () => {
    const employee = makeEmployee(10);
    const vacation = makeVacation();
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await vacationService.updateVacation(1, { status: "approved", approvedBy: 5 });

    expect(employee.state.vacationDays).toBe(5); // 10 − 5
    expect(vacation.state.status).toBe("approved");
    expect(vacation.state.approvedBy).toBe(5);
    expect(vacation.state.approvedAt).not.toBeNull();
  });

  it("aplica saldo y estado dentro de la misma transacción", async () => {
    const employee = makeEmployee(10);
    const vacation = makeVacation();
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await vacationService.updateVacation(1, { status: "approved", approvedBy: 5 });

    expect(employee.instance.update).toHaveBeenCalledWith(
      { vacationDays: 5 },
      { transaction: "tx" },
    );
    expect(vacation.instance.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" }),
      { transaction: "tx" },
    );
  });

  it("falla con 400 si el saldo es insuficiente", async () => {
    const employee = makeEmployee(3); // menos que los 5 días solicitados
    const vacation = makeVacation();
    mockVacationFindByPk.mockResolvedValue(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await expect(
      vacationService.updateVacation(1, { status: "approved" }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(employee.instance.update).not.toHaveBeenCalled();
    expect(vacation.state.status).toBe("pending");
  });

  it("al aprobar con saldo sin asignar (null) no descuenta nada", async () => {
    const employee = makeEmployee(null);
    const vacation = makeVacation();
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await vacationService.updateVacation(1, { status: "approved", approvedBy: 5 });

    expect(employee.state.vacationDays).toBeNull();
    expect(vacation.state.status).toBe("approved");
  });

  it("al rechazar una solicitud aprobada devuelve los días al saldo", async () => {
    const employee = makeEmployee(5); // aprobada descontó 5 de 10
    const vacation = makeVacation({ status: "approved", approvedAt: "2026-09-20T10:00:00.000Z" });
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await vacationService.updateVacation(1, { status: "rejected", approvedBy: 5 });

    expect(employee.state.vacationDays).toBe(10); // 5 + 5 restaurados
    expect(vacation.state.status).toBe("rejected");
    expect(vacation.state.approvedAt).toBeNull();
  });

  it("al rechazar una solicitud pendiente no toca el saldo", async () => {
    const employee = makeEmployee(10);
    const vacation = makeVacation();
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    await vacationService.updateVacation(1, { status: "rejected", approvedBy: 5 });

    expect(employee.instance.update).not.toHaveBeenCalled();
    expect(employee.state.vacationDays).toBe(10);
    expect(vacation.state.status).toBe("rejected");
  });

  it("permite editar fechas solo mientras está pendiente", async () => {
    const vacation = makeVacation({ status: "approved" });
    mockVacationFindByPk.mockResolvedValue(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(makeEmployee(10).instance);

    await expect(
      vacationService.updateVacation(1, { startDate: "2026-11-02", endDate: "2026-11-06" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("recalcula daysRequested al editar fechas de una solicitud pendiente", async () => {
    const vacation = makeVacation();
    mockVacationFindByPk
      .mockResolvedValueOnce(vacation.instance)
      .mockResolvedValueOnce(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(makeEmployee(10).instance);

    const result = await vacationService.updateVacation(1, {
      startDate: "2026-10-12",
      endDate: "2026-10-16",
    });

    expect(vacation.state.daysRequested).toBe(5);
    expect(result?.daysRequested).toBe(5);
  });
});

describe("deleteVacation", () => {
  it("devuelve false si no existe", async () => {
    mockVacationFindByPk.mockResolvedValue(null);
    expect(await vacationService.deleteVacation(999)).toBe(false);
  });

  it("elimina una solicitud pendiente sin tocar el saldo", async () => {
    const employee = makeEmployee(10);
    const vacation = makeVacation();
    mockVacationFindByPk.mockResolvedValue(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    expect(await vacationService.deleteVacation(1)).toBe(true);
    expect(employee.instance.update).not.toHaveBeenCalled();
    expect(vacation.instance.destroy).toHaveBeenCalled();
  });

  it("al eliminar una aprobada devuelve los días al saldo", async () => {
    const employee = makeEmployee(5);
    const vacation = makeVacation({ status: "approved" });
    mockVacationFindByPk.mockResolvedValue(vacation.instance);
    mockEmployeeFindByPk.mockResolvedValue(employee.instance);

    expect(await vacationService.deleteVacation(1)).toBe(true);
    expect(employee.state.vacationDays).toBe(10);
    expect(vacation.instance.destroy).toHaveBeenCalled();
  });
});

describe("getVacations", () => {
  it("devuelve la lista paginada con filtros", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [makeVacation().instance],
    });

    const result = await vacationService.getVacations({ employeeId: "7" });

    expect(mockFindAndCountAll.mock.calls[0][0].where).toEqual({ employeeId: 7 });
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalItems).toBe(1);
  });
});
