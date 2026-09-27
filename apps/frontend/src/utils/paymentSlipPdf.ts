// Client-side generation of the biweekly pay slip ("Comprobante de pago").
// Reproduces the company's Word template: letter page, both logos over a
// thick rule, centered title, "PERIODO", the concept table with grey
// borders, the currency note and the legal footer. The same PDF is downloaded
// and attached to the email, so what the user checks is what is sent.
import { Payment, PAYMENT_CONCEPTS } from "../models/Payment";
import { loadJSPDF } from "./export";
import shieldLogo from "../assets/images/boleta/logo-escudo.png";
import brandLogo from "../assets/images/boleta/logo-su-auto.png";
import {
  COMPANY,
  COMPANY_FOOTER_TEXT,
  formatBoletaPeriod,
  formatColones,
  getPeriodEndISO,
} from "./boletaFormat";

const CURRENCY_LABELS: Record<string, string> = {
  CRC: "₡",
  USD: "$",
  EUR: "€",
};

export const formatMoney = (value: number, currency = "CRC"): string => {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_LABELS[currency] ?? "";
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Same period math as the backend getBiweeklyDates (1-15 / 16-end of month).
export const getBiweeklyPeriodLabel = (biweekNumber: number, year: number): string => {
  const month = Math.floor((biweekNumber - 1) / 2);
  const isFirstBiweek = biweekNumber % 2 === 1;
  const startDay = isFirstBiweek ? 1 : 16;
  const startDate = new Date(year, month, startDay);
  const endDay = isFirstBiweek ? 15 : new Date(year, month + 1, 0).getDate();
  const endDate = new Date(year, month, endDay);
  const fmt = (date: Date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  return `${fmt(startDate)} – ${fmt(endDate)}`;
};

export const getPaymentFileName = (payment: Payment): string => {
  const name = (payment.employee
    ? `${payment.employee.firstName} ${payment.employee.lastName}`
    : "empleado"
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const period = getPeriodEndISO(payment.biweekNumber, payment.year);
  return `comprobante-de-pago-${period}-${name}.pdf`;
};

const imageCache = new Map<string, string | null>();

const loadImageDataUrl = async (src: string): Promise<string | null> => {
  if (imageCache.has(src)) return imageCache.get(src) ?? null;
  try {
    const blob = await (await fetch(src)).blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    imageCache.set(src, dataUrl);
    return dataUrl;
  } catch {
    imageCache.set(src, null);
    return null;
  }
};

// Word template geometry (points): letter page, 1701 twips side margins.
const PAGE = { marginX: 85, headerTop: 35 };
const INK: [number, number, number] = [36, 36, 36]; // #242424
const GRID: [number, number, number] = [191, 191, 191]; // #BFBFBF
const LINK: [number, number, number] = [31, 73, 125]; // #1F497D

export const boletaRows = (payment: Payment): Array<{ label: string; value: string }> => {
  const employeeName = payment.employee
    ? `${payment.employee.firstName} ${payment.employee.lastName}`.trim()
    : `Empleado #${payment.employeeId}`;
  return [
    { label: "Nombre", value: employeeName },
    ...PAYMENT_CONCEPTS.map(({ field, label }) => ({
      label,
      value: formatColones(Number(payment[field] ?? 0)),
    })),
    { label: "Total a pagar", value: formatColones(Number(payment.totalPayable ?? 0)) },
  ];
};

/**
 * Builds the "Comprobante de pago" PDF. Returns the jsPDF instance so callers
 * can either save it locally or read it as base64 for the email endpoint.
 */
export async function buildPaymentSlipPdf(payment: Payment) {
  const PDFDocument = await loadJSPDF();
  const doc = new PDFDocument({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = PAGE.marginX;
  const right = pageWidth - PAGE.marginX;

  // ── Header: shield (left) and "Su auto… nuestro chofer." (right) ──────────
  const [shield, brand] = await Promise.all([
    loadImageDataUrl(shieldLogo),
    loadImageDataUrl(brandLogo),
  ]);
  const headerLeft = left - 9; // paragraph indent of the template header
  const headerRight = right + 38;
  const shieldSize = { w: 100, h: 106 };
  const brandSize = { w: 86, h: 62 };
  const headerBottom = PAGE.headerTop + shieldSize.h;
  try {
    if (shield) {
      doc.addImage(shield, "PNG", headerLeft, PAGE.headerTop, shieldSize.w, shieldSize.h);
    }
    if (brand) {
      doc.addImage(
        brand,
        "PNG",
        headerRight - brandSize.w,
        headerBottom - brandSize.h,
        brandSize.w,
        brandSize.h,
      );
    }
  } catch {
    // Unreadable logo — keep the document without it.
  }
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2.25);
  doc.line(headerLeft, headerBottom + 6, headerRight, headerBottom + 6);

  // ── Title and period ──────────────────────────────────────────────────────
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  let y = headerBottom + 44;
  doc.text("COMPROBANTE DE PAGO", pageWidth / 2, y, { align: "center" });

  y += 30;
  doc.setFontSize(9);
  const periodLabel = "PERIODO: ";
  doc.text(periodLabel, left, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    formatBoletaPeriod(getPeriodEndISO(payment.biweekNumber, payment.year)),
    left + doc.getTextWidth(periodLabel),
    y,
  );

  // ── Concept table (column widths 3415 / 5413 twips) ───────────────────────
  y += 6;
  const labelWidth = 170.75;
  const valueWidth = 270.65;
  const rowHeight = 17;
  doc.setDrawColor(...GRID);
  doc.setLineWidth(0.75);
  boletaRows(payment).forEach((row, index, rows) => {
    const isTotal = index === rows.length - 1;
    doc.rect(left, y, labelWidth, rowHeight);
    doc.rect(left + labelWidth, y, valueWidth, rowHeight);
    doc.setFont("helvetica", "bold");
    doc.text(row.label, left + 5, y + 11.5);
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.text(row.value, left + labelWidth + 5, y + 11.5);
    y += rowHeight;
  });

  doc.setFont("helvetica", "normal");
  doc.text("*Moneda: Colón CR", left + labelWidth + valueWidth, y + 12, { align: "right" });

  // ── Footer: legal line with the website link ──────────────────────────────
  const footerY = pageHeight - 40;
  doc.setFontSize(8);
  const text = `${COMPANY_FOOTER_TEXT} /`;
  // getTextWidth ignores trailing spaces: add the separating space by hand.
  const spaceWidth = (doc.getStringUnitWidth(" ") * doc.getFontSize()) / doc.internal.scaleFactor;
  const textWidth = doc.getTextWidth(text) + spaceWidth;
  const linkWidth = doc.getTextWidth(COMPANY.website);
  const startX = (pageWidth - textWidth - linkWidth) / 2;
  doc.setTextColor(...INK);
  doc.text(text, startX, footerY);
  doc.setTextColor(...LINK);
  doc.textWithLink(COMPANY.website, startX + textWidth, footerY, { url: COMPANY.websiteUrl });
  doc.setDrawColor(...LINK);
  doc.setLineWidth(0.4);
  doc.line(startX + textWidth, footerY + 1.2, startX + textWidth + linkWidth, footerY + 1.2);
  doc.setTextColor(...INK);
  doc.text("c.archivo", left, footerY + 12);

  return doc;
}

/** Downloads the boleta as a PDF file. */
export async function downloadPaymentSlip(payment: Payment): Promise<void> {
  const doc = await buildPaymentSlipPdf(payment);
  doc.save(getPaymentFileName(payment));
}

/** Builds the boleta and returns its base64 payload (for the email endpoint). */
export async function buildPaymentSlipBase64(
  payment: Payment,
): Promise<{ pdfBase64: string; pdfFileName: string }> {
  const doc = await buildPaymentSlipPdf(payment);
  const dataUri = doc.output("datauristring") as string;
  const commaIndex = dataUri.indexOf(",");
  return {
    pdfBase64: commaIndex >= 0 ? dataUri.slice(commaIndex + 1) : dataUri,
    pdfFileName: getPaymentFileName(payment),
  };
}
