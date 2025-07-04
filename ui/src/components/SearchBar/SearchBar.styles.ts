import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => ({
  mb: 2,
  ...customSx,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: "#e0e0e0",
      borderWidth: "2px",
    },
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
});

export const searchIconStyles: SxProps<Theme> = {
  color: "#666666",
};

export const clearIconStyles: SxProps<Theme> = {
  fontSize: "20px",
}; 