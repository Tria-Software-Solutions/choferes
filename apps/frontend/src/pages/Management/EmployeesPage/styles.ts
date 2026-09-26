import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const employeesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
};

export const employeesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: 1,
};

export const employeesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "1.75rem",
  letterSpacing: "-0.02em",
  color: (theme) => theme.palette.text.primary,
  mb: 1,
  gap: 1.5,
};

export const employeesIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const employeesDividerStyles = (theme: Theme): SxProps<Theme> => ({
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
};

export const noEmployeesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
};

export const noEmployeesIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};

// Band of summary metrics shown between the page header and the grid.
export const kpiRowStyles = (theme: Theme): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 1, sm: 1.5 },
  px: { xs: 2, sm: 2.5 },
  py: { xs: 1.5, sm: 1.75 },
  borderBottom: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
  }`,
});

export const kpiCardStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  minWidth: 0,
  px: 1.5,
  py: 1.25,
  borderRadius: "12px",
  border: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"
  }`,
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
});

// Plain amber icon (no pill / background) that flags employees missing
// pay-related data. The tooltip explains what is missing.
export const incompleteBadgeStyles = (theme: Theme): SxProps<Theme> => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: theme.palette.warning.main,
});
