import { SxProps, Theme } from "@mui/material";

export const iconButtonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-1px)",
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
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
});

export const menuItemStyles: SxProps<Theme> = {
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: (theme: Theme) => theme.palette.action.hover,
  },
};

export const subMenuPaperStyles = (theme: Theme): SxProps<Theme> => ({
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
});

export const listItemTextStyles: SxProps<Theme> = {
  fontWeight: 500,
};
