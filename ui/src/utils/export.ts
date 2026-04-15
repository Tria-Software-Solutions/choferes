import { translateColumnHeaderToSpanish, translateDayOptionsToSpanish } from "./string";
import { formatDateWithDay, parseIsoDateWithoutTimeZone } from "./dates";
import { Employee } from '../models/Employee';
import { HoursWorked } from '../models/HoursWorked';
import { WeeklySummary } from '../models/WeeklySummary';
import { Schedule } from '../models/Schedule';
import { Vehicle } from '../models/Vehicle';

// Lazy load heavy libraries
type XLSXType = typeof import("xlsx");
type JSPDFType = typeof import("jspdf");

let XLSX: XLSXType | null = null;
let jsPDF: JSPDFType["default"] | null = null;

async function loadXLSX(): Promise<XLSXType> {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
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
}: {
  data: ExportableRecord[];
  fileName: string;
  format: "excel" | "pdf";
  customHeaders?: string[];
  columnOrder?: string[];
  isVehicleData?: boolean;
  groupedHeaders?: string[][];
}): Promise<void> {
  const { rows, headers } = prepareExportData(data, isVehicleData);
  if (rows.length === 0) return;

  // Decide column order: customHeaders > columnOrder > headers
  const exportHeaders = customHeaders ?? columnOrder ?? headers;

  if (format === "excel") {
    const xlsx = await loadXLSX();
    // Build a new array with only the exportHeaders keys for each row
    const strictRows = rows.map((row) => {
      const obj: ExportableRecord = {};
      exportHeaders.forEach((key) => {
        obj[key] = row[key];
      });
      return obj;
    });
    let ws;
    if (groupedHeaders && groupedHeaders.length > 1) {
      // Multi-level header: prepend groupedHeaders rows
      // SheetJS expects arrays of arrays for aoa_to_sheet
      const aoa = [...groupedHeaders, ...strictRows.map(row => exportHeaders.map(key => row[key]))];
      ws = xlsx.utils.aoa_to_sheet(aoa);
      if (
        groupedHeaders[0][0] &&
        groupedHeaders[0].slice(1).every(cell => cell === "")
      ) {
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: exportHeaders.length - 1 } }
        ];
      } else {
        const merges = [];
        for (let i = 0; i < groupedHeaders[0].length; ) {
          const val = groupedHeaders[0][i];
          let j = i + 1;
          while (j < groupedHeaders[0].length && groupedHeaders[0][j] === val) j++;
          if (j - i > 1) {
            merges.push({ s: { r: 0, c: i }, e: { r: 0, c: j - 1 } });
          }
          i = j;
        }
        ws['!merges'] = merges;
      }
      if (ws['!ref']) {
        const range = xlsx.utils.decode_range(ws['!ref']);
        range.e.c = exportHeaders.length - 1;
        ws['!ref'] = xlsx.utils.encode_range(range);
      }
    } else {
      ws = xlsx.utils.json_to_sheet(strictRows, { header: exportHeaders });
      if (ws['!ref']) {
        const range = xlsx.utils.decode_range(ws['!ref']);
        range.e.c = exportHeaders.length - 1;
        ws['!ref'] = xlsx.utils.encode_range(range);
      }
    }
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Datos");
    xlsx.writeFile(wb, `${fileName}.xlsx`);
  } else {
    const PDFDocument = await loadJSPDF();
    // Reorder columns for PDF
    const tableData = rows.map((row) => exportHeaders.map((key) => row[key]));
    const doc = new PDFDocument();
    doc.autoTable({
      head: [exportHeaders],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`${fileName}.pdf`);
  }
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
}: {
  excelIcon: JSX.Element;
  pdfIcon: JSX.Element;
  data: ExportableRecord[];
  fileName: string;
  columnOrder?: string[];
  isVehicleData?: boolean;
  customHeaders?: string[];
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
