import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Employee } from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";
import { Schedule } from "../models/Schedule";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";
import {
  translateColumnHeaderToSpanish,
  translateDayOptionsToSpanish,
  translateDayToAbrevSpanish,
  translatePeriodToSpanish,
} from "./string";
import { parseIsoDateWithoutTimeZone, formatDateWithDay } from "./dates";
import {
  formatHeaderDateWithYear,
  hasMultipleYears,
  hasMultipleBiweeks,
  hasMultipleMonths,
  getInvolvedPeriods,
} from "./dates";
import { EnglishDayOfWeek } from "./dayAbreviations";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "./calculation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) return;

  const isVehicleData = "licensePlate" in data[0];

  if (isVehicleData) {
    data.sort((a, b) => {
      const ticketA = a.ticket ? BigInt(a.ticket) : BigInt(0);
      const ticketB = b.ticket ? BigInt(b.ticket) : BigInt(0);
      return ticketA < ticketB ? -1 : ticketA > ticketB ? 1 : 0;
    });
  }

  const cleanedData = isVehicleData
    ? data.map(({ id, updatedAt, createdAt, ...row }) => {
        const newRow = { ...row };
        if (createdAt) {
          const localDate = parseIsoDateWithoutTimeZone(createdAt);
          newRow.Fecha = formatDateWithDay(localDate, false);
        }
        return newRow;
      })
    : data.map(({ id, ...row }) => row);

  const translatedData = cleanedData.map((row) => {
    const translatedRow: Record<string, unknown> = {};
    if (isVehicleData && row.Fecha) {
      translatedRow["Fecha"] = row.Fecha;
    }

    Object.entries(row).forEach(([key, value]) => {
      if (key === "Fecha") return;

      if (Array.isArray(value)) {
        translatedRow[translateColumnHeaderToSpanish(key)] = value
          .map(translateDayOptionsToSpanish)
          .join(", ");
      } else if (typeof value === "boolean") {
        translatedRow[translateColumnHeaderToSpanish(key)] = value
          ? "Sí"
          : "No";
      } else if (value === null || value === undefined) {
        translatedRow[translateColumnHeaderToSpanish(key)] = "";
      } else {
        translatedRow[translateColumnHeaderToSpanish(key)] = value;
      }
    });

    return translatedRow;
  });

  const ws = XLSX.utils.json_to_sheet(translatedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  fileName: string,
  headers?: unknown,
) => {
  if (!data || data.length === 0) return;

  const isVehicleData = data.length > 0 && "licensePlate" in data[0];

  if (isVehicleData) {
    data.sort((a, b) => {
      const ticketA = a.ticket ? BigInt(a.ticket) : BigInt(0);
      const ticketB = b.ticket ? BigInt(b.ticket) : BigInt(0);
      return ticketA < ticketB ? -1 : ticketA > ticketB ? 1 : 0;
    });
  }

  const cleanedData = isVehicleData
    ? data.map(({ id, updatedAt, createdAt, ...row }) => {
        const formattedDate = createdAt
          ? formatDateWithDay(parseIsoDateWithoutTimeZone(createdAt), false)
          : "";
        return { Fecha: formattedDate, ...row };
      })
    : data.map(({ id, ...row }) => row);

  const tableHeaders = Array.isArray(headers)
    ? [headers]
    : [
        Object.keys(cleanedData[0]).map((header) =>
          header === "Fecha" ? "Fecha" : translateColumnHeaderToSpanish(header),
        ),
      ];

  const tableData = cleanedData.map((row) => {
    return Object.entries(row).map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(translateDayOptionsToSpanish).join(", ");
      } else if (typeof value === "boolean") {
        return value ? "Sí" : "No";
      } else if (value === null || value === undefined) {
        return "";
      } else {
        return String(value);
      }
    });
  });

  const doc = new jsPDF();
  doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: 20,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`${fileName}.pdf`);
};

export const exportFileFormattedDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}-${String(date.getHours()).padStart(
    2,
    "0",
  )}-${String(date.getMinutes()).padStart(2, "0")}-${String(
    date.getSeconds(),
  ).padStart(2, "0")}`;
};

export const handleExportTableData = (
  filteredEmployees: Employee[],
  hoursWorked: HoursWorked[],
  schedules: Schedule[],
  weeklySummaries: WeeklySummary[],
  biweeklySummaries: BiweeklySummary[],
  monthlySummaries: MonthlySummary[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  currentWeek: { day: string; date: string; isoDate: string }[],
  withHours?: boolean,
) => {
  const headers = !withHours
    ? [
        "Nombre",
        ...currentWeek.map(({ date }) => formatHeaderDateWithYear(date)),
      ]
    : [
        "Nombre",
        ...currentWeek.map(({ date }) => formatHeaderDateWithYear(date)),
        `Total ${translatePeriodToSpanish("weekly")}`,
        `Total Horas Extra ${translatePeriodToSpanish("weekly")}`,
        `Total ${translatePeriodToSpanish("biweekly")}`,
        `Total Horas Extra ${translatePeriodToSpanish("biweekly")}`,
        `Total ${translatePeriodToSpanish("monthly")}`,
        `Total Horas Extra ${translatePeriodToSpanish("monthly")}`,
      ];

  const sortedEmployees = filteredEmployees.sort((a, b) => {
    const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return fullNameA.localeCompare(fullNameB);
  });

  const dataForExport = sortedEmployees.map((employee) => {
    const employeeData: Record<string, unknown> = {
      Nombre: `${employee.firstName} ${employee.lastName}`,
    };

    currentWeek.forEach(({ day, date }) => {
      const dateObject = new Date(date);
      const selectedRecord = hoursWorked.find(
        (record) =>
          record.employeeId === employee.id &&
          new Date(record.date).toISOString().split("T")[0] ===
            dateObject.toISOString().split("T")[0],
      );

      const scheduleLabel =
        selectedRecord?.scheduleId &&
        schedules.find((schedule) => schedule.id === selectedRecord.scheduleId)
          ?.label;

      employeeData[translateDayToAbrevSpanish(day as EnglishDayOfWeek)] =
        scheduleLabel || "Libre";
    });

    if (withHours) {
      const multiplePeriods = getInvolvedPeriods(currentWeek);

      if (hasMultipleYears(currentWeek)) {
        employeeData[`Total ${translatePeriodToSpanish("weekly")}`] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "weekly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours,
        );

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("weekly")}`
        ] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "weekly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).overtime,
        );
      } else {
        employeeData[`Total ${translatePeriodToSpanish("weekly")}`] =
          calculateTotalHoursAndOvertimeForPeriod(
            employee.id,
            "weekly",
            weekNumber,
            biweekNumber,
            month,
            year,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours;

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("weekly")}`
        ] = calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          "weekly",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).overtime;
      }

      if (hasMultipleBiweeks(currentWeek)) {
        employeeData[`Total ${translatePeriodToSpanish("biweekly")}`] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "biweekly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours,
        );

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("biweekly")}`
        ] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "biweekly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).overtime,
        );
      } else {
        employeeData[`Total ${translatePeriodToSpanish("biweekly")}`] =
          calculateTotalHoursAndOvertimeForPeriod(
            employee.id,
            "biweekly",
            weekNumber,
            biweekNumber,
            month,
            year,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours;

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("biweekly")}`
        ] = calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          "biweekly",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).overtime;
      }

      if (hasMultipleMonths(currentWeek)) {
        employeeData[`Total ${translatePeriodToSpanish("monthly")}`] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "monthly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours,
        );

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("monthly")}`
        ] = String(
          calculateTotalHoursAndOvertimeForPeriods(
            employee.id,
            "monthly",
            multiplePeriods.weekNumbers,
            multiplePeriods.biweekNumbers,
            multiplePeriods.months,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).overtime,
        );
      } else {
        employeeData[`Total ${translatePeriodToSpanish("monthly")}`] =
          calculateTotalHoursAndOvertimeForPeriod(
            employee.id,
            "monthly",
            weekNumber,
            biweekNumber,
            month,
            year,
            weeklySummaries,
            biweeklySummaries,
            monthlySummaries,
          ).totalHours;

        employeeData[
          `Total Horas Extra ${translatePeriodToSpanish("monthly")}`
        ] = calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          "monthly",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).overtime;
      }
    }

    return employeeData;
  });

  return {
    dataForExport,
    headers,
    fileName: `roles-${exportFileFormattedDate(new Date())}`,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createExportOptions = (
  excelIcon: JSX.Element,
  pdfIcon: JSX.Element,
  exportToExcel?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataForExport: any[],
    fileName: string,
    headers?: unknown,
  ) => unknown,
  exportToPDF?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataForExport: any[],
    fileName: string,
    headers?: unknown,
  ) => unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataForExport?: any[],
  fileName?: string,
  headers?: unknown,
) => {
  const options = [];
  if (exportToExcel && dataForExport) {
    options.push({
      label: "Exportar a Excel",
      icon: excelIcon,
      onClick: () =>
        exportToExcel(
          dataForExport,
          fileName || "excel-exported-file",
          headers,
        ),
    });
  }
  if (exportToPDF && dataForExport) {
    options.push({
      label: "Exportar a PDF",
      icon: pdfIcon,
      onClick: () =>
        exportToPDF(dataForExport, fileName || "pdf-exported-file", headers),
    });
  }

  return options;
};
