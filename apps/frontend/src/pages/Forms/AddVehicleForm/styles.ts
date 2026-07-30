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
  textFieldSx,
  menuPaperProps,
  submitButton,
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
  menuPaperProps,
  submitButton,
};

export const formControl = (theme: Theme) => ({
  ...textFieldSx(theme),
  // Override for multiline textarea
  "& .MuiOutlinedInput-root textarea": {
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "14px",
    paddingRight: "14px",
    lineHeight: "1.5",
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.6,
    },
  },
  "&.MuiInputBase-adornedStart textarea": {
    paddingLeft: "40px",
  },
  "& .MuiInputBase-multiline .MuiInputAdornment-positionStart": {
    top: "23px",
    transform: "none",
  },
  "& .MuiOutlinedInput-root.MuiInputBase-multiline textarea": {
    paddingTop: "12px",
    paddingBottom: "10px",
  },
});
