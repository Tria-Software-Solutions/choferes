import { keyframes } from '@emotion/react';
import { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";

export const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to { opacity: 1; transform: translateY(0); max-height: 100px; }
`;

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`;

export const wrapper: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
  position: "relative",
};

export const split: SxProps<Theme> = () => ({
  display: "flex",
  width: "100%",
  minHeight: "100dvh",
  flex: 1,
  overflow: "hidden",
  position: "relative",
  boxShadow: "none",
  borderRadius: 0,
  alignItems: "center",
  justifyContent: "center",
});

export const right: SxProps<Theme> = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 2, sm: 3, md: 6 },
  background: "transparent",
  minHeight: "100dvh",
  position: "relative",
};

export const formContainer: SxProps<Theme> = {
  width: "100%",
  maxWidth: { xs: "100%", sm: 380, md: 400 },
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
  px: { xs: 1.5, sm: 0 },
};

// Inputs sobre el overlay oscuro: fondo translúcido oscuro y texto blanco.
export const loginTextFieldStyles: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    minHeight: "46px",
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    transition: "background-color 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.09)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255,255,255,0.09)",
      boxShadow: "0 0 0 3px rgba(255,255,255,0.12)",
    },
    "& fieldset": {
      border: "none",
    },
    // Error/disabled: the theme's light-surface fills would turn the field
    // white over the dark overlay; keep it translucent and mark the edge.
    "&.Mui-error, &.Mui-error:hover": {
      backgroundColor: "rgba(248,113,113,0.08)",
      boxShadow: "inset 0 0 0 1px rgba(252,165,165,0.55)",
    },
    "&.Mui-error.Mui-focused": {
      boxShadow: "inset 0 0 0 1px rgba(252,165,165,0.7), 0 0 0 3px rgba(248,113,113,0.2)",
    },
    "&.Mui-disabled": {
      backgroundColor: "rgba(255,255,255,0.04)",
    },
    "& input.Mui-disabled": {
      WebkitTextFillColor: "rgba(255,255,255,0.5)",
    },
    "& input": {
      color: "#ffffff",
      fontSize: "0.92rem",
      paddingTop: "11px",
      paddingBottom: "11px",
      paddingLeft: "14px",
      paddingRight: "14px",
      "&::placeholder": {
        color: "rgba(255,255,255,0.45)",
        opacity: 1,
      },
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "38px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "44px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "38px",
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
      WebkitBoxShadow: "0 0 0 100px rgba(28,28,40,0.9) inset",
      WebkitTextFillColor: "#ffffff",
      borderRadius: "10px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 100px rgba(28,28,40,0.9) inset",
      WebkitTextFillColor: "#ffffff",
    },
  },
  "& .MuiFormHelperText-root, & .MuiFormHelperText-root.Mui-error": {
    mx: 0.5,
    fontWeight: 500,
    color: "#fca5a5",
  },
};

export const form: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const inputIconStyles: CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  display: "block",
};

export const optionsRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mx: 0.5,
  my: 0.5,
};

export const checkboxStyles: SxProps<Theme> = {
  '& .MuiCheckbox-root': {
    padding: '4px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: 'rgba(255,255,255,0.45)',
    },
    '&.Mui-checked .MuiSvgIcon-root': {
      color: '#a5b4fc',
    },
  },
  '& .MuiFormControlLabel-label': {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 500,
    userSelect: 'none',
  },
};

export const forgotLinkStyles: SxProps<Theme> = {
  background: 'none',
  border: 0,
  padding: 0,
  font: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#a5b4fc',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    color: '#c7d2fe',
  },
  '&:focus-visible': {
    outline: '2px solid #a5b4fc',
    outlineOffset: 2,
    borderRadius: '4px',
  },
};

export const forgotHeader: SxProps<Theme> = {
  mb: 4,
  textAlign: 'center',
  '& .MuiTypography-h5': {
    color: '#ffffff',
  },
};

export const forgotDescription: SxProps<Theme> = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '0.85rem',
  lineHeight: 1.6,
  mb: 3,
  textAlign: 'center',
  fontWeight: 500,
};

export const backLinkStyles: SxProps<Theme> = {
  background: 'none',
  border: 0,
  padding: 0,
  font: 'inherit',
  mx: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  mt: 3,
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#ffffff',
  },
};

export const animateStagger = (delayMs: number): SxProps<Theme> => ({
  animation: `${fadeSlideUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  animationDelay: `${delayMs}ms`,
  opacity: 0,
});

export const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.18); }
  50% { box-shadow: 0 0 0 5px rgba(255,255,255,0.08); }
`;

// Shake para inputs inválidos (se re-dispara al fallar el submit).
// Incluye opacity: 1 para no heredar el opacity: 0 del animateStagger
// (que dejaría el campo invisible al sobreescribir la animación).
export const inputShakeStyles: SxProps<Theme> = {
  animation: `${shake} 0.45s ease`,
  opacity: 1,
};

// Banner de error sobre el overlay oscuro (fondo translúcido rojo, texto claro)
export const errorBannerStyles: SxProps<Theme> = {
  mt: 2.5,
  borderRadius: "10px",
  border: "1px solid rgba(239,83,80,0.45)",
  background: "rgba(127,29,29,0.35)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  "& .MuiAlert-icon": {
    alignItems: "center",
    color: "#fda4af",
  },
  "& .MuiAlert-message": {
    fontWeight: 500,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    color: "#fecaca",
  },
};

// Glow pulsante del botón mientras envía
export const submitGlowStyles: SxProps<Theme> = {
  animation: `${pulseGlow} 1.6s ease-in-out infinite`,
};

// Botón primario invertido sobre el overlay oscuro (mismo radio y peso que
// el resto de botones de la app).
export const loginSubmitButtonStyles: SxProps<Theme> = {
  minHeight: "46px",
  borderRadius: "10px",
  background: "#fafafa",
  color: "#09090b",
  fontWeight: 600,
  fontSize: "0.92rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
  "&:hover": {
    background: "#e4e4e7",
    boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
  },
  "&:disabled": {
    background: "rgba(255,255,255,0.3)",
    color: "rgba(255,255,255,0.55)",
    boxShadow: "none",
  },
};

export const submitProgressStyles: SxProps<Theme> = {
  mr: 1,
  color: "inherit",
};

export const loginPasswordIconButtonStyles: SxProps<Theme> = {
  color: "rgba(255,255,255,0.55)",
  width: "28px",
  height: "28px",
  padding: "4px",
  mr: 0.1,
  "&:hover": {
    color: "#ffffff",
    backgroundColor: "transparent",
  },
};

// Estado de éxito de recuperación de contraseña (texto blanco, sin sombras)
export const forgotSuccessStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 1.5,
  py: 1,
  "& > svg": {
    color: "#4ade80",
    filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.4))",
  },
  "& .MuiTypography-h5": {
    color: "#ffffff",
  },
  "& .MuiTypography-body2": {
    color: "rgba(255,255,255,0.75)",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    maxWidth: 320,
    fontWeight: 500,
  },
};
