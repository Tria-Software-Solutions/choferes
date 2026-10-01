import React from "react";
import { Box, ButtonBase, Tooltip, useTheme } from "@mui/material";
import { NAV_SHORT_LABELS } from "../../constants/appbar.constants";

export interface TopNavLink {
  /** Stable key (also the long, descriptive label). */
  label: string;
  path?: string;
  icon?: React.ReactElement;
}

interface TopNavProps {
  links: TopNavLink[];
  /** Current pathname; a link is active for its path and any sub-path. */
  pathname?: string;
  onNavigate?: (path: string) => void;
  /** Hide the text labels (icon-only) — used on medium screens. */
  compact?: boolean;
  /**
   * Fuerza la etiqueta de todos los ítems, sin animación. Lo usa la vista
   * previa de "Accesos rápidos", donde no hay una ruta activa que marcar.
   */
  showAllLabels?: boolean;
}

const isActivePath = (pathname: string | undefined, path: string | undefined) =>
  Boolean(pathname && path && (pathname === path || pathname.startsWith(`${path}/`)));

// Ancho máximo de la etiqueta al desplegarse: suficiente para los nombres más
// largos ("Amonestaciones") y con transición para que abra/cierre suave.
const LABEL_MAX_WIDTH = 180;

// Primary navigation of the app: always visible in the top bar, so users see
// where they are and reach any section in one click. Solo el ítem activo muestra
// su texto; el resto queda como ícono, y la etiqueta se abre/cierra al cambiar de
// página (respeta `prefers-reduced-motion`).
const TopNav: React.FC<TopNavProps> = ({
  links,
  pathname,
  onNavigate,
  compact = false,
  showAllLabels = false,
}) => {
  const { colors, borders } = useTheme().tokens;

  // Etiqueta animada: 0→ancho completo según esté activo el ítem.
  const labelSx = (active: boolean) => ({
    display: "inline-block",
    overflow: "hidden",
    whiteSpace: "nowrap",
    maxWidth: active ? LABEL_MAX_WIDTH : 0,
    opacity: active ? 1 : 0,
    ml: active ? 1 : 0,
    transition:
      "max-width 260ms cubic-bezier(0.22, 0.8, 0.24, 1), opacity 180ms ease, margin-left 260ms cubic-bezier(0.22, 0.8, 0.24, 1)",
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  });

  return (
    <Box component="nav" aria-label="Navegación principal" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {links.map((link) => {
        const active = isActivePath(pathname, link.path);
        const text = NAV_SHORT_LABELS[link.label] ?? link.label;
        const item = (
          <ButtonBase
            key={link.label}
            onClick={() => link.path && onNavigate?.(link.path)}
            aria-current={active ? "page" : undefined}
            aria-label={compact ? text : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 36,
              px: compact ? 1.1 : 1.5,
              borderRadius: "9px",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              fontWeight: active ? 700 : 500,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              color: active ? colors.text : colors.textMuted,
              backgroundColor: active ? colors.selected : "transparent",
              transition: "background-color 0.15s ease, color 0.15s ease",
              "&:hover": { color: colors.text, backgroundColor: active ? colors.selected : colors.hover },
              "&.Mui-focusVisible": { outline: borders.focus, outlineOffset: 1 },
              "& svg": {
                width: 18,
                height: 18,
                strokeWidth: active ? 2 : 1.75,
                color: active ? colors.accent : "inherit",
                flexShrink: 0,
              },
            }}
          >
            {link.icon}
            {!compact &&
              (showAllLabels ? (
                <Box component="span" sx={{ ml: 1 }}>
                  {text}
                </Box>
              ) : (
                <Box component="span" sx={labelSx(active)}>
                  {text}
                </Box>
              ))}
          </ButtonBase>
        );
        return compact ? (
          <Tooltip key={link.label} title={text}>
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </Box>
  );
};

export default TopNav;
