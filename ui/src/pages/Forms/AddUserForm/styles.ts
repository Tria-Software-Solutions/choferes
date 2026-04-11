import { Theme } from "@mui/material/styles";
import { CSSProperties } from "react";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle: CSSProperties = {
  color: "#666666",
};

export const formControl = (theme: Theme) => ({
  marginTop: "8px",
  "& .MuiOutlinedInput-root, & .MuiSelect-select": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 2,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
  },
});

export const menuPaperProps = {
  PaperProps: {
    sx: (theme: Theme) => ({
      maxHeight: 320,
      overflowY: "auto" as React.CSSProperties["overflowY"],
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    }),
  },
};

export const infoBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  p: { xs: 1.5, sm: 2 },
  backgroundColor: theme.palette.action.hover,
  borderRadius: 1,
  border: "1px solid",
  borderColor: theme.palette.divider,
});

export const infoIconBox = (theme: Theme) => ({
  mr: { xs: 1, sm: 2 },
  color: theme.palette.info.main,
});

export const infoTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 0.5,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
});

export const infoDesc = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
});

export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: { xs: 1, sm: 2 },
  pt: 2,
  borderTop: "1px solid",
  borderColor: theme.palette.divider,
});

export const clearButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  order: { xs: 3, sm: 1 },
};

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

export const cancelButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const submitButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  fontWeight: 600,
  px: { xs: 2, sm: 4 },
  py: { xs: 1, sm: 1.5 },
};
