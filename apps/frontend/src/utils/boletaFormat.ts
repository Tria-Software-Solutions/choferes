// Formatting of the pay slip ("Comprobante de pago"), matching the company's
// Word template: "PERIODO: 30.SEPT. 2026" and "¢405.710,07". Mirrors
// apps/backend/src/utils/boletaFormat.ts (email body).

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

/** Last day of a quincena as YYYY-MM-DD (15th or end of month). */
export const getPeriodEndISO = (biweekNumber: number, year: number): string => {
  const month = Math.floor((biweekNumber - 1) / 2);
  const day = biweekNumber % 2 === 1 ? 15 : new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/** "2026-09-30" → "30.SEPT. 2026" */
export const formatBoletaPeriod = (isoDate: string): string => {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return `${String(day).padStart(2, "0")}.${MONTHS[month - 1]} ${year}`;
};

/** 405710.07 → "¢405.710,07" (dot thousands, comma decimals). */
export const formatColones = (value: number): string => {
  const amount = Number.isFinite(value) ? value : 0;
  const [integer, decimals] = Math.abs(amount).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${amount < 0 ? "-" : ""}¢${grouped},${decimals}`;
};

export const COMPANY = {
  legalName: "Choferes de Alquiler, S.A.",
  legalId: "Cédula Jurídica 3-101-559864",
  phone: "Teléfono 2234·2662",
  tollFree: "800·CHOFERES",
  website: "www.choferesdealquiler.com",
  websiteUrl: "http://www.choferesdealquiler.com",
} as const;

export const COMPANY_FOOTER_TEXT = [
  COMPANY.legalName,
  COMPANY.legalId,
  COMPANY.phone,
  COMPANY.tollFree,
].join(" / ");
