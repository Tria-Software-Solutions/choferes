import type { Theme } from "@mui/material";

const getRowBackgroundColor = (theme: Theme, rowIndex: number) => {
  const isEven = rowIndex % 2 === 0;

  // Consistent alternating row colors for both themes
  return isEven ? theme.palette.background.paper : (theme.palette.mode === "dark" ? "#1f1f1f" : "#fafafa");
};

export const getScheduleRowStyles = (theme: Theme, isSmallScreen: boolean, rowIndex: number) => ({
  row: {
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    borderBottom: "none",
  },
  scheduleCell: {
    padding: isSmallScreen ? "8px" : "16px",
    whiteSpace: "nowrap" as const,
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    position: "sticky" as const,
    left: 0,
    zIndex: 10,
    borderRight: "none",
  },
  scheduleName: {
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
    whiteSpace: "nowrap" as const,
    textAlign: "left" as const,
  },
  dayCell: (isToday: boolean) => ({
    padding: isSmallScreen ? "4px" : "8px",
    backgroundColor: isToday
      ? (theme.palette.mode === "dark"
          ? "linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(25, 118, 210, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(25, 118, 210, 0.4) 0%, rgba(25, 118, 210, 0.25) 100%)")
      : getRowBackgroundColor(theme, rowIndex),
    border: "none",
    ...(isToday && {
      boxShadow: theme.palette.mode === "dark"
        ? "0 0 50px rgba(25, 118, 210, 0.6), 0 0 20px rgba(25, 118, 210, 0.4)"
        : "0 0 50px rgba(25, 118, 210, 0.5), 0 0 20px rgba(25, 118, 210, 0.35)",
      position: "relative" as const,
    }),
    transition: "background-color 0.15s ease",
  }),
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
  formControl: {
    border: "none",
    outline: "none",
    boxShadow: "none",
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiInputBase-root": {
      border: "none",
    },
    "& .MuiInput-root": {
      border: "none",
      "&::before": {
        display: "none",
        borderBottom: "none",
      },
      "&::after": {
        display: "none",
        borderBottom: "none",
      },
    },
  },
  select: {
    fontSize: "0.875rem",
    fontWeight: 500,
    backgroundColor: getRowBackgroundColor(theme, rowIndex),
    color: theme.palette.text.primary,
    borderRadius: "0",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "none",
    border: "none",
    outline: "none",
    "& .MuiSelect-select": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
      borderRadius: "0",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
    "&:hover": {
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "none",
      "&::before": {
        display: "none",
      },
    },
    "&.Mui-focused": {
      backgroundColor: "transparent",
      border: "none",
      "&::before": {
        display: "none",
      },
      "&::after": {
        display: "none",
      },
      boxShadow: "none",
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
  namesContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.5,
  },
  employeeChip: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.08)",
    color: theme.palette.primary.main,
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  employeeName: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "inherit",
  },
  searchMenuItem: {
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(30, 30, 35, 0.98)" : "rgba(255, 255, 255, 0.98)",
    padding: "0",
    borderBottom: "none",
    cursor: "default" as const,
    borderRadius: "12px 12px 0 0",
    margin: "0",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(30, 30, 35, 0.98)" : "rgba(255, 255, 255, 0.98)",
    },
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(40, 40, 45, 0.6)" : "rgba(245, 245, 250, 0.8)",
    borderRadius: "12px",
    border: "transparent",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: theme.palette.mode === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.06)",
    padding: "8px 12px",
    "&:focus-within": {
      borderColor: "transparent",
      backgroundColor: theme.palette.mode === "dark" ? "rgba(40, 40, 45, 0.8)" : "rgba(255, 255, 255, 0.95)",
      boxShadow: `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.1)"}, 0 4px 12px rgba(0, 0, 0, 0.1)`,
    },
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: theme.palette.text.secondary,
    fontSize: "1.1rem",
    pointerEvents: "none" as const,
    opacity: 0.7,
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    border: "none",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
  employeeMenuItem: (isSelected: boolean) => ({
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "14px 20px",
    fontSize: "0.875rem",
    fontWeight: isSelected ? 600 : 500,
    letterSpacing: "-0.01em",
    borderRadius: "14px",
    margin: "3px 10px",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    gap: "14px",
    minHeight: "52px",
    color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
    backgroundColor: isSelected
      ? (theme.palette.mode === "dark"
          ? "rgba(25, 118, 210, 0.18)"
          : "rgba(25, 118, 210, 0.1)")
      : "transparent",
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid rgba(0, 0, 0, 0.03)",
    boxShadow: isSelected
      ? (theme.palette.mode === "dark"
          ? "0 4px 16px rgba(25, 118, 210, 0.3), 0 2px 8px rgba(25, 118, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 4px 16px rgba(25, 118, 210, 0.25), 0 2px 8px rgba(25, 118, 210, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)")
      : "none",
    transform: isSelected ? "scale(1.01)" : "none",
    "&:hover": {
      backgroundColor: isSelected
        ? (theme.palette.mode === "dark"
            ? "rgba(25, 118, 210, 0.25)"
            : "rgba(25, 118, 210, 0.15)")
        : (theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(0, 0, 0, 0.08)"),
      transform: "translateX(6px) scale(1.02)",
      boxShadow: isSelected
        ? (theme.palette.mode === "dark"
            ? "0 6px 20px rgba(25, 118, 210, 0.4), 0 3px 10px rgba(25, 118, 210, 0.3)"
            : "0 6px 20px rgba(25, 118, 210, 0.35), 0 3px 10px rgba(25, 118, 210, 0.25)")
        : (theme.palette.mode === "dark"
            ? "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)"
            : "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)"),
      border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
    },
  }),
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: (isSelected: boolean) => ({
    color: isSelected ? theme.palette.primary.main : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"),
    padding: "4px",
    borderRadius: "6px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&.Mui-checked": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" 
        ? "rgba(255,255,255,0.08)" 
        : "rgba(25, 118, 210, 0.08)",
    },
  }),
  checkedIcon: {
    fontSize: "1.1rem",
    color: theme.palette.primary.main,
  },
  employeeInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: 1,
  },
  employeeNameText: {
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: "inherit",
  },
  selectedBadge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.2)" : "rgba(25, 118, 210, 0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
    minWidth: "20px",
    textAlign: "center" as const,
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
