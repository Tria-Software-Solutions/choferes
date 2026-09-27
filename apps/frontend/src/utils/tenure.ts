// Antigüedad laboral en formato "X años Y meses Z días" entre dos fechas
// YYYY-MM-DD. Vive en utils porque la usan tanto la ficha del empleado como
// la columna "Antigüedad" de la tabla de Planilla.

const parseDateOnly = (value?: string | null): Date | null => {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

// Suma meses conservando el día, sin desbordar (31 ene + 1 mes = 28/29 feb).
const addMonths = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
};

const daysBetween = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / 86_400_000);

// Devuelve null cuando no hay fecha de inicio o el rango no es válido, para que
// la interfaz muestre un texto claro en vez de un guion.
export const formatTenure = (start?: string | null, end?: string | null): string | null => {
  const from = parseDateOnly(start);
  const to = parseDateOnly(end) ?? new Date();
  if (!from || to.getTime() < from.getTime()) return null;

  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let days = daysBetween(addMonths(from, months), to);
  if (days < 0) {
    months -= 1;
    days = daysBetween(addMonths(from, months), to);
  }
  if (months < 0 || days < 0) return null;

  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years === 1 ? "" : "s"}`);
  if (restMonths > 0) parts.push(`${restMonths} mes${restMonths === 1 ? "" : "es"}`);
  if (days > 0) parts.push(`${days} día${days === 1 ? "" : "s"}`);
  return parts.length > 0 ? parts.join(" ") : "0 días";
};
