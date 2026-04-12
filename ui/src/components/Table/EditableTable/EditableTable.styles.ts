import { SxProps, Theme } from "@mui/material";

// Base input styles compartidos - Premium Edition
const baseInputStyles = (theme: Theme) => ({
  borderRadius: "14px",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  height: 56,
  fontSize: "0.875rem",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  "& fieldset": {
    borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    borderWidth: "1.5px",
    borderRadius: "14px",
  },
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
    transform: "translateY(-1px)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
    boxShadow: "0 0 0 4px rgba(25, 118, 210, 0.12)",
  },
  "&.Mui-focused": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(25, 118, 210, 0.08)",
    outline: "none",
    transform: "translateY(-1px)",
  },
});

// Premium form control styles
export const formControlStyles: SxProps<Theme> = (theme) => ({
  height: 56,
  mb: 1,
  "& .MuiInputBase-root": { height: 56 },
  "& .MuiOutlinedInput-root, & .MuiSelect-select": baseInputStyles(theme),
});

// Premium select styles
export const selectStyles: SxProps<Theme> = (theme) => ({
  height: 56,
  borderRadius: "14px",
  "& .MuiOutlinedInput-root": {
    ...baseInputStyles(theme),
    paddingRight: "42px !important",
  },
  "& .MuiSelect-select": {
    paddingRight: "42px !important",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    color: theme.palette.primary.main,
    fontSize: "24px",
    right: "12px",
    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  "&.Mui-focused .MuiSelect-icon": {
    transform: "rotate(180deg)",
  },
});

// Premium date picker text field styles
export const datePickerTextFieldStyles: SxProps<Theme> = (theme) => ({
  "& .MuiOutlinedInput-root": {
    ...baseInputStyles(theme),
    "& input": {
      color: theme.palette.text.primary,
      outline: "none",
      boxShadow: "none",
      fontSize: "0.875rem",
      letterSpacing: "-0.01em",
    },
  },
});

// Premium table cell styles
export const tableCellStyles: SxProps<Theme> = (theme) => ({
  borderRight: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
  transition: "background-color 0.15s ease",
});

// Premium permission chip styles
export const permissionChipStyles = (theme: Theme): SxProps<Theme> => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  px: 1.5,
  py: 0.5,
  borderRadius: "6px",
  fontSize: "clamp(0.75rem, 1vw, 0.8125rem)",
  mb: 0.5,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  letterSpacing: "-0.01em",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
});

export const viewMoreLessStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  cursor: "pointer",
  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
  textDecoration: "underline",
  "&:hover": {
    textDecoration: "none",
  },
  display: "flex",
  alignItems: "center",
  height: "28px",
  mt: 1,
});

export const emailLinkStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
});

// Premium table head cell styles
export const tableHeadCellStyles = (theme: Theme): SxProps<Theme> => ({
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#000000",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "0.8125rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "14px 16px",
  whiteSpace: "nowrap",
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
  borderBottom: "none",
});

// Premium dropdown menu props styles
export const premiumMenuProps = {
  PaperProps: {
    sx: (theme: Theme) => ({
      maxHeight: 360,
      overflowY: "auto",
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: "16px",
      marginTop: "8px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
      border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
      "& .MuiList-root": {
        padding: "8px",
      },
      "& .MuiMenuItem-root": {
        borderRadius: "10px",
        margin: "2px 4px",
        padding: "12px 16px",
        fontSize: "0.875rem",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "44px",
        gap: "12px",
        "&:hover": {
          backgroundColor: theme.palette.mode === "dark" 
            ? "rgba(255,255,255,0.08)" 
            : "rgba(25, 118, 210, 0.08)",
        },
        "&.Mui-selected": {
          backgroundColor: theme.palette.mode === "dark" 
            ? "rgba(25, 118, 210, 0.25)" 
            : "rgba(25, 118, 210, 0.12)",
          color: theme.palette.primary.main,
          fontWeight: 600,
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(25, 118, 210, 0.35)" 
              : "rgba(25, 118, 210, 0.18)",
          },
        },
      },
      "& .MuiCheckbox-root": {
        color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
        borderRadius: "8px",
        padding: "6px",
        transition: "all 0.2s ease",
        "&.Mui-checked": {
          color: theme.palette.primary.main,
        },
        "&:hover": {
          backgroundColor: theme.palette.mode === "dark" 
            ? "rgba(255,255,255,0.08)" 
            : "rgba(25, 118, 210, 0.08)",
        },
      },
      "& .MuiListItemText-primary": {
        fontWeight: 500,
        fontSize: "0.875rem",
        letterSpacing: "-0.01em",
      },
      // Scrollbar styling
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
        borderRadius: "0 16px 16px 0",
      },
      "&::-webkit-scrollbar-thumb": {
        background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      },
    }),
  },
  anchorOrigin: {
    vertical: "bottom" as const,
    horizontal: "left" as const,
  },
  transformOrigin: {
    vertical: "top" as const,
    horizontal: "left" as const,
  },
};
