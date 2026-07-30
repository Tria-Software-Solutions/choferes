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
  menuPaperProps,
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
  menuPaperProps,
};

export const formControl = (theme: Theme) => textFieldSx(theme);
