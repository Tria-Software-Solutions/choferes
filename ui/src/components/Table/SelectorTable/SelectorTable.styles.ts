import { SxProps, Theme } from "@mui/material";

// Premium paper styles for the table container
export const paperStyles: SxProps<Theme> = (theme) => ({
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "visible",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 0,
  boxShadow: "none",
  border: "none",
});

// Premium sticky header with improved styling
export const stickyHeaderBoxStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => (theme) => ({
  position: "relative",
  backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#fafafa",
  padding: isSmallScreen ? "6px 12px" : "8px 16px",
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const headerFlexBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

// Premium header controls container
export const headerControlsBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flexWrap: "wrap",
};

export const tableContainerStyles: SxProps<Theme> = {
  position: "relative",
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
  height: "100%",
};

// Premium table head styles with better typography
export const tableHeadStyles: SxProps<Theme> = (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#000000",
  "& th": {
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "12px 16px",
    borderBottom: "none",
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
  },
  "& th:first-of-type": {
    borderTopLeftRadius: "0",
  },
  "& th:last-of-type": {
    borderTopRightRadius: "0",
  },
});

// Premium employee column with sticky positioning
export const employeeColumnCellStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => (theme) => ({
  padding: isSmallScreen ? "8px 12px" : "12px 16px",
  position: "sticky",
  left: 0,
  zIndex: 11,
  whiteSpace: "nowrap",
  backgroundColor: "inherit",
  fontWeight: 600,
  fontSize: "0.875rem",
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
  borderRight: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
  letterSpacing: "-0.01em",
});

// Premium table cell styles
export const tableCellStyles = (isSmallScreen: boolean): SxProps<Theme> => (theme) => ({
  padding: isSmallScreen ? "8px 12px" : "12px 16px",
  zIndex: 10,
  whiteSpace: "nowrap",
  color: theme.palette.text.primary,
  backgroundColor: "transparent",
  fontSize: "0.875rem",
  fontWeight: 500,
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
  letterSpacing: "-0.01em",
});

export const boldTypographyStyles: SxProps<Theme> = (theme) => ({
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.025em",
  textTransform: "uppercase",
  color: theme.palette.mode === "dark" ? "#fff" : "rgba(0,0,0,0.87)",
});

// Premium menu item styles for selects - Ultra Premium Edition
export const menuItemStyles: SxProps<Theme> = (theme) => ({
  fontWeight: 500,
  fontSize: "0.875rem",
  pl: 2,
  py: 1.25,
  px: 2,
  mx: 0.5,
  my: 0.25,
  borderRadius: "10px",
  letterSpacing: "-0.01em",
  minHeight: "44px",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" 
      ? "rgba(255,255,255,0.08)" 
      : "rgba(25, 118, 210, 0.08)",
    transform: "translateX(2px)",
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
});

// Premium list subheader styles
export const listSubheaderStyles = (color: string): SxProps<Theme> => (theme) => ({
  display: "flex",
  alignItems: "center",
  bgcolor: theme.palette.background.paper,
  fontWeight: 700,
  fontSize: "0.9375rem",
  color,
  py: 1.25,
  px: 2,
  letterSpacing: "-0.01em",
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
});

// Premium form control for period selection
export const formControlTotalStyles: SxProps<Theme> = (theme) => ({
  minWidth: 140,
  backgroundColor: theme.palette.mode === "dark" ? "#333333" : "#000000",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  ".MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "#ffffff",
    backgroundColor: `${theme.palette.mode === "dark" ? "#333333" : "#000000"} !important`,
    height: "40px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    "& fieldset": {
      border: "none",
    },
  },
  ".MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "#ffffff",
    backgroundColor: "transparent !important",
    pl: 2,
    pr: 4,
    py: 0.75,
    letterSpacing: "-0.01em",
  },
  ".MuiSvgIcon-root": {
    color: "#ffffff",
    fontSize: "1.25rem",
    right: "8px",
  },
});

// Premium outlined input styles
export const outlinedInputTotalStyles: SxProps<Theme> = (theme) => ({
  color: "#ffffff",
  backgroundColor: theme.palette.mode === "dark" ? "#333333" : "#000000",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "0.9375rem",
  letterSpacing: "-0.01em",
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
});

export const dividerStyles: SxProps<Theme> = {
  my: 1,
};

export const badgeStyles: SxProps<Theme> = {
  "& .MuiBadge-badge": {
    fontSize: "0.95rem",
    minWidth: 22,
    height: 22,
    borderRadius: "50%",
    boxShadow: 1,
  },
};

export const stackTotalHoursStyles: SxProps<Theme> = {
  height: 1,
};

export const totalHoursTypographyStyles: SxProps<Theme> = {
  minWidth: 48,
  textAlign: "right",
};

// Premium alternating row backgrounds
export const tableRowBackground = (rowIndex: number): SxProps<Theme> => (theme) => ({
  backgroundColor: rowIndex % 2 === 0 
    ? theme.palette.background.paper 
    : theme.palette.mode === "dark" ? "#1f1f1f" : "#fafafa",
});

// Premium cell background with today highlighting
export const tableCellBackground = (
  rowIndex: number,
  today: boolean,
): SxProps<Theme> => (theme) => ({
  backgroundColor: today
    ? theme.palette.mode === "dark" 
      ? "rgba(255,255,255,0.08)" 
      : theme.palette.action.selected
    : rowIndex % 2 === 0
    ? theme.palette.background.paper
    : theme.palette.mode === "dark" ? "#1f1f1f" : "#fafafa",
});

// Premium employee cell styles
export const employeeCellBoxStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  whiteSpace: isSmallScreen ? "break-spaces" : "nowrap",
  gap: 1,
  display: "flex",
  alignItems: "center",
});

// Premium Select styles for schedule cells
export const scheduleSelectStyles: SxProps<Theme> = (theme) => ({
  minWidth: "120px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    fontSize: "0.875rem",
    fontWeight: 500,
    height: "40px",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      borderWidth: "1.5px",
      borderRadius: "12px",
    },
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
      transform: "translateY(-1px)",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
  },
  "& .MuiSelect-select": {
    py: 0.75,
    px: 1.5,
    fontSize: "0.875rem",
    letterSpacing: "-0.01em",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    color: theme.palette.primary.main,
    fontSize: "22px",
    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  "&.Mui-focused .MuiSelect-icon": {
    transform: "rotate(180deg)",
  },
});

// Premium MenuProps for all selects
export const premiumSelectorMenuProps = {
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

// Premium MultiSelect styles for schedule view
export const scheduleMultiSelectStyles: SxProps<Theme> = (theme) => ({
  minWidth: "160px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: theme.palette.background.paper,
    fontSize: "0.875rem",
    fontWeight: 500,
    minHeight: "36px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
  "& .MuiSelect-select": {
    py: 0.5,
    px: 1.5,
    fontSize: "0.875rem",
    letterSpacing: "-0.01em",
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
  },
  "& .MuiChip-root": {
    height: "24px",
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: "4px",
  },
});

// Dialog styles
export const dialogPaperStyles: SxProps<Theme> = {
  border: "2px solid #fff",
  borderRadius: 3,
};

export const dialogHeaderBoxStyles: SxProps<Theme> = {
  background: (theme) => theme.palette.primary.main,
  color: "#fff",
  p: { xs: 3, sm: 4 },
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const dialogCloseButtonStyles: SxProps<Theme> = {
  color: "#fff",
};

export const dialogContentBoxStyles: SxProps<Theme> = {
  p: { xs: 2, sm: 3, md: 4 },
};

export const dialogInfoBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  p: { xs: 1.5, sm: 2 },
  backgroundColor: (theme) => theme.palette.action.hover,
  borderRadius: 1,
  border: "1px solid",
  borderColor: (theme) => theme.palette.divider,
};

export const dialogInfoIconBoxStyles: SxProps<Theme> = {
  mr: { xs: 1, sm: 2 },
  color: (theme) => theme.palette.info.main,
};

export const dialogInfoTitleBoxStyles: SxProps<Theme> = {
  fontWeight: 600,
  color: (theme) => theme.palette.text.primary,
  mb: 0.5,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
};

export const dialogInfoDescBoxStyles: SxProps<Theme> = {
  color: (theme) => theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const dialogTextFieldStyles: SxProps<Theme> = {
  mt: 1,
  width: "100%",
  boxSizing: "border-box",
};
