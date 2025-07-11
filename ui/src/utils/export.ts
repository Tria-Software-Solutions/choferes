import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { translateColumnHeaderToSpanish, translateDayOptionsToSpanish } from "./string";
import { formatDateWithDay, parseIsoDateWithoutTimeZone } from "./dates";

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
export function exportTable({
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
}) {
  const { rows, headers } = prepareExportData(data, isVehicleData);
  if (rows.length === 0) return;

  // Decide column order: customHeaders > columnOrder > headers
  const exportHeaders = customHeaders ?? columnOrder ?? headers;

  if (format === "excel") {
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
      ws = XLSX.utils.aoa_to_sheet(aoa);
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
        const range = XLSX.utils.decode_range(ws['!ref']);
        range.e.c = exportHeaders.length - 1;
        ws['!ref'] = XLSX.utils.encode_range(range);
      }
    } else {
      ws = XLSX.utils.json_to_sheet(strictRows, { header: exportHeaders });
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        range.e.c = exportHeaders.length - 1;
        ws['!ref'] = XLSX.utils.encode_range(range);
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } else {
    // Reorder columns for PDF
    const tableData = rows.map((row) => exportHeaders.map((key) => row[key]));
    const doc = new jsPDF();
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
        exportTable({
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
        exportTable({
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
