import { SxProps, Theme } from "@mui/material";

export const dialogPaperStyles = (paperSx: object = {}): SxProps<Theme> => ({
  border: "2px solid #fff",
  borderRadius: 3,
  minWidth: 400,
  maxWidth: 500,
  boxShadow: 3,
  bgcolor: "background.paper",
  ...paperSx,
});

export const headerBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background:
    theme.palette.mode === "dark"
      ? "#111"
      : theme.palette.primary.main,
  color:
    theme.palette.mode === "dark"
      ? "#fff"
      : theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  gap: 2,
  px: 3,
  py: 2,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
});

export const iconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: theme.palette.primary.contrastText,
  borderRadius: "50%",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const closeButtonStyles: SxProps<Theme> = {
  color: "inherit",
};

export const dialogContentStyles: SxProps<Theme> = {};

export const messageTypographyStyles: SxProps<Theme> = {
  lineHeight: 1.6,
};

export const customActionsBoxStyles: SxProps<Theme> = {
  px: 3,
  pb: 3,
};

export const dialogActionsStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  gap: 2,
  flexDirection: isSmallScreen ? "column" : "row",
});

export const cancelButtonStyles = (isSmallScreen: boolean): SxProps<Theme> => ({
  minWidth: isSmallScreen ? "100%" : 120,
  py: 1.5,
  fontWeight: 600,
});

export const confirmButtonStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  minWidth: isSmallScreen ? "100%" : 120,
  py: 1.5,
  fontWeight: 600,
});
