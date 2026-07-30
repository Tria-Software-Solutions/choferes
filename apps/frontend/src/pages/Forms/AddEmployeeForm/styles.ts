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
