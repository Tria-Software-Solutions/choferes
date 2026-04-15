import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";
import blurredBg from "../../../assets/images/choferesblurred1.webp";

export const authPageBoxStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: { xs: 2, sm: 4 },
  minHeight: "100vh",
  height: { xs: "auto", sm: "100vh" },
  position: "relative",
  overflow: { xs: "auto", sm: "hidden" },
  // Premium blurred background image
  backgroundImage: `url(${blurredBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  // Light overlay to preserve image colors
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(135deg, rgba(15,15,20,0.45) 0%, rgba(20,20,30,0.35) 50%, rgba(15,15,25,0.45) 100%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(250,250,252,0.15) 50%, rgba(245,245,250,0.2) 100%)",
    zIndex: 0,
  },
  // Subtle color enhancement orbs
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === "dark"
      ? `radial-gradient(ellipse at 30% 70%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
         radial-gradient(ellipse at 70% 30%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)`
      : `radial-gradient(ellipse at 30% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
         radial-gradient(ellipse at 70% 30%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)`,
    animation: "gradientShift 20s ease-in-out infinite",
    zIndex: 0,
  },
  "@keyframes gradientShift": {
    "0%, 100%": {
      opacity: 1,
      transform: "scale(1)",
    },
    "50%": {
      opacity: 0.85,
      transform: "scale(1.05)",
    },
  },
});

export const authCardStyles: SxProps<Theme> = (theme) => ({
  width: { xs: "100%", sm: 480, md: 520 },
  maxWidth: "100%",
  borderRadius: "24px",
  position: "relative",
  overflow: "hidden",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(35,35,35,0.85) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.9) 100%)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 32px 64px rgba(0,0,0,0.5), 0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 32px 64px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)",
  border: theme.palette.mode === "dark"
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: theme.palette.mode === "dark"
      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
  },
});

export const cardContentStyles: SxProps<Theme> = {
  p: { xs: 4, sm: 5 },
  position: "relative",
  zIndex: 1,
};

export const logoBoxStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 80,
  height: 80,
  borderRadius: "24px",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #2d2d3a 0%, #1a1a2e 50%, #16213e 100%)"
    : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  mb: 3,
  boxShadow: theme.palette.mode === "dark"
    ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px rgba(99,102,241,0.3)"
    : "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 30px rgba(99,102,241,0.2)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    right: "-50%",
    bottom: "-50%",
    background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent 30%)",
    animation: "rotate 4s linear infinite",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  "&:hover": {
    transform: "scale(1.08) rotate(2deg)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px rgba(99,102,241,0.5)"
      : "0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 40px rgba(99,102,241,0.35)",
  },
  "@keyframes rotate": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
});

export const logoImgStyles: CSSProperties = {
  width: 44,
  height: "auto",
  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2)) drop-shadow(0 0 20px rgba(255,255,255,0.1))",
  position: "relative",
  zIndex: 1,
};

export const titleStyles = (isSmallScreen: boolean): SxProps<Theme> => (theme: Theme) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  mb: 1.5,
  letterSpacing: "-0.02em",
  ...(isSmallScreen ? { fontSize: "1.75rem" } : { fontSize: "2rem" }),
});

export const dividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 40,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  mb: 2,
  mx: "auto",
  borderRadius: "2px",
  opacity: theme.palette.mode === "dark" ? 0.6 : 1,
});

export const descriptionStyles: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  maxWidth: 360,
  fontSize: "0.9rem",
  lineHeight: 1.5,
  textAlign: "center",
});

export const formBoxStyles: SxProps<Theme> = {
  width: "100%",
};

export const nameFieldsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.5,
  mb: 1.5,
};

export const textFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  mb: 1.5,
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
    // Fix autofill background color
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

export const emailTextFieldStyles: SxProps<Theme> = (theme) => ({
  mb: 1.5,
  ...textFieldStyles(theme),
});

export const usernameTextFieldStyles: SxProps<Theme> = (theme) => ({
  mb: 1.5,
  ...textFieldStyles(theme),
});

export const passwordTextFieldStyles: SxProps<Theme> = (theme) => ({
  mb: 1.5,
  ...textFieldStyles(theme),
});

export const passwordIconButtonStyles: SxProps<Theme> = {
  color: "#666666",
  width: "36px",
  height: "36px",
  padding: "8px",
  overflow: "hidden",
  "&:hover": {
    color: "#000000",
    backgroundColor: "transparent",
  },
};

export const submitButtonStyles: SxProps<Theme> = (theme) => ({
  minHeight: "42px",
  borderRadius: "12px",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)"
    : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
  color: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
  fontWeight: 600,
  fontSize: "0.9rem",
  textTransform: "none",
  letterSpacing: "0.01em",
  boxShadow: theme.palette.mode === "dark"
    ? "0 4px 16px rgba(255,255,255,0.15)"
    : "0 4px 16px rgba(0,0,0,0.15)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  "&:hover": {
    transform: "translateY(-2px) scale(1.01)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 8px 24px rgba(255,255,255,0.2)"
      : "0 8px 24px rgba(0,0,0,0.25)",
  },
  "&:active": {
    transform: "translateY(0) scale(0.99)",
  },
  "&:disabled": {
    background: theme.palette.mode === "dark" ? "#444444" : "#e0e0e0",
    color: theme.palette.mode === "dark" ? "#666666" : "#999999",
    transform: "none",
    boxShadow: "none",
  },
});

export const submitProgressStyles: SxProps<Theme> = {
  mr: 1,
};

export const alertStyles: SxProps<Theme> = {
  mt: 3,
  borderRadius: "8px",
  "& .MuiAlert-icon": {
    alignItems: "center",
  },
};

export const dividerSectionStyles: SxProps<Theme> = (theme) => ({
  my: 3,
  opacity: theme.palette.mode === "dark" ? 0.15 : 0.1,
  borderColor: theme.palette.divider,
});

export const loginBoxStyles: SxProps<Theme> = {
  textAlign: "center",
};

export const loginTextStyles: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  mb: 1,
  fontSize: "0.9rem",
});

export const loginLinkStyles: CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  fontWeight: 600,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  display: "inline-block",
  padding: "4px 8px",
  margin: "-4px -8px",
  borderRadius: "6px",
};
