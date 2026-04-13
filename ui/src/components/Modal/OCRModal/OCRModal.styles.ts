import { SxProps, Theme } from "@mui/material";
import { OCRResult } from "../../../services/ocrService";

export const dialogPaperStyles: SxProps<Theme> = {
  border: "2px solid #fff",
  borderRadius: 3,
  minHeight: "48vh",
  maxHeight: "80vh",
  boxShadow: 3,
  bgcolor: "background.paper",
};

export const headerBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background:
    theme.palette.mode === "dark" ? "#111" : theme.palette.primary.main,
  color:
    theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  px: 3,
  py: 2,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
});

export const iconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: theme.palette.primary.contrastText,
  borderRadius: "50%",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const iconStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  fontSize: 24,
});

export const titleBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export const titleStyles: SxProps<Theme> = {
  lineHeight: 1.2,
  mb: 0.5,
};

export const subtitleStyles: SxProps<Theme> = {
  opacity: 0.9,
  lineHeight: 1.2,
};

export const closeButtonStyles: SxProps<Theme> = {
  color: "inherit",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
};

export const dialogContentStyles = (
  result: OCRResult | null,
  isLoading: boolean,
  isImageFormatValid: boolean | null
): SxProps<Theme> => ({
  px: 3,
  py: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: result && !isLoading && !isImageFormatValid ? "48vh" : "auto",
  height: result && !isLoading && isImageFormatValid ? "500px" : "auto",
});

export const loadingBoxStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
  gap: 3,
  padding: 4,
  borderRadius: 2,
  bgcolor: 'background.paper',
  border: (theme) => `1px solid ${theme.palette.divider}`,
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
};

export const loadingTextStyles: SxProps<Theme> = {
  mt: 2,
  color: 'text.secondary',
  fontWeight: 600,
  textAlign: 'center',
  fontSize: '1.1rem',
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 0.7,
    },
    '50%': {
      opacity: 1,
    },
  },
};

export const errorContainerStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  py: { xs: 1.5, sm: 2 },
  height: "100%",
  justifyContent: "center",
  width: "100%",
  overflow: "hidden",
};

export const errorIconStyles = (theme: Theme): SxProps<Theme> => ({
  fontSize: { xs: 60, sm: 80, md: 100 },
  color: theme.palette.error.main,
  mb: { xs: 1.5, sm: 2 },
  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
});

export const errorTitleStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.error.main,
  mb: { xs: 1, sm: 1.5 },
  fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
  fontWeight: "bold",
});

// Shared TextField styles matching login/register
export const ocrModalTextFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  mb: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    minHeight: "42px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(40,40,50,0.6)"
      : "rgba(255,255,255,0.7)",
    color: theme.palette.text.primary,
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(50,50,60,0.7)"
        : "rgba(255,255,255,0.85)",
      borderColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.15)"
        : "rgba(0,0,0,0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(55,55,65,0.8)"
        : "rgba(255,255,255,0.95)",
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "& fieldset": {
      border: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.9rem",
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
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "12px",
      marginLeft: 0,
      zIndex: 2,
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: theme.palette.mode === "dark" 
        ? "0 0 0 100px rgba(40,40,50,0.6) inset"
        : "0 0 0 100px rgba(255,255,255,0.7) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "12px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(55,55,65,0.8) inset"
        : "0 0 0 100px rgba(255,255,255,0.95) inset",
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
});

export const errorSubtitleStyles: SxProps<Theme> = {
  mb: { xs: 0.5, sm: 1 },
  fontSize: { xs: "0.875rem", sm: "1.125rem" },
  fontWeight: 500,
};

export const errorDescriptionStyles: SxProps<Theme> = {
  mb: { xs: 1.5, sm: 2, md: 2.5 },
  lineHeight: 1.5,
  fontSize: { xs: "0.8rem", sm: "0.9rem" },
  maxWidth: 450,
};

export const errorActionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  justifyContent: "center",
  flexWrap: "wrap",
  width: "100%",
};

export const errorButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  fontWeight: 600,
  px: { xs: 2, sm: 4 },
  py: { xs: 1, sm: 1.5 },
};

export const tablePaperStyles = (theme: Theme): SxProps<Theme> => ({
  width: "100%",
  borderRadius: 1,
  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.10)",
  overflow: "hidden",
});

export const tableContainerStyles: SxProps<Theme> = {
  height: "400px",
  overflowY: "auto",
  overflowX: "auto",
  borderRadius: 0,
};

export const tableStyles: SxProps<Theme> = {
  minWidth: 650,
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const tableHeadCellStyles = (theme: Theme): SxProps<Theme> => ({
  fontWeight: "bold",
  background:
    theme.palette.mode === "dark" ? "#111" : theme.palette.primary.main,
  color: "#fff",
});

export const tableCellStyles: SxProps<Theme> = {
  fontSize: "0.875rem",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
};

export const editableCellStyles: SxProps<Theme> = {
  fontSize: "0.875rem",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "& .MuiTextField-root": {
    "& .MuiInput-root": {
      fontSize: "0.875rem",
      padding: 0,
    },
  },
};

export const colorIndicatorStyles = (color: string): SxProps<Theme> => ({
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: getColorValue(color),
  border: "1px solid #ccc",
  display: "inline-block",
  mr: 1,
});

export const dialogActionsStyles: SxProps<Theme> = {
  gap: 2,
  px: 3,
  pb: 3,
};

export const cancelButtonStyles: SxProps<Theme> = {
  minWidth: 120,
  py: 1.5,
  fontWeight: 600,
};

export const importButtonStyles: SxProps<Theme> = {
  minWidth: 200,
  py: 1.5,
  fontWeight: 600,
};

// Helper function to convert color names to hex values
const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    blanco: "#ffffff",
    negro: "#000000",
    gris: "#808080",
    azul: "#0000ff",
    rojo: "#ff0000",
    verde: "#00ff00",
    amarillo: "#ffff00",
    naranja: "#ffa500",
    morado: "#800080",
    rosa: "#ffc0cb",
    marron: "#a52a2a",
    beige: "#f5f5dc",
    plateado: "#c0c0c0",
    dorado: "#ffd700",
  };

  return colorMap[colorName.toLowerCase()] || "#cccccc";
};
