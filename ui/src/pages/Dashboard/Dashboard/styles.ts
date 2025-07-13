import { SxProps, Theme } from "@mui/material";

export const dashboardHeaderBoxStyles: SxProps<Theme> = {
  mb: 2,
};

export const dashboardTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: 1,
};

export const dashboardTitleStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: theme.palette.text.primary,
  mb: 0.5,
  gap: 1.5,
});

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

export const dashboardDeleteButtonStyles = {
  ml: 2,
  width: "62px",
  height: "56px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  backgroundColor: "#000",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  fontSize: 32,
  "&:hover": {
    backgroundColor: "#333",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  },
};
