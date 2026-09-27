import { Theme } from "@mui/material/styles";
import {
  actionsBox as sharedActionsBox,
  actionsInnerBox as sharedActionsInnerBox,
  clearButton as sharedClearButton,
  cancelButton as sharedCancelButton,
  submitButton as sharedSubmitButton,
} from "../sharedStyles";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle = (theme: Theme) => ({
  color: theme.tokens.colors.textMuted,
});

// Entrada compacta de "horas por día": redondeada, centrada y sin las flechas
// nativas del input numérico, que se veían toscas tanto en el modal como en la
// edición inline. Compartida por AddScheduleForm y SchedulesPage.
export const dayHoursInputSx = (theme: Theme, isFilled: boolean) => ({
  width: 50,
  "& .MuiInputBase-root": {
    height: 30,
    borderRadius: "8px",
    backgroundColor: isFilled
      ? theme.tokens.colors.surface
      : theme.tokens.colors.hoverSoft,
    transition: "background-color 0.15s ease",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: isFilled
      ? theme.tokens.colors.borderStrong
      : theme.tokens.colors.border,
  },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.tokens.colors.borderStrong,
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: "1.5px",
  },
  "& input": {
    textAlign: "center",
    padding: 0,
    fontSize: "0.72rem",
    fontWeight: 700,
    color: isFilled ? theme.palette.text.primary : theme.palette.text.secondary,
  },
  // Sin flechas del input numérico (Chrome/Safari y Firefox).
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    { WebkitAppearance: "none", margin: 0 },
  "& input[type=number]": { MozAppearance: "textfield" },
});

// ─── Re-export shared premium button styles ───
export const actionsBox = sharedActionsBox;
export const actionsInnerBox = sharedActionsInnerBox;
export const clearButton = sharedClearButton;
export const cancelButton = sharedCancelButton;
export const submitButton = sharedSubmitButton;
