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
          ? "linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.08) 100%)"
          : "linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.06) 100%)")
      : getRowBackgroundColor(theme, rowIndex),
    ...(isToday && {
      boxShadow: theme.palette.mode === "dark"
        ? "0 0 30px rgba(25, 118, 210, 0.15)"
        : "0 0 30px rgba(25, 118, 210, 0.12)",
    }),
    transition: "background-color 0.15s ease",
  }),
  select: {
    fontSize: "0.875rem",
    fontWeight: 500,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(35, 35, 40, 0.95)" : "rgba(255, 255, 255, 0.98)",
    color: theme.palette.text.primary,
    borderRadius: "14px",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      : "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.04)",
    "& .MuiSelect-select": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      borderWidth: "0",
      borderRadius: "14px",
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(40, 40, 45, 0.98)" : "rgba(255, 255, 255, 1)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
        : "0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)",
      transform: "translateY(-2px) scale(1.01)",
      border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(40, 40, 45, 0.98)" : "rgba(255, 255, 255, 1)",
      transform: "translateY(-2px) scale(1.01)",
      border: theme.palette.mode === "dark" ? "1px solid rgba(25, 118, 210, 0.3)" : "1px solid rgba(25, 118, 210, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      borderWidth: "0",
      boxShadow: `0 0 0 4px ${theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.2)" : "rgba(25, 118, 210, 0.15)"}, 0 8px 24px rgba(25, 118, 210, 0.15)`,
    },
    "& .MuiSelect-icon": {
      color: theme.palette.text.secondary,
      fontSize: "1.25rem",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    "&:hover .MuiSelect-icon": {
      color: theme.palette.primary.main,
      transform: "scale(1.15) rotate(5deg)",
    },
    "&.Mui-focused .MuiSelect-icon": {
      color: theme.palette.primary.main,
      transform: "scale(1.15) rotate(5deg)",
    },
  },
  menuItem: {
    fontSize: "0.875rem",
    fontWeight: 500,
    py: 1.75,
    px: 3,
    margin: "3px 10px",
    borderRadius: "14px",
    letterSpacing: "-0.01em",
    minHeight: "52px",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    color: theme.palette.text.primary,
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid rgba(0, 0, 0, 0.03)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)",
      transform: "translateX(6px) scale(1.02)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)"
        : "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
      border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(25, 118, 210, 0.18)"
        : "rgba(25, 118, 210, 0.1)",
      fontWeight: 600,
      color: theme.palette.primary.main,
      boxShadow: theme.palette.mode === "dark"
        ? "0 4px 16px rgba(25, 118, 210, 0.3), 0 2px 8px rgba(25, 118, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        : "0 4px 16px rgba(25, 118, 210, 0.25), 0 2px 8px rgba(25, 118, 210, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      border: theme.palette.mode === "dark" ? "1px solid rgba(25, 118, 210, 0.3)" : "1px solid rgba(25, 118, 210, 0.2)",
      transform: "scale(1.01)",
      "&:hover": {
        backgroundColor: theme.palette.mode === "dark"
          ? "rgba(25, 118, 210, 0.25)"
          : "rgba(25, 118, 210, 0.15)",
        transform: "translateX(6px) scale(1.03)",
        boxShadow: theme.palette.mode === "dark"
          ? "0 6px 20px rgba(25, 118, 210, 0.4), 0 3px 10px rgba(25, 118, 210, 0.3)"
          : "0 6px 20px rgba(25, 118, 210, 0.35), 0 3px 10px rgba(25, 118, 210, 0.25)",
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
