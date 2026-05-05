import { SxProps, Theme } from "@mui/material";

export const iconButtonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  color: "#ffffff",
  backgroundColor: "#000000",
  border: `1px solid ${theme.palette.mode === "dark" ? "#222" : "#000000"}`,
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#333333",
    borderColor: "#333333",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  "&:focus": {
    backgroundColor: "#333333",
    borderColor: "#333333",
    outline: "none",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  "&:active": {
    backgroundColor: "#000000",
    borderColor: "#000000",
    transform: "translateY(0px)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "#333333",
    borderColor: "#333333",
    outline: "none",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
});

export const textButtonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: "translateY(-1px)",
  },
});

export const buttonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-1px)",
  },
});

export const menuPaperStyles = (theme: Theme): SxProps<Theme> => ({
  mt: 1.5,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  boxShadow: 'none',
  border: 'none',
});

export const menuItemStyles: SxProps<Theme> = {
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: (theme: Theme) => theme.palette.action.hover,
  },
};

export const subMenuPaperStyles = (theme: Theme): SxProps<Theme> => ({
  boxShadow: 'none',
  border: 'none',
  backgroundColor: `${theme.palette.background.paper} !important`,
});

export const listItemTextStyles: SxProps<Theme> = {
  fontWeight: 500,
};
