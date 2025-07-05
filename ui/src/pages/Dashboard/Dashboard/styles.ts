import { SxProps, Theme } from "@mui/material";

export const dashboardHeaderBoxStyles: SxProps<Theme> = {
  mb: 2,
};

export const dashboardTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
};

export const dashboardTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: "#000000",
  mb: 0.5,
  gap: 1.5,
};

export const dashboardIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const dashboardDividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  borderRadius: 2,
  mx: "auto",
  mb: 0.5,
});
