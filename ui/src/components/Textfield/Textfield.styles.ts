import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
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
