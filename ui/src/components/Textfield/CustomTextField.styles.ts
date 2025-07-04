import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => ({
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      outline: "none",
      boxShadow: "none",
    },
  },
  ...customSx,
});

export const inputAdornmentStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  height: "100%",
}; 