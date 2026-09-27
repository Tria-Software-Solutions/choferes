// El agregado de horas de Planilla debe:
//  1) usar el MISMO reparto por día que el pago (sumHours) y la MISMA regla de
//     horas extra (getPayrollRules), para que la tabla nunca discrepe del boleto;
//  2) traer una sola consulta para toda la quincena (no N+1);
//  3) agrupar por empleado aunque un mismo empleado tenga varios turnos.
//
// Notas del modelo (fuente de la verdad):
//  - `biweekNumber` es global 1-24 (dos quincenas por mes): 1-15 y 16-fin.
//  - `scheduleDays.day` se guarda en inglés ("monday", ...).
//  - Cada registro de horas aporta SOLO las horas del día de su `date`
//    (el turno de ese día), no la semana completa del horario.
jest.mock("../models/HoursWorked", () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

import HoursWorked from "../models/HoursWorked";
import {
  getEmployeesBiweeklyHours,
  getCurrentBiweek,
} from "../services/employeeHoursSummaryService";

const mockFindAll = HoursWorked.findAll as jest.Mock;

const row = (employeeId: number, date: string, scheduleDays: { day: string; hours: number }[]) => ({
  get: () => ({
    employeeId,
    date: new Date(date),
    Schedule: { hours: 8, scheduleDays },
  }),
});

// Horario de lunes a viernes con las mismas horas cada día.
const fullWeek = (hours: number) => [
  { day: "monday", hours },
  { day: "tuesday", hours },
  { day: "wednesday", hours },
  { day: "thursday", hours },
  { day: "friday", hours },
];

beforeEach(() => {
  mockFindAll.mockReset();
});

describe("getCurrentBiweek", () => {
  it("devuelve la quincena global del mes en curso (1-24)", () => {
    // Septiembre es el 9.º mes: 1-15 => 17, 16-fin => 18.
    expect(getCurrentBiweek(new Date(2026, 8, 3))).toEqual({ biweekNumber: 17, year: 2026 });
  });

  it("devuelve la segunda quincena del mes", () => {
    expect(getCurrentBiweek(new Date(2026, 8, 27))).toEqual({ biweekNumber: 18, year: 2026 });
  });

  it("cambia de año en diciembre", () => {
    expect(getCurrentBiweek(new Date(2026, 11, 20))).toEqual({ biweekNumber: 24, year: 2026 });
    expect(getCurrentBiweek(new Date(2027, 0, 5))).toEqual({ biweekNumber: 1, year: 2027 });
  });
});

describe("getEmployeesBiweeklyHours", () => {
  it("hace una sola consulta para toda la quincena", async () => {
    mockFindAll.mockResolvedValue([]);

    await getEmployeesBiweeklyHours(18, 2026);

    expect(mockFindAll).toHaveBeenCalledTimes(1);
  });

  it("suma las horas de todos los turnos del mismo empleado", async () => {
    // lunes 14 y martes 15 de septiembre de 2026.
    mockFindAll.mockResolvedValue([
      row(1, "2026-09-14T12:00:00.000Z", [
        { day: "monday", hours: 8 },
        { day: "tuesday", hours: 8 },
      ]),
      row(1, "2026-09-15T12:00:00.000Z", [
        { day: "monday", hours: 8 },
        { day: "tuesday", hours: 12 },
      ]),
    ]);

    const result = await getEmployeesBiweeklyHours(18, 2026);

    // 8 (lunes) + 12 (martes) = 20.
    expect(result).toEqual([
      { employeeId: 1, totalHours: 20, regularHours: 20, overtimeHours: 0 },
    ]);
  });

  it("separa las horas extra con el mismo umbral del comprobante (96 h)", async () => {
    // 9 días laborables de 12 h dentro de la quincena 16-30 de septiembre
    // (16, 17, 18, 21-25 y 28) = 108 h -> 96 ordinarias + 12 extra.
    const days = [
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-28",
    ];
    mockFindAll.mockResolvedValue([
      ...days.map((day) => row(1, `${day}T12:00:00.000Z`, fullWeek(12))),
      ...days.map((day) => row(2, `${day}T12:00:00.000Z`, fullWeek(12))),
    ]);

    const result = await getEmployeesBiweeklyHours(18, 2026);

    expect(result).toEqual([
      { employeeId: 1, totalHours: 108, regularHours: 96, overtimeHours: 12 },
      { employeeId: 2, totalHours: 108, regularHours: 96, overtimeHours: 12 },
    ]);
  });

  it("no inventa horas extra por debajo del umbral", async () => {
    // miércoles 16 de septiembre de 2026, 4 h ese día.
    mockFindAll.mockResolvedValue([
      row(7, "2026-09-16T12:00:00.000Z", [{ day: "wednesday", hours: 4 }]),
    ]);

    const [summary] = await getEmployeesBiweeklyHours(18, 2026);

    expect(summary.overtimeHours).toBe(0);
    expect(summary.regularHours).toBe(4);
  });

  it("devuelve lista vacía cuando nadie registró horas en la quincena", async () => {
    mockFindAll.mockResolvedValue([]);

    await expect(getEmployeesBiweeklyHours(1, 2026)).resolves.toEqual([]);
  });
});
