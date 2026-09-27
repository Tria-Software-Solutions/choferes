import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useThemeMode } from "../../context/ThemeContext";

type ThemeMode = "light" | "dark" | "default";

/**
 * ThemeToggle cycles between light → dark → system (default) modes.
 * Shows a Sun icon in dark mode, Moon in light mode, Monitor in system mode.
 */
export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeMode();

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
    const iconProps = { size: iconSize, strokeWidth: 1.75 };

    switch (currentMode) {
      case "dark":
        return <IconSun {...iconProps} />;
      case "light":
        return <IconMoon {...iconProps} />;
      default:
        return <IconDeviceDesktop {...iconProps} />;
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

  return (
    <Tooltip title={getTooltip()}>
      <IconButton onClick={cycleMode} aria-label="Cambiar tema">
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
