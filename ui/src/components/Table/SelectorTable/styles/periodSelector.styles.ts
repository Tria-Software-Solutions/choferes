import type { Theme } from "@mui/material";

export const getPeriodSelectorStyles = (theme: Theme) => {
  const bgColor = theme.palette.mode === "dark" ? "#232323" : "#000000";

  return {
    input: {
      backgroundColor: `${bgColor} !important`,
      color: "#fff !important",
      fontSize: "0.8rem",
      fontWeight: 600,
      height: "32px",
      padding: "0 !important",
      "& .MuiOutlinedInput-input": {
        color: "#fff !important",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "6px 12px !important",
        backgroundColor: `${bgColor} !important`,
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: `${bgColor} !important`,
        height: "32px",
        border: "none !important",
      },
      "& .MuiInputBase-root": {
        backgroundColor: `${bgColor} !important`,
        height: "32px",
        border: "none !important",
      },
      border: "none !important",
      "& fieldset": {
        border: "none !important",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
      },
    },
    select: {
      backgroundColor: `${bgColor} !important`,
      color: "#fff !important",
      fontSize: "0.8rem",
      fontWeight: 600,
      height: "32px",
      padding: "0 !important",
      "& .MuiSelect-select": {
        color: "#fff !important",
        backgroundColor: `${bgColor} !important`,
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "6px 12px !important",
      },
      "& .MuiSelect-icon": {
        color: "#fff !important",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
      },
      "& .MuiInputBase-root": {
        backgroundColor: `${bgColor} !important`,
        height: "32px",
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: `${bgColor} !important`,
        height: "32px",
      },
      "& fieldset": {
        border: "none !important",
      },
      "&::before": {
        display: "none !important",
        borderBottom: "none !important",
      },
      "&::after": {
        display: "none !important",
        borderBottom: "none !important",
      },
      "& .MuiInput-underline:before": {
        borderBottom: "none !important",
      },
      "& .MuiInput-underline:after": {
        borderBottom: "none !important",
      },
      "& .MuiInput-underline:hover:before": {
        borderBottom: "none !important",
      },
    },
  };
};
