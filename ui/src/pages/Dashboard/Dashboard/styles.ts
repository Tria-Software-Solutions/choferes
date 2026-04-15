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

export const dashboardDeleteButtonStyles = (theme: Theme): SxProps<Theme> => ({
  ml: 2,
  top: "-4px",
  width: "62px",
  height: "58px",
  borderRadius: "8px",
  //boxShadow: theme.shadows[6],
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.primary.main,
  color:
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: theme.transitions.create(
    ["background", "box-shadow", "transform"],
    {
      duration: theme.transitions.duration.short,
    }
  ),
  fontSize: 40,
  "&:hover": {
    backgroundColor: "#333333",
  },
});

