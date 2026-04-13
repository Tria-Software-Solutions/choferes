import type { Theme } from "@mui/material";

const getRowBackgroundColor = (theme: Theme, rowIndex: number, hover = false) => {
  const isDarkMode = theme.palette.mode === "dark";
  const isEven = rowIndex % 2 === 0;

  if (hover) {
    return isEven ? theme.palette.background.paper : theme.palette.action.hover;
  }

  // In dark mode, align with the global MuiTableRow theme colors:
  // even rows: #232323, odd rows: #181818
  if (isDarkMode) {
    return isEven ? "#232323" : "#181818";
  }

  return isEven ? theme.palette.background.paper : theme.palette.action.hover;
};

export const getEmployeeRowStyles = (theme: Theme, isSmallScreen: boolean, rowIndex: number) => ({
  row: {
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    borderBottom: theme.palette.mode === "dark" ? "1px solid #444" : "1px solid rgba(0,0,0,0.08)",
  },
  employeeCell: {
    padding: isSmallScreen ? "8px" : "16px",
    whiteSpace: "nowrap" as const,
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    position: "sticky" as const,
    left: 0,
    zIndex: 10,
    borderRight: "1px solid rgba(0,0,0,0.04)",
  },
  employeeBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
  },
  employeeName: {
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  infoButton: {
    color: "primary.main",
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    border: "1px solid rgba(25, 118, 210, 0.2)",
    borderRadius: "10px",
    width: 36,
    height: 36,
    padding: 0,
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.15)",
      borderColor: "rgba(25, 118, 210, 0.35)",
      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
    },
    transition: "all 0.2s ease",
  },
  scheduleCell: (isToday: boolean) => ({
    padding: isSmallScreen ? "8px" : "16px",
    backgroundColor: isToday
      ? (theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #2a2a2a 0%, #333333 100%)"
          : "linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.08) 100%)")
      : getRowBackgroundColor(theme, rowIndex),
    ...(isToday && {
      boxShadow: theme.palette.mode === "dark"
        ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
        : "inset 0 0 0 1px rgba(25, 118, 210, 0.15)",
    }),
    transition: "background-color 0.15s ease",
  }),
  select: {
    fontSize: "0.875rem",
    backgroundColor: "transparent",
    "& .MuiSelect-select": {
      padding: "6px 12px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.15)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.25)",
    },
  },
  menuItem: {
    fontSize: "0.875rem",
    fontWeight: 500,
    py: 1.25,
    px: 2,
    mx: 0.5,
    my: 0.25,
    borderRadius: "10px",
    letterSpacing: "-0.01em",
    minHeight: "44px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  adjustCell: {
    padding: isSmallScreen ? "8px" : "16px",
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
  },
  adjustButton: (hasWorked: boolean) => ({
    color: hasWorked ? "warning.main" : "grey.400",
    backgroundColor: hasWorked ? "rgba(237, 108, 2, 0.08)" : "transparent",
    border: hasWorked ? "1px solid rgba(237, 108, 2, 0.25)" : "1px solid transparent",
    borderRadius: "10px",
    width: 36,
    height: 36,
    padding: 0,
    "&:hover": {
      backgroundColor: hasWorked ? "rgba(237, 108, 2, 0.15)" : "transparent",
      borderColor: hasWorked ? "rgba(237, 108, 2, 0.4)" : "transparent",
      boxShadow: hasWorked ? "0 2px 8px rgba(237, 108, 2, 0.2)" : "none",
    },
    transition: "all 0.2s ease",
  }),
  hoursCell: {
    padding: isSmallScreen ? "8px" : "16px",
    position: isSmallScreen ? ("static" as const) : ("sticky" as const),
    right: 0,
    zIndex: 2,
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    borderLeft: "1px solid rgba(0,0,0,0.04)",
  },
  overtimeBadge: (overtime: number) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    height: 24,
    px: 0.5,
    borderRadius: "12px",
    backgroundColor: overtime > 0 ? "success.main" : "grey.300",
    color: overtime > 0 ? "#fff" : "grey.600",
    fontSize: "0.75rem",
    fontWeight: 700,
    boxShadow: overtime > 0 ? "0 2px 6px rgba(76, 175, 80, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
    cursor: "default",
  }),
});
