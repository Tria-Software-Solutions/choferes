import { translateColumnHeaderToSpanish, translateDayOptionsToSpanish } from "./string";
import { formatDateWithDay, parseIsoDateWithoutTimeZone } from "./dates";
import { parseSvgPath, PdfIcon, PdfPathLeg } from "./pdfIcons";
import {
  BRAND_INK,
  BRAND_MUTED,
  drawBrandFooter,
  drawBrandHeader,
  brandHeaderSizes,
  drawCompactBrandHeader,
  loadBrandAssets,
} from "./pdfBranding";
import { COMPANY, COMPANY_FOOTER_TEXT } from "./boletaFormat";
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

async function loadExcelJS(): Promise<ExcelJSModule> {
  if (!excelJsModule) {
    excelJsModule = await import("exceljs");
  }
  return excelJsModule;
}

export async function loadJSPDF(): Promise<JSPDFType["default"]> {
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
    const cleanTitle = (title ?? deriveTitleFromFileName(fileName)).slice(0, 60);
    const colCount = exportHeaders.length;
    const banner =
      groupedHeaders && groupedHeaders.length > 1
        ? (groupedHeaders[0].find((c) => String(c).trim() !== "") ?? "")
        : "";

    // Layout: 1 brand header (shield + motto) · 2 title · 3 subtitle · [banner] · column headers.
    const BRAND_ROW = 1;
    const TITLE_ROW = 2;
    const SUBTITLE_ROW = 3;
    const bannerRow = banner ? 4 : 0;
    const headerRowIndex = banner ? 5 : 4;
    const sheet = workbook.addWorksheet("Datos", {
      views: [{ state: "frozen", ySplit: headerRowIndex }],
      pageSetup: { paperSize: 9, orientation: colCount > 6 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      headerFooter: {
        oddFooter: `&L&8${COMPANY.legalName}&C&8${COMPANY.website}&R&8Página &P de &N`,
      },
    });

    // ── Column widths (content-aware, capped) — computed first: the logos are positioned from them ──
    const colWidths = exportHeaders.map((header) => {
      const maxLen = Math.max(
        String(header).length,
        ...strictRows.map((row) => {
          const v = row[header];
          return v === null || v === undefined ? 0 : String(v).length;
        }),
      );
      return Math.min(Math.max(maxLen + 3, 10), 48);
    });
    colWidths.forEach((width, i) => {
      sheet.getColumn(i + 1).width = width;
    });
    const colPx = colWidths.map((w) => Math.round(w * 7 + 5));
    const totalPx = colPx.reduce((sum, px) => sum + px, 0);

    // Native anchor (column + EMU offset) for an x position in pixels from the left edge.
    // ExcelJS' fractional columns are relative to a different width, so offsets are given in EMU.
    const EMU_PER_PX = 9525;
    const anchorAtPx = (px: number, rowOffsetPx = 0) => {
      let acc = 0;
      let col = colPx.length - 1;
      let offset = 0;
      for (let i = 0; i < colPx.length; i += 1) {
        if (px < acc + colPx[i]) {
          col = i;
          offset = px - acc;
          break;
        }
        acc += colPx[i];
      }
      return {
        nativeCol: col,
        nativeColOff: Math.round(offset * EMU_PER_PX),
        nativeRow: 0,
        nativeRowOff: Math.round(rowOffsetPx * EMU_PER_PX),
      } as unknown as { col: number; row: number };
    };

    // ── Brand header: shield (left) + "Su auto… nuestro chofer." (right) over a thick rule ──
    const assets = await loadBrandAssets();
    const brandRowHeightPt = 62;
    const brandRowPx = Math.round(brandRowHeightPt * (96 / 72));
    sheet.getRow(BRAND_ROW).height = brandRowHeightPt;
    for (let c = 1; c <= colCount; c += 1) {
      sheet.getCell(BRAND_ROW, c).border = { bottom: { style: "thick", color: { argb: "FF000000" } } };
    }
    const sizes = brandHeaderSizes(brandRowPx - 8);
    const pad = 6;
    if (assets.shield) {
      const id = workbook.addImage({ base64: assets.shield, extension: "png" });
      sheet.addImage(id, {
        tl: anchorAtPx(pad, 4),
        ext: { width: sizes.shield.w, height: sizes.shield.h },
      });
    }
    if (assets.brand) {
      const id = workbook.addImage({ base64: assets.brand, extension: "png" });
      sheet.addImage(id, {
        tl: anchorAtPx(Math.max(totalPx - sizes.brand.w - pad, pad), 4 + sizes.shield.h - sizes.brand.h),
        ext: { width: sizes.brand.w, height: sizes.brand.h },
      });
    }

    // ── Title + subtitle (plain, under the brand rule) ──
    sheet.mergeCells(TITLE_ROW, 1, TITLE_ROW, colCount);
    const titleCell = sheet.getCell(TITLE_ROW, 1);
    titleCell.value = cleanTitle;
    titleCell.font = { bold: true, size: 15, color: { argb: "FF242424" } };
    titleCell.alignment = { vertical: "bottom", horizontal: "left", indent: 0 };
    sheet.getRow(TITLE_ROW).height = 30;

    sheet.mergeCells(SUBTITLE_ROW, 1, SUBTITLE_ROW, colCount);
    const subtitleCell = sheet.getCell(SUBTITLE_ROW, 1);
    subtitleCell.value = [subtitle, `Generado el ${formatDateSpanish(new Date())}`]
      .filter(Boolean)
      .join("  ·  ");
    subtitleCell.font = { size: 9.5, color: { argb: "FF6B7280" } };
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
    sheet.getRow(SUBTITLE_ROW).height = 18;

    // ── Optional grouped header (merged, e.g. "Agosto 2026") ──
    if (bannerRow) {
      sheet.mergeCells(bannerRow, 1, bannerRow, colCount);
      const bannerCell = sheet.getCell(bannerRow, 1);
      bannerCell.value = String(banner);
      bannerCell.font = { bold: true, size: 10.5, color: { argb: "FFFFFFFF" } };
      bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
      bannerCell.alignment = { vertical: "middle", horizontal: "center" };
      sheet.getRow(bannerRow).height = 20;
    }

    // ── Column headers (black, bold, white text) ──
    const headerRow = sheet.getRow(headerRowIndex);
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
      const excelRow = sheet.getRow(headerRowIndex + 1 + rowIndex);
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

    // ── Footer: legal line + website link (same as the pay slip) ──
    const footerRow = headerRowIndex + strictRows.length + 3;
    sheet.mergeCells(footerRow, 1, footerRow, colCount);
    const legalCell = sheet.getCell(footerRow, 1);
    legalCell.value = COMPANY_FOOTER_TEXT;
    legalCell.font = { size: 8.5, color: { argb: "FF242424" } };
    legalCell.alignment = { vertical: "middle", horizontal: "center" };
    legalCell.border = { top: { style: "thin", color: { argb: "FFD1D5DB" } } };
    sheet.getRow(footerRow).height = 20;
    sheet.mergeCells(footerRow + 1, 1, footerRow + 1, colCount);
    const linkCell = sheet.getCell(footerRow + 1, 1);
    linkCell.value = { text: COMPANY.website, hyperlink: COMPANY.websiteUrl };
    linkCell.font = { size: 8.5, underline: true, color: { argb: "FF1F497D" } };
    linkCell.alignment = { vertical: "middle", horizontal: "center" };

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

  // ── Brand header (same as the pay slip): shield + "Su auto… nuestro chofer." ──
  const assets = await loadBrandAssets();
  const headerTop = 10;
  const headerHeight = 19;
  const ruleY = drawBrandHeader(doc, assets, {
    left: marginX,
    right: pageWidth - marginX,
    top: headerTop,
    height: headerHeight,
  });

  // Title block under the rule; generated date + record count on the right.
  const rightEdge = pageWidth - marginX;
  const titleY = ruleY + 10;
  const metaWidth = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND_INK);
  const titleLines = doc.splitTextToSize(cleanTitle, pageWidth - marginX * 2 - metaWidth);
  doc.text(String(titleLines[0] ?? cleanTitle), marginX, titleY);

  // Subtitle (each "·"-separated segment is shortened, e.g. "Semana 32 · Agosto 2026")
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_MUTED);
    const shortenedSubtitle = subtitle
      .split("·")
      .map((segment) => shortenPdfCell(segment))
      .join(" · ");
    const subLines = doc.splitTextToSize(shortenedSubtitle, pageWidth - marginX * 2 - metaWidth);
    doc.text(String(subLines[0] ?? ""), marginX, titleY + 6);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_MUTED);
  doc.text(`Generado el ${generatedLabel}`, rightEdge, titleY - 4, { align: "right" });

  // Records count chip (outlined pill, right side)
  const recordText = `${rows.length} ${rows.length === 1 ? "registro" : "registros"}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const chipW = doc.getTextWidth(recordText) + 8;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightEdge - chipW, titleY, chipW, 6.5, 3.25, 3.25, "S");
  doc.setTextColor(...BRAND_INK);
  doc.text(recordText, rightEdge - chipW / 2, titleY + 4.4, { align: "center" });

  const tableStartY = titleY + (subtitle ? 13 : 9);

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
    startY: tableStartY,
    margin: { top: 26, left: marginX, right: marginX, bottom: 24 },
    // Pages after the first get a compact brand header instead of nothing.
    didDrawPage: (hookData: { pageNumber: number }) => {
      if (hookData.pageNumber > 1) {
        drawCompactBrandHeader(
          doc,
          assets,
          { left: marginX, right: pageWidth - marginX, top: 9, height: 11 },
          cleanTitle,
        );
      }
    },
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
    if (legendY + legendHeight > pageHeight - 28) {
      doc.addPage();
      legendY = 32;
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

  // ── Footer on every page: legal line with the website link + page number ──
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 11;
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5);
    drawBrandFooter(doc, { y: footerY, fontSize: 7, color: BRAND_MUTED });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_MUTED);
    doc.text(`Página ${page} de ${totalPages}`, pageWidth / 2, footerY + 4.2, { align: "center" });
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
