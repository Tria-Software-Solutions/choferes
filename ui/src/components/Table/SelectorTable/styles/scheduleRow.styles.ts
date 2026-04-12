import type { Theme } from "@mui/material";

const getRowBackgroundColor = (theme: Theme, rowIndex: number) => {
  const isDarkMode = theme.palette.mode === "dark";
  const isEven = rowIndex % 2 === 0;

  // In dark mode, align with the global MuiTableRow theme colors:
  // even rows: #232323, odd rows: #181818
  if (isDarkMode) {
    return isEven ? "#232323" : "#181818";
  }

  return isEven ? theme.palette.background.paper : theme.palette.action.hover;
};

export const getScheduleRowStyles = (theme: Theme, isSmallScreen: boolean, rowIndex: number) => ({
  row: {
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    borderBottom: theme.palette.mode === "dark" ? "1px solid #444" : "1px solid rgba(0,0,0,0.08)",
  },
  scheduleCell: {
    padding: isSmallScreen ? "8px" : "16px",
    whiteSpace: "nowrap" as const,
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    position: "sticky" as const,
    left: 0,
    zIndex: 10,
    borderRight: "1px solid rgba(0,0,0,0.04)",
  },
  scheduleName: {
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  dayCell: (isToday: boolean) => ({
    padding: isSmallScreen ? "8px" : "16px",
    backgroundColor: isToday ? "rgba(25, 118, 210, 0.08)" : getRowBackgroundColor(theme, rowIndex),
    transition: "background-color 0.15s ease",
  }),
  unassignedText: {
    color: theme.palette.text.disabled,
    fontSize: "0.85rem",
    fontWeight: 400,
  },
  namesContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.5,
  },
  employeeName: {
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  searchMenuItem: {
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    padding: "12px 16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: "default" as const,
    borderRadius: "10px 10px 0 0",
    margin: "0 4px",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    border: `1.5px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: "12px",
    outline: "none",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1), 0 4px 12px rgba(0,0,0,0.08)",
    },
    "&:hover": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    },
  },
  employeeMenuItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 16px",
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    borderRadius: "10px",
    margin: "2px 4px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    gap: "12px",
    minHeight: "44px",
  },
  checkbox: {
    color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
    padding: "6px",
    mr: 1,
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&.Mui-checked": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" 
        ? "rgba(255,255,255,0.08)" 
        : "rgba(25, 118, 210, 0.08)",
    },
  },
  menuItemText: {
    textAlign: "left" as const,
    flex: 1,
  },
  noAvailable: {
    color: theme.palette.text.disabled,
    fontSize: "0.85rem",
    fontWeight: 400,
    textAlign: "center" as const,
  },
  emptyCell: {
    padding: isSmallScreen ? "8px" : "16px",
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    position: isSmallScreen ? ("static" as const) : ("sticky" as const),
    right: 0,
    zIndex: 2,
  },
});
