import { Theme } from "@mui/material/styles";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle = (theme: Theme) => ({
  color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
});

export const formControl = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: 500,
    position: "relative",
    border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.875rem",
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "14px",
      paddingRight: "14px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.6,
      },
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "36px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "44px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "36px",
      paddingRight: "44px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "12px",
      marginRight: 0,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "8px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "10px",
    },
    "& .MuiSelect-select": {
      paddingLeft: "36px",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
});

export const daysSelectBox = (theme: Theme) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 0.5,
});

export const dayChip = (theme: Theme) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.selected,
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  fontSize: "0.85rem",
});

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
  minHeight: 44,
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
  minHeight: 44,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const textFieldSx = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    minHeight: "48px",
    border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
    "&:hover": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
    "& input": {
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "14px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "36px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "44px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "36px",
      paddingRight: "44px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "12px",
      marginRight: 0,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "8px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "10px",
    },
  },
});
