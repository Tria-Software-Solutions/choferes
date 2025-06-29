import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
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
            "& input": {
              color: "#000000",
              fontSize: "1rem",
            },
            "& textarea": {
              color: "#000000",
              fontSize: "1rem",
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
          "& .MuiFormHelperText-root": {
            color: "#d32f2f",
            fontSize: "0.75rem",
            marginTop: "4px",
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
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e0e0e0",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "2px",
          },
          "& .MuiSelect-select": {
            color: "#000000",
            backgroundColor: "transparent",
          },
          "& .MuiSelect-icon": {
            color: "#000000",
          },
          ".MuiTableHead &": {
            color: "#ffffff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
            "& .MuiSelect-select": {
              color: "#ffffff",
            },
            "& .MuiSelect-icon": {
              color: "#ffffff",
            },
            "& .MuiInputLabel-root": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#000000",
          backgroundColor: "#ffffff",
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          "&.Mui-selected": {
            backgroundColor: "#e3f2fd",
            color: "#000000",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: "#000000",
          backgroundColor: "#f5f5f5",
          fontWeight: 600,
        },
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
          borderRadius: '20px',
          fontSize: '0.875rem',
          transition: 'all 0.3s ease',
          "& .MuiChip-label": {
            color: "#ffffff !important",
          },
          "&:hover": {
            backgroundColor: "#333333",
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
    },
  },
});

export default theme;
