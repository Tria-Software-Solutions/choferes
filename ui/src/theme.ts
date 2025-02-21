import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 435,
      md: 960,
      lg: 1280,
      xl: 3300,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#0056b3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f50057",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ffa000",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#388e3c",
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
    body1: {
      fontSize: "1rem",
      color: "#333333",
    },
    body2: {
      fontSize: "0.875rem",
      color: "#555555",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: "25px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          borderRadius: "4px",
          textTransform: "none",
        },
        contained: {
          boxShadow: "none",
        },
        outlined: {
          borderColor: "#0056b3",
          color: "#0056b3",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        },
        colorInherit: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px 0",
          "& input": {
            color: "#333333",
          },
          "& label": {
            color: "#555555",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px",
          color: "#333333",
          border: "none",
        },
        head: {
          borderBottom: "0.25px solid rgba(224, 224, 224, 1)",
          borderTop: "0.25px solid rgba(224, 224, 224, 1)",
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
            backgroundColor: "#f5f5f5",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "white",
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectLabel: {
          color: "black",
        },
        select: {
          color: "black",
        },
        actions: {
          "& .MuiIconButton-root": {
            color: "black",
          },
        },
      },
    },
  },
});

export default theme;
