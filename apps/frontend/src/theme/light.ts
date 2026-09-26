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
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          letterSpacing: "-0.01em",
          padding: "0 16px",
          minHeight: "38px",
          transition:
            "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease",
          "&:active": {
            transform: "scale(0.97)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(0,0,0,0.35)",
            outlineOffset: "2px",
          },
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffffff",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#1a1a1a",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          },
          "&:active": {
            backgroundColor: "#2a2a2a",
            boxShadow: "none",
          },
          "&:disabled": {
            backgroundColor: "rgba(0,0,0,0.08)",
            color: "rgba(0,0,0,0.32)",
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
          borderColor: "rgba(0,0,0,0.16)",
          color: "#111827",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
            borderColor: "rgba(0,0,0,0.3)",
          },
          "&:disabled": {
            borderColor: "rgba(0,0,0,0.08)",
            color: "rgba(0,0,0,0.32)",
            backgroundColor: "transparent",
          },
        },
        text: {
          color: "#111827",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.05)",
          },
          "&:disabled": {
            color: "rgba(0,0,0,0.32)",
          },
        },
        sizeSmall: {
          minHeight: "32px",
          padding: "0 12px",
          fontSize: "0.8125rem",
          borderRadius: "8px",
        },
        sizeLarge: {
          minHeight: "44px",
          padding: "0 20px",
          fontSize: "0.9375rem",
          borderRadius: "8px",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#000000",
          borderRadius: "8px",
          transition:
            "background-color 0.15s ease, color 0.15s ease, transform 0.05s ease",
          padding: "7px",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.05)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(0,0,0,0.3)",
            outlineOffset: "1px",
          },
        },
        sizeSmall: {
          padding: "4px",
          borderRadius: "8px",
        },
        sizeLarge: {
          padding: "9px",
          borderRadius: "10px",
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
            borderRadius: "10px",
            backgroundColor: "rgba(0,0,0,0.04)",
            transition:
              "background-color 0.15s ease, box-shadow 0.15s ease",
            minHeight: "40px",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.06)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(0,0,0,0.06)",
              boxShadow: "0 0 0 3px rgba(0,0,0,0.07)",
            },
            "& input": {
              padding: "11px 14px",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            },
            "& textarea": {
              padding: "11px 14px",
              fontSize: "0.9375rem",
            },
            "& input::-webkit-input-placeholder, & textarea::-webkit-input-placeholder": {
              color: "rgba(0,0,0,0.38)",
              opacity: 1,
            },
            "&.Mui-error": {
              backgroundColor: "rgba(211,47,47,0.04)",
              boxShadow: "0 0 0 3px rgba(211,47,47,0.1)",
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
            borderRadius: "10px",
            minHeight: "40px",
            backgroundColor: "rgba(0,0,0,0.04)",
            transition:
              "background-color 0.15s ease, box-shadow 0.15s ease",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.06)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(0,0,0,0.06)",
              boxShadow: "0 0 0 3px rgba(0,0,0,0.07)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#6b7280",
            fontSize: "0.9375rem",
            fontWeight: 500,
            transform: "translate(14px, 12px) scale(1)",
            letterSpacing: "-0.01em",
            "&.Mui-focused": {
              color: "#000000",
              fontWeight: 600,
            },
            "&.MuiFormLabel-filled, &.Mui-focused": {
              transform: "translate(14px, -7px) scale(0.85)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "#000000",
          backgroundColor: "rgba(0,0,0,0.04)",
          borderRadius: "10px",
          minHeight: "40px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: "none",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(0,0,0,0.06)",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.07)",
            outline: "none",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        select: {
          backgroundColor: "transparent",
          padding: "11px 14px",
          paddingRight: "44px !important",
          fontSize: "0.9375rem",
          letterSpacing: "-0.01em",
        },
        icon: {
          color: "#000000",
          right: "12px",
          top: "calc(50% - 12px)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          backgroundColor: "rgba(0,0,0,0.04)",
          transition:
            "background-color 0.15s ease, box-shadow 0.15s ease",
          "& fieldset": {
            border: "none",
          },
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(0,0,0,0.06)",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.07)",
            outline: "none",
          },
          "&.Mui-error": {
            backgroundColor: "rgba(211,47,47,0.04)",
            boxShadow: "0 0 0 3px rgba(211,47,47,0.1)",
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
          width: 40,
          height: 24,
          padding: 3,
          "& .MuiSwitch-switchBase": {
            padding: 3,
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "transparent",
              },
              "& + .MuiSwitch-track": {
                opacity: 1,
                backgroundColor: "#000000",
              },
            },
            "&:hover": {
              backgroundColor: "transparent",
            },
          },
          "& .MuiSwitch-thumb": {
            width: 18,
            height: 18,
            boxShadow: "none",
          },
          "& .MuiSwitch-track": {
            borderRadius: 12,
            opacity: 0.38,
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
          transition:
            "background-color 0.15s ease, box-shadow 0.15s ease",
          boxShadow: "none",
          "& .MuiChip-label": {
            color: "#ffffff !important",
            padding: "0 8px",
          },
          "&:hover": {
            backgroundColor: "#1a1a1a",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
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
          borderRadius: "50%",
          backgroundColor: "#000000",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          transition:
            "background-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease",
          "&:hover": {
            backgroundColor: "#333333",
            boxShadow: "0 4px 12px rgba(0,0,0,0.24)",
          },
          "&:active": {
            transform: "scale(0.96)",
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
            borderRadius: "10px",
            minHeight: "40px",
            padding: "4px 12px",
            "& .MuiAutocomplete-input": {
              padding: "7px 4px",
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
          border: "none",
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
