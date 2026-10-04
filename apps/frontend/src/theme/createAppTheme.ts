import { createTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import {
  helperTextStyles,
  inputAdornmentStyles,
  inputControlStyles,
  inputRootStyles,
} from "./fieldStyles";
import { staticLabelStyles } from "./staticLabel";
import type { ThemeTokens } from "./tokens";

// Components read the active mode's design tokens from `theme.tokens` instead
// of branching on `theme.palette.mode` with hard-coded rgba values.
declare module "@mui/material/styles" {
  interface Theme {
    tokens: ThemeTokens;
  }
  interface ThemeOptions {
    tokens?: ThemeTokens;
  }
}

export const FONT_FAMILY = "'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Teléfonos y tablets (< md = 960px): interfaz tipo app. Estas reglas viven aquí
// para que TODAS las pantallas las hereden sin tocar cada una.
const MOBILE = "@media (max-width:959.95px)";
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";
const sheetUp = keyframes`
  from { transform: translateY(32px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

/** Radii of the design system (px). */
export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
} as const;

/**
 * Single source of truth for the whole app's look.
 *
 * Structure (breakpoints, typography scale, spacing, radii, every component
 * override) is declared once, here. A visual mode is only a set of tokens, so
 * light and dark always render the same components and every
 * style tweak propagates everywhere at once.
 *
 * Language: neutral surfaces separated by 1px hairlines, monochrome primary
 * actions, one indigo accent (see tokens.ts), soft status tints, restrained
 * shadows and generous but consistent spacing.
 */
export const createAppTheme = (tokens: ThemeTokens) => {
  const { colors: c, field, shadows: shadow, borders: b } = tokens;
  const isDark = tokens.mode === "dark";

  // Papel de menús, selectores y popovers en móvil: hoja inferior. Lleva
  // !important porque Popover posiciona su papel con estilos en línea.
  const bottomSheetPaper = {
      position: "fixed !important",
      top: "auto !important",
      left: "0 !important",
      right: "0 !important",
      bottom: "0 !important",
      width: "100% !important",
      minWidth: "100% !important",
      maxWidth: "100% !important",
      maxHeight: "65dvh !important",
      opacity: "1 !important",
      transform: "none !important",
      borderRadius: "20px 20px 0 0",
      borderBottom: "none",
      paddingBottom: SAFE_BOTTOM,
      animation: `${sheetUp} 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)`,
      "&::before": {
        content: '""',
        display: "block",
        width: 36,
        height: 5,
        borderRadius: 3,
        margin: "8px auto 4px",
        backgroundColor: c.borderStrong,
      },
  };

  return createTheme({
    tokens,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 3500,
      },
    },
    palette: {
      mode: tokens.mode,
      primary: {
        main: c.primary,
        light: c.primarySoft,
        dark: c.primaryDeep,
        contrastText: c.onPrimary,
      },
      secondary: {
        main: c.accent,
        light: c.accentStrong,
        dark: c.accentStrong,
        contrastText: c.onAccent,
      },
      background: {
        default: c.canvas,
        paper: c.surface,
      },
      text: {
        primary: c.text,
        secondary: c.textMuted,
        disabled: c.disabledText,
      },
      error: { main: c.error, light: c.errorLight, dark: c.errorDark },
      warning: { main: c.warning, light: c.warningLight, dark: c.warningDark },
      info: { main: c.info, light: c.infoLight, dark: c.infoDark },
      success: { main: c.success, light: c.successLight, dark: c.successDark },
      divider: c.divider,
      action: {
        hover: c.actionHover,
        selected: c.actionSelected,
        disabled: c.actionDisabled,
        disabledBackground: c.actionDisabledBg,
      },
    },
    shape: { borderRadius: RADIUS.md },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 },
      h2: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2 },
      h3: { fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 },
      h4: { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 },
      h5: { fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.35 },
      h6: { fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.4 },
      subtitle1: { fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.5 },
      subtitle2: { fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.5 },
      body1: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.55 },
      button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none", letterSpacing: "-0.005em" },
      caption: { fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.5 },
      overline: {
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        lineHeight: 1.5,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.canvas,
            color: c.text,
            overflowX: "hidden",
            WebkitTapHighlightColor: "transparent",
            fontFeatureSettings: "'tnum' 1",
          },
          "::selection": {
            backgroundColor: c.accentSoft,
            color: c.text,
          },
          // Thin, theme-aware scrollbars.
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${c.borderStrong} transparent`,
          },
          "*::-webkit-scrollbar": { width: 8, height: 8 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            background: c.borderStrong,
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            background: c.textSubtle,
            backgroundClip: "padding-box",
          },
          // Keyboard focus ring for plain interactive elements; MUI inputs and
          // floating surfaces draw their own focus states.
          "a:focus-visible, button:focus-visible, [role='button']:focus-visible, [tabindex]:focus-visible": {
            outline: b.focus,
            outlineOffset: 2,
          },
        },
      },

      // ── Surfaces ──────────────────────────────────────────────────────────
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "inherit" },
        styleOverrides: {
          root: {
            backgroundColor: c.appBarBg,
            color: c.text,
            boxShadow: "none",
            borderBottom: b.inverse,
            borderRadius: 0,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: c.surface,
            color: c.text,
          },
          rounded: { borderRadius: RADIUS.lg },
          outlined: { border: b.paper },
          elevation0: { boxShadow: "none" },
          elevation1: { boxShadow: `0 1px 2px ${shadow.paper}`, border: b.paper },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: RADIUS.lg,
            border: b.paper,
            boxShadow: `0 1px 2px ${shadow.card}`,
            overflow: "hidden",
            backgroundColor: c.surface,
            color: c.text,
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: "18px 20px 0" },
          title: { fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em", color: c.text },
          subheader: { fontSize: "0.8125rem", color: c.textMuted, marginTop: 2 },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: { padding: 20, "&:last-child": { paddingBottom: 20 } },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: c.borderDivider } },
      },

      // ── Buttons ───────────────────────────────────────────────────────────
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: RADIUS.md,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: "-0.005em",
            padding: "0 14px",
            minHeight: 38,
            [MOBILE]: { minHeight: 44, borderRadius: RADIUS.lg },
            gap: 2,
            transition:
              "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
            "&:focus-visible": { outline: b.focus, outlineOffset: 2 },
            "& .MuiButton-startIcon": { marginRight: 6, marginLeft: -2 },
            "& .MuiButton-endIcon": { marginLeft: 6, marginRight: -2 },
          },
          containedPrimary: {
            backgroundColor: c.primary,
            color: c.onPrimary,
            border: b.contained,
            boxShadow: `0 1px 2px ${shadow.button}`,
            "&:hover": { backgroundColor: c.primaryHover, color: c.onPrimary, boxShadow: `0 1px 2px ${shadow.button}` },
            "&:active": { backgroundColor: c.primaryActive, color: c.onPrimary },
            "&:focus-visible": { color: c.onPrimary },
          },
          contained: {
            "&.Mui-disabled": {
              backgroundColor: c.disabled,
              color: c.disabledText,
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: c.borderStrong,
            color: c.textButton,
            backgroundColor: c.surface,
            "&:hover": {
              backgroundColor: c.hoverSoft,
              borderColor: c.focusOutline,
            },
            "&.Mui-disabled": {
              borderColor: c.border,
              color: c.disabledText,
            },
          },
          outlinedError: {
            borderColor: c.errorSoft,
            color: c.error,
            "&:hover": { backgroundColor: c.errorSoft, borderColor: c.error },
          },
          text: {
            color: c.textMuted,
            "&:hover": { backgroundColor: c.hover, color: c.text },
            "&.Mui-disabled": { color: c.disabledText },
          },
          sizeSmall: { minHeight: 32, padding: "0 10px", fontSize: "0.8125rem", borderRadius: RADIUS.sm },
          sizeLarge: { minHeight: 44, padding: "0 18px", fontSize: "0.9375rem" },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: c.iconColor,
            borderRadius: RADIUS.sm,
            padding: 7,
            [MOBILE]: { minWidth: 40, minHeight: 40 },
            transition: "background-color 0.15s ease, color 0.15s ease",
            "&:hover": { backgroundColor: c.hover, color: c.text },
            "&:focus-visible": { outline: b.focus, outlineOffset: 1 },
          },
          sizeSmall: { padding: 5 },
          sizeLarge: { padding: 9, borderRadius: RADIUS.md },
          colorInherit: { color: "inherit" },
          colorPrimary: { color: c.text },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            color: c.textMuted,
            borderColor: c.border,
            "&.Mui-selected": {
              backgroundColor: c.selected,
              color: c.text,
              "&:hover": { backgroundColor: c.hoverStrong },
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            backgroundColor: c.primary,
            color: c.onPrimary,
            boxShadow: `0 4px 14px ${shadow.fab}`,
            "&:hover": { backgroundColor: c.primaryHover, boxShadow: `0 6px 18px ${shadow.fabHover}` },
          },
        },
      },
      MuiSpeedDial: {
        styleOverrides: { fab: { width: 40, height: 40, minHeight: 40 } },
      },
      MuiSpeedDialAction: {
        styleOverrides: {
          fab: {
            backgroundColor: c.menuSurface,
            color: c.text,
            border: b.paper,
            boxShadow: shadow.menu,
            "&:hover": { backgroundColor: c.hover },
          },
          staticTooltipLabel: {
            backgroundColor: c.inverseBg,
            color: c.onInverse,
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: RADIUS.sm,
          },
        },
      },

      // ── Inputs ────────────────────────────────────────────────────────────
      MuiTextField: {
        styleOverrides: { root: { margin: "6px 0" } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            ...inputRootStyles(field),
            ...inputAdornmentStyles(field),
            ...inputControlStyles(field),
            [MOBILE]: { "&:not(.MuiInputBase-multiline)": { minHeight: 48 } },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: helperTextStyles(field) },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            margin: "6px 0",
            "& .MuiInputLabel-root": staticLabelStyles({
              color: c.textMuted,
              focusedColor: c.text,
              errorColor: field.errorText,
            }),
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            ...staticLabelStyles({
              color: c.textMuted,
              focusedColor: c.text,
              errorColor: field.errorText,
            }),
            fontWeight: 600,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: { color: c.text },
          select: {
            backgroundColor: "transparent",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "14px",
            paddingRight: "40px !important",
            fontSize: "0.9375rem",
          },
          icon: { color: c.textMuted, right: 10 },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: c.borderStrong,
            borderRadius: 6,
            "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: c.primary },
            "&:hover": { backgroundColor: c.hoverSoft },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: c.borderStrong,
            "&.Mui-checked": { color: c.primary },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 38,
            height: 22,
            padding: 0,
            margin: 8,
            overflow: "visible",
            "& .MuiSwitch-switchBase": {
              padding: 3,
              "&.Mui-checked": {
                transform: "translateX(16px)",
                color: c.onPrimary,
                "& + .MuiSwitch-track": { opacity: 1, backgroundColor: c.primary },
              },
              "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.4 },
              "&:hover": { backgroundColor: "transparent" },
            },
            "& .MuiSwitch-thumb": {
              width: 16,
              height: 16,
              boxShadow: `0 1px 2px ${shadow.button}`,
              backgroundColor: isDark ? c.text : "#ffffff",
            },
            "& .Mui-checked .MuiSwitch-thumb": { backgroundColor: c.onPrimary },
            "& .MuiSwitch-track": {
              borderRadius: 11,
              opacity: 1,
              backgroundColor: c.borderStrong,
              transition: "background-color 0.2s ease",
            },
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            // Switches have no touch padding (see MuiSwitch): align them with
            // the content edge instead of the checkbox-oriented -11px offset.
            "&:has(.MuiSwitch-root)": { marginLeft: 0, gap: 10 },
            "& .MuiSwitch-root": { margin: 0 },
          },
          label: { fontSize: "0.875rem", color: c.text },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            margin: "6px 0",
            "& .MuiOutlinedInput-root": {
              minHeight: "40px",
              padding: "3px 10px",
              "& .MuiAutocomplete-input": { padding: "7px 4px", fontSize: "0.9375rem" },
              // Leading icon is absolutely positioned (see fieldStyles).
              "&.MuiInputBase-adornedStart": { paddingLeft: "32px" },
            },
          },
          popupIndicator: { color: c.textMuted },
          clearIndicator: { color: c.textSubtle, "&:hover": { color: c.text } },
          paper: {
            borderRadius: 12,
            border: b.dialog,
            boxShadow: shadow.menu,
            marginTop: 4,
            backgroundColor: c.menuSurface,
          },
          listbox: {
            padding: 4,
            "& .MuiAutocomplete-option": {
              borderRadius: RADIUS.sm,
              padding: "8px 10px",
              minHeight: 36,
              fontSize: "0.875rem",
              color: c.text,
              "&.Mui-focused": { backgroundColor: c.hover },
              "&[aria-selected='true']": { backgroundColor: c.selected, fontWeight: 600 },
              "&[aria-selected='true'].Mui-focused": { backgroundColor: c.hoverStrong },
            },
          },
          tag: {
            backgroundColor: c.chipTagBg,
            color: c.text,
            fontWeight: 600,
            borderRadius: 6,
            height: 24,
            margin: 2,
          },
        },
      },

      // ── Data display ──────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            height: 26,
            borderRadius: RADIUS.sm,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0",
            backgroundColor: c.chipTagBg,
            color: c.text,
            "& .MuiChip-label": { padding: "0 9px" },
            "& .MuiChip-icon": { marginLeft: 7, marginRight: -3, color: "inherit" },
            "& .MuiChip-deleteIcon": { color: c.textSubtle, "&:hover": { color: c.text } },
          },
          clickable: {
            "&:hover": { backgroundColor: c.chipBgHover },
          },
          outlined: {
            backgroundColor: "transparent",
            borderColor: c.borderChip,
            color: c.chipOutlinedText,
          },
          sizeSmall: { height: 22, fontSize: "0.6875rem", "& .MuiChip-label": { padding: "0 7px" } },
          colorPrimary: { backgroundColor: c.primary, color: c.onPrimary },
          colorSecondary: { backgroundColor: c.accentSoft, color: c.accentStrong },
          colorSuccess: { backgroundColor: c.successSoft, color: c.success },
          colorWarning: { backgroundColor: c.warningSoft, color: c.warning },
          colorError: { backgroundColor: c.errorSoft, color: c.error },
          colorInfo: { backgroundColor: c.infoSoft, color: c.info },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: { fontSize: "0.625rem", fontWeight: 700, minWidth: 16, height: 16, padding: "0 4px" },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: c.avatarBg,
            color: c.accentStrong,
            fontWeight: 700,
            fontSize: "0.875rem",
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 250 },
        styleOverrides: {
          tooltip: {
            backgroundColor: c.inverseBg,
            color: c.onInverse,
            fontSize: "0.75rem",
            fontWeight: 500,
            borderRadius: RADIUS.sm,
            padding: "6px 10px",
            boxShadow: `0 4px 12px ${shadow.popupSoft}`,
          },
          arrow: { color: c.inverseBg },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.md,
            fontSize: "0.875rem",
            alignItems: "center",
            "& .MuiAlert-icon": { opacity: 1 },
          },
          standardSuccess: { backgroundColor: c.successSoft, color: c.text, "& .MuiAlert-icon": { color: c.success } },
          standardWarning: { backgroundColor: c.warningSoft, color: c.text, "& .MuiAlert-icon": { color: c.warning } },
          standardError: { backgroundColor: c.errorSoft, color: c.text, "& .MuiAlert-icon": { color: c.error } },
          standardInfo: { backgroundColor: c.accentSoft, color: c.text, "& .MuiAlert-icon": { color: c.accent } },
          outlinedInfo: { borderColor: c.border, color: c.text, backgroundColor: c.accentSoft, "& .MuiAlert-icon": { color: c.accent } },
          outlinedWarning: { borderColor: c.border, color: c.text, backgroundColor: c.warningSoft },
          outlinedError: { borderColor: c.border, color: c.text, backgroundColor: c.errorSoft },
          outlinedSuccess: { borderColor: c.border, color: c.text, backgroundColor: c.successSoft },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 6, backgroundColor: c.hoverStrong },
          bar: { borderRadius: 999 },
        },
      },
      MuiSkeleton: {
        styleOverrides: { root: { backgroundColor: c.hover } },
      },

      // ── Tables ────────────────────────────────────────────────────────────
      MuiTableContainer: {
        styleOverrides: { root: { backgroundColor: "transparent" } },
      },
      MuiTable: {
        styleOverrides: { root: { backgroundColor: "transparent", borderCollapse: "separate" } },
      },
      MuiTableHead: {
        styleOverrides: { root: { backgroundColor: c.tableHeadBg } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: c.textOnSunken,
            padding: "12px 16px",
            fontSize: "0.875rem",
            borderBottom: b.hairline,
            backgroundColor: "transparent",
          },
          head: {
            backgroundColor: c.tableHeadBg,
            color: c.tableHeadText,
            fontWeight: 600,
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            padding: "10px 16px",
            borderBottom: b.headCell,
          },
          stickyHeader: { backgroundColor: c.tableHeadBg },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.12s ease",
            "&.MuiTableRow-hover:hover": { backgroundColor: c.hoverSoft },
            "&:last-child > .MuiTableCell-body": { borderBottom: "none" },
          },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            color: "inherit",
            "&:hover, &.Mui-active": { color: c.text },
            "& .MuiTableSortLabel-icon": { color: `${c.textMuted} !important` },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: { color: c.textMuted, borderTop: b.hairline },
          selectLabel: { fontSize: "0.8125rem" },
          displayedRows: { fontSize: "0.8125rem" },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            fontWeight: 600,
            "&.Mui-selected": { backgroundColor: c.primary, color: c.onPrimary },
          },
        },
      },

      // ── Navigation ────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          // Pestañas con deslizamiento horizontal (sin barra) en vez de cortarse.
          scroller: {
            [MOBILE]: { overflowX: "auto !important", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } },
          },
          indicator: { height: 2, borderRadius: 2, backgroundColor: c.text },
        },
      },
      MuiTab: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            minHeight: 44,
            minWidth: 0,
            padding: "10px 14px",
            color: c.textMuted,
            "&:hover": { color: c.text },
            "&.Mui-selected": { color: c.text },
            "& .MuiTab-iconWrapper": { marginRight: 8 },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: c.menuSurface,
            border: b.dialog,
            boxShadow: shadow.menu,
            borderRadius: 12,
            minWidth: 180,
            // Móvil: los menús y selectores salen como hoja inferior (action
            // sheet) en vez de un globo flotante, con !important porque
            // Popover posiciona su papel con estilos en línea.
            [MOBILE]: bottomSheetPaper,
          },
          list: { padding: 4, [MOBILE]: { padding: "4px 8px 8px" } },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            minHeight: 36,
            fontSize: "0.875rem",
            [MOBILE]: { minHeight: 48, fontSize: "1rem" },
            gap: 10,
            color: c.text,
            "&:hover": { backgroundColor: c.hover },
            "&.Mui-selected": {
              backgroundColor: c.selected,
              "&:hover": { backgroundColor: c.hoverStrong },
            },
            "&.Mui-focusVisible": { backgroundColor: c.hover },
            "& .MuiListItemIcon-root": { minWidth: 0, color: c.textMuted },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: b.dialog,
            boxShadow: shadow.menu,
            backgroundColor: c.menuSurface,
            [MOBILE]: bottomSheetPaper,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            "&:hover": { backgroundColor: c.hover },
            "&.Mui-selected": {
              backgroundColor: c.selected,
              "&:hover": { backgroundColor: c.hoverStrong },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: { root: { color: c.textMuted, minWidth: 34 } },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundColor: c.surface, borderColor: c.border, backgroundImage: "none" },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            "&:not(.MuiBackdrop-invisible)": {
              backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(9,9,11,0.32)",
              backdropFilter: "blur(2px)",
            },
          },
        },
      },

      // ── Dialogs ───────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          // En móvil los diálogos suben desde abajo como una hoja (bottom sheet).
          container: { [MOBILE]: { alignItems: "flex-end" } },
          paper: {
            [MOBILE]: {
              margin: 0,
              width: "100%",
              maxWidth: "100% !important",
              maxHeight: "92dvh",
              borderRadius: "20px 20px 0 0",
              borderBottom: "none",
              paddingBottom: SAFE_BOTTOM,
              animation: `${sheetUp} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)`,
              "&::before": {
                content: '""',
                display: "block",
                flexShrink: 0,
                width: 36,
                height: 5,
                borderRadius: 3,
                margin: "8px auto 0",
                backgroundColor: c.borderStrong,
              },
            },
            borderRadius: RADIUS.xl,
            border: b.dialog,
            boxShadow: `0 24px 64px -12px ${shadow.dialog}, 0 4px 12px ${shadow.dialogSoft}`,
            overflow: "hidden",
            backgroundColor: c.surface,
            color: c.text,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            color: c.text,
            padding: "20px 24px 8px",
            fontSize: "1.0625rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            "& .MuiTypography-root": { color: c.text },
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: { padding: "12px 24px 20px", backgroundColor: c.surface, color: c.text },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "14px 24px",
            [MOBILE]: { padding: "12px 16px" },
            backgroundColor: c.surfaceSunken,
            borderTop: b.hairline,
            gap: 8,
            "& > :not(style) ~ :not(style)": { marginLeft: 0 },
          },
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      MuiTypography: {
        styleOverrides: {
          root: { color: c.text },
          body2: { color: c.textMuted },
          caption: { color: c.textMuted },
          overline: { color: c.textMuted },
          subtitle2: { color: c.textMuted },
        },
      },
    },
  });
};
