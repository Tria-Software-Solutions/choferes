import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const rolesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
  py: { xs: 2, sm: 3, md: 4 },
};

export const rolesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
};

export const rolesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: (theme) => theme.palette.text.primary,
  mb: 0.5,
  gap: 1.5,
};

export const rolesIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const rolesDividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  borderRadius: 2,
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
};

export const backdropStyles = (theme: Theme): SxProps<Theme> => ({
  color: "#fff",
  zIndex: theme.zIndex.drawer + 1,
});

export const searchBarSx: SxProps<Theme> = {
  maxWidth: "100%",
};

export const datePickerSx: SxProps<Theme> = (theme) => ({
  height: "56px",
  minWidth: "180px",
  "& .MuiOutlinedInput-root": {
    height: "56px",
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      outline: "none",
      boxShadow: "none",
    },
  },
});

export const buttonGroupSx: SxProps<Theme> = (theme) => ({
  height: "56px",
  width: "auto",
  flexDirection: "row",
  "& .MuiButton-root": {
    minWidth: 0,
    height: "100%",
    px: 2,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&.Mui-disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
      border: "none",
    },
  },
});

export const noEmployeesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  paddingBottom: "12%",
};

export const noEmployeesIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

export const summaryDialogPaperSx: SxProps<Theme> = {
  border: "2px solid #fff",
  borderRadius: 3,
};

export const summaryDialogHeaderBoxStyles: SxProps<Theme> = {
  background: (theme: Theme) => theme.palette.primary.main,
  color: "#fff",
  p: { xs: 3, sm: 4 },
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
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
  borderRadius: 1,
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
});

export const summaryInfoDescStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
});
