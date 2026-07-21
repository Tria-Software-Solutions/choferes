import { useState } from "react";
import { Employee } from "../../../../models/Employee";
import { WeeklySummary } from "../../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../../models/MonthlySummary";
import { PeriodType } from "./hoursCalculation";
import { calculateHoursForPeriod } from "./hoursCalculation";
import { SELECTOR_TABLE } from "../../../../constants/constants";

export interface DialogState {
  openAdjustDialogEmployee: Employee | null;
  timeAdjustment: number;
}

export interface DialogHandlers {
  openAdjustDialog: (employee: Employee) => void;
  closeAdjustDialog: () => void;
  setTimeAdjustment: (value: number) => void;
  handleAdjustTime: () => void;
}

/**
 * Hook for managing the time adjustment dialog state
 */
export const useTimeAdjustmentDialog = (
  onAdjustTime: (
    employeeId: number,
    condition: string,
    timeAdjustment: number,
  ) => void,
) => {
  const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] = useState<Employee | null>(null);
  const [timeAdjustment, setTimeAdjustment] = useState(0);

  const openAdjustDialog = (employee: Employee) => {
    setOpenAdjustDialogEmployee(employee);
    setTimeAdjustment(0);
  };

  const closeAdjustDialog = () => {
    setOpenAdjustDialogEmployee(null);
    setTimeAdjustment(0);
  };

  const handleAdjustTime = () => {
    if (openAdjustDialogEmployee && timeAdjustment >= 0) {
      onAdjustTime(openAdjustDialogEmployee.id, "add", timeAdjustment);
      closeAdjustDialog();
    }
  };

  return {
    openAdjustDialogEmployee,
    timeAdjustment,
    openAdjustDialog,
    closeAdjustDialog,
    setTimeAdjustment,
    handleAdjustTime,
  };
};

/**
 * Gets the dialog title for the time adjustment dialog
 */
export const getDialogTitle = (employee: Employee | null): string => {
  return employee ? `${employee.firstName} ${employee.lastName}` : "";
};

/**
 * Gets the current hours display for the dialog
 */
export const getCurrentHoursDisplay = (
  employee: Employee | null,
  selectedPeriod: PeriodType,
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: WeeklySummary[],
  biweeklySummaries: BiweeklySummary[],
  monthlySummaries: MonthlySummary[],
): string => {
  if (!employee) return "0";

  const result = selectedPeriod === "weekly"
    ? calculateHoursForPeriod({
        employee,
        period: "weekly",
        type: "totalHours",
        weekNumber,
        biweekNumber,
        month,
        year,
        weeklySummaries,
        biweeklySummaries,
        monthlySummaries,
      })
    : selectedPeriod === "biweekly"
      ? calculateHoursForPeriod({
          employee,
          period: "biweekly",
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        })
      : calculateHoursForPeriod({
          employee,
          period: "monthly",
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  
  return String(result);
};

/**
 * Validates the time adjustment input
 */
export const validateTimeAdjustmentInput = (value: number): boolean => {
  return value >= 0;
};

/**
 * Gets the error message for invalid time adjustment
 */
export const getTimeAdjustmentError = (value: number): string => {
  return value < 0 ? SELECTOR_TABLE.POSITIVE_NUMBER_REQUIRED : " ";
};

/**
 * Gets the icon color for time adjustment based on validation
 */
export const getTimeAdjustmentIconColor = (value: number): "error" | "primary" => {
  return value < 0 ? "error" : "primary";
};

/**
 * Checks if the adjust button should be disabled
 */
export const isAdjustButtonDisabled = (value: number): boolean => {
  return value < 0;
}; 