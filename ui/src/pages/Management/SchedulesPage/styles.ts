import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

// Premium header styles matching EmployeesPage pattern
export const schedulesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const schedulesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: 1,
};

export const schedulesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontWeight: 800,
  fontSize: { xs: "1.5rem", sm: "1.75rem" },
  letterSpacing: "-0.02em",
  color: (theme) => theme.palette.text.primary,
  mb: 1,
  gap: 1.5,
};

export const schedulesIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const schedulesDividerStyles = (theme: Theme): SxProps<Theme> => ({
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

export const addButtonMobileStyles: SxProps<Theme> = {
  display: { xs: "flex", md: "none" },
  minWidth: "auto",
  width: 48,
  height: 48,
  borderRadius: "12px",
  p: 0,
  alignSelf: "center",
  mt: -1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
};

export const addButtonDesktopBoxStyles: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
  justifyContent: "flex-end",
};

export const addButtonDesktopStyles: SxProps<Theme> = {
  px: 3,
  py: 1.5,
  fontSize: "1rem",
  minHeight: 48,
  borderRadius: "12px",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
    transform: "translateY(-2px)",
  },
};

export const noSchedulesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
  backgroundColor: (theme) => theme.palette.background.paper,
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
};

export const noSchedulesIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
  borderRadius: "12px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
  borderRadius: "12px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
  overflow: "hidden",
};
