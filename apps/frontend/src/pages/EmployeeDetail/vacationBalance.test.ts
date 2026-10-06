import { displayedVacationDays } from "./vacationBalance";
import { VacationAccrual } from "../../models/VacationAccrual";

const accrual = (availableDays: number): VacationAccrual => ({
  contractStartDate: "2024-01-01",
  referenceDate: "2026-10-06",
  accruedDays: availableDays,
  takenDays: 0,
  availableDays,
  weeksWorked: 0,
  currentBalance: null,
});

describe("displayedVacationDays", () => {
  it("usa el saldo guardado cuando existe", () => {
    expect(displayedVacationDays(7, accrual(12))).toBe(7);
  });

  it("acepta el saldo guardado en 0 (asignado, no vacío)", () => {
    expect(displayedVacationDays(0, accrual(12))).toBe(0);
  });

  it("cae al acumulado legal cuando el saldo no está asignado", () => {
    expect(displayedVacationDays(null, accrual(4.5))).toBe(4.5);
    expect(displayedVacationDays(undefined, accrual(4.5))).toBe(4.5);
  });

  it("no muestra nada sin saldo ni acumulado (falta la fecha de ingreso)", () => {
    expect(displayedVacationDays(null, null)).toBeNull();
  });
});
