import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Employee } from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";
import { Schedule } from "../models/Schedule";
import {
  translateColumnHeaderToSpanish,
  translateDayOptionsToSpanish,
  translateDayToAbrevSpanish,
  translatePeriodToSpanish,
  translationsDayOptionsToSpanish,
} from "./stringUtils";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "./calculationUtils";
import {
  formatHeaderDateWithYear,
  formatDate,
  formatDateWithDay,
  hasMultipleYears,
  hasMultipleBiweeks,
  hasMultipleMonths,
  getInvolvedPeriods,
} from "./dateUtils";
import { EnglishDayOfWeek } from "./englishDayOfWeek";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";

export const exportToExcel = (
  data: any[],
  fileName: string,
  customHeaders?: string[]
) => {
  let isVehicleData = data.length > 0 && "licensePlate" in data[0];

  if (!isVehicleData) {
    data = data.map(({ id, ...filteredRow }) => {
      return filteredRow;
    });
  } else {
    data = data.map(({ id, updatedAt, createdAt, ...filteredRow }) => {
      const newRow = { ...filteredRow };
      if (createdAt) {
        newRow.Fecha = formatDateWithDay(new Date(createdAt), false);
      }
      return newRow;
    });
  }

  const translatedData = data.map((row) => {
    const translatedRow: any = {};
    if (isVehicleData) {
      translatedRow["Fecha"] = row["Fecha"];
    }

    Object.keys(row).forEach((key) => {
      if (key !== "Fecha") {
        let value = row[key];

        if (
          (key === "ticket" || key === "licensePlate") &&
          typeof value === "string"
        ) {
          value = `${value}`;
        } else if (typeof value === "string") {
          const dateValue = new Date(value);
          value = !isNaN(dateValue.getTime())
            ? formatDate(dateValue, false)
            : value;
        }

        if (
          typeof value === "string" &&
          Object.keys(translationsDayOptionsToSpanish).includes(value)
        ) {
          value = translateDayOptionsToSpanish(value);
        }

        translatedRow[translateColumnHeaderToSpanish(key)] = value;
      }
    });

    return translatedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(translatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (
  data: any[],
  fileName: string,
  customHeaders?: string[]
) => {
  const doc = new jsPDF();

  let isVehicleData = data.length > 0 && "licensePlate" in data[0];

  if (!isVehicleData) {
    data = data.map(({ id, ...filteredRow }) => filteredRow);
  } else {
    data = data.map(({ id, updatedAt, createdAt, ...filteredRow }) => {
      const formattedDate = createdAt
        ? formatDateWithDay(new Date(createdAt), false)
        : "";

      return Object.assign({ Fecha: formattedDate }, filteredRow);
    });
  }

  const headers = customHeaders
    ? [customHeaders]
    : [
        Object.keys(data[0]).map((header) =>
          header === "Fecha" ? "Fecha" : translateColumnHeaderToSpanish(header)
        ),
      ];

  const tableData = data.map((row) => {
    return Object.entries(row).map(([key, value]) => {
      if (
        (key === "ticket" || key === "licensePlate") &&
        typeof value === "string"
      ) {
        return value;
      }

      if (typeof value === "string") {
        const dateValue = new Date(value);
        value = !isNaN(dateValue.getTime())
          ? formatDate(dateValue, false)
          : value;
      }

      if (
        typeof value === "string" &&
        Object.keys(translationsDayOptionsToSpanish).includes(value)
      ) {
        value = translateDayOptionsToSpanish(value);
      }

      return value;
    });
  });

  doc.autoTable({
    head: headers,
    body: tableData,
  });

  doc.save(`${fileName}.pdf`);
};

export const exportFileFormattedDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}-${String(date.getHours()).padStart(
    2,
    "0"
  )}-${String(date.getMinutes()).padStart(2, "0")}-${String(
    date.getSeconds()
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
  period: "weekly" | "biweekly" | "monthly"
) => {
  const headers = [
    "Nombre",
    ...currentWeek.map(({ date }) => formatHeaderDateWithYear(date)),
    `Total ${translatePeriodToSpanish(period)}`,
  ];

  const sortedEmployees = filteredEmployees.sort((a, b) => {
    const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return fullNameA.localeCompare(fullNameB);
  });

  const dataForExport = sortedEmployees.map((employee) => {
    const employeeData: any = {
      Nombre: `${employee.firstName} ${employee.lastName}`,
    };

    currentWeek.forEach(({ day, date }) => {
      const dateObject = new Date(date);
      const selectedRecord = hoursWorked.find(
        (record) =>
          record.employeeId === employee.id &&
          new Date(record.date).toISOString().split("T")[0] ===
            dateObject.toISOString().split("T")[0]
      );

      const scheduleLabel =
        selectedRecord?.scheduleId &&
        schedules.find((schedule) => schedule.id === selectedRecord.scheduleId)
          ?.label;

      employeeData[translateDayToAbrevSpanish(day as EnglishDayOfWeek)] =
        scheduleLabel || "Libre";
    });

    const multiplePeriods = getInvolvedPeriods(currentWeek);

    if (hasMultipleYears(currentWeek)) {
      employeeData[`Total ${translatePeriodToSpanish("weekly")}`] =
        calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          "weekly",
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).totalHours;

      employeeData[`Total Horas Extra ${translatePeriodToSpanish("weekly")}`] =
        calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          "weekly",
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
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
          monthlySummaries
        ).totalHours;

      employeeData[`Total Horas Extra ${translatePeriodToSpanish("weekly")}`] =
        calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          "weekly",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
    }

    if (hasMultipleBiweeks(currentWeek)) {
      employeeData[`Total ${translatePeriodToSpanish("biweekly")}`] =
        calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          "biweekly",
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).totalHours;

      employeeData[
        `Total Horas Extra ${translatePeriodToSpanish("biweekly")}`
      ] = calculateTotalHoursAndOvertimeForPeriods(
        employee.id,
        "biweekly",
        multiplePeriods.weekNumbers,
        multiplePeriods.biweekNumbers,
        multiplePeriods.months,
        year,
        weeklySummaries,
        biweeklySummaries,
        monthlySummaries
      ).overtime;
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
          monthlySummaries
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
        monthlySummaries
      ).overtime;
    }

    if (hasMultipleMonths(currentWeek)) {
      employeeData[`Total ${translatePeriodToSpanish("monthly")}`] =
        calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          "monthly",
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).totalHours;

      employeeData[`Total Horas Extra ${translatePeriodToSpanish("monthly")}`] =
        calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          "monthly",
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
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
          monthlySummaries
        ).totalHours;

      employeeData[`Total Horas Extra ${translatePeriodToSpanish("monthly")}`] =
        calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          "monthly",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
    }

    return employeeData;
  });

  return {
    dataForExport,
    headers,
    fileName: `roles-${exportFileFormattedDate(new Date())}`,
  };
};

export const createExportOptions = (
  excelIcon: JSX.Element,
  pdfIcon: JSX.Element,
  exportToExcel: (dataForExport: any, fileName: string, headers?: any) => any,
  exportToPDF: (dataForExport: any, fileName: string, headers?: any) => any,
  dataForExport: any,
  fileName: string,
  headers?: any
) => {
  return [
    {
      label: "Descargar Excel",
      icon: excelIcon,
      action: () => exportToExcel(dataForExport, fileName, headers),
    },
    {
      label: "Descargar PDF",
      icon: pdfIcon,
      action: () => exportToPDF(dataForExport, fileName, headers),
    },
  ];
};
