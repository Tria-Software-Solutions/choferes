import { SxProps, Theme } from "@mui/material";

export const autoGenerateModalContainerStyles: SxProps<Theme> = {
  p: { xs: 0.5, sm: 1.5 },
  pt: { xs: 0.25, sm: 0.5 },
  minHeight: '100%',
};

export const autoGenerateModalGridContainerStyles: SxProps<Theme> = {
  spacing: { xs: 2, sm: 3, md: 4 },
  '& .MuiGrid-item': {
    marginBottom: { xs: 2, sm: 2.5, md: 3 },
  },
};

export const autoGenerateModalSectionTitleStyles = (theme: Theme): SxProps<Theme> => ({
  mb: { xs: 1, sm: 1.5 },
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: { xs: '1rem', sm: '1.25rem' },
});

export const autoGenerateModalCardStyles = (theme: Theme): SxProps<Theme> => ({
  mb: { xs: 1.5, sm: 2, md: 2.5 },
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 2,
  boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 25px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)'}`,
  },
});

export const autoGenerateModalCardContentStyles: SxProps<Theme> = {
  p: { xs: 1.25, sm: 1.5 },
  display: 'flex',
  flexDirection: 'column',
};

export const autoGenerateModalSubtitleStyles: SxProps<Theme> = {
  mb: { xs: 1, sm: 1.25 },
  fontWeight: 500,
  fontSize: { xs: '0.85rem', sm: '0.95rem' },
};

export const autoGenerateModalFormControlStyles = (theme: Theme): SxProps<Theme> => ({
  component: "fieldset",
  '& .MuiFormControlLabel-root': {
    marginBottom: theme.spacing(1),
  },
  '& .MuiRadio-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
});

export const autoGenerateModalTextFieldStyles = (theme: Theme): SxProps<Theme> => ({
  mt: { xs: 1, sm: 1.25 },
  width: '100%',
  mb: 1,
  '& .MuiOutlinedInput-root': {
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
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
    '&.Mui-shrink': {
      color: theme.palette.text.secondary,
    },
  },
  '& .MuiFormHelperText-root': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
});

export const autoGenerateModalFormGroupStyles = (theme: Theme): SxProps<Theme> => ({
  '& .MuiFormControlLabel-root': {
    marginBottom: theme.spacing(1),
  },
  '& .MuiSwitch-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
});

export const autoGenerateModalSwitchStyles = (theme: Theme): SxProps<Theme> => ({
  '& .MuiSwitch-switchBase': {
    color: theme.palette.grey[400],
    '&.Mui-checked': {
      color: theme.palette.primary.main,
    },
    '&.Mui-disabled': {
      color: theme.palette.action.disabled,
    },
  },
  '& .MuiSwitch-track': {
    backgroundColor: theme.palette.grey[300],
    '&.Mui-checked': {
      backgroundColor: theme.palette.primary.light,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: theme.shadows[1],
  },
});

export const autoGenerateModalHelperTextStyles = (theme: Theme): SxProps<Theme> => ({
  mt: { xs: 0.25, sm: 0.5 },
  color: theme.palette.text.secondary,
  fontSize: { xs: '0.75rem', sm: '0.8rem' },
});

export const autoGenerateModalWeekPreviewStyles: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: { xs: 0.5, sm: 0.75 },
  mt: { xs: 0.75, sm: 1 },
};

export const autoGenerateModalChipStyles = (theme: Theme): SxProps<Theme> => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.selected,
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
  mb: 0.5,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const autoGenerateModalEmployeeListStyles: SxProps<Theme> = {
  maxHeight: { xs: 180, sm: 250 },
  overflow: 'auto',
  pr: 1,
  py: 1,
};

export const autoGenerateModalEmployeeItemStyles: SxProps<Theme> = {
  mb: 1,
};

export const autoGenerateModalIndividualHoursStyles = (theme: Theme): SxProps<Theme> => ({
  minWidth: { xs: '80px', sm: '100px' },
  flex: '0 0 auto',
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 1,
    height: 56,
    '& fieldset': {
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
      borderWidth: 1,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
      borderWidth: 2,
    },
    '& input': {
      color: theme.palette.text.primary,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      height: 56,
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
        fontSize: theme.typography.body2.fontSize,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
});

export const autoGenerateModalCustomScheduleStyles = (theme: Theme): SxProps<Theme> => ({
  minWidth: { xs: '120px', sm: '140px' },
  flex: '1 1 auto',
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 1,
    height: 56,
    '& fieldset': {
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
      borderWidth: 1,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    '& input': {
      color: theme.palette.text.primary,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      height: 56,
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
        fontSize: theme.typography.body2.fontSize,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
});

export const autoGenerateModalSummaryStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 0.75, sm: 1 },
  mt: 1.5,
};

export const autoGenerateModalSummaryTextStyles: SxProps<Theme> = {
  variant: "body2",
};

export const autoGenerateModalActionsStyles: SxProps<Theme> = {
  gap: 2,
  px: 3,
  pb: 3,
};

export const autoGenerateModalButtonStyles: SxProps<Theme> = {
  minWidth: 120,
  py: 1.5,
  fontWeight: 600,
};

export const autoGenerateModalCancelButtonStyles: SxProps<Theme> = {
  ...autoGenerateModalButtonStyles,
  variant: "outlined",
};

export const autoGenerateModalGenerateButtonStyles: SxProps<Theme> = {
  ...autoGenerateModalButtonStyles,
  variant: "contained",
};

// Dashboard specific styles
export const autoGenerateModalMetricsContainerStyles: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
  gap: { xs: 0.75, sm: 1 },
  mb: 0.5,
};

export const autoGenerateModalMetricCardStyles = (theme: Theme): SxProps<Theme> => ({
  p: 1,
  borderRadius: 1,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
  },
});

export const autoGenerateModalMetricValueStyles = (theme: Theme): SxProps<Theme> => ({
  fontSize: { xs: '1rem', sm: '1.5rem' },
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 0.25,
});

export const autoGenerateModalMetricLabelStyles: SxProps<Theme> = {
  fontSize: { xs: '0.65rem', sm: '0.75rem' },
  color: 'text.secondary',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

export const autoGenerateModalProgressBarStyles = (theme: Theme): SxProps<Theme> => ({
  width: '100%',
  height: 8,
  borderRadius: 4,
  background: theme.palette.grey[200],
  overflow: 'hidden',
  mt: 1,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  },
});

export const autoGenerateModalStatusChipStyles = (theme: Theme): SxProps<Theme> => ({
  borderRadius: 2,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.75rem',
});

export const autoGenerateModalConfigSectionStyles: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  bgcolor: 'background.paper',
  border: (theme) => `1px solid ${theme.palette.divider}`,
  mb: 2,
};

export const autoGenerateModalEmployeeCardStyles = (theme: Theme): SxProps<Theme> => ({
  p: 1.5,
  borderRadius: 1.5,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  transition: 'all 0.2s ease',
  mb: 1.5,
  '&:hover': {
    background: theme.palette.action.hover,
    borderColor: theme.palette.primary.light,
  },
  '&.selected': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(99, 102, 241, 0.15)' 
      : 'rgba(99, 102, 241, 0.08)',
    borderColor: theme.palette.primary.main,
  },
});

// Loading indicator styles
export const autoGenerateModalLoadingBoxStyles: SxProps<Theme> = {
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

export const autoGenerateModalLoadingTextStyles: SxProps<Theme> = {
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