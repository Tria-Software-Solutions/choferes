import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const authPageBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: { xs: 2, sm: 4 },
  minHeight: "100vh",
};

export const authCardStyles: SxProps<Theme> = {
  width: { xs: "100%", sm: 450, md: 500 },
  maxWidth: "100%",
  borderRadius: 3,
  position: "relative",
  overflow: "hidden",
};

export const cardContentStyles: SxProps<Theme> = {
  p: { xs: 3, sm: 4 },
};

export const logoBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
  mb: 2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
  },
};

export const logoImgStyles: CSSProperties = {
  width: 50,
  height: "auto",
};

export const titleStyles = (isSmallScreen: boolean): SxProps<Theme> => ({
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: "#000000",
  mb: 1,
  ...(isSmallScreen ? { fontSize: "1.5rem" } : { fontSize: "2rem" }),
});

export const dividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  mb: 1.5,
  mx: "auto",
  borderRadius: 2,
});

export const descriptionStyles: SxProps<Theme> = {
  color: "#666666",
  maxWidth: 300,
};

export const formBoxStyles: SxProps<Theme> = {
  width: "100%",
};

export const textFieldStyles: SxProps<Theme> = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
    },
  },
};

export const passwordTextFieldStyles: SxProps<Theme> = {
  mb: 3,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#ffffff",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
    },
  },
};

export const passwordIconButtonStyles: SxProps<Theme> = {
  color: "#666666",
  "&:hover": {
    color: "#000000",
  },
};

export const submitButtonStyles: SxProps<Theme> = {
  minHeight: 56,
  borderRadius: 2,
  background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #333333 0%, #000000 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  },
  "&:disabled": {
    background: "#bdbdbd",
    transform: "none",
    boxShadow: "none",
  },
};

export const submitProgressStyles: SxProps<Theme> = {
  mr: 1,
};

export const alertStyles: SxProps<Theme> = {
  mt: 3,
  borderRadius: 2,
  "& .MuiAlert-icon": {
    alignItems: "center",
  },
};

export const dividerSectionStyles: SxProps<Theme> = {
  my: 3,
  opacity: 0.6,
};

export const registerBoxStyles: SxProps<Theme> = {
  textAlign: "center",
};

export const registerTextStyles: SxProps<Theme> = {
  color: "#666666",
  mb: 1,
};

export const registerLinkStyles: CSSProperties = {
  textDecoration: "none",
  color: "#000000",
  fontWeight: 600,
  transition: "color 0.3s ease",
}; 