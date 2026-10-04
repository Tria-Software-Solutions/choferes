import React, { useRef } from "react";
import { Box, ButtonBase, useTheme } from "@mui/material";
import { useMobileShell } from "../../hooks/useMobileShell";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "small" | "medium";
  fullWidth?: boolean;
  /** Kept for API compatibility; colors always follow the active theme. */
  surface?: "auto" | "dark" | "light";
  /** Accessible name of the group, e.g. "Filtrar por estado". */
  ariaLabel?: string;
}

// SegmentedToggle renders a pill-style segmented control (e.g. Semanal / Quincenal / Mensual).
// It behaves as a radio group: one option is always selected, Tab focuses the
// group and the arrow keys move the selection.
export default function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "small",
  fullWidth,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  // En teléfonos y tablets los filtros ocupan todo el ancho (como en iOS).
  const isMobileShell = useMobileShell();
  const stretch = fullWidth ?? isMobileShell;
  const { colors, borders, shadows } = useTheme().tokens;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectAt = (index: number) => {
    const next = options[(index + options.length) % options.length];
    onChange(next.value);
    itemRefs.current[(index + options.length) % options.length]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectAt(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectAt(index - 1);
    }
  };

  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        display: "flex",
        gap: "2px",
        alignItems: "stretch",
        minHeight: { xs: 44, md: 38 },
        boxSizing: "border-box",
        backgroundColor: colors.hoverSoft,
        border: borders.paper,
        borderRadius: "10px",
        p: "3px",
        width: stretch ? "100%" : "fit-content",
        maxWidth: "100%",
        overflowX: "auto",
        flexShrink: 0,
      }}
    >
      {options.map((opt, index) => {
        const active = value === opt.value;
        return (
          <ButtonBase
            key={opt.value}
            ref={(node: HTMLButtonElement | null) => {
              itemRefs.current[index] = node;
            }}
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              flex: stretch ? 1 : "none",
              minHeight: { xs: 36, md: 30 },
              px: size === "medium" ? { xs: 1.25, sm: 1.75 } : 1.1,
              borderRadius: "7px",
              fontFamily: "inherit",
              fontSize: size === "medium" ? "0.8125rem" : "0.75rem",
              fontWeight: active ? 700 : 500,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              color: active ? colors.text : colors.textMuted,
              backgroundColor: active ? colors.surface : "transparent",
              boxShadow: active ? `0 1px 3px ${shadows.chip}` : "none",
              transition: "background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
              "&:hover": active ? undefined : { color: colors.text, backgroundColor: colors.hover },
              "&.Mui-focusVisible": { outline: borders.focus, outlineOffset: 1 },
              "& svg": { flexShrink: 0 },
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                  height: 18,
                  px: 0.6,
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  backgroundColor: active ? colors.hoverStrong : colors.hover,
                  color: active ? colors.text : colors.textMuted,
                }}
              >
                {opt.count}
              </Box>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
