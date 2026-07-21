import React, { useMemo, useState, createContext, useContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme, highContrastTheme } from "./theme";
import "./index.css";

const ThemeModeContext = createContext({
  mode: "light",
  setMode: (mode: "light" | "dark" | "high-contrast" | "default") => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getThemeByMode = (mode: string) => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "high-contrast":
      return highContrastTheme;
    case "default":
      return getSystemTheme() === "dark" ? darkTheme : lightTheme;
    default:
      return lightTheme;
  }
};

const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "default");

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  const theme = useMemo(() => getThemeByMode(mode), [mode]);

  // Set body background color to match theme
  useEffect(() => {
    document.body.style.backgroundColor = theme.palette.background.default;
  }, [theme]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  // <React.StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  // </React.StrictMode>,
);
