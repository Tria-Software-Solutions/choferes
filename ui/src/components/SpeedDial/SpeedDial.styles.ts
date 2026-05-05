import { SxProps, Theme } from "@mui/material";

export const speedDialStyles: SxProps<Theme> = {
  zIndex: 1000,
  "& .MuiFab-root": {
    borderRadius: "12px",
    backgroundColor: "#000000",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    width: 48,
    height: 48,
    "&:hover": {
      backgroundColor: "#1a1a1a",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
};

export const speedDialActionStyles: SxProps<Theme> = {
  zIndex: 1001,
  "& .MuiFab-root": {
    borderRadius: "12px",
    backgroundColor: "#000000",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "#1a1a1a",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
};
