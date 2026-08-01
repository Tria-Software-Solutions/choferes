import { Theme } from "@mui/material/styles";
import {
  boxRoot,
  gridContainer,
  iconStyle,
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
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
};

export const formControl = (theme: Theme) => textFieldSx(theme);

export const permissionsError = (theme: Theme) => ({
  color: theme.palette.error.main,
  fontSize: "0.75rem",
  mb: 1,
});
