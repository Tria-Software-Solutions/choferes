import type { Theme } from "@mui/material";

export const getPremiumToggleStyles = (theme: Theme) => ({
  toggleContainer: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.mode === 'dark'
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "14px",
    padding: "5px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: theme.palette.mode === 'dark'
      ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
      : "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark'
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)",
      boxShadow: theme.palette.mode === 'dark'
        ? "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
        : "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
      transform: "scale(1.02)",
    },
  },
  slider: {
    position: "absolute" as const,
    top: "5px",
    left: "5px",
    width: "calc(50% - 5px)",
    height: "calc(100% - 10px)",
    background: theme.palette.primary.main,
    borderRadius: "10px",
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: theme.palette.mode === 'dark'
      ? "0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
      : "0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  },
  option: (isActive: boolean) => ({
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: "10px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none" as const,
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    fontWeight: isActive ? 700 : 500,
  }),
  optionText: (isActive: boolean) => ({
    fontSize: "0.8rem",
    fontWeight: isActive ? 700 : 500,
    letterSpacing: "0.03em",
    whiteSpace: "nowrap" as const,
    transition: "all 0.3s ease",
    display: { xs: "none", sm: "block" },
  }),
});

export const getTableHeaderStyles = (theme: Theme, isSmallScreen: boolean) => ({
  topHeader: {
    position: "relative" as const,
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
    padding: isSmallScreen ? "12px 16px" : "16px 24px",
    borderBottom: "none",
    border: "none",
  },
  headerFlexContainer: {
    display: "flex",
    position: "relative" as const,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  viewToggleContainer: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  iconButton: {
    mr: 1,
    color: "#fff",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  viewModeLabel: {
    mr: 2,
    color: "#fff",
    display: { xs: "none", sm: "block" },
  },
  periodTitleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  periodTitle: {
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.025em",
    textTransform: "uppercase" as const,
    color: "#fff",
  },
  employeeColumn: {
    padding: isSmallScreen ? "6px 12px" : "8px 12px",
    position: "sticky" as const,
    left: 0,
    top: 0,
    zIndex: 20,
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
    color: "#fff",
    minHeight: "32px",
    height: "32px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    whiteSpace: "nowrap" as const,
    fontWeight: 600,
    fontSize: "0.8rem",
    border: "none",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
  dayHeader: {
    padding: isSmallScreen ? "6px 12px" : "8px 12px",
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
    color: "#fff",
    whiteSpace: "nowrap" as const,
    minHeight: "32px",
    height: "32px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontWeight: 600,
    fontSize: "0.8rem",
    borderBottom: "none",
    border: "none",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
  dayHeaderText: (isToday: boolean) => ({
    color: isToday
      ? (theme.palette.mode === "dark"
          ? "#00ffff"
          : "#00d4ff")
      : "#fff",
    fontWeight: isToday ? 800 : 600,
    fontSize: isToday ? "0.9rem" : "0.8rem",
    textShadow: isToday
      ? (theme.palette.mode === "dark"
          ? "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff"
          : "0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff")
      : "none",
    letterSpacing: isToday ? "0.05em" : "normal",
    animation: isToday ? "pulse 2s ease-in-out infinite" : "none",
    "@keyframes pulse": {
      "0%, 100%": {
        opacity: 1,
      },
      "50%": {
        opacity: 0.8,
      },
    },
  }),
  emptyCell: {
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
    color: "#fff",
    minHeight: "32px",
    height: "32px",
    border: "none",
  },
  periodSelectorCell: {
    padding: isSmallScreen ? "0 12px" : "0 12px",
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
    color: "#fff",
    minHeight: "32px",
    height: "32px",
    width: "100%",
    borderBottom: "none",
    border: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    display: "flex",
    alignItems: "center",
    verticalAlign: "middle",
    outline: "none",
    boxShadow: "none",
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
});
