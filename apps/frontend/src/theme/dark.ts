import { createTheme } from "@mui/material/styles";
import { lightTheme } from "./light";

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
    divider: "rgba(255,255,255,0.12)",
    action: {
      hover: "rgba(255,255,255,0.08)",
      selected: "rgba(255,255,255,0.12)",
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
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#181818",
          color: "#ffffff",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#232323",
          color: "#ffffff",
          marginBottom: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.18)",
          border: "1px solid rgba(255,255,255,0.06)",
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
          boxShadow: "0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.18)",
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
          "&:hover": {
            backgroundColor: "#444444",
            boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
          },
          "&:disabled": {
            backgroundColor: "#2a2a2a",
            color: "#666666",
            transform: "none",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.15)",
          color: "#e0e0e0",
          borderWidth: "1.5px",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.35)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          },
          "&:disabled": {
            borderColor: "rgba(255,255,255,0.12)",
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
              borderColor: "transparent",
              borderWidth: "0",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
              borderWidth: "0",
              boxShadow: "none",
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
              borderColor: "transparent",
              borderWidth: "0",
              border: "none",
              borderRadius: "12px",
            },
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
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
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
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
          "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
            color: "#ffffff",
          },
        },
        notchedOutline: {
          borderColor: "transparent",
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
            backgroundColor: "transparent",
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
          border: "none",
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
          border: "none",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
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
          borderBottom: "none",
        },
        body: {
          borderBottom: "none",
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
          backgroundColor: "#232323",
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
          borderColor: "rgba(255,255,255,0.1)",
        },
      },
    },
  },
});
