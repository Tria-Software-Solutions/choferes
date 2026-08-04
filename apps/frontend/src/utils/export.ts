import { translateColumnHeaderToSpanish, translateDayOptionsToSpanish } from "./string";
import { formatDateWithDay, parseIsoDateWithoutTimeZone } from "./dates";
import { parseSvgPath, PdfIcon, PdfPathLeg } from "./pdfIcons";
import logoAsset from "../assets/images/logo.png";
import { Employee } from '../models/Employee';
import { HoursWorked } from '../models/HoursWorked';
import { WeeklySummary } from '../models/WeeklySummary';
import { Schedule } from '../models/Schedule';
import { Vehicle } from '../models/Vehicle';

// Lazy load heavy libraries
type ExcelJSModule = typeof import("exceljs");
type JSPDFType = typeof import("jspdf");

let excelJsModule: ExcelJSModule | null = null;
let jsPDF: JSPDFType["default"] | null = null;

type PDFDocumentInstance = InstanceType<JSPDFType["default"]>;

// Cached base64 data URL of the app logo so jsPDF can draw it synchronously.
let logoDataUrlCache: string | null = null;

async function loadLogoDataUrl(): Promise<string | null> {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const response = await fetch(logoAsset);
    const blob = await response.blob();
    logoDataUrlCache = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    logoDataUrlCache = null;
  }
  return logoDataUrlCache;
}

async function loadExcelJS(): Promise<ExcelJSModule> {
  if (!excelJsModule) {
    excelJsModule = await import("exceljs");
  }
  return excelJsModule;
}

async function loadJSPDF(): Promise<JSPDFType["default"]> {
  if (!jsPDF) {
    const jspdfModule = await import("jspdf");
    await import("jspdf-autotable");
    jsPDF = jspdfModule.default;
  }
  return jsPDF;
}

/**
 * Generic type for exportable records. Allows any value for flexibility in export data.
 */
export interface ExportableRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Formats a date for use in exported file names.
 * @param date Date to format
 * @returns Formatted string (e.g. 12-07-2024-15-30-45)
 */
export function exportFileFormattedDate(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}-${String(date.getHours()).padStart(
    2,
    "0",
  )}-${String(date.getMinutes()).padStart(2, "0")}-${String(
    date.getSeconds(),
  ).padStart(2, "0")}`;
}

/**
 * Prepares and translates data for export, including vehicle-specific formatting.
 */
function prepareExportData(
  data: ExportableRecord[],
  isVehicleData = false
): { rows: ExportableRecord[]; headers: string[] } {
  if (!data || data.length === 0) return { rows: [], headers: [] };

  const cleaned = data.map((row) => {
    // Remove 'id', 'createdAt', 'updatedAt' from export
    const { id, createdAt, updatedAt, ...rest } = row;
    if (isVehicleData) {
      let fecha = "";
      if (row.parkingDate) {
        fecha = formatDateWithDay(
          row.parkingDate instanceof Date ? row.parkingDate : new Date(row.parkingDate),
          false
        );
      } else if (row.createdAt) {
        fecha = formatDateWithDay(parseIsoDateWithoutTimeZone(row.createdAt), false);
      }
      // Remove parkingDate from rest as well
      const { parkingDate, ...restWithoutParkingDate } = rest;
      return { Fecha: fecha, ...restWithoutParkingDate };
    }
    return rest;
  });

  const translated = cleaned.map((row) => {
    const translatedRow: ExportableRecord = {};
    Object.entries(row).forEach(([key, value]) => {
      if (key === "Fecha") {
        translatedRow["Fecha"] = value;
      } else if (Array.isArray(value)) {
        translatedRow[translateColumnHeaderToSpanish(key)] = value.map(translateDayOptionsToSpanish).join(", ");
      } else if (typeof value === "boolean") {
        translatedRow[translateColumnHeaderToSpanish(key)] = value ? "Sí" : "No";
      } else if (value === null || value === undefined) {
        translatedRow[translateColumnHeaderToSpanish(key)] = "";
      } else {
        translatedRow[translateColumnHeaderToSpanish(key)] = value;
      }
    });
    return translatedRow;
  });

  // After normalization, filter out 'id', 'createdAt', 'updatedAt' from headers
  const allKeys = Array.from(new Set(translated.flatMap((row) => Object.keys(row))));
  const filteredKeys = allKeys.filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
  const normalized = translated.map((row) => {
    const norm: ExportableRecord = {};
    filteredKeys.forEach((key) => {
      norm[key] = row[key] ?? "";
    });
    return norm;
  });

  // Only include columns that have at least one non-empty, non-null, non-undefined value
  const nonEmptyKeys = filteredKeys.filter((key) =>
    normalized.some((row) => {
      const value = row[key];
      return value !== "" && value !== null && value !== undefined;
    })
  );
  const filtered = normalized.map((row) => {
    const filteredRow: ExportableRecord = {};
    nonEmptyKeys.forEach((key) => {
      filteredRow[key] = row[key];
    });
    return filteredRow;
  });

  return { rows: filtered, headers: nonEmptyKeys };
}

/**
 * Exports data to Excel or PDF, with translation, cleaning, and custom column order support.
 * @param params Object with data, fileName, format, customHeaders, columnOrder, isVehicleData
 */
export async function exportTable({
  data,
  fileName,
  format,
  customHeaders,
  columnOrder,
  isVehicleData = false,
  groupedHeaders,
  title,
  subtitle,
  pdfData,
  pdfHeaders,
  headerIcons,
  legend,
}: {
  data: ExportableRecord[];
  fileName: string;
  format: "excel" | "pdf";
  customHeaders?: string[];
  columnOrder?: string[];
  isVehicleData?: boolean;
  groupedHeaders?: string[][];
  title?: string;
  subtitle?: string;
  /** Override data/headers used ONLY for the PDF export (Excel keeps `data`). */
  pdfData?: ExportableRecord[];
  pdfHeaders?: string[];
  /** Vector icons drawn in matching PDF table header cells. */
  headerIcons?: Record<number, PdfHeaderIcon>;
  /** Footer legend rendered under the PDF table. */
  legend?: PdfLegendEntry[];
}): Promise<void> {
  const { rows, headers } = prepareExportData(data, isVehicleData);
  if (rows.length === 0) return;

  // Decide column order: customHeaders > columnOrder > headers
  const exportHeaders = customHeaders ?? columnOrder ?? headers;

  if (format === "excel") {
    const ExcelJS = await loadExcelJS();
    // Build a new array with only the exportHeaders keys for each row
    const strictRows = rows.map((row) => {
      const obj: ExportableRecord = {};
      exportHeaders.forEach((key) => {
        obj[key] = row[key];
      });
      return obj;
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Choferes";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("Datos", {
      views: [{ state: "frozen", ySplit: (groupedHeaders && groupedHeaders.length > 1 ? 3 : 2) }],
    });

    // ── Title bar (merged, black band like the PDF hero) ──
    const cleanTitle = (title ?? deriveTitleFromFileName(fileName)).slice(0, 60);
    sheet.mergeCells(1, 1, 1, exportHeaders.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = cleanTitle;
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
    titleCell.alignment = { vertical: "middle" };
    sheet.getRow(1).height = 26;

    let rowCursor = 2;

    // ── Optional grouped header (merged, e.g. "Agosto 2026") ──
    if (groupedHeaders && groupedHeaders.length > 1) {
      const banner =
        groupedHeaders[0].find((c) => String(c).trim() !== "") ?? "";
      if (banner) {
        sheet.mergeCells(2, 1, 2, exportHeaders.length);
        const bannerCell = sheet.getCell(2, 1);
        bannerCell.value = String(banner);
        bannerCell.font = { bold: true, size: 10.5, color: { argb: "FFFFFFFF" } };
        bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
        bannerCell.alignment = { vertical: "middle", horizontal: "center" };
        sheet.getRow(2).height = 20;
        rowCursor = 3;
      }
    }

    // ── Column headers (black, bold, white text) ──
    const headerRow = sheet.getRow(rowCursor);
    exportHeaders.forEach((header, colIndex) => {
      const cell = headerRow.getCell(colIndex + 1);
      cell.value = String(header).toUpperCase();
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF111111" } },
        bottom: { style: "thin", color: { argb: "FF111111" } },
        left: { style: "thin", color: { argb: "FF333333" } },
        right: { style: "thin", color: { argb: "FF333333" } },
      };
    });
    headerRow.height = 22;

    // ── Data rows (zebra + borders) ──
    strictRows.forEach((row, rowIndex) => {
      const excelRow = sheet.getRow(rowCursor + 1 + rowIndex);
      const zebra = rowIndex % 2 === 1;
      exportHeaders.forEach((key, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        const value = row[key];
        cell.value =
          value === null || value === undefined
            ? ""
            : typeof value === "object" && !(value instanceof Date)
              ? JSON.stringify(value)
              : value;
        cell.font = { size: 10, color: { argb: "FF2F2F33" } };
        if (zebra) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F7F8" } };
        }
        const numeric = /total|hora|año|ticket|boleta|distancia/i.test(key);
        cell.alignment = {
          vertical: "middle",
          horizontal: numeric ? "right" : "left",
        };
        cell.border = {
          top: { style: "hair", color: { argb: "FFE8E8EB" } },
          bottom: { style: "hair", color: { argb: "FFE8E8EB" } },
          left: { style: "hair", color: { argb: "FFF0F0F2" } },
          right: { style: "hair", color: { argb: "FFF0F0F2" } },
        };
      });
      excelRow.height = 18;
    });

    // ── Column widths (content-aware, capped) ──
    exportHeaders.forEach((header, colIndex) => {
      const maxLen = Math.max(
        String(header).length,
        ...strictRows.map((row) => {
          const v = row[header];
          return v === null || v === undefined
            ? 0
            : String(v).length;
        })
      );
      sheet.getColumn(colIndex + 1).width = Math.min(Math.max(maxLen + 3, 10), 48);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const pdfRows = pdfData ?? rows;
    const pdfCols = pdfHeaders ?? exportHeaders;
    await exportToModernPdf({
      rows: pdfRows,
      headers: pdfCols,
      fileName,
      title,
      subtitle,
      groupedHeaders,
      headerIcons,
      legend,
    });
  }
}

/**
 * Derives a human-readable report title from the export file name.
 * E.g. "empleados-05-08-2026-10-30-00" → "Empleados".
 */
function deriveTitleFromFileName(fileName: string): string {
  const base = fileName.replace(
    /-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-\d{2}$/,
    ""
  );
  const words = base
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return words || "Reporte";
}

/**
 * Computes content-aware column widths (mm) so the table fills the page
 * width evenly while keeping long text readable and short columns compact.
 * Headers are measured as drawn (shortened), and columns holding only short
 * numeric values (e.g. "Total horas", "Horas extra") stay narrow so the
 * name column keeps enough room for long names to wrap at word boundaries.
 */
function computeColumnWidths(
  doc: PDFDocumentInstance,
  headers: string[],
  body: string[][],
  available: number
): number[] {
  const min = 11;
  const max = 58;
  const compactMax = 20; // numeric-only columns (totals) stay narrow
  const measureCap = 42; // don't let a single very long value blow up the column

  const widths = headers.map((header, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    let w = doc.getTextWidth(shortenPdfCell(header).toUpperCase()) + 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    const cells = body.map((row) => String(row[i] ?? ""));
    const numeric = cells.every(
      (c) => c.trim() === "" || /^[\d.,%+\-–\s]*$/.test(c.trim())
    );
    for (const raw of cells) {
      const sample = raw.length > measureCap ? raw.slice(0, measureCap) : raw;
      const cw = doc.getTextWidth(sample) + 7;
      if (cw > w) w = cw;
      // Floor by the widest single word so long names wrap at word
      // boundaries instead of overflowing the column.
      for (const word of sample.split(/\s+/)) {
        const ww = doc.getTextWidth(word) + 7;
        if (ww > w) w = ww;
      }
    }
    return Math.min(numeric ? compactMax : max, Math.max(min, w));
  });

  const total = widths.reduce((a, b) => a + b, 0);
  if (total <= available) {
    // Distribute leftover space evenly across columns
    const extra = available - total;
    return widths.map((w) => w + extra / widths.length);
  }
  // Scale down proportionally when the table is too wide
  return widths.map((w) => w * (available / total));
}

// ─── PDF cell shortening ──────────────────────────────────────────────
// Abbreviates common Spanish dates/labels so headers and cells stay compact.
// Long values (names, schedule labels) are NOT truncated — they wrap onto
// multiple lines (overflow: "linebreak") so everything stays fully readable.

const SPANISH_MONTHS: Record<string, string> = {
  enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
  julio: "07", agosto: "08", septiembre: "09", setiembre: "09", octubre: "10",
  noviembre: "11", diciembre: "12",
};

const SPANISH_MONTH_ABBR: Record<string, string> = {
  enero: "Ene", febrero: "Feb", marzo: "Mar", abril: "Abr", mayo: "May", junio: "Jun",
  julio: "Jul", agosto: "Ago", septiembre: "Sep", setiembre: "Sep", octubre: "Oct",
  noviembre: "Nov", diciembre: "Dic",
};

const SPANISH_DAYS: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miércoles: "Mié", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sábado: "Sáb", sabado: "Sáb", domingo: "Dom",
};

const WORD_CHARS = "A-Za-zÁÉÍÓÚáéíóúñÑüÜ";

/**
 * Shortens a cell value so it fits on one line in the PDF table.
 * - "Martes 05 de Agosto de 2026" → "05/08/2026"
 * - "Lunes 04" → "Lun 04"
 * - "Agosto 2026" → "Ago 2026"
 * - "Semana 32 (04/08/2026 - 10/08/2026)" → "Sem 32 · 04/08–10/08"
 * - Anything else → returned as-is (wraps to multiple lines, never truncated)
 */
function shortenPdfCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  if (!text) return "";

  // Spanish long date: "Martes 05 de Agosto de 2026" → "05/08/2026"
  // (tolerates an optional comma after the weekday: "Martes, 05 de ...")
  const longDate = text.match(
    new RegExp(`^([${WORD_CHARS}]+),?\\s+(\\d{1,2})\\s+de\\s+([${WORD_CHARS}]+)\\s+de\\s+(\\d{4})$`, "i")
  );
  if (longDate) {
    const month = SPANISH_MONTHS[longDate[3].toLowerCase()];
    if (month) {
      return `${longDate[2].padStart(2, "0")}/${month}/${longDate[4]}`;
    }
  }

  // Week label: "Semana 32 (04/08/2026 - 10/08/2026)" → "Sem 32 · 04/08–10/08"
  const week = text.match(
    /^semana\s+(\d+)(?:\s*\(?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4}))?/i
  );
  if (week) {
    const range = week[2]
      ? `${week[2].padStart(2, "0")}/${week[3].padStart(2, "0")}/${week[4]}–${week[5].padStart(2, "0")}/${week[6].padStart(2, "0")}/${week[7]}`
      : "";
    return `Sem ${week[1]}${range ? ` · ${range}` : ""}`;
  }

  // Day + day number: "Lunes 04" → "Lun 04"
  const dayDate = text.match(
    new RegExp(`^([${WORD_CHARS}]+)\\s+(\\d{1,2})$`, "i")
  );
  if (dayDate) {
    const abbr = SPANISH_DAYS[dayDate[1].toLowerCase()];
    if (abbr) return `${abbr} ${dayDate[2].padStart(2, "0")}`;
  }

  // Month + year: "Agosto 2026" → "Ago 2026"
  const monthYear = text.match(
    new RegExp(`^([${WORD_CHARS}]+)\\s+(\\d{4})$`, "i")
  );
  if (monthYear) {
    const abbr = SPANISH_MONTH_ABBR[monthYear[1].toLowerCase()];
    if (abbr) return `${abbr} ${monthYear[2]}`;
  }

  // Any other text (names, schedule labels, etc.) is kept in full — it wraps
  // onto multiple lines in the table instead of being truncated.
  return text;
}

// ─── PDF header icons ────────────────────────────────────────────────
// jsPDF cannot render emoji/font icons, so we draw the actual Lucide icon
// geometry (see ./pdfIcons) as stroked vectors. `headerIcons` maps a column
// index to the icon drawn in that header cell (replacing the text label)
// and `legend` renders a footer legend explaining each icon under the table.

export interface PdfHeaderIcon {
  /** Lucide icon (24x24 viewBox) drawn in the header cell. */
  path: PdfIcon;
}

export interface PdfLegendEntry {
  icon: PdfIcon;
  label: string;
  description: string;
}

/** Renders a Lucide icon (24x24 point space) scaled into a box on the doc. */
function drawIcon(
  doc: PDFDocumentInstance,
  icon: PdfIcon,
  x: number,
  y: number,
  size: number,
  color: [number, number, number]
): void {
  const scale = size / 24;
  const s = (v: number) => v * scale;
  doc.setDrawColor(color[0], color[1], color[2]);
  // Lucide icons are stroked with a 2-unit line in their 24x24 viewBox.
  doc.setLineWidth(2 * scale);
  for (const el of icon) {
    if (el.type === "circle") {
      doc.circle(x + s(el.cx), y + s(el.cy), s(el.r), "S");
    } else {
      const legs: PdfPathLeg[] = parseSvgPath(el.d).map((leg) => ({
        op: leg.op,
        c: leg.c.map((v, idx) => (idx % 2 === 0 ? x + s(v) : y + s(v))),
      }));
      doc.path(legs);
      doc.stroke();
    }
  }
}

/**
 * Generates a modern, professional PDF report that matches the app's premium
 * black look & feel: dark hero header with title/meta, content-aware column
 * widths, optional merged group banner, zebra rows and a footer with page
 * numbers on every page. `headerIcons` draws vector icons in the matching
 * table header cells and `legend` renders an explanation under the table.
 */
async function exportToModernPdf({
  rows,
  headers,
  fileName,
  title,
  subtitle,
  groupedHeaders,
  headerIcons,
  legend,
}: {
  rows: ExportableRecord[];
  headers: string[];
  fileName: string;
  title?: string;
  subtitle?: string;
  groupedHeaders?: string[][];
  /** Column index → icon drawn in the header cell (replaces the text label). */
  headerIcons?: Record<number, PdfHeaderIcon>;
  /** Footer legend rendered under the table (icon + label + description). */
  legend?: PdfLegendEntry[];
}): Promise<void> {
  const PDFDocument = await loadJSPDF();
  const doc = new PDFDocument({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;

  const cleanTitle = (title ?? deriveTitleFromFileName(fileName)).slice(0, 60);
  const generatedLabel = formatDateSpanish(new Date());

  // ── Hero header band ───────────────────────────────────────────────
  const bandY = 10;
  const bandH = 34;
  doc.setFillColor(10, 10, 10);
  doc.roundedRect(marginX, bandY, pageWidth - marginX * 2, bandH, 5, 5, "F");

  // Brand logo on a white rounded chip (dark icon needs contrast on the
  // black band). Falls back to the "CHOFERES" overline if the image fails.
  const logoDataUrl = await loadLogoDataUrl();
  let textX = marginX + 7;
  let titleY = bandY + 16.5;
  let subtitleY = bandY + 23.5;
  if (logoDataUrl) {
    const chipSize = 24;
    const chipX = marginX + 6;
    const chipY = bandY + (bandH - chipSize) / 2;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(chipX, chipY, chipSize, chipSize, 6, 6, "F");
    doc.addImage(logoDataUrl, "PNG", chipX + 2, chipY + 2, chipSize - 4, chipSize - 4);
    textX = marginX + 36;
    titleY = bandY + 17;
    subtitleY = bandY + 24;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text("CHOFERES", textX, bandY + 8);
  }

  // Title (truncated to fit the band, keeping clear of the right-side meta)
  const contentMaxWidth = logoDataUrl ? 90 : 110;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(cleanTitle, contentMaxWidth);
  doc.text(String(titleLines[0] ?? cleanTitle), textX, titleY);

  // Subtitle (each "·"-separated segment is shortened, e.g. "Semana 32 · Agosto 2026")
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const shortenedSubtitle = subtitle
      .split("·")
      .map((segment) => shortenPdfCell(segment))
      .join(" · ");
    const subLines = doc.splitTextToSize(shortenedSubtitle, contentMaxWidth);
    doc.text(String(subLines[0] ?? ""), textX, subtitleY);
  }

  // Generated date (right side)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generado el ${generatedLabel}`,
    pageWidth - marginX - 7,
    bandY + 8,
    { align: "right" }
  );

  // Records count chip (right side, below generated date)
  const recordText = `${rows.length} ${rows.length === 1 ? "registro" : "registros"}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const chipW = doc.getTextWidth(recordText) + 9;
  const chipX = pageWidth - marginX - 7 - chipW;
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(chipX, bandY + 12, chipW, 7.5, 3.75, 3.75, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(recordText, chipX + 4.5, bandY + 17);

  // ── Table data ─────────────────────────────────────────────────────
  // Cells are shortened first so every value fits on a single line (no wraps).
  const tableBody = rows.map((row) =>
    headers.map((key) => shortenPdfCell(row[key]))
  );

  const banner =
    groupedHeaders && groupedHeaders.length > 0
      ? groupedHeaders[0].find((c) => String(c).trim() !== "")
      : undefined;
  // When a merged banner row is present it becomes head row 0, so the actual
  // column headers (and their icons) live on row 1.
  const headerRowIndex = banner ? 1 : 0;
  const head: unknown[][] = banner
    ? [
        [
          {
            content: shortenPdfCell(String(banner)),
            colSpan: headers.length,
            styles: {
              halign: "center" as const,
              fontStyle: "bold" as const,
              fillColor: [26, 26, 26] as const,
              textColor: [255, 255, 255] as const,
              fontSize: 8.5,
            },
          },
        ],
        headers.map((h) => shortenPdfCell(String(h)).toUpperCase()),
      ]
    : [headers.map((h) => shortenPdfCell(String(h)).toUpperCase())];

  const available = pageWidth - marginX * 2;
  const widths = computeColumnWidths(doc, headers, tableBody, available);
  const columnStyles: Record<
    number,
    { cellWidth: number; halign: "left" | "right" | "center" }
  > = {};
  headers.forEach((h, i) => {
    const numeric = /total|hora|año|ticket|boleta|distancia/i.test(h);
    columnStyles[i] = {
      cellWidth: widths[i],
      halign: numeric ? "right" : "left",
    };
  });

  // Render header icons: for the columns listed in `headerIcons`, the column
  // text is replaced by the icon centered in the cell (its meaning is
  // explained in the legend under the table).
  const headerIconSpecs: Record<number, PdfHeaderIcon> = headerIcons ?? {};
  const autoTableResult = doc.autoTable({
    head,
    body: tableBody,
    startY: bandY + bandH + 8,
    margin: { top: 20, left: marginX, right: marginX, bottom: 18 },
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      textColor: [48, 48, 54],
      lineColor: [232, 232, 235],
      lineWidth: 0.2,
      cellPadding: { top: 2.4, bottom: 2.4, left: 3, right: 3 },
      valign: "middle",
      // Names and schedule labels wrap at word boundaries (first name on one
      // line, last name on the next) — a word wider than the cell stays whole
      // instead of being character-split like jsPDF's default "linebreak".
      overflow: (textLines: string[], textSpace: number) => {
        const lines: string[] = [];
        for (const line of textLines) {
          let current = "";
          for (const word of line.split(/\s+/).filter(Boolean)) {
            const candidate = current ? `${current} ${word}` : word;
            if (!current || doc.getTextWidth(candidate) <= textSpace) {
              current = candidate;
            } else {
              lines.push(current);
              current = word;
            }
          }
          if (current) lines.push(current);
        }
        return lines;
      },
    },
    headStyles: {
      fillColor: [10, 10, 10],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.6,
      halign: "center",
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [247, 247, 248] },
    columnStyles,
    didParseCell: (hookData: {
      section: string;
      row: { index: number };
      column: { index: number };
      cell: { x: number; y: number; width: number; height: number; text: unknown[] };
    }) => {
      const { section, row, column, cell } = hookData;
      if (section !== "head" || row.index !== headerRowIndex) return;
      // Icon columns render the icon manually in didDrawCell, so the
      // plain text is dropped here (also keeps the header cell compact).
      if (headerIconSpecs[column.index]) cell.text = [];
    },
    didDrawCell: (hookData: {
      section: string;
      row: { index: number };
      column: { index: number };
      cell: { x: number; y: number; width: number; height: number };
    }) => {
      const { section, row, column, cell } = hookData;
      if (section !== "head" || row.index !== headerRowIndex) return;
      const spec = headerIconSpecs[column.index];
      if (!spec) return;
      // didParseCell fires during width calculation (cell.x/y still 0), so
      // the icon is drawn here, after the header background is painted and
      // the final cell coordinates are known. The icon replaces the column
      // text; its meaning is explained in the legend under the table.
      const iconSize = 5;
      const iconX = cell.x + (cell.width - iconSize) / 2;
      const iconY = cell.y + (cell.height - iconSize) / 2;
      drawIcon(doc, spec.path, iconX, iconY, iconSize, [255, 255, 255]);
    },
  }) as unknown as { finalY: number };

  // ── Legend under the table (icon + meaning) ───────────────────────
  if (legend && legend.length > 0) {
    // jspdf-autotable 3.x exposes finalY via doc.lastAutoTable (the return value lacks it)
    const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
    const tableBottom = (autoTableResult.finalY ?? lastTable?.finalY) || 20;
    // Ensure the whole legend fits on the page; add a new page if needed.
    const legendHeight = 14 + legend.length * 7.5;
    let legendY = tableBottom + 12;
    if (legendY + legendHeight > pageHeight - 20) {
      doc.addPage();
      legendY = 24;
    }
    doc.setPage(doc.getNumberOfPages());
    doc.setDrawColor(10, 10, 10);
    doc.setLineWidth(0.4);
    doc.line(marginX, legendY - 5, pageWidth - marginX, legendY - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(10, 10, 10);
    doc.text("Leyenda", marginX, legendY + 1);

    legend.forEach((entry, idx) => {
      const rowY = legendY + 9 + idx * 7.5;
      drawIcon(doc, entry.icon, marginX + 2, rowY - 1.6, 3.6, [10, 10, 10]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      const labelX = marginX + 8.5;
      doc.text(entry.label, labelX, rowY + 1.5);
      // Measure with the same bold font the label was drawn with, so the
      // description always starts after a clear gap (never overlapping).
      const labelWidth = doc.getTextWidth(entry.label);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text(entry.description, labelX + labelWidth + 4, rowY + 1.5);
    });
  }

  // ── Footer with page numbers on every page ─────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 8;
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Choferes · ${cleanTitle}`, marginX, footerY);
    doc.text(
      `Página ${page} de ${totalPages}`,
      pageWidth - marginX,
      footerY,
      { align: "right" }
    );
  }

  doc.save(`${fileName}.pdf`);
}

/**
 * Utility to create export options for UI buttons (Excel/PDF).
 * @param params Object with icons, data, fileName, columnOrder, isVehicleData, customHeaders
 * @returns Array of export option objects for UI
 */
export function createExportOptions({
  excelIcon,
  pdfIcon,
  data,
  fileName,
  columnOrder,
  isVehicleData = false,
  customHeaders,
  title,
  subtitle,
  pdfData,
  pdfHeaders,
  headerIcons,
  legend,
}: {
  excelIcon: JSX.Element;
  pdfIcon: JSX.Element;
  data: ExportableRecord[];
  fileName: string;
  columnOrder?: string[];
  isVehicleData?: boolean;
  customHeaders?: string[];
  title?: string;
  subtitle?: string;
  /** Override data/headers used ONLY for the PDF export (Excel keeps `data`). */
  pdfData?: ExportableRecord[];
  pdfHeaders?: string[];
  /** Vector icons drawn in matching PDF table header cells. */
  headerIcons?: Record<number, PdfHeaderIcon>;
  /** Footer legend rendered under the PDF table. */
  legend?: PdfLegendEntry[];
}) {
  return [
    {
      label: "Exportar a Excel",
      icon: excelIcon,
      onClick: () =>
        void exportTable({
          data,
          fileName,
          format: "excel",
          columnOrder,
          isVehicleData,
          customHeaders,
        }),
    },
    {
      label: "Exportar a PDF",
      icon: pdfIcon,
      onClick: () =>
        void exportTable({
          data,
          fileName,
          format: "pdf",
          columnOrder,
          isVehicleData,
          customHeaders,
          title,
          subtitle,
          pdfData,
          pdfHeaders,
          headerIcons,
          legend,
        }),
    },
  ];
}


export function formatDateSpanish(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function buildWeeklySelectorTableExportData({
  employees,
  hoursWorked,
  weeklySummaries,
  schedules,
}: {
  employees: Employee[];
  hoursWorked: HoursWorked[];
  weeklySummaries: WeeklySummary[];
  schedules: Schedule[];
}) {
  // 1. Get all unique (employeeId, weekNumber, year) combinations from weeklySummaries
  const summaryCombos = weeklySummaries.map(ws => ({
    employeeId: ws.employeeId,
    weekNumber: ws.weekNumber,
    year: ws.year,
    totalHours: ws.totalHours,
  }));

  // 2. Sort employees by name
  const sortedEmployees = [...employees].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // 3. Build headers
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const headers = ['Año', 'Semana', 'Empleado', ...dayNames, 'Total horas', 'Horas extra'];

  // 4. Build rows
  const rows: ExportableRecord[] = [];
  for (const emp of sortedEmployees) {
    // Find all summaries for this employee
    const empSummaries = summaryCombos.filter(s => s.employeeId === emp.id);
    for (const summary of empSummaries) {
      // Calculate the Monday of the ISO week
      const monday = getMondayOfISOWeek(summary.weekNumber, summary.year);
      const lastDay = new Date(monday);
      lastDay.setDate(monday.getDate() + 6);
      const semanaLabel = `Semana ${summary.weekNumber} (${monday.getDate().toString().padStart(2, '0')}/${(monday.getMonth()+1).toString().padStart(2, '0')}/${monday.getFullYear()} - ${lastDay.getDate().toString().padStart(2, '0')}/${(lastDay.getMonth()+1).toString().padStart(2, '0')}/${lastDay.getFullYear()})`;
      const row: ExportableRecord = {
        'Año': summary.year,
        'Semana': semanaLabel,
        'Empleado': `${emp.firstName} ${emp.lastName}`,
      };
      // For each day of the week
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        // Find hoursWorked for this employee and exact date
        const hw = hoursWorked.find(h => h.employeeId === emp.id && new Date(h.date).toDateString() === day.toDateString());
        let label = 'Libre';
        if (hw && hw.scheduleId) {
          const sched = schedules.find(s => s.id === hw.scheduleId);
          label = sched ? sched.label : 'Libre';
        }
        row[dayNames[i]] = label;
      }
      row['Total horas'] = summary.totalHours;
      // Horas extra: not available in WeeklySummary, always set to 0
      row['Horas extra'] = 0;
      rows.push(row);
    }
  }
  return { headers, rows };
}

/**
 * Returns the Monday of a given ISO week and year
 */
function getMondayOfISOWeek(week: number, year: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  let monday = new Date(simple);
  if (dow <= 4)
    monday.setDate(simple.getDate() - simple.getDay() + 1);
  else
    monday.setDate(simple.getDate() + 8 - simple.getDay());
  return monday;
}

export function buildVehiclesExportData(vehicles: Vehicle[]) {
  // Ordenar por fecha de parqueo ascendente
  const sorted = [...vehicles].sort((a, b) => new Date(a.parkingDate).getTime() - new Date(b.parkingDate).getTime());
  const headers = ['Año', 'Fecha de Parqueo', 'Ticket', 'Placa', 'Marca', 'Color', 'Parqueo', 'Notas'];
  const rows = sorted.map(v => {
    const dateObj = new Date(v.parkingDate);
    const year = dateObj.getFullYear();
    const legibleDate = dateObj.toLocaleString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    // Capitalizar el primer carácter del día
    const capitalizedDate =
      legibleDate.charAt(0).toUpperCase() + legibleDate.slice(1);
    return {
      Año: year,
      "Fecha de Parqueo": capitalizedDate,
      Ticket: v.ticket,
      Placa: v.licensePlate,
      Marca: v.brand,
      Color: v.color,
      Parqueo: v.parkingLot,
      Notas: v.notes || "",
    };
  });
  return { headers, rows };
}
