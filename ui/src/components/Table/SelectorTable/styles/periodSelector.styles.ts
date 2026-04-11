import type { Theme } from "@mui/material";

export const getPeriodSelectorStyles = (theme: Theme) => {
  const bgColor = theme.palette.mode === "dark" ? "#111" : "#000000";

  return {
    input: {
      backgroundColor: `${bgColor} !important`,
      color: "#fff",
      fontSize: "1rem",
      fontWeight: 700,
      "& .MuiOutlinedInput-input": {
        color: "#fff",
        fontSize: "1rem",
        fontWeight: 700,
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: `${bgColor} !important`,
      },
      "& .MuiInputBase-root": {
        backgroundColor: `${bgColor} !important`,
      },
      border: "none",
    },
    select: {
      backgroundColor: `${bgColor} !important`,
      color: "#fff",
      fontSize: "1rem",
      fontWeight: 700,
      "& .MuiSelect-select": {
        color: "#fff",
        backgroundColor: `${bgColor} !important`,
        fontSize: "1rem",
        fontWeight: 700,
      },
      "& .MuiSelect-icon": {
        color: "#fff",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "& .MuiInputBase-root": {
        backgroundColor: `${bgColor} !important`,
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: `${bgColor} !important`,
      },
    },
  };
};
