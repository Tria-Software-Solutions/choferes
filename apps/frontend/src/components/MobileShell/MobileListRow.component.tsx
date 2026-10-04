import React from "react";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import { IconChevronRight } from "@tabler/icons-react";
import { pressable } from "./mobileShell.constants";

interface MobileListRowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Etiquetas o estados a la derecha del título (chips, avisos). */
  trailing?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  /** Muestra la flecha ">" de "abre otra pantalla" (por defecto, si hay onClick). */
  chevron?: boolean;
}

// Fila de lista tipo app (UITableViewCell / ListItem): objetivo táctil de al
// menos 56 px, retroalimentación al presionar y una flecha cuando abre detalle.
// Mantiene la forma leading / contenido / trailing de un `Pressable` nativo.
const MobileListRow: React.FC<MobileListRowProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  ariaLabel,
  chevron,
}) => {
  const { colors, borders } = useTheme().tokens;
  const showChevron = chevron ?? Boolean(onClick);

  return (
    <ButtonBase
      component="div"
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        textAlign: "left",
        gap: 1.5,
        minHeight: 60,
        px: 2,
        py: 1,
        borderBottom: borders.hairline,
        backgroundColor: colors.surface,
        ...pressable,
        "&:active": { backgroundColor: colors.hover, opacity: 1, transform: "none" },
      }}
    >
      {leading && <Box sx={{ display: "flex", flexShrink: 0 }}>{leading}</Box>}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", lineHeight: 1.35, color: colors.text }} noWrap>
          {title}
        </Typography>
        {subtitle && (
          <Typography component="div" sx={{ fontSize: "0.8125rem", color: colors.textMuted, lineHeight: 1.4 }} noWrap>
            {subtitle}
          </Typography>
        )}
      </Box>
      {trailing && <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>{trailing}</Box>}
      {showChevron && <IconChevronRight size={18} color={colors.textSubtle} style={{ flexShrink: 0 }} />}
    </ButtonBase>
  );
};

export default MobileListRow;
