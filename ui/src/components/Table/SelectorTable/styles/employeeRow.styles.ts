import type { Theme } from "@mui/material";

const getRowBackgroundColor = (theme: Theme, rowIndex: number, hover = false) => {
  const isEven = rowIndex % 2 === 0;

  if (hover) {
    return isEven ? theme.palette.background.paper : theme.palette.action.hover;
  }

  // Consistent alternating row colors for both themes
  return isEven ? theme.palette.background.paper : (theme.palette.mode === "dark" ? "#1f1f1f" : "#fafafa");
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
    fontWeight: 500,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(30, 30, 35, 0.8)" : "rgba(255, 255, 255, 0.9)",
    color: theme.palette.text.primary,
    borderRadius: "10px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 1px 4px rgba(0, 0, 0, 0.2)"
      : "0 1px 4px rgba(0, 0, 0, 0.08)",
    "& .MuiSelect-select": {
      padding: "8px 12px",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
      borderRadius: "10px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
        : "0 2px 8px rgba(0, 0, 0, 0.12)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
    },
    "& .MuiSelect-icon": {
      color: theme.palette.text.secondary,
      fontSize: "1.25rem",
    },
  },
  menuItem: {
    fontSize: "0.875rem",
    fontWeight: 500,
    py: 1.25,
    px: 2,
    margin: 0,
    borderRadius: "10px",
    letterSpacing: "-0.01em",
    minHeight: "44px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
      transform: "translateX(2px)",
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.06)",
      fontWeight: 600,
      "&:hover": {
        backgroundColor: theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.08)",
      },
    },
  },
  unassignedContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: theme.palette.text.disabled,
  },
  unassignedIcon: {
    fontSize: "1rem",
    color: theme.palette.text.disabled,
    opacity: 0.6,
  },
  unassignedText: {
    color: theme.palette.text.disabled,
    fontSize: "0.85rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
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
