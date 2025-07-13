import { SxProps, Theme } from "@mui/material";

export const paperStyles: SxProps<Theme> = (theme) => ({
  width: "100%",
  backgroundColor: theme.palette.mode === "dark" ? "#111" : theme.palette.background.paper,
  color: theme.palette.text.primary,
});

export const stickyHeaderBoxStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 5,
  backgroundColor: theme.palette.background.paper,
  padding: isSmallScreen ? "8px" : "16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
});

export const headerFlexBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 2,
};

export const tableContainerStyles: SxProps<Theme> = {
  maxHeight: "65vh",
  overflowX: "auto",
};

export const tableHeadStyles: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  zIndex: 10,
};

export const employeeColumnCellStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  padding: isSmallScreen ? "8px" : "16px",
  position: "sticky",
  left: 0,
  zIndex: 11,
  whiteSpace: "nowrap",
});

export const tableCellStyles = (isSmallScreen: boolean): SxProps<Theme> => (theme) => ({
  padding: isSmallScreen ? "8px" : "16px",
  zIndex: 10,
  whiteSpace: "nowrap",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
});

export const boldTypographyStyles: SxProps<Theme> = {
  fontWeight: "bold",
};

export const menuItemStyles: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: "0.98rem",
  pl: 4,
  py: 1.2,
  borderBottom: "1px solid #f0f0f0",
};

export const listSubheaderStyles = (color: string): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  bgcolor: "background.paper",
  fontWeight: 700,
  fontSize: "1rem",
  color,
  py: 1,
});

export const formControlTotalStyles: SxProps<Theme> = {
  minWidth: 120,
  backgroundColor: "#000",
  borderRadius: 2,
  ".MuiOutlinedInput-root": {
    borderRadius: 2,
    fontWeight: 700,
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#000 !important",
    "& fieldset": {
      border: "none",
    },
  },
  ".MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontWeight: 700,
    color: "#fff",
    backgroundColor: "#000 !important",
    pl: 0,
  },
  ".MuiSvgIcon-root": {
    color: "#fff",
  },
};

export const outlinedInputTotalStyles: SxProps<Theme> = {
  color: "#fff",
  backgroundColor: "#000 !important",
  borderRadius: 2,
  fontWeight: 700,
  fontSize: "1rem",
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
};

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

export const tableRowBackground = (rowIndex: number): SxProps<Theme> => (theme) => ({
  backgroundColor: rowIndex % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover,
});

export const tableCellBackground = (
  rowIndex: number,
  today: boolean,
): SxProps<Theme> => (theme) => ({
  backgroundColor: today
    ? theme.palette.action.selected
    : rowIndex % 2 === 0
    ? theme.palette.background.paper
    : theme.palette.action.hover,
});

export const employeeCellBoxStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  whiteSpace: isSmallScreen ? "break-spaces" : "nowrap",
  gap: 1,
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
