import { Theme } from "@mui/material/styles";
import {
  boxRoot,
  gridContainer,
  iconStyle,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
  textFieldSx,
} from "../sharedStyles";

export {
  boxRoot,
  gridContainer,
  iconStyle,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
};

export const formControl = (theme: Theme) => textFieldSx(theme);

export const permissionsLabel = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 1,
  fontSize: "0.85rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
});

export const permissionsError = (theme: Theme) => ({
  color: theme.palette.error.main,
  fontSize: "0.75rem",
  mb: 1,
});

export const permissionsBox = (theme: Theme) => ({
  maxHeight: 320,
  overflowY: "auto",
  borderRadius: "12px",
  p: { xs: 1.5, sm: 2 },
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
});

export const categoryBox = {
  mb: 2.5,
};

export const categoryTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  mb: 1,
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
});

export const chipSx = (theme: Theme) => ({
  fontSize: "0.82rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
});
