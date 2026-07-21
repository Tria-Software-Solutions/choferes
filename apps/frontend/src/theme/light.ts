import { createTheme } from "@mui/material/styles";

// Light Theme
export const lightTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 435,
      md: 960,
      lg: 1280,
      xl: 3500,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      light: "#333333",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      light: "#f5f5f5",
      dark: "#e0e0e0",
      contrastText: "#000000",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    info: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    divider: "#e0e0e0",
    action: {
      hover: "#f5f5f5",
      selected: "#e3f2fd",
      disabled: "#bdbdbd",
      disabledBackground: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontSize: "2.75rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2.25rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: "1.125rem",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "1rem",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0em",
    },
    body2: {
      fontSize: "0.9375rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0em",
    },
    button: {
      fontSize: "0.9375rem",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "-0.01em",
    },
    caption: {
      fontSize: "0.875rem",
      fontWeight: 500,
      letterSpacing: "0em",
      lineHeight: 1.5,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.04)",
          borderRadius: "8px",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9375rem",
          padding: "12px 28px",
          minHeight: "48px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          letterSpacing: "-0.01em",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          },
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
          "&:hover": {
            backgroundColor: "#1a1a1a",
            boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
          },
          "&:disabled": {
            backgroundColor: "#e5e5e5",
            color: "#9ca3af",
            transform: "none",
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#000000",
          "&:hover": {
            backgroundColor: "#1a1a1a",
          },
        },
        outlined: {
          borderColor: "rgba(0,0,0,0.15)",
          color: "#1f2937",
          borderWidth: "1.5px",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.03)",
            borderColor: "rgba(0,0,0,0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          "&:disabled": {
            borderColor: "rgba(0,0,0,0.08)",
            color: "#9ca3af",
            backgroundColor: "transparent",
          },
        },
        text: {
          color: "#374151",
          padding: "10px 20px",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.05)",
            transform: "translateY(-1px)",
          },
        },
        sizeSmall: {
          padding: "8px 16px",
          fontSize: "0.875rem",
          minHeight: "36px",
          borderRadius: "10px",
        },
        sizeLarge: {
          padding: "16px 40px",
          fontSize: "1rem",
          minHeight: "56px",
          borderRadius: "14px",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#000000",
          borderRadius: "12px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: "10px",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
            transform: "scale(1.08)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        },
        sizeSmall: {
          padding: "6px",
          borderRadius: "8px",
        },
        sizeLarge: {
          padding: "14px",
          borderRadius: "14px",
        },
        colorInherit: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.12)",
          },
        },
        colorPrimary: {
          backgroundColor: "rgba(0,0,0,0.04)",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& .MuiInputBase-root": {
            fontSize: "0.9375rem",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            minHeight: "48px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            "& fieldset": {
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
              transition: "all 0.2s ease",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
              boxShadow: "none",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            "& input": {
              padding: "14px 18px",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            },
            "& textarea": {
              padding: "14px 18px",
              fontSize: "0.9375rem",
            },
            "&.Mui-error fieldset": {
              borderColor: "transparent",
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            minHeight: "48px",
            backgroundColor: "#ffffff",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            "& fieldset": {
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
              boxShadow: "none",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#6b7280",
            fontSize: "0.9375rem",
            fontWeight: 500,
            transform: "translate(18px, 15px) scale(1)",
            letterSpacing: "-0.01em",
            "&.Mui-focused": {
              color: "#000000",
              fontWeight: 600,
            },
            "&.MuiFormLabel-filled, &.Mui-focused": {
              transform: "translate(18px, -9px) scale(0.85)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "#000000",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          minHeight: "48px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          "& .MuiOutlinedInput-root": {
            border: "none",
            "& fieldset": {
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
            },
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
            borderWidth: "0",
            boxShadow: "none",
          },
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
          },
          "&.Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            outline: "none",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
            borderWidth: "0",
            borderRadius: "12px",
          },
        },
        select: {
          backgroundColor: "transparent",
          padding: "14px 18px",
          paddingRight: "48px !important",
          fontSize: "0.9375rem",
          letterSpacing: "-0.01em",
        },
        icon: {
          color: "#000000",
          right: "14px",
          top: "calc(50% - 12px)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          },
          "&.Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            outline: "none",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ef4444",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "12px 16px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: "transparent",
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-checked": {
            color: "#000000",
          },
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#000000",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#000000",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          fontWeight: 600,
          borderRadius: "6px",
          fontSize: "0.8125rem",
          height: "28px",
          padding: "0 10px",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          "& .MuiChip-label": {
            color: "#ffffff !important",
            padding: "0 8px",
          },
          "&:hover": {
            backgroundColor: "#1a1a1a",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
        outlined: {
          borderColor: "#e5e7eb",
          borderWidth: "1.5px",
          color: "#374151",
          background: "transparent",
          "& .MuiChip-label": {
            color: "#374151 !important",
          },
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
            borderColor: "#d1d5db",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          },
        },
        sizeSmall: {
          height: "24px",
          fontSize: "0.75rem",
          borderRadius: "4px",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#1f2937",
          border: "none",
          padding: "16px 20px",
          fontSize: "0.9375rem",
        },
        head: {
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "0.8125rem",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          borderBottom: "none",
          padding: "14px 20px",
        },
        body: {
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
          "&:nth-of-type(even)": {
            backgroundColor: "#fafafa",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: "#000000",
        },
        selectLabel: {
          color: "#000000",
        },
        select: {
          color: "#000000",
        },
        actions: {
          "& .MuiIconButton-root": {
            color: "#000000",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#000000",
          color: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#333333",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          },
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          width: "62px",
        },
      },
    },
    MuiSpeedDialAction: {
      styleOverrides: {
        fab: {
          width: "45px",
          backgroundColor: "#000000",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "8px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
          border: "none",
          overflow: "hidden",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: "24px 28px",
          "& .MuiTypography-root": {
            fontWeight: 600,
            fontSize: "1.25rem",
            letterSpacing: "-0.01em",
            color: "#ffffff",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "28px",
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "20px 28px",
          backgroundColor: "#fafafa",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          gap: "12px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.04)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "20px 24px",
        },
        title: {
          fontWeight: 600,
          fontSize: "1.125rem",
          letterSpacing: "-0.01em",
        },
        subheader: {
          fontSize: "0.875rem",
          color: "#6b7280",
          marginTop: "4px",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#000000",
        },
        h1: {
          color: "#000000",
        },
        h2: {
          color: "#000000",
        },
        h3: {
          color: "#000000",
        },
        h4: {
          color: "#000000",
        },
        h5: {
          color: "#000000",
        },
        h6: {
          color: "#000000",
        },
        body1: {
          color: "#000000",
        },
        body2: {
          color: "#666666",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#666666",
          fontSize: "1rem",
          "&.Mui-focused": {
            color: "#000000",
            fontWeight: 600,
          },
          ".MuiTableHead &": {
            color: "#ffffff",
            "&.Mui-focused": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "1rem",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            minHeight: "48px",
            padding: "4px 14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            "& .MuiAutocomplete-input": {
              padding: "8px 4px",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            },
          },
        },
        popupIndicator: {
          color: "#000000",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
          },
        },
        clearIndicator: {
          color: "#6b7280",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
            color: "#000000",
          },
        },
        paper: {
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
          marginTop: "4px",
        },
        listbox: {
          padding: "8px",
          "& .MuiAutocomplete-option": {
            borderRadius: "8px",
            padding: "10px 14px",
            margin: "2px 0",
            fontSize: "0.9375rem",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(0,0,0,0.06)",
            },
            "&[aria-selected='true']": {
              backgroundColor: "rgba(0,0,0,0.08)",
              fontWeight: 600,
            },
          },
        },
        tag: {
          backgroundColor: "rgba(0,0,0,0.08)",
          color: "#000000",
          fontWeight: 500,
          borderRadius: "6px",
          margin: "2px",
          "& .MuiChip-deleteIcon": {
            color: "#6b7280",
            "&:hover": {
              color: "#000000",
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          border: "none",
          boxShadow: "none",
          borderRadius: "12px",
          overflow: "hidden",
          padding: "6px",
        },
        list: {
          padding: "4px",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "8px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#bdbdbd",
        },
      },
    },
  },
});
