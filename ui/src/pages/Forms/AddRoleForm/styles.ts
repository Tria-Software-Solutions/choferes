import { Theme } from "@mui/material/styles";
import { CSSProperties } from "react";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle: CSSProperties = {
  color: "#666666",
};

export const permissionsLabel = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 1,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
});

export const permissionsError = (theme: Theme) => ({
  color: theme.palette.error.main,
  fontSize: "0.75rem",
  mb: 1,
});

export const permissionsBox = (theme: Theme) => ({
  maxHeight: 200,
  overflowY: "auto",
  border: "1px solid",
  borderColor: theme.palette.divider,
  borderRadius: 1,
  p: { xs: 1, sm: 2 },
  backgroundColor: theme.palette.background.paper,
});

export const categoryBox = (theme: Theme) => ({
  mb: 3,
});

export const categoryTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  mb: 1,
  fontSize: "clamp(0.8rem, 1.25vw, 0.9rem)",
  textTransform: "capitalize",
});

export const chipSx = (theme: Theme) => ({
  mr: 1,
  mb: 1,
  fontSize: "0.75rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.selected,
});

export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: { xs: 1, sm: 2 },
  pt: 2,
  borderTop: "1px solid",
  borderColor: theme.palette.divider,
});

export const clearButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  order: { xs: 3, sm: 1 },
};

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

export const cancelButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const infoBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: { xs: 1, sm: 2 },
  p: { xs: 1.5, sm: 2 },
  backgroundColor: theme.palette.background.default,
  borderRadius: 1,
  border: "1px solid",
  borderColor: theme.palette.divider,
  mb: 2,
});

export const infoIconBox = (theme: Theme) => ({
  color: theme.palette.info.main,
  flexShrink: 0,
  mt: 0.25,
});

export const infoTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 0.5,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
});

export const infoDesc = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  lineHeight: 1.4,
});
