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
    fontFamily: "Montserrat, Arial, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#000000",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#000000",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#000000",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#000000",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "#000000",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#000000",
    },
    body1: {
      fontSize: "1rem",
      color: "#000000",
    },
    body2: {
      fontSize: "0.875rem",
      color: "#666666",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      color: "#666666",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          color: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
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
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "2px solid #000000",
          "&:hover": {
            backgroundColor: "#333333",
            borderColor: "#333333",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3), inset 0 0 0 2px #000000",
          },
          "&:disabled": {
            backgroundColor: "#bdbdbd",
            borderColor: "#bdbdbd",
            color: "#666666",
            transform: "none",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "#000000",
          color: "#000000",
          borderWidth: "2px",
          "&:hover": {
            backgroundColor: "#000000",
            color: "#ffffff",
            borderColor: "#000000",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2), inset 0 0 0 2px #ffffff",
          },
          "&:disabled": {
            borderColor: "#bdbdbd",
            color: "#bdbdbd",
            transform: "none",
            boxShadow: "none",
          },
        },
        text: {
          color: "#000000",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#000000",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            transform: "scale(1.05)",
          },
        },
        colorInherit: {
          color: "#ffffff",
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
            borderRadius: 2,
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease",
            "& fieldset": {
              borderColor: "#e0e0e0",
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
              backgroundColor: "#ffffff",
              outline: "none",
              boxShadow: "none",
            },
            "& input": {
              outline: "none",
              boxShadow: "none",
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
            transition: "all 0.3s ease",
            "& fieldset": {
              borderColor: "#e0e0e0",
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
            color: "#666666",
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
          backgroundColor: "#fff",
          borderRadius: "8px",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
          },
          "&.Mui-focused": {
            backgroundColor: "#fff",
            outline: "none",
            boxShadow: "none",
          },
        },
        select: {
          backgroundColor: "#fff",
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
          backgroundColor: "#fff",
          "&.Mui-focused": {
            backgroundColor: "#fff",
            outline: "none",
            boxShadow: "none",
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
          borderRadius: "20px",
          fontSize: "0.875rem",
          transition: "all 0.3s ease",
          "& .MuiChip-label": {
            color: "#ffffff !important",
          },
          "&:hover": {
            backgroundColor: "#333333",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            "& .MuiChip-label": {
              color: "#ffffff !important",
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
            backgroundColor: "#000000",
            color: "#ffffff",
            "& .MuiChip-label": {
              color: "#ffffff !important",
            },
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
          border: "none",
          padding: "16px",
        },
        head: {
          backgroundColor: "#000000",
          color: "#ffffff",
          fontWeight: 600,
          borderBottom: "2px solid #000000",
        },
        body: {
          borderBottom: "1px solid #e0e0e0",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#f8f9fa",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
          "&:hover": {
            backgroundColor: "#f5f5f5",
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
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: "24px",
          "& .MuiTypography-root": {
            fontWeight: 600,
            color: "#ffffff",
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
          padding: "24px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e0e0e0",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
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
          borderRadius: "8px !important",
          overflow: "hidden",
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "0px !important",
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
    fontFamily: "Montserrat, Arial, sans-serif",
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
          background: "linear-gradient(135deg, #232323 0%, #181818 100%)",
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
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "8px 24px",
          transition: "all 0.3s ease",
          borderWidth: "1px", // Cambiado a 1px
        },
        contained: {
          backgroundColor: "#333333",
          color: "#bdbdbd",
          border: "1px solid #bdbdbd", // Cambiado a 1px
          "&:hover": {
            backgroundColor: "#444444",
            borderColor: "#e0e0e0",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          },
          "&:disabled": {
            backgroundColor: "#444444",
            borderColor: "#444444",
            color: "#888888",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "#bdbdbd",
          color: "#bdbdbd",
          borderWidth: "1px", // Cambiado a 1px
          "&:hover": {
            backgroundColor: "#232323",
            color: "#ffffff",
            borderColor: "#e0e0e0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          },
          "&:disabled": {
            borderColor: "#444444",
            color: "#444444",
            boxShadow: "none",
          },
        },
        text: {
          color: "#bdbdbd",
          "&:hover": {
            backgroundColor: "#232323",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#bdbdbd",
          "&:hover": {
            backgroundColor: "#232323",
          },
        },
        colorInherit: {
          color: "#ffffff",
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
            borderRadius: 2,
            backgroundColor: "#232323",
            color: "#ffffff",
            "& fieldset": {
              borderColor: "#333333",
              borderWidth: "2px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#bdbdbd",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#bdbdbd",
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: "#232323",
            },
            "& input": {
              color: "#ffffff",
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
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#232323",
            color: "#ffffff",
            "& fieldset": {
              borderColor: "#333333",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#bdbdbd",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#bdbdbd",
              borderWidth: "2px",
            },
            // Adornos (iconos)
            "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
              color: "#ffffff",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#b0b0b0",
            fontSize: "1rem",
            "&.Mui-focused": {
              color: "#bdbdbd",
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "#ffffff",
          backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#fff",
          borderRadius: "8px",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#bdbdbd",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#bdbdbd",
          },
          // Unificar fondo y borde
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#fff",
            borderRadius: "8px",
          },
        }),
        select: {
          backgroundColor: "#232323",
        },
        icon: {
          color: "#bdbdbd",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px",
          backgroundColor: theme.palette.background.paper,
          color: "#ffffff",
          "& input": {
            color: "#ffffff",
          },
          // Unificar fondo y borde
          "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
          },
          // Adornos (iconos)
          "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
            color: "#ffffff",
          },
        }),
        notchedOutline: {
          borderColor: "#333333",
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
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          border: "none",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.85)"
              : "0 4px 24px rgba(0,0,0,0.15)",
          borderRadius: "8px !important",
          overflow: "hidden",
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "0px !important",
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
    fontFamily: "Montserrat, Arial, sans-serif",
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
          borderRadius: "8px !important",
          overflow: "hidden",
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "0px !important",
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
