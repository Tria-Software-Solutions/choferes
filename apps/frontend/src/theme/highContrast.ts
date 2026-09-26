import { createTheme } from "@mui/material/styles";
import { lightTheme } from "./light";

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
          letterSpacing: "-0.01em",
          padding: "0 16px",
          minHeight: "38px",
          transition:
            "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease",
          "&:active": {
            transform: "scale(0.97)",
          },
          "&:focus-visible": {
            outline: "2px solid #000000",
            outlineOffset: "2px",
          },
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffff00",
          border: "2px solid #000000",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#222222",
            borderColor: "#000000",
          },
          "&:active": {
            backgroundColor: "#000000",
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
          "&:hover": {
            backgroundColor: "#ffff00",
            color: "#000000",
            borderColor: "#000000",
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
          "&:disabled": {
            color: "#cccc00",
          },
        },
        sizeSmall: {
          minHeight: "32px",
          padding: "0 12px",
          fontSize: "0.8125rem",
          borderRadius: "6px",
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
          padding: "8px",
          transition:
            "background-color 0.15s ease, color 0.15s ease, transform 0.05s ease",
          "&:hover": {
            backgroundColor: "#ffff66",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
          "&:focus-visible": {
            outline: "2px solid #000000",
            outlineOffset: "1px",
          },
        },
        sizeSmall: {
          padding: "5px",
          borderRadius: "6px",
        },
        sizeLarge: {
          padding: "10px",
          borderRadius: "10px",
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
            borderRadius: "8px",
            backgroundColor: "#ffff00",
            color: "#000000",
            minHeight: "40px",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "#e5e500",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffff00",
              boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
            },
            "& input": {
              color: "#000000",
              padding: "11px 14px",
            },
            "& textarea": {
              padding: "11px 14px",
            },
            "& input::-webkit-input-placeholder, & textarea::-webkit-input-placeholder": {
              color: "rgba(0,0,0,0.45)",
              opacity: 1,
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
            minHeight: "40px",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "#e5e500",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffff00",
              boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
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
          minHeight: "40px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: "none",
            },
          },
          "&:hover": {
            backgroundColor: "#e5e500",
          },
          "&.Mui-focused": {
            backgroundColor: "#ffff00",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
            outline: "none",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        select: {
          backgroundColor: "#ffff00",
          padding: "11px 14px",
          paddingRight: "44px !important",
        },
        icon: {
          color: "#000000",
          right: "12px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#ffff00",
          color: "#000000",
          minHeight: "40px",
          "& fieldset": {
            border: "none",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
          },
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
          width: 40,
          height: 24,
          padding: 3,
          "& .MuiSwitch-switchBase": {
            padding: 3,
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#ffff66",
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
            backgroundColor: "#ffff66",
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
          borderRadius: "50%",
          backgroundColor: "#000000",
          color: "#ffff00",
          boxShadow: "0 2px 8px #000000",
          transition:
            "background-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease",
          "&:hover": {
            backgroundColor: "#222222",
            boxShadow: "0 4px 12px #000000",
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
          borderRadius: "8px",
          boxShadow: "0 8px 32px #000000",
          border: "2px solid #000000",
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
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          borderTop: "2px solid #000000",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 2px 8px #000000",
          border: "2px solid #000000",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          borderBottom: "2px solid #ffff00",
        },
        title: {
          fontWeight: 600,
          color: "#ffff00",
        },
        subheader: {
          color: "#ffff00",
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
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffff00",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffff00",
          border: "2px solid #000000",
          boxShadow: "0 4px 12px #000000",
          borderRadius: "8px",
          padding: "4px",
        },
        list: {
          padding: "4px",
          backgroundColor: "#ffff00",
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
          borderColor: "#000000",
        },
      },
    },
  },
});
