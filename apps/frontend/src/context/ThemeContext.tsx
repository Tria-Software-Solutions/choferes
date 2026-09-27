import React, { useMemo, useState, createContext, useContext, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "../theme";

export type ThemeMode = "light" | "dark" | "default";

const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "default"];

// Unknown/legacy values (e.g. the removed "high-contrast") fall back to the
// system preference.
export const normalizeThemeMode = (value: unknown): ThemeMode =>
  THEME_MODES.includes(value as ThemeMode) ? (value as ThemeMode) : "default";

interface ThemeModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: "light",
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getThemeByMode = (mode: string) => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "default":
      return getSystemTheme() === "dark" ? darkTheme : lightTheme;
    default:
      return lightTheme;
  }
};

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() =>
    normalizeThemeMode(localStorage.getItem("themeMode")),
  );
  // "Sistema" follows OS light/dark changes while the app is open.
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(getSystemTheme());
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  // systemTheme is a dependency so "default" re-resolves when the OS flips.
  const theme = useMemo(() => getThemeByMode(mode), [mode, systemTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the browser UI (address bar on mobile, form controls) in sync.
  useEffect(() => {
    document.documentElement.style.colorScheme = theme.palette.mode;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme.tokens.colors.appBarBg);
  }, [theme]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {/* Global body, selection, scrollbar and focus styles from the theme tokens */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
