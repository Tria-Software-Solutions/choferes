import React from "react";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import {
  IconAlertTriangle,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useToneColors } from "../../../components/Layout";
import type { AttentionItem, AttentionTone } from "../panelModel";
import { revealSx } from "../ui/motion";

const TONE_ICON: Record<AttentionTone, React.ElementType> = {
  danger: IconAlertTriangle,
  warning: IconClock,
  info: IconInfoCircle,
};

interface AttentionStripProps {
  items: AttentionItem[];
  onSelect: (item: AttentionItem) => void;
}

// Lo que requiere atención, en píldoras que llevan directo a la sección. El
// texto usa el color de texto y solo el ícono lleva el tono, para que se lea
// bien sobre cualquier fondo. Sin pendientes, una línea tranquila lo confirma.
export const AttentionStrip: React.FC<AttentionStripProps> = ({ items, onSelect }) => {
  const { colors } = useTheme().tokens;
  const tone = useToneColors();

  if (items.length === 0) {
    return (
      <Box sx={[{ display: "flex", alignItems: "center", gap: 1, px: 0.5 }, revealSx(1) as object]}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            color: colors.success,
            "& svg": { width: 18, height: 18 },
          }}
        >
          <IconCircleCheck aria-hidden />
        </Box>
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.textMuted }}>
          Todo al día: no tienes avisos pendientes.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="ul"
      aria-label="Avisos que requieren tu atención"
      sx={[
        {
          display: "flex",
          gap: 1,
          m: 0,
          listStyle: "none",
          flexWrap: { xs: "nowrap", sm: "wrap" },
          // En móvil las píldoras van en una fila deslizable que llega al borde.
          overflowX: { xs: "auto", sm: "visible" },
          mx: { xs: -2.5, sm: 0 },
          px: { xs: 2.5, sm: 0 },
          pb: { xs: 0.5, sm: 0 },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        revealSx(1) as object,
      ]}
    >
      {items.map((item) => {
        const colorsForTone = tone(item.tone);
        const Icon = TONE_ICON[item.tone];
        return (
          <Box component="li" key={item.id} sx={{ display: "flex", flexShrink: 0 }}>
            <ButtonBase
              onClick={() => onSelect(item)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                gap: 0.75,
                height: 36,
                pl: 0.5,
                pr: 1,
                borderRadius: 999,
                border: `1px solid ${colors.borderStrong}`,
                backgroundColor: colors.surface,
                fontFamily: "inherit",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: colors.text,
                transition: "background-color 160ms ease, border-color 160ms ease",
                "&:hover": { backgroundColor: colors.hoverSoft },
                "&:focus-visible": { outline: `2px solid ${colors.accent}`, outlineOffset: 2 },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  color: colorsForTone.fg,
                  backgroundColor: colorsForTone.bg,
                  "& svg": { width: 15, height: 15, strokeWidth: 2.1 },
                }}
              >
                <Icon />
              </Box>
              {item.label}
              <IconChevronRight aria-hidden size={15} style={{ color: colors.textSubtle }} />
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
};
