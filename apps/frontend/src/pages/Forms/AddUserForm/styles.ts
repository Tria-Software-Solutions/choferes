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
  sectionTitle,
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
  sectionTitle,
};

export const formControl = (theme: Theme) => textFieldSx(theme);
