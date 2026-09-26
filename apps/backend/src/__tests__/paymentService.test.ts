// Mocks for the payment service layer.
jest.mock("../models/Payment", () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Employee stays REAL (model associations depend on it); findByPk is not
// exercised here — paymentCalculationService is mocked below.

// Breakdown is mocked; the pure helpers (round2, computeTotalPayable) stay real.
jest.mock("../services/paymentCalculationService", () => {
  const actual = jest.requireActual("../services/paymentCalculationService");
  return {
    ...actual,
    calculateBiweeklyBreakdown: jest.fn(),
  };
});

import Payment from "../models/Payment";
import {
  calculateBiweeklyBreakdown,
} from "../services/paymentCalculationService";
import * as paymentService from "../services/paymentService";
import { ServiceError } from "../utils/errors";

const mockFindAndCountAll = Payment.findAndCountAll as jest.Mock;
const mockFindByPk = Payment.findByPk as jest.Mock;
const mockFindOne = Payment.findOne as jest.Mock;
const mockCreate = Payment.create as jest.Mock;
const mockDestroy = Payment.destroy as jest.Mock;
const mockBreakdown = calculateBiweeklyBreakdown as jest.Mock;

const makePayment = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    id: 1,
    employeeId: 7,
    payPeriod: "biweekly",
    biweekNumber: 17,
    year: 2026,
    payDate: null,
    currency: "CRC",
    regularSalary: "32000.00",
    overtimePay: "0.00",
    mileage: "0.00",
    others: "0.00",
    socialCharges: "0.00",
    deductions: "0.00",
    totalPayable: "32000.00",
    notes: null,
    status: "pending",
    emailSentAt: null,
    isManual: false,
    ...overrides,
  };

  const instance = {
    ...state,
    update: jest.fn((updates: Record<string, unknown>) => {
      Object.assign(state, updates);
      Object.assign(instance, updates);
      return Promise.resolve(instance);
    }),
    get: jest.fn(() => ({ ...state })),
  };

  return { state, instance };
};

const breakdownFor = (employeeId: number, biweekNumber: number, year: number) => ({
  employeeId,
  biweekNumber,
  year,
  startDate: "2026-09-01",
  endDate: "2026-09-15",
  hoursWorked: 16,
  hourlyRate: 2000,
  regularSalary: 32000,
  overtimePay: 0,
  mileage: 0,
  others: 0,
  socialCharges: 0,
  deductions: 0,
  totalPayable: 32000,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("serializePayment", () => {
  it("convierte montos DECIMAL (strings) a números", () => {
    const result = paymentService.serializePayment({
      id: 1,
      regularSalary: "32000.00",
      overtimePay: "1500.50",
      totalPayable: "33500.50",
      status: "pending",
    });

    expect(result.regularSalary).toBe(32000);
    expect(result.overtimePay).toBe(1500.5);
    expect(result.totalPayable).toBe(33500.5);
    expect(result.status).toBe("pending");
  });

  it("normaliza el hourlyRate del empleado incluido", () => {
    const result = paymentService.serializePayment({
      id: 1,
      totalPayable: "100.00",
      employee: { id: 7, hourlyRate: "2000.00" },
    });

    expect(result.employee.hourlyRate).toBe(2000);
  });
});

describe("getPayments", () => {
  it("devuelve la lista paginada con montos numéricos", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [makePayment().instance],
    });

    const result = await paymentService.getPayments({});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].regularSalary).toBe(32000);
    expect(result.pagination.totalItems).toBe(1);
    const options = mockFindAndCountAll.mock.calls[0][0];
    expect(options.include).toBeDefined();
    expect(options.order[0]).toEqual(["year", "DESC"]);
  });

  it("aplica los filtros de la query", async () => {
    mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await paymentService.getPayments({
      employeeId: "7",
      year: "2026",
      biweekNumber: "17",
      status: "pending",
    });

    expect(mockFindAndCountAll.mock.calls[0][0].where).toEqual({
      employeeId: 7,
      year: 2026,
      biweekNumber: 17,
      status: "pending",
    });
  });
});

describe("createPayment", () => {
  it("falla con 409 si ya existe un pago para la quincena", async () => {
    mockFindOne.mockResolvedValue({ id: 99 });

    await expect(
      paymentService.createPayment({ employeeId: 7, biweekNumber: 17, year: 2026 }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("crea el pago con montos calculados y isManual=false sin overrides", async () => {
    mockFindOne.mockResolvedValue(null);
    mockBreakdown.mockResolvedValue(breakdownFor(7, 17, 2026));
    mockCreate.mockResolvedValue(makePayment().instance);

    const result = await paymentService.createPayment({
      employeeId: 7,
      biweekNumber: 17,
      year: 2026,
    });

    const createdArgs = mockCreate.mock.calls[0][0];
    expect(createdArgs.regularSalary).toBe(32000);
    expect(createdArgs.totalPayable).toBe(32000);
    expect(createdArgs.isManual).toBe(false);
    expect(createdArgs.status).toBe("pending");
    expect(result.regularSalary).toBe(32000);
  });

  it("marca isManual=true cuando se envían montos override", async () => {
    mockFindOne.mockResolvedValue(null);
    mockBreakdown.mockResolvedValue({
      ...breakdownFor(7, 17, 2026),
      overtimePay: 5000,
      totalPayable: 37000,
    });
    mockCreate.mockResolvedValue(makePayment().instance);

    await paymentService.createPayment({
      employeeId: 7,
      biweekNumber: 17,
      year: 2026,
      overtimePay: 5000,
    });

    expect(mockBreakdown).toHaveBeenCalledWith(7, 17, 2026, { overtimePay: 5000 });
    expect(mockCreate.mock.calls[0][0].isManual).toBe(true);
  });

  it("propaga errores de dominio del cálculo", async () => {
    mockFindOne.mockResolvedValue(null);
    mockBreakdown.mockRejectedValue(
      new ServiceError(404, "Empleado no encontrado"),
    );

    await expect(
      paymentService.createPayment({ employeeId: 999, biweekNumber: 1, year: 2026 }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updatePayment", () => {
  it("devuelve null si no existe", async () => {
    mockFindByPk.mockResolvedValue(null);
    expect(await paymentService.updatePayment(999, {})).toBeNull();
  });

  it("recalcula el total y marca isManual al editar montos", async () => {
    const { instance } = makePayment();
    mockFindByPk.mockResolvedValue(instance);

    const result = await paymentService.updatePayment(1, {
      overtimePay: 5000,
      deductions: 2000,
    });

    expect(result?.totalPayable).toBe(35000); // 32000 + 5000 − 2000
    expect(result?.isManual).toBe(true);
    expect(instance.update).toHaveBeenCalled();
  });

  it("rechaza el estado 'sent' (solo se marca al enviar el correo)", async () => {
    const { instance } = makePayment();
    mockFindByPk.mockResolvedValue(instance);

    await expect(
      paymentService.updatePayment(1, { status: "sent" as never }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("edita notes/payDate sin tocar montos", async () => {
    const { state, instance } = makePayment();
    mockFindByPk.mockResolvedValue(instance);

    const result = await paymentService.updatePayment(1, {
      payDate: "2026-09-15",
      notes: "Pago vía transferencia",
    });

    expect(result?.payDate).toBe("2026-09-15");
    expect(result?.notes).toBe("Pago vía transferencia");
    expect(result?.isManual).toBe(false);
    expect(state.totalPayable).toBe("32000.00"); // no recalculated
  });
});

describe("recalculatePayment", () => {
  it("devuelve null si no existe", async () => {
    mockFindByPk.mockResolvedValue(null);
    expect(await paymentService.recalculatePayment(999)).toBeNull();
  });

  it("recalcula el salario, preserva montos opcionales y limpia isManual", async () => {
    const { instance } = makePayment({ isManual: true, overtimePay: "5000.00" });
    mockFindByPk.mockResolvedValue(instance);
    mockBreakdown.mockResolvedValue({
      ...breakdownFor(7, 17, 2026),
      regularSalary: 34000,
      overtimePay: 5000,
      totalPayable: 39000,
    });

    const result = await paymentService.recalculatePayment(1);

    expect(mockBreakdown).toHaveBeenCalledWith(7, 17, 2026, {
      overtimePay: 5000,
      mileage: 0,
      others: 0,
      socialCharges: 0,
      deductions: 0,
    });
    expect(result?.regularSalary).toBe(34000);
    expect(result?.totalPayable).toBe(39000);
    expect(result?.isManual).toBe(false);
  });
});

describe("markPaymentSent", () => {
  it("marca el pago como enviado con fecha", async () => {
    const { instance } = makePayment();
    mockFindByPk.mockResolvedValue(instance);

    const result = await paymentService.markPaymentSent(1);

    expect(result?.status).toBe("sent");
    expect(result?.emailSentAt).not.toBeNull();
  });

  it("devuelve null si no existe", async () => {
    mockFindByPk.mockResolvedValue(null);
    expect(await paymentService.markPaymentSent(999)).toBeNull();
  });
});

describe("deletePayment", () => {
  it("devuelve true cuando se elimina", async () => {
    mockDestroy.mockResolvedValue(1);
    expect(await paymentService.deletePayment(1)).toBe(true);
  });

  it("devuelve false cuando no existe", async () => {
    mockDestroy.mockResolvedValue(0);
    expect(await paymentService.deletePayment(999)).toBe(false);
  });
});
