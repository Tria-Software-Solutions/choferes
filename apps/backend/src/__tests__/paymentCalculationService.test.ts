// Mocks: the hours loader from summaryRecalculation. Employee stays REAL (its
// module participates in model associations); findByPk is stubbed per test.
// getBiweeklyDates / sumHours / computeTotalPayable stay REAL so the period
// and total math are actually verified.
jest.mock("../services/summaryRecalculationService", () => {
  const actual = jest.requireActual("../services/summaryRecalculationService");
  return {
    ...actual,
    loadEmployeeHours: jest.fn(),
  };
});

import Employee from "../models/Employee";
// eslint-disable-next-line import/no-named-as-default-member
import { loadEmployeeHours } from "../services/summaryRecalculationService";
import {
  calculateBiweeklyBreakdown,
  computeTotalPayable,
  round2,
} from "../services/paymentCalculationService";
import { ServiceError } from "../utils/errors";

const mockFindByPk = jest.spyOn(Employee, "findByPk") as unknown as jest.Mock;
const mockLoadHours = loadEmployeeHours as jest.Mock;

const employee = (hourlyRate: number | null) => ({
  id: 7,
  firstName: "Juan",
  lastName: "Pérez",
  hourlyRate,
});

// Two worked days with schedules of 8h each
const hoursRows = [
  { date: new Date(2026, 8, 1) },
  { date: new Date(2026, 8, 2) },
];

const scheduleFor = (hours: number) => ({ hours, scheduleDays: [] });

describe("round2", () => {
  it("redondea a 2 decimales", () => {
    expect(round2(1234.567)).toBe(1234.57);
    expect(round2(0.005)).toBe(0.01);
    expect(round2(10)).toBe(10);
  });
});

describe("computeTotalPayable", () => {
  it("suma ingresos y resta deducciones", () => {
    expect(
      computeTotalPayable({
        regularSalary: 100000,
        overtimePay: 10000,
        mileage: 5000,
        others: 0,
        socialCharges: 8000,
        deductions: 2000,
      }),
    ).toBe(105000);
  });

  it("devuelve 0 cuando todo es 0", () => {
    expect(
      computeTotalPayable({
        regularSalary: 0,
        overtimePay: 0,
        mileage: 0,
        others: 0,
        socialCharges: 0,
        deductions: 0,
      }),
    ).toBe(0);
  });
});

describe("calculateBiweeklyBreakdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calcula el salario ordinario como horas × hourlyRate", async () => {
    mockFindByPk.mockResolvedValue(employee(2000));
    mockLoadHours.mockResolvedValue([
      { date: new Date(2026, 8, 1), schedule: scheduleFor(8) },
      { date: new Date(2026, 8, 2), schedule: scheduleFor(8) },
    ]);

    const result = await calculateBiweeklyBreakdown(7, 17, 2026);

    expect(result.hoursWorked).toBe(16);
    expect(result.hourlyRate).toBe(2000);
    expect(result.regularSalary).toBe(32000);
    expect(result.totalPayable).toBe(32000);
  });

  it("usa el rango exacto de la quincena (16-fin de mes)", async () => {
    mockFindByPk.mockResolvedValue(employee(1000));
    mockLoadHours.mockResolvedValue([]);

    await calculateBiweeklyBreakdown(7, 18, 2026);

    const [employeeId, start, end] = mockLoadHours.mock.calls[0];
    expect(employeeId).toBe(7);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(8); // septiembre
    expect(start.getDate()).toBe(16);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(30); // 30 días en septiembre
  });

  it("devuelve salario 0 si el empleado no tiene tarifa", async () => {
    mockFindByPk.mockResolvedValue(employee(null));
    mockLoadHours.mockResolvedValue([
      { date: new Date(2026, 8, 1), schedule: scheduleFor(8) },
    ]);

    const result = await calculateBiweeklyBreakdown(7, 17, 2026);

    expect(result.hourlyRate).toBeNull();
    expect(result.regularSalary).toBe(0);
    expect(result.hoursWorked).toBe(8);
  });

  it("aplica montos opcionales como overrides", async () => {
    mockFindByPk.mockResolvedValue(employee(1000));
    mockLoadHours.mockResolvedValue([
      { date: new Date(2026, 8, 1), schedule: scheduleFor(10) },
    ]);

    const result = await calculateBiweeklyBreakdown(7, 17, 2026, {
      overtimePay: 5000,
      socialCharges: 1070,
      deductions: 300,
    });

    expect(result.regularSalary).toBe(10000);
    expect(result.overtimePay).toBe(5000);
    expect(result.socialCharges).toBe(1070);
    expect(result.deductions).toBe(300);
    expect(result.totalPayable).toBe(10000 + 5000 - 1070 - 300);
  });

  it("permite override manual del salario ordinario", async () => {
    mockFindByPk.mockResolvedValue(employee(1000));
    mockLoadHours.mockResolvedValue([]);

    const result = await calculateBiweeklyBreakdown(7, 17, 2026, {
      regularSalary: 55000,
    });

    expect(result.regularSalary).toBe(55000);
    expect(result.totalPayable).toBe(55000);
  });

  it("falla con 404 si el empleado no existe", async () => {
    mockFindByPk.mockResolvedValue(null);

    await expect(calculateBiweeklyBreakdown(999, 1, 2026)).rejects.toThrow(ServiceError);
    await expect(calculateBiweeklyBreakdown(999, 1, 2026)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("falla con 400 si la quincena está fuera de rango", async () => {
    mockFindByPk.mockResolvedValue(employee(1000));

    await expect(calculateBiweeklyBreakdown(7, 25, 2026)).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(calculateBiweeklyBreakdown(7, 0, 2026)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("falla con 400 si el año es inválido", async () => {
    mockFindByPk.mockResolvedValue(employee(1000));

    await expect(calculateBiweeklyBreakdown(7, 1, 1999)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
