import { useState, useCallback, useMemo } from "react";
import type { Employee } from "../../../../models/Employee";

type ViewMode = "employee" | "schedule";
type PeriodType = "weekly" | "biweekly" | "monthly";
type SummaryTab = "weekly" | "biweekly" | "monthly" | "overtime";
type OrderDirection = "asc" | "desc";

interface UseSelectorTableStateProps {
  rowsPerPageProp?: number;
  setRowsPerPageProp?: (rows: number) => void;
}

interface UseSelectorTableStateReturn {
  // Pagination
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  
  // Sorting
  orderDirection: OrderDirection;
  toggleOrderDirection: () => void;
  
  // View mode
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  toggleViewMode: () => void;
  
  // Period
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  
  // Dialogs
  openAdjustDialogEmployee: Employee | null;
  setOpenAdjustDialogEmployee: (employee: Employee | null) => void;
  openInfoDialogEmployee: Employee | null;
  setOpenInfoDialogEmployee: (employee: Employee | null) => void;
  
  // Summary tab
  summaryTab: SummaryTab;
  setSummaryTab: (tab: SummaryTab) => void;
  
  // Time adjustment
  timeAdjustment: number;
  setTimeAdjustment: (value: number) => void;
  
  // Search terms for schedule view
  employeeSearchTerms: Record<string, string>;
  setEmployeeSearchTerm: (scheduleId: number, date: string, value: string) => void;
  getSearchKey: (scheduleId: number, date: string) => string;
}

export const useSelectorTableState = ({
  rowsPerPageProp,
  setRowsPerPageProp,
}: UseSelectorTableStateProps): UseSelectorTableStateReturn => {
  // Pagination
  const [page, setPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(5);
  const rowsPerPage = rowsPerPageProp !== undefined ? rowsPerPageProp : localRowsPerPage;
  const setRowsPerPage = useCallback((rows: number) => {
    if (setRowsPerPageProp) {
      setRowsPerPageProp(rows);
    } else {
      setLocalRowsPerPage(rows);
    }
    setPage(0);
  }, [setRowsPerPageProp]);

  // Sorting
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("asc");
  const toggleOrderDirection = useCallback(() => {
    setOrderDirection(prev => prev === "asc" ? "desc" : "asc");
  }, []);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("employee");
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === "employee" ? "schedule" : "employee");
  }, []);

  // Period
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("weekly");

  // Dialogs
  const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] = useState<Employee | null>(null);
  const [openInfoDialogEmployee, setOpenInfoDialogEmployee] = useState<Employee | null>(null);

  // Summary tab
  const [summaryTab, setSummaryTab] = useState<SummaryTab>("weekly");

  // Time adjustment
  const [timeAdjustment, setTimeAdjustment] = useState(0);

  // Search terms for schedule view
  const [employeeSearchTerms, setEmployeeSearchTerms] = useState<Record<string, string>>({});
  
  const getSearchKey = useCallback((scheduleId: number, date: string) => 
    `${scheduleId}-${date}`, []);

  const setEmployeeSearchTerm = useCallback((scheduleId: number, date: string, value: string) => {
    const key = getSearchKey(scheduleId, date);
    setEmployeeSearchTerms(prev => ({ ...prev, [key]: value }));
  }, [getSearchKey]);

  return useMemo(() => ({
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    orderDirection,
    toggleOrderDirection,
    viewMode,
    setViewMode,
    toggleViewMode,
    selectedPeriod,
    setSelectedPeriod,
    openAdjustDialogEmployee,
    setOpenAdjustDialogEmployee,
    openInfoDialogEmployee,
    setOpenInfoDialogEmployee,
    summaryTab,
    setSummaryTab,
    timeAdjustment,
    setTimeAdjustment,
    employeeSearchTerms,
    setEmployeeSearchTerm,
    getSearchKey,
  }), [
    page, rowsPerPage, setRowsPerPage,
    orderDirection, toggleOrderDirection,
    viewMode, toggleViewMode,
    selectedPeriod,
    openAdjustDialogEmployee, openInfoDialogEmployee,
    summaryTab, timeAdjustment, employeeSearchTerms,
    setEmployeeSearchTerm, getSearchKey
  ]);
};
