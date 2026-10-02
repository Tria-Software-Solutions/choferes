import type { EmployeeLicense } from "../../../models/EmployeeLicense";

/**
 * Resumen de licencias para el KPI "Licencias" de la Planilla.
 *
 * Antes el card mostraba un solo número (por vencer + vencidas juntas), que no
 * decía si había que actuar ya o simplemente estar pendiente. Ahora separa las
 * dos situaciones y añade la fecha que urge: la más próxima a vencer o la que
 * lleva más tiempo vencida.
 */
export interface LicenseSummary {
  /** Empleados con al menos una licencia vencida. */
  expired: number;
  /** Empleados con al menos una licencia por vencer (≤ 30 días). */
  expiring: number;
  /** Total de empleados que requieren atención. */
  alerts: number;
  /** Días de la licencia más urgente (negativo si ya venció). */
  mostUrgentDays: number | null;
  /** Fecha de vencimiento de esa licencia (YYYY-MM-DD). */
  mostUrgentDate: string | null;
}

/** Peor estado por empleado: vencida (3) > por vencer (2) > vigente (1). */
const STATUS_RANK: Record<string, number> = {
  vencida: 3,
  por_vencer: 2,
  vigente: 1,
  sin_vencimiento: 0,
};

const worstStatusByEmployee = (licenses: EmployeeLicense[]): Map<number, string> => {
  const byEmployee = new Map<number, string>();
  licenses.forEach((license) => {
    const status = license.status ?? "sin_vencimiento";
    const current = byEmployee.get(license.employeeId);
    if (!current || STATUS_RANK[status] > STATUS_RANK[current]) {
      byEmployee.set(license.employeeId, status);
    }
  });
  return byEmployee;
};

/** Cuenta empleados por estado y localiza la licencia más urgente. */
export const summarizeLicenses = (licenses: EmployeeLicense[]): LicenseSummary => {
  const byEmployee = worstStatusByEmployee(licenses);
  let expired = 0;
  let expiring = 0;
  byEmployee.forEach((status) => {
    if (status === "vencida") expired += 1;
    else if (status === "por_vencer") expiring += 1;
  });

  // Solo importan las que requieren atención; entre ellas, la de menor días.
  const urgent = licenses.filter((license) => {
    const days = license.daysUntilExpiry;
    return days != null && days <= 30;
  });
  const mostUrgent = urgent.reduce<EmployeeLicense | null>(
    (worst, license) =>
      worst == null || Number(license.daysUntilExpiry) < Number(worst.daysUntilExpiry)
        ? license
        : worst,
    null,
  );

  return {
    expired,
    expiring,
    alerts: expired + expiring,
    mostUrgentDays: mostUrgent ? Number(mostUrgent.daysUntilExpiry) : null,
    mostUrgentDate: mostUrgent?.expiresAt ?? null,
  };
};

const plural = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

/**
 * Texto del valor grande del card. Sin nada que avisar dice "Todo vigente", que
 * es más tranquilizador que un "0" suelto. Con alertas, el total de empleados a
 * revisar; el desglose va en la línea de abajo para que aquí siempre quepa.
 */
export const licenseAlertsValue = ({ alerts }: LicenseSummary): string =>
  alerts === 0 ? "Todo vigente" : plural(alerts, "por revisar", "por revisar");

/** Segunda línea: el desglose de lo que hay que atender y la ventana del aviso. */
export const licenseAlertsHint = ({ expired, expiring }: LicenseSummary): string => {
  if (expired === 0 && expiring === 0) return "Ninguna vencida ni por vencer";
  const parts: string[] = [];
  if (expired > 0) parts.push(plural(expired, "vencida", "vencidas"));
  if (expiring > 0) parts.push(plural(expiring, "por vencer", "por vencer"));
  return `${parts.join(" · ")} · ventana 30 días`;
};

/**
 * Tercera línea: el dato accionable, la fecha que hay que atacar primero.
 * "Venció hace 12 días" / "Vence en 3 días" / "Vence el 12 oct (en 28 días)".
 */
export const licenseUrgencyText = (
  summary: LicenseSummary,
  formatDate: (value: string) => string,
): string | null => {
  const { mostUrgentDays: days, mostUrgentDate: date } = summary;
  if (days == null || !date) return null;
  const when = formatDate(date);
  if (days < 0) {
    const late = Math.abs(days);
    return `Venció el ${when} (hace ${plural(late, "día", "días")})`;
  }
  if (days === 0) return `Vence hoy (${when})`;
  return `Vence el ${when} (en ${plural(days, "día", "días")})`;
};
