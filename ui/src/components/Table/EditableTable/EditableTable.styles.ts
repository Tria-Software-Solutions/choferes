import { SxProps, Theme } from "@mui/material";

export const formControlStyles: SxProps<Theme> = (theme) => ({
  height: 56,
  mb: 1,
  "& .MuiInputBase-root": {
    height: 56,
  },
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

export const selectStyles: SxProps<Theme> = (theme) => ({
  height: 56,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    height: 56,
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
  },
});

export const datePickerTextFieldStyles: SxProps<Theme> = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    height: 56,
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
});

export const tableCellStyles: SxProps<Theme> = {
  borderRight: "1px solid #f0f0f0",
  borderBottom: "1px solid #f0f0f0",
  padding: "10px 16px",
};

export const permissionChipStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  px: 1,
  py: 0.5,
  borderRadius: 1,
  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
  fontWeight: 500,
  mb: 0.5,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

export const tableHeadCellStyles = (theme: Theme): SxProps<Theme> => ({
  position: "sticky",
  top: 0,
  zIndex: 4,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "#111"
      : theme.palette.primary.main,
  color:
    theme.palette.mode === "dark"
      ? "#fff"
      : theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
  padding: "12px 16px",
  whiteSpace: "nowrap",
});
