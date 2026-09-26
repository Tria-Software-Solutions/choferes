// Client-side generation of the biweekly payment slip (boleta quincenal).
// Reuses the same lazy jsPDF + logo infra as utils/export.ts.
import { Payment } from "../models/Payment";
import { loadJSPDF, loadLogoDataUrl } from "./export";

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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  return `boleta-Q${payment.biweekNumber}-${payment.year}-${name}.pdf`;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  sent: "Enviada",
  cancelled: "Cancelada",
};

/**
 * Builds the boleta PDF. Returns the jsPDF instance so callers can either
 * save it locally or read it as base64 to attach it to the email endpoint.
 */
export async function buildPaymentSlipPdf(payment: Payment) {
  const PDFDocument = await loadJSPDF();
  const doc = new PDFDocument({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;

  const currency = payment.currency || "CRC";
  const employeeName = payment.employee
    ? `${payment.employee.firstName} ${payment.employee.lastName}`.trim()
    : `Empleado #${payment.employeeId}`;

  // ── Header ────────────────────────────────────────────────────────────────
  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, 36, 56, 56);
    } catch {
      // Corrupt/unsupported logo — draw the title without it.
    }
  }

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Boleta de pago quincenal", margin + (logoDataUrl ? 70 : 0), 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text("Choferes de Alquiler", margin + (logoDataUrl ? 70 : 0), 74);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Quincena ${payment.biweekNumber} · ${payment.year}`,
    pageWidth - margin,
    52,
    { align: "right" },
  );
  doc.text(getBiweeklyPeriodLabel(payment.biweekNumber, payment.year), pageWidth - margin, 68, {
    align: "right",
  });
  if (payment.payDate) {
    doc.text(`Fecha de pago: ${formatPaymentDate(payment.payDate)}`, pageWidth - margin, 84, {
      align: "right",
    });
  }

  doc.setDrawColor(224, 224, 224);
  doc.setLineWidth(1);
  doc.line(margin, 104, pageWidth - margin, 104);

  // ── Employee block ────────────────────────────────────────────────────────
  let y = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(employeeName, margin, y);

  if (payment.employee?.email) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(payment.employee.email, margin, y + 16);
    y += 16;
  }

  if (payment.status) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(`Estado: ${STATUS_LABELS[payment.status] ?? payment.status}`, pageWidth - margin, 130, {
      align: "right",
    });
    if (payment.emailSentAt) {
      doc.text(
        `Enviada por correo: ${formatPaymentDate(payment.emailSentAt)}`,
        pageWidth - margin,
        146,
        { align: "right" },
      );
    }
  }

  // ── Amounts table ─────────────────────────────────────────────────────────
  y += 40;
  const hourlyRate = payment.employee?.hourlyRate;
  const earnings: Array<{ label: string; value: string; strong?: boolean }> = [];

  earnings.push({
    label: "Salario ordinario",
    value: formatMoney(payment.regularSalary, currency),
    strong: true,
  });
  if (hourlyRate != null) {
    earnings.push({
      label: "Tarifa por hora",
      value: formatMoney(Number(hourlyRate), currency),
    });
  }
  earnings.push({ label: "Horas extra", value: formatMoney(payment.overtimePay, currency) });
  earnings.push({ label: "Millaje", value: formatMoney(payment.mileage, currency) });
  earnings.push({ label: "Otros ingresos", value: formatMoney(payment.others, currency) });

  const deductions: Array<{ label: string; value: string }> = [
    { label: "Cargas sociales", value: `− ${formatMoney(payment.socialCharges, currency)}` },
    { label: "Deducciones", value: `− ${formatMoney(payment.deductions, currency)}` },
  ];

  const rowHeight = 24;
  const labelX = margin + 8;
  const valueX = pageWidth - margin - 8;

  const drawSectionHeader = (title: string) => {
    doc.setFillColor(246, 246, 248);
    doc.roundedRect(margin, y, pageWidth - margin * 2, rowHeight, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(title, labelX, y + 16);
    y += rowHeight;
  };

  const drawRow = (
    label: string,
    value: string,
    options: { bold?: boolean; muted?: boolean } = {},
  ) => {
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(options.bold ? 11 : 10);
    doc.setTextColor(options.muted ? 130 : 30, options.muted ? 130 : 30, options.muted ? 130 : 30);
    doc.text(label, labelX, y + 16);
    doc.text(value, valueX, y + 16, { align: "right" });
    y += rowHeight;
  };

  drawSectionHeader("Ingresos");
  earnings.forEach((row) => drawRow(row.label, row.value, { bold: row.strong }));
  y += 8;
  drawSectionHeader("Deducciones");
  deductions.forEach((row) => drawRow(row.label, row.value, { muted: true }));

  // Total
  y += 10;
  doc.setFillColor(236, 244, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(25, 60, 120);
  doc.text("Total a pagar", labelX + 4, y + 25);
  doc.text(formatMoney(payment.totalPayable, currency), valueX - 4, y + 25, {
    align: "right",
  });
  y += 40;

  if (payment.isManual) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 110, 40);
    doc.text("Montos editados manualmente.", labelX, y + 14);
    y += 18;
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (payment.notes) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Notas", labelX, y + 14);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    const lines = doc.splitTextToSize(payment.notes, pageWidth - margin * 2 - 16);
    doc.text(lines, labelX, y + 14);
    y += lines.length * 13 + 8;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(224, 224, 224);
  doc.line(margin, pageHeight - 52, pageWidth - margin, pageHeight - 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Documento generado el ${formatPaymentDate(new Date())} · Choferes de Alquiler`,
    margin,
    pageHeight - 36,
  );

  return doc;
}

const formatPaymentDate = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

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
