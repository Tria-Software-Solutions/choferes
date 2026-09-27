import { formatBoletaPeriod, formatColones, getPeriodEndISO } from "./boletaFormat";

describe("boletaFormat", () => {
  it("calcula el último día de cada quincena", () => {
    expect(getPeriodEndISO(17, 2026)).toBe("2026-09-15");
    expect(getPeriodEndISO(18, 2026)).toBe("2026-09-30");
    expect(getPeriodEndISO(4, 2028)).toBe("2028-02-29");
  });

  it("imprime el periodo y los montos como la plantilla", () => {
    expect(formatBoletaPeriod("2026-09-30")).toBe("30.SEPT. 2026");
    expect(formatColones(405710.07)).toBe("¢405.710,07");
    expect(formatColones(0)).toBe("¢0,00");
  });
});
