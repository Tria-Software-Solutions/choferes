import { SxProps, Theme } from "@mui/material";

export const formControlStyles: SxProps<Theme> = {
  height: 56,
  mb: 1,
  "& .MuiInputBase-root": {
    height: 56,
  },
  "& .MuiOutlinedInput-root, & .MuiSelect-select": {
    backgroundColor: "#fff",
    borderRadius: 2,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
      borderWidth: 2,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      outline: "none",
      boxShadow: "none",
    },
  },
};

export const selectStyles: SxProps<Theme> = {
  height: 56,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    height: 56,
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
  },
};

export const datePickerTextFieldStyles: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    height: 56,
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
};

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
