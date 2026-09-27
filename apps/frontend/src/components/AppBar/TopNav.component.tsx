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
}

const isActivePath = (pathname: string | undefined, path: string | undefined) =>
  Boolean(pathname && path && (pathname === path || pathname.startsWith(`${path}/`)));

// Primary navigation of the app: always visible in the top bar, so users see
// where they are and reach any section in one click.
const TopNav: React.FC<TopNavProps> = ({ links, pathname, onNavigate, compact = false }) => {
  const { colors, borders } = useTheme().tokens;

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
              gap: 1,
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
            {!compact && <span>{text}</span>}
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
