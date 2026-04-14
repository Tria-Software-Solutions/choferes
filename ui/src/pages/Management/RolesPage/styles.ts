import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

// Premium header styles matching EmployeesPage pattern
export const rolesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const rolesTitleBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  mb: 2,
  py: 1,
};

export const rolesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontWeight: 800,
  fontSize: { xs: "1.5rem", sm: "1.75rem" },
  letterSpacing: "-0.02em",
  color: (theme) => theme.palette.text.primary,
  mb: 1,
  gap: 1.5,
};

export const rolesIconStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  display: { xs: "none", sm: "flex" },
});

export const rolesDividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  borderRadius: "2px",
  mx: "auto",
  mb: 0.5,
});

export const exportSpeedDialBoxStyles: SxProps<Theme> = {
  minHeight: 65,
};

export const loadingBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  height: "100vh",
};

export const backdropStyles = (theme: Theme): SxProps<Theme> => ({
  color: "#fff",
  zIndex: theme.zIndex.drawer + 1,
});

export const searchBarBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  height: 48,
};

export const searchBarSx: SxProps<Theme> = {
  maxWidth: "100%",
};

// Premium DatePicker styles
export const datePickerSx: SxProps<Theme> = (theme) => ({
  height: "48px",
  minWidth: { xs: "140px", sm: "220px", md: "280px" },
  "& .MuiOutlinedInput-root": {
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      borderWidth: "1.5px",
      borderRadius: "12px",
    },
    "&:hover": {
      boxShadow: "0 2px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: "0 0 0 4px rgba(0,0,0,0.04)",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      outline: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.9375rem",
      letterSpacing: "-0.01em",
      outline: "none",
      boxShadow: "none",
    },
  },
});

// Premium ButtonGroup styles
export const buttonGroupSx: SxProps<Theme> = (theme) => ({
  height: "48px",
  width: "auto",
  flexDirection: "row",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  borderRadius: "12px",
  overflow: "hidden",
  "& .MuiButton-root": {
    minWidth: "48px",
    height: "100%",
    px: 1.5,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: "none",
    borderRadius: 0,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:not(:last-of-type)": {
      borderRight: "1px solid rgba(0,0,0,0.08)",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "none",
    },
    "&:active": {
      backgroundColor: theme.palette.action.selected,
      transform: "none",
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
      border: "none",
    },
  },
  "& .MuiButton-root:first-of-type": {
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
  },
  "& .MuiButton-root:last-of-type": {
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
  },
});

export const noEmployeesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
  backgroundColor: (theme) => theme.palette.background.paper,
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.06)",
};

export const noEmployeesIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

// Additional premium styles
export const headerActionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flexWrap: "wrap",
  justifyContent: { xs: "flex-start", md: "flex-end" },
};

export const datePickerBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const viewToggleButtonStyles: SxProps<Theme> = (theme) => ({
  borderRadius: "10px",
  px: 2,
  py: 1,
  fontWeight: 600,
  fontSize: "0.875rem",
  textTransform: "none",
  letterSpacing: "-0.01em",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: "1.5px solid rgba(0,0,0,0.12)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: "rgba(0,0,0,0.2)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  "&:active": {
    backgroundColor: theme.palette.action.selected,
    transform: "scale(0.98)",
  },
});

export const summaryDialogPaperSx: SxProps<Theme> = {
  borderRadius: "12px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

export const summaryDialogHeaderBoxStyles: SxProps<Theme> = {
  background: (theme: Theme) => theme.palette.primary.main,
  color: "#fff",
  p: { xs: 3, sm: 4 },
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const summaryDialogCloseIconStyles: CSSProperties = {
  color: "#fff",
};

export const summaryTabPanelAvatarStyles = (
  theme: Theme,
  color: "success" | "info" | "warning" | "error",
): SxProps<Theme> => {
  const colorMap = {
    success: theme.palette.success.light,
    info: theme.palette.info.light,
    warning: theme.palette.warning.light,
    error: theme.palette.error.light,
  };
  return {
    bgcolor: colorMap[color],
    width: 56,
    height: 56,
  };
};

export const summaryInfoBoxStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  p: { xs: 1.5, sm: 2 },
  backgroundColor: theme.palette.action.hover,
  borderRadius: "8px",
  border: "1px solid",
  borderColor: theme.palette.divider,
});

export const summaryInfoIconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  mr: { xs: 1, sm: 2 },
  color: theme.palette.info.main,
});

export const summaryInfoIconStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.info.main,
  mr: { xs: 1, sm: 2 },
});

export const summaryInfoTitleStyles = (theme: Theme): SxProps<Theme> => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 0.5,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
  letterSpacing: "-0.01em",
});

export const summaryInfoDescStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  lineHeight: 1.5,
});
