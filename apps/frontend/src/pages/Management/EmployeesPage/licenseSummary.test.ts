import type { EmployeeLicense } from "../../../models/EmployeeLicense";
import {
  licenseAlertsHint,
  licenseAlertsValue,
  licenseUrgencyText,
  summarizeLicenses,
} from "./licenseSummary";

const fmt = (value: string) => value;

const license = (over: Partial<EmployeeLicense> = {}): EmployeeLicense => ({
  id: 1,
  employeeId: 1,
  licenseType: "B1",
  expiresAt: "2026-11-01",
  daysUntilExpiry: 30,
  status: "por_vencer",
  ...over,
});

describe("summarizeLicenses", () => {
  it("cuenta empleados con licencia vencida y por vencer", () => {
    const summary = summarizeLicenses([
      license({ id: 1, employeeId: 1, status: "por_vencer", daysUntilExpiry: 10 }),
      license({ id: 2, employeeId: 2, status: "vencida", daysUntilExpiry: -5 }),
      license({ id: 3, employeeId: 3, status: "vigente", daysUntilExpiry: 200 }),
    ]);

    expect(summary.expired).toBe(1);
    expect(summary.expiring).toBe(1);
    expect(summary.alerts).toBe(2);
  });

  it("cuenta al empleado una sola vez aunque tenga varias licencias en alerta", () => {
    const summary = summarizeLicenses([
      license({ id: 1, employeeId: 1, status: "por_vencer", daysUntilExpiry: 10 }),
      license({ id: 2, employeeId: 1, status: "vencida", daysUntilExpiry: -2 }),
    ]);

    // Pésimo estado = vencida: cuenta como una alerta, no dos.
    expect(summary.expired).toBe(1);
    expect(summary.expiring).toBe(0);
    expect(summary.alerts).toBe(1);
  });

  it("ignora las licencias vigentes y sin vencimiento", () => {
    const summary = summarizeLicenses([
      license({ status: "vigente", daysUntilExpiry: 90 }),
      license({ status: "sin_vencimiento", daysUntilExpiry: null }),
    ]);

    expect(summary.alerts).toBe(0);
    expect(summary.mostUrgentDays).toBeNull();
  });

  it("señala la licencia más urgente entre las que requieren atención", () => {
    const summary = summarizeLicenses([
      license({ id: 1, status: "por_vencer", daysUntilExpiry: 12 }),
      license({ id: 2, status: "vencida", daysUntilExpiry: -9 }),
      license({ id: 3, status: "vigente", daysUntilExpiry: 400 }),
    ]);

    expect(summary.mostUrgentDays).toBe(-9);
    expect(summary.mostUrgentDate).toBe("2026-11-01");
  });
});

describe("licenseAlertsValue", () => {
  it("tranquiliza cuando no hay nada que atender", () => {
    expect(licenseAlertsValue(summarizeLicenses([]))).toBe("Todo vigente");
  });

  it("cuenta los empleados a revisar, no las licencias", () => {
    expect(
      licenseAlertsValue(
        summarizeLicenses([
          license({ employeeId: 1, status: "por_vencer", daysUntilExpiry: 10 }),
          license({ employeeId: 2, status: "vencida", daysUntilExpiry: -5 }),
        ]),
      ),
    ).toBe("2 por revisar");
  });

  it("usa el singular cuando solo falta revisar a una persona", () => {
    expect(
      licenseAlertsValue(
        summarizeLicenses([license({ employeeId: 1, status: "por_vencer", daysUntilExpiry: 3 })]),
      ),
    ).toBe("1 por revisar");
  });
});

describe("licenseAlertsHint", () => {
  it("separa vencidas de por vencer y aclara la ventana", () => {
    expect(
      licenseAlertsHint(
        summarizeLicenses([
          license({ employeeId: 1, status: "por_vencer", daysUntilExpiry: 10 }),
          license({ employeeId: 2, status: "vencida", daysUntilExpiry: -5 }),
          license({ employeeId: 3, status: "vencida", daysUntilExpiry: -6 }),
        ]),
      ),
    ).toBe("2 vencidas · 1 por vencer · ventana 30 días");
  });

  it("no inventa un desglose cuando solo hay un escenario", () => {
    expect(
      licenseAlertsHint(
        summarizeLicenses([license({ status: "por_vencer", daysUntilExpiry: 10 })]),
      ),
    ).toBe("1 por vencer · ventana 30 días");

    expect(
      licenseAlertsHint(summarizeLicenses([license({ status: "vencida", daysUntilExpiry: -10 })])),
    ).toBe("1 vencida · ventana 30 días");
  });

  it("dice que no hay nada pendiente cuando todo está vigente", () => {
    expect(licenseAlertsHint(summarizeLicenses([]))).toBe("Ninguna vencida ni por vencer");
  });
});

describe("licenseUrgencyText", () => {
  it("no dice nada cuando no hay alertas", () => {
    expect(licenseUrgencyText(summarizeLicenses([]), fmt)).toBeNull();
  });

  it("cuenta los días que lleva vencida", () => {
    const summary = summarizeLicenses([
      license({ status: "vencida", daysUntilExpiry: -12, expiresAt: "2026-09-20" }),
    ]);
    expect(licenseUrgencyText(summary, fmt)).toBe("Venció el 2026-09-20 (hace 12 días)");
  });

  it("avisa el día exacto y avisa el resto de días", () => {
    expect(
      licenseUrgencyText(
        summarizeLicenses([
          license({ status: "por_vencer", daysUntilExpiry: 0, expiresAt: "2026-10-02" }),
        ]),
        fmt,
      ),
    ).toBe("Vence hoy (2026-10-02)");

    expect(
      licenseUrgencyText(
        summarizeLicenses([
          license({ status: "por_vencer", daysUntilExpiry: 3, expiresAt: "2026-10-05" }),
        ]),
        fmt,
      ),
    ).toBe("Vence el 2026-10-05 (en 3 días)");
  });
});
