// Mocks so the service loads without initialising the real Sequelize models.
jest.mock("../models/Vacation", () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

jest.mock("../models/Employee", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

import Vacation from "../models/Vacation";
import {
  computeVacationAccrual,
  VACATION_CYCLE_DAYS,
  VACATION_WORKING_DAYS_PER_CYCLE,
} from "../services/vacationAccrualService";

const mockFindAll = Vacation.findAll as jest.Mock;

const makeEmployee = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 7,
    vacationDays: null,
    contractStartDate: null,
    terminationDate: null,
    ...overrides,
  }) as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockFindAll.mockResolvedValue([]);
});

describe("vacationAccrualService", () => {
  it("acumula 2 semanas (10 días) por cada 50 semanas (350 días) trabajadas", async () => {
    const employee = makeEmployee({ contractStartDate: "2025-01-01" });

    const accrual = await computeVacationAccrual(employee, new Date(2025, 11, 16));

    expect(VACATION_CYCLE_DAYS).toBe(350);
    expect(VACATION_WORKING_DAYS_PER_CYCLE).toBe(10);
    expect(accrual.accruedDays).toBe(10);
    expect(accrual.weeksWorked).toBe(50);
    expect(accrual.takenDays).toBe(0);
    expect(accrual.availableDays).toBe(10);
  });

  it("prorratea períodos menores a 50 semanas", async () => {
    const employee = makeEmployee({ contractStartDate: "2025-01-01" });

    // 175 días trabajados = la mitad del ciclo → 5 días hábiles.
    const accrual = await computeVacationAccrual(employee, new Date(2025, 5, 24));

    expect(accrual.accruedDays).toBe(5);
    expect(accrual.availableDays).toBe(5);
  });

  it("descuenta las vacaciones aprobadas del acumulado", async () => {
    mockFindAll.mockResolvedValue([{ daysRequested: 3 }, { daysRequested: 2 }]);
    const employee = makeEmployee({ contractStartDate: "2025-01-01" });

    const accrual = await computeVacationAccrual(employee, new Date(2025, 11, 16));

    expect(mockFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { employeeId: 7, status: "approved" } }),
    );
    expect(accrual.takenDays).toBe(5);
    expect(accrual.availableDays).toBe(5);
  });

  it("no acumula nada sin fecha de ingreso", async () => {
    const employee = makeEmployee();

    const accrual = await computeVacationAccrual(employee, new Date(2025, 11, 16));

    expect(accrual.accruedDays).toBe(0);
    expect(accrual.contractStartDate).toBeNull();
    expect(accrual.availableDays).toBe(0);
  });

  it("usa la fecha de finalización como tope cuando el empleado egresó", async () => {
    const employee = makeEmployee({
      contractStartDate: "2025-01-01",
      terminationDate: "2025-06-24",
    });

    // Aunque "hoy" sea posterior, el cálculo se detiene en el egreso.
    const accrual = await computeVacationAccrual(employee, new Date(2026, 0, 1));

    expect(accrual.referenceDate).toBe("2025-06-24");
    expect(accrual.accruedDays).toBe(5);
  });

  it("devuelve el saldo manual actual", async () => {
    const employee = makeEmployee({
      contractStartDate: "2025-01-01",
      vacationDays: 12,
    });

    const accrual = await computeVacationAccrual(employee, new Date(2025, 11, 16));

    expect(accrual.currentBalance).toBe(12);
  });
});
