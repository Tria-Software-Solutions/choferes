import React from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeMode } from "../../index";

type ThemeMode = "light" | "dark" | "default";

/**
 * ThemeToggle cycles between light → dark → system (default) modes.
 * Shows a Sun icon in dark mode, Moon in light mode, Monitor in system mode.
 */
export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const muiTheme = useTheme();

  const currentMode = mode as ThemeMode;

  const cycleMode = () => {
    const next: Record<ThemeMode, ThemeMode> = {
      light: "dark",
      dark: "default",
      default: "light",
    };
    setMode(next[currentMode]);
  };

  const getIcon = () => {
    const iconSize = 18;
    const iconProps = { size: iconSize, strokeWidth: 1.5 };

    switch (currentMode) {
      case "dark":
        return <Sun {...iconProps} />;
      case "light":
        return <Moon {...iconProps} />;
      default:
        return <Monitor {...iconProps} />;
    }
  };

  const getTooltip = () => {
    switch (currentMode) {
      case "dark":
        return "Cambiar a modo claro";
      case "light":
        return "Cambiar a modo oscuro";
      default:
        return "Usar preferencia del sistema";
    }
  };

  const isDarkMode = muiTheme.palette.mode === "dark";

  return (
    <Tooltip title={getTooltip()} arrow>
      <IconButton
        onClick={cycleMode}
        sx={{
          color: "#ffffff",
          backgroundColor: "transparent",
          border: "none",
          opacity: isDarkMode ? 0.9 : 0.7,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
            opacity: 1,
          },
        }}
        aria-label="Cambiar tema"
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
