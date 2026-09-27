import { buildPaymentSlipHtml } from "../services/emailService";
import { formatBoletaPeriod, formatColones } from "../utils/boletaFormat";

const input = {
  to: "juan@example.com",
  employeeName: "Alberto Gutiérrez",
  biweekNumber: 18,
  year: 2026,
  periodEnd: "2026-09-30",
  currency: "CRC",
  regularSalary: 405710.07,
  overtimePay: 0,
  mileage: 0,
  others: 0,
  socialCharges: 43938.47,
  deductions: 0,
  totalPayable: 361771.6,
};

describe("formato de la boleta", () => {
  it("imprime el periodo como en la plantilla", () => {
    expect(formatBoletaPeriod("2026-09-30")).toBe("30.SEPT. 2026");
    expect(formatBoletaPeriod("2026-01-15")).toBe("15.ENE. 2026");
  });

  it("formatea colones con punto de miles y coma decimal", () => {
    expect(formatColones(405710.07)).toBe("¢405.710,07");
    expect(formatColones(0)).toBe("¢0,00");
    expect(formatColones(1234567.5)).toBe("¢1.234.567,50");
  });
});

describe("buildPaymentSlipHtml", () => {
  it("reproduce el comprobante: título, periodo, conceptos y pie legal", () => {
    const html = buildPaymentSlipHtml(input);
    expect(html).toContain("COMPROBANTE DE PAGO");
    expect(html).toContain("<strong>PERIODO:</strong> 30.SEPT. 2026");
    [
      "Nombre",
      "Salario ordinario",
      "Salario extraordinario",
      "Kilometraje",
      "Otros",
      "Cargas Sociales",
      "Rebajos",
      "Total a pagar",
    ].forEach((label) => expect(html).toContain(label));
    expect(html).toContain("¢405.710,07");
    expect(html).toContain("¢43.938,47");
    expect(html).toContain("*Moneda: Colón CR");
    expect(html).toContain("Cédula Jurídica 3-101-559864");
    expect(html).toContain("cid:boleta-logo-escudo");
    expect(html).toContain("cid:boleta-logo-su-auto");
  });

  it("escapa el nombre del empleado", () => {
    const html = buildPaymentSlipHtml({ ...input, employeeName: '<img src=x onerror="1">' });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});
