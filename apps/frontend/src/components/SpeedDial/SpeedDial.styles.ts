import { SxProps, Theme } from "@mui/material";

export const speedDialStyles: SxProps<Theme> = {
  zIndex: 1000,
  "& .MuiFab-root": {
    borderRadius: "16px",
    backdropFilter: "blur(20px)",
    backgroundColor: "#000000",
    color: "#ffffff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    width: 48,
    height: 48,
    "&:hover": {
      backgroundColor: "#1a1a1a",
      boxShadow: "0 10px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
      transform: "scale(1.1)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
};

export const speedDialActionStyles: SxProps<Theme> = {
  zIndex: 1001,
  "& .MuiFab-root": {
    borderRadius: "16px",
    backdropFilter: "blur(20px)",
    backgroundColor: "#000000",
    color: "#ffffff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "#1a1a1a",
      boxShadow: "0 10px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
      transform: "scale(1.15)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  "& .MuiSpeedDialAction-tooltip": {
    borderRadius: "16px",
    backgroundColor: "#000000",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: 500,
    padding: "6px 12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
  },
};
