import { SxProps, Theme } from "@mui/material";
import { OCRResult } from "../../../services/ocrService";

export const dialogPaperStyles: SxProps<Theme> = {
  border: "2px solid #fff",
  borderRadius: 3,
  minHeight: "60vh",
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
  minHeight: result && !isLoading && !isImageFormatValid ? "60vh" : "auto",
  height: result && !isLoading && isImageFormatValid ? "500px" : "auto",
});

export const loadingBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "200px",
};

export const loadingTextStyles: SxProps<Theme> = {
  ml: 2,
};

export const errorContainerStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  py: { xs: 2, sm: 3 },
  minHeight: "60vh",
  justifyContent: "center",
  width: "100%",
};

export const errorIconStyles = (theme: Theme): SxProps<Theme> => ({
  fontSize: { xs: 80, sm: 100, md: 120 },
  color: theme.palette.error.main,
  mb: { xs: 2, sm: 3 },
  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
});

export const errorTitleStyles = (theme: Theme): SxProps<Theme> => ({
  background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  mb: { xs: 1, sm: 2 },
  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
  fontWeight: "bold",
});

export const errorSubtitleStyles: SxProps<Theme> = {
  mb: { xs: 1, sm: 2 },
  fontSize: { xs: "1rem", sm: "1.25rem" },
  fontWeight: 500,
};

export const errorDescriptionStyles: SxProps<Theme> = {
  mb: { xs: 2, sm: 3, md: 4 },
  lineHeight: 1.6,
  fontSize: { xs: "0.875rem", sm: "1rem" },
  maxWidth: 500,
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
