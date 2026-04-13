import React, { memo } from "react";
import { Box, Typography, TablePagination } from "@mui/material";
import type { DayEntry } from "../../../../utils/dates";
import type { Employee } from "../../../../models/Employee";
import { TABLE } from "../../../../constants/constants";
import PaginationComponent from "../../Pagination/Pagination.component";
import { getTableFooterStyles } from "../styles/tableFooter.styles";

type PeriodType = "weekly" | "biweekly" | "monthly";

interface TableFooterProps {
  isSmallScreen: boolean;
  selectedPeriod: PeriodType;
  currentWeek: DayEntry[];
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  sortedEmployees: Employee[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  theme: import("@mui/material").Theme;
  paginationRef: React.RefObject<HTMLDivElement>;
}

const getMonthName = (m: number): string =>
  new Date(2024, m - 1, 1).toLocaleDateString("es-ES", { month: "long" });

const formatDateWithoutYear = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
};

const renderPeriodFooter = (
  selectedPeriod: PeriodType,
  currentWeek: DayEntry[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number
): string => {
  if (selectedPeriod === "weekly") {
    return `Semana del ${formatDateWithoutYear(currentWeek[0]?.date)} al ${formatDateWithoutYear(currentWeek[6]?.date)}`;
  } else if (selectedPeriod === "biweekly") {
    // Simplified biweekly display
    return `Quincena ${biweekNumber} - ${year}`;
  } else {
    return `${getMonthName(month)} ${year}`;
  }
};

const generateRowsPerPageOptions = (currentRows: number, total: number): number[] => {
  const defaults = [5, 10, 25, 50, 100];
  
  // Generate dynamic options based on total
  const dynamicOptions: number[] = [];
  let current = 5;
  while (current < total) {
    dynamicOptions.push(current);
    current *= 2;
  }
  if (total > 0) {
    dynamicOptions.push(total);
  }
  
  // Combine with default options and remove duplicates
  const allOptions = Array.from(new Set([...defaults, ...dynamicOptions, currentRows]));
  return allOptions.filter((opt) => opt <= total || total === 0).sort((a, b) => a - b);
};

export const TableFooter = memo(function TableFooter({
  isSmallScreen,
  selectedPeriod,
  currentWeek,
  weekNumber,
  biweekNumber,
  month,
  year,
  sortedEmployees,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  theme,
  paginationRef,
}: TableFooterProps) {
  const styles = getTableFooterStyles(theme);
  const rowsPerPageOptions = generateRowsPerPageOptions(rowsPerPage, sortedEmployees.length);

  return (
    <Box sx={styles.container}>
      {!isSmallScreen && (
        <Typography variant="body2" sx={styles.periodInfo}>
          {renderPeriodFooter(
            selectedPeriod,
            currentWeek,
            weekNumber,
            biweekNumber,
            month,
            year
          )}
        </Typography>
      )}
      <div ref={paginationRef}>
        <TablePagination
          className="pagination"
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(event) => {
            onRowsPerPageChange(parseInt(event.target.value, 10));
          }}
          labelRowsPerPage={TABLE.ROWS_PER_PAGE}
          labelDisplayedRows={() => ""}
          ActionsComponent={PaginationComponent}
          sx={styles.pagination}
          SelectProps={{
            MenuProps: {
              anchorOrigin: { horizontal: 'left', vertical: 'top' },
              transformOrigin: { horizontal: 'left', vertical: 'bottom' },
              PaperProps: {
                sx: {
                  maxHeight: 200,
                  '& .MuiMenuItem-root': {
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    border: 'none',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      border: 'none',
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      border: 'none',
                    },
                  },
                },
              },
            },
            onBlur: (e) => {
              e.target.blur();
            },
          }}
        />
      </div>
    </Box>
  );
});
