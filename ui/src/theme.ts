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
              borderColor: "rgba(0,0,0,0.12)",
              borderWidth: "1.5px",
              transition: "all 0.2s ease",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0,0,0,0.25)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#000000",
              borderWidth: "2px",
              boxShadow: "0 0 0 4px rgba(0,0,0,0.04)",
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
              borderColor: "#ef4444",
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
              borderColor: "rgba(0,0,0,0.12)",
              borderWidth: "1.5px",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0,0,0,0.25)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#000000",
              borderWidth: "2px",
              boxShadow: "0 0 0 4px rgba(0,0,0,0.04)",
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
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "2px",
            boxShadow: "0 0 0 4px rgba(0,0,0,0.04)",
          },
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,0,0,0.25)",
          },
          "&.Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            outline: "none",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,0,0,0.12)",
            borderWidth: "1.5px",
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
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.selected,
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
          "&:hover": {
            backgroundColor: "#f3f4f6",
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
          border: "1px solid rgba(0,0,0,0.08)",
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
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
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

// Dark Theme
export const darkTheme = createTheme({
  breakpoints: lightTheme.breakpoints,
  palette: {
    mode: "dark",
    primary: {
      main: "#bdbdbd", // neutral gray accent
      light: "#e0e0e0",
      dark: "#757575",
      contrastText: "#181818",
    },
    secondary: {
      main: "#232323",
      light: "#333333",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    background: {
      default: "#181818",
      paper: "#232323",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    error: {
      main: "#ef5350",
      light: "#ff867c",
      dark: "#b61827",
    },
    warning: {
      main: "#ffa726",
      light: "#ffd95b",
      dark: "#c77800",
    },
    info: {
      main: "#29b6f6",
      light: "#73e8ff",
      dark: "#0086c3",
    },
    success: {
      main: "#66bb6a",
      light: "#98ee99",
      dark: "#338a3e",
    },
    divider: "#bdbdbd",
    action: {
      hover: "#232323",
      selected: "#333333",
      disabled: "#666666",
      disabledBackground: "#232323",
    },
  },
  typography: {
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700, color: "#ffffff" },
    h2: { fontSize: "2rem", fontWeight: 600, color: "#ffffff" },
    h3: { fontSize: "1.75rem", fontWeight: 600, color: "#ffffff" },
    h4: { fontSize: "1.5rem", fontWeight: 600, color: "#ffffff" },
    h5: { fontSize: "1.25rem", fontWeight: 600, color: "#ffffff" },
    h6: { fontSize: "1rem", fontWeight: 600, color: "#ffffff" },
    subtitle1: { fontSize: "1.125rem", fontWeight: 500, color: "#b0b0b0" },
    subtitle2: { fontSize: "1rem", fontWeight: 500, color: "#b0b0b0" },
    body1: { fontSize: "1rem", color: "#ffffff" },
    body2: { fontSize: "0.875rem", color: "#b0b0b0" },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
      color: "#bdbdbd",
    },
    caption: { fontSize: "0.75rem", color: "#b0b0b0" },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "#b0b0b0",
      letterSpacing: 1,
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#181818",
          color: "#ffffff",
          borderBottom: "1px solid #333333",
          boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#232323",
          color: "#ffffff",
          marginBottom: "25px",
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
          letterSpacing: "-0.01em",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          },
        },
        contained: {
          backgroundColor: "#333333",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          "&:hover": {
            backgroundColor: "#444444",
            boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
          },
          "&:disabled": {
            backgroundColor: "#2a2a2a",
            color: "#666666",
            transform: "none",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "rgba(189,189,189,0.5)",
          color: "#e0e0e0",
          borderWidth: "1.5px",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.7)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          },
          "&:disabled": {
            borderColor: "rgba(255,255,255,0.2)",
            color: "#666666",
            backgroundColor: "transparent",
          },
        },
        text: {
          color: "#e0e0e0",
          padding: "10px 20px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
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
          color: "#e0e0e0",
          borderRadius: "12px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: "10px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
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
          backgroundColor: "rgba(255,255,255,0.05)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            minHeight: "48px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.15)",
              borderWidth: "1.5px",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
              borderWidth: "2px",
              boxShadow: "0 0 0 4px rgba(255,255,255,0.1)",
            },
            "&.Mui-focused": {
              backgroundColor: "#1e1e1e",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            },
            "& input": {
              color: "#ffffff",
              padding: "14px 18px",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            },
            "& textarea": {
              padding: "14px 18px",
              fontSize: "0.9375rem",
            },
            "&.Mui-error fieldset": {
              borderColor: "#ef5350",
            },
            // Adornos (iconos)
            "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
              color: "#ffffff",
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
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            minHeight: "48px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.15)",
              borderWidth: "1.5px",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,255,255,0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ffffff",
              borderWidth: "2px",
              boxShadow: "0 0 0 4px rgba(255,255,255,0.1)",
            },
            // Adornos (iconos)
            "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
              color: "#ffffff",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#b0b0b0",
            fontSize: "0.9375rem",
            fontWeight: 500,
            transform: "translate(18px, 15px) scale(1)",
            letterSpacing: "-0.01em",
            "&.Mui-focused": {
              color: "#ffffff",
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
          color: "#ffffff",
          backgroundColor: "#1e1e1e",
          borderRadius: "12px",
          minHeight: "48px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
            borderWidth: "2px",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.1)",
          },
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.3)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.15)",
            borderWidth: "1.5px",
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
          color: "#e0e0e0",
          right: "14px",
          top: "calc(50% - 12px)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          },
          "& input": {
            color: "#ffffff",
          },
          "&.Mui-focused": {
            backgroundColor: "#1e1e1e",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ef5350",
          },
          // Adornos (iconos)
          "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
            color: "#ffffff",
          },
        },
        notchedOutline: {
          borderColor: "rgba(255,255,255,0.15)",
          borderRadius: "12px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
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
          color: "#90caf9",
          "&.Mui-checked": {
            color: "#90caf9",
          },
          "&:hover": {
            backgroundColor: "rgba(144,202,249,0.08)",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#90caf9",
            "&:hover": {
              backgroundColor: "rgba(144,202,249,0.08)",
            },
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#90caf9",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#232323",
          color: "#bdbdbd",
          fontWeight: 600,
          borderRadius: "20px",
          fontSize: "0.875rem",
          "& .MuiChip-label": {
            color: "#bdbdbd !important",
          },
          "&:hover": {
            backgroundColor: "#333333",
            "& .MuiChip-label": {
              color: "#ffffff !important",
            },
          },
        },
        outlined: {
          borderColor: "#bdbdbd",
          color: "#bdbdbd",
          "& .MuiChip-label": {
            color: "#bdbdbd !important",
          },
          "&:hover": {
            backgroundColor: "#232323",
            color: "#ffffff",
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
            backgroundColor: "#1e1e1e",
            minHeight: "48px",
            padding: "4px 14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            },
            "& .MuiAutocomplete-input": {
              padding: "8px 4px",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            },
          },
        },
        popupIndicator: {
          color: "#e0e0e0",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
          },
        },
        clearIndicator: {
          color: "#9e9e9e",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#ffffff",
          },
        },
        paper: {
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "#232323",
          marginTop: "4px",
        },
        listbox: {
          padding: "8px",
          backgroundColor: "#232323",
          "& .MuiAutocomplete-option": {
            borderRadius: "8px",
            padding: "10px 14px",
            margin: "2px 0",
            fontSize: "0.9375rem",
            color: "#ffffff",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
            "&[aria-selected='true']": {
              backgroundColor: "rgba(255,255,255,0.12)",
              fontWeight: 600,
            },
          },
        },
        tag: {
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "#ffffff",
          fontWeight: 500,
          borderRadius: "6px",
          margin: "2px",
          "& .MuiChip-deleteIcon": {
            color: "#9e9e9e",
            "&:hover": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#232323",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          padding: "6px",
        },
        list: {
          padding: "4px",
          backgroundColor: "#232323",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#232323",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          border: "none",
          padding: "16px",
          backgroundColor: "#232323",
        },
        head: {
          backgroundColor: "#232323",
          color: "#bdbdbd",
          fontWeight: 600,
          borderBottom: "2px solid #222", // Cambiado a un color más oscuro
        },
        body: {
          borderBottom: "1px solid #222", // Cambiado a un color más oscuro
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#232323",
          color: "#bdbdbd",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#232323",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "#181818",
          },
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: "#bdbdbd",
          backgroundColor: "#232323",
        },
        selectLabel: {
          color: "#bdbdbd",
        },
        select: {
          color: "#bdbdbd",
        },
        actions: {
          "& .MuiIconButton-root": {
            color: "#bdbdbd",
            "&:hover": {
              backgroundColor: "#232323",
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#232323",
          color: "#bdbdbd",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          "&:hover": {
            backgroundColor: "#333333",
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
          backgroundColor: "#232323",
          color: "#bdbdbd",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
          border: "none",
          backgroundColor: "#232323",
          color: "#ffffff",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#232323",
          color: "#bdbdbd",
          padding: "24px",
          "& .MuiTypography-root": {
            fontWeight: 600,
            color: "#bdbdbd",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          backgroundColor: "#181818",
          color: "#ffffff",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "24px",
          backgroundColor: "#181818",
          borderTop: "1px solid #333333",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          border: "none",
          backgroundColor: "#232323",
          color: "#ffffff",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#181818",
          borderBottom: "1px solid #333333",
        },
        title: {
          fontWeight: 600,
          color: "#bdbdbd",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
        h1: { color: "#ffffff" },
        h2: { color: "#ffffff" },
        h3: { color: "#ffffff" },
        h4: { color: "#ffffff" },
        h5: { color: "#ffffff" },
        h6: { color: "#ffffff" },
        subtitle1: { color: "#b0b0b0" },
        subtitle2: { color: "#b0b0b0" },
        body1: { color: "#ffffff" },
        body2: { color: "#b0b0b0" },
        caption: { color: "#b0b0b0" },
        overline: { color: "#b0b0b0" },
        button: { color: "#bdbdbd" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#b0b0b0",
          fontSize: "1rem",
          "&.Mui-focused": {
            color: "#bdbdbd",
            fontWeight: 600,
          },
          ".MuiTableHead &": {
            color: "#bdbdbd",
            "&.Mui-focused": {
              color: "#bdbdbd",
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(144,202,249,0.2)",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.2)",
        },
      },
    },
  },
});

// High Contrast Theme
export const highContrastTheme = createTheme({
  breakpoints: lightTheme.breakpoints,
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      light: "#222222",
      dark: "#000000",
      contrastText: "#ffff00",
    },
    secondary: {
      main: "#ffff00",
      light: "#ffff66",
      dark: "#cccc00",
      contrastText: "#000000",
    },
    background: {
      default: "#ffff00",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#000000",
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
    divider: "#000000",
    action: {
      hover: "#ffff66",
      selected: "#000000",
      disabled: "#000000",
      disabledBackground: "#ffff66",
    },
  },
  typography: {
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700, color: "#000000" },
    h2: { fontSize: "2rem", fontWeight: 600, color: "#000000" },
    h3: { fontSize: "1.75rem", fontWeight: 600, color: "#000000" },
    h4: { fontSize: "1.5rem", fontWeight: 600, color: "#000000" },
    h5: { fontSize: "1.25rem", fontWeight: 600, color: "#000000" },
    h6: { fontSize: "1rem", fontWeight: 600, color: "#000000" },
    body1: { fontSize: "1rem", color: "#000000" },
    body2: { fontSize: "0.875rem", color: "#000000" },
    button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
    caption: { fontSize: "0.75rem", color: "#000000" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#000000",
          color: "#ffff00",
          boxShadow: "0 4px 20px #000000",
          borderBottom: "2px solid #ffff00",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: "25px",
          boxShadow: "0 2px 8px #000000",
          border: "2px solid #000000",
          backgroundColor: "#ffffff",
          color: "#000000",
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
          padding: "8px 24px",
          transition: "all 0.3s ease",
          borderWidth: "2px",
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffff00",
          border: "2px solid #000000",
          "&:hover": {
            backgroundColor: "#222222",
            borderColor: "#000000",
            boxShadow: "0 6px 20px #000000",
          },
          "&:disabled": {
            backgroundColor: "#cccc00",
            borderColor: "#cccc00",
            color: "#000000",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "#000000",
          color: "#000000",
          borderWidth: "2px",
          "&:hover": {
            backgroundColor: "#ffff00",
            color: "#000000",
            borderColor: "#000000",
            boxShadow: "0 4px 12px #000000",
          },
          "&:disabled": {
            borderColor: "#cccc00",
            color: "#cccc00",
            boxShadow: "none",
          },
        },
        text: {
          color: "#000000",
          "&:hover": {
            backgroundColor: "#ffff66",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#000000",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#ffff66",
          },
        },
        colorInherit: {
          color: "#000000",
          "&:hover": {
            backgroundColor: "#ffff66",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#ffff00",
            color: "#000000",
            "& fieldset": {
              borderColor: "#000000",
              borderWidth: "2px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000000",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000000",
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: "#ffff00",
            },
            "& input": {
              color: "#000000",
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#ffff00",
            color: "#000000",
            "& fieldset": {
              borderColor: "#000000",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#000000",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#000000",
              borderWidth: "2px",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#000000",
            fontSize: "1rem",
            "&.Mui-focused": {
              color: "#000000",
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "#000000",
          backgroundColor: "#ffff00",
          borderRadius: "8px",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
          },
        },
        select: {
          backgroundColor: "#ffff00",
        },
        icon: {
          color: "#000000",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#ffff00",
          color: "#000000",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
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
            backgroundColor: "#ffff66",
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
              backgroundColor: "#ffff66",
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
          color: "#ffff00",
          fontWeight: 600,
          borderRadius: "20px",
          fontSize: "0.875rem",
          "& .MuiChip-label": {
            color: "#ffff00 !important",
          },
          "&:hover": {
            backgroundColor: "#222222",
            "& .MuiChip-label": {
              color: "#ffff00 !important",
            },
          },
        },
        outlined: {
          borderColor: "#000000",
          color: "#000000",
          "& .MuiChip-label": {
            color: "#000000 !important",
          },
          "&:hover": {
            backgroundColor: "#ffff00",
            color: "#000000",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          overflow: "hidden",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#000000",
          border: "2px solid #000000",
          padding: "16px",
        },
        head: {
          backgroundColor: "#000000",
          color: "#ffff00",
          fontWeight: 600,
          borderBottom: "2px solid #ffff00",
        },
        body: {
          borderBottom: "2px solid #000000",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffff00",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#ffff00",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
          "&:hover": {
            backgroundColor: "#ffff66",
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
              backgroundColor: "#ffff66",
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
          color: "#ffff00",
          boxShadow: "0 4px 12px #000000",
          "&:hover": {
            backgroundColor: "#222222",
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
          color: "#ffff00",
          "&:hover": {
            backgroundColor: "#222222",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px #000000",
          border: "2px solid #000000",
          backgroundColor: "#ffffff",
          color: "#000000",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffff00",
          padding: "24px",
          "& .MuiTypography-root": {
            fontWeight: 600,
            color: "#ffff00",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          backgroundColor: "#ffff00",
          color: "#000000",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "24px",
          backgroundColor: "#ffff00",
          borderTop: "2px solid #000000",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 2px 8px #000000",
          border: "2px solid #000000",
          backgroundColor: "#ffffff",
          color: "#000000",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffff00",
          borderBottom: "2px solid #000000",
        },
        title: {
          fontWeight: 600,
          color: "#000000",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#000000",
        },
        h1: { color: "#000000" },
        h2: { color: "#000000" },
        h3: { color: "#000000" },
        h4: { color: "#000000" },
        h5: { color: "#000000" },
        h6: { color: "#000000" },
        body1: { color: "#000000" },
        body2: { color: "#000000" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#000000",
          fontSize: "1rem",
          "&.Mui-focused": {
            color: "#000000",
            fontWeight: 600,
          },
          ".MuiTableHead &": {
            color: "#ffff00",
            "&.Mui-focused": {
              color: "#ffff00",
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffff00",
          color: "#000000",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#181818"
              : theme.palette.background.paper,
          border: "none",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.85)"
              : "0 4px 24px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          overflow: "hidden",
        }),
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

// Default export for backward compatibility
const theme = lightTheme;
export default theme;
