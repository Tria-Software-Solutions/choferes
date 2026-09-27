// Formatting used by the pay slip ("Comprobante de pago"), matching the
// company's Word template: "PERIODO: 30.SEPT. 2026" and "¢405.710,07".

const MONTHS = [
  "ENE.",
  "FEB.",
  "MAR.",
  "ABR.",
  "MAY.",
  "JUN.",
  "JUL.",
  "AGO.",
  "SEPT.",
  "OCT.",
  "NOV.",
  "DIC.",
];

/** "2026-09-30" | Date → "30.SEPT. 2026" */
export const formatBoletaPeriod = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T12:00:00`) : value;
  return `${String(date.getDate()).padStart(2, "0")}.${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** 405710.07 → "¢405.710,07" (dot thousands, comma decimals). */
export const formatColones = (value: number): string => {
  const amount = Number.isFinite(value) ? value : 0;
  const [integer, decimals] = Math.abs(amount).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${amount < 0 ? "-" : ""}¢${grouped},${decimals}`;
};
