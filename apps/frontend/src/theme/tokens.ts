// Design tokens: the only place where the three visual modes differ.
//
// Everything else — breakpoints, typography scale, spacing, radii, component
// structure — lives once in `createAppTheme.ts`. A mode is nothing more than
// this token set, so a style change is made in a single file and every screen
// of the app picks it up.
//
// Visual language: neutral "zinc" surfaces separated by 1px hairlines, a
// monochrome primary (black on light, white on dark) and a single indigo
// accent reserved for emphasis (page icons, active states, charts). Status
// colors (success/warning/error/info) are only used to communicate state.

import type { FieldPalette } from "./fieldStyles";
import {
  darkFieldPalette,
  lightFieldPalette,
} from "./fieldStyles";

export interface ThemeColors {
  // --- Lienzo y superficies -------------------------------------------------
  /** Fondo de la página (`palette.background.default`). */
  canvas: string;
  /** Papel, tarjetas, diálogos, tablas. */
  surface: string;
  /** Superficie hundida: cabeceras de tabla, pie de diálogo, bloques secundarios. */
  surfaceSunken: string;
  /** Menús, popovers y autocompletados. */
  menuSurface: string;

  // --- Marca (superficies invertidas) --------------------------------------
  /** Superficies invertidas: tooltips, chips de día activos, íconos de diálogo. */
  inverseBg: string;
  inverseBgHover: string;
  inverseBgActive: string;
  onInverse: string;
  /** Fondo de hover sobre superficies invertidas. */
  inverseHover: string;
  /** FAB, acciones del SpeedDial, títulos de diálogo heredados. */
  emphasisBg: string;
  emphasisBgHover: string;
  onEmphasis: string;
  onEmphasisHover: string;
  /** Barra superior de la aplicación. */
  appBarBg: string;

  // --- Texto ----------------------------------------------------------------
  text: string;
  textMuted: string;
  textSubtle: string;
  textStrong: string;
  textButton: string;
  /** Texto de celdas de tabla. */
  textOnSunken: string;
  /** Thumb del switch encendido. */
  textOnInverse: string;

  // --- Bordes ---------------------------------------------------------------
  border: string;
  borderStrong: string;
  borderHairline: string;
  borderDivider: string;
  borderChip: string;

  // --- Interacción ----------------------------------------------------------
  hover: string;
  hoverSoft: string;
  hoverStrong: string;
  hoverSurface: string;
  selected: string;
  focusOutline: string;
  disabled: string;
  disabledText: string;

  // --- Acento (índigo) -----------------------------------------------------
  /** Color de énfasis: íconos de página, estados activos, series de gráficos. */
  accent: string;
  /** Fondo tintado del acento (íconos en caja, selección suave). */
  accentSoft: string;
  /** Acento sobre fondo tintado (texto/íconos con máximo contraste). */
  accentStrong: string;
  onAccent: string;
  avatarBg: string;
  /** Iconos sueltos: select, popup de autocompletado, botones de icono. */
  iconColor: string;
  chipBgHover: string;
  chipOutlinedText: string;

  // --- Paleta ---------------------------------------------------------------
  /**
   * `palette.primary.main`: foreground accent (icons, active states, spinners,
   * tab indicators). Must contrast with `surface` — in dark mode it is light.
   */
  primary: string;
  /** Text/icons drawn on top of `primary`. */
  onPrimary: string;
  /** Contained (primary) button hover/pressed fills. */
  primaryHover: string;
  primaryActive: string;
  primarySoft: string;
  primaryDeep: string;
  secondaryMain: string;
  secondarySoft: string;
  secondaryDeep: string;
  secondaryOn: string;
  divider: string;
  actionHover: string;
  actionSelected: string;
  actionDisabled: string;
  actionDisabledBg: string;

  // --- Estado ---------------------------------------------------------------
  error: string;
  errorLight: string;
  errorDark: string;
  errorSoft: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  warningSoft: string;
  info: string;
  infoLight: string;
  infoDark: string;
  infoSoft: string;
  success: string;
  successLight: string;
  successDark: string;
  successSoft: string;

  // --- Tablas ---------------------------------------------------------------
  tableHeadBg: string;
  tableHeadText: string;
  tableRowOdd: string;
  tableRowEven: string;

  // --- Chips / autocompletado ----------------------------------------------
  chipTagBg: string;
}

export interface ThemeBorders {
  /** Línea inferior de la barra superior. */
  inverse: string;
  /** Contorno de papel y tarjetas. */
  paper: string;
  /** Separadores: cabeceras de tarjeta, pie de diálogo, filas de tabla. */
  hairline: string;
  /** Rejilla de celdas. */
  cell: string;
  /** Línea bajo la cabecera de la tabla. */
  headCell: string;
  /** Contorno de diálogos y menús. */
  dialog: string;
  /** Contorno de botones contenidos. */
  contained: string;
  /** Anillo de foco visible. */
  focus: string;
}

export interface ThemeShadows {
  appBar: string;
  paper: string;
  paperSoft: string;
  card: string;
  cardHover: string;
  dialog: string;
  dialogSoft: string;
  /** Sombra completa de menús y popovers. */
  menu: string;
  popup: string;
  popupSoft: string;
  fab: string;
  fabHover: string;
  button: string;
  chip: string;
}

export interface ThemeTokens {
  mode: "light" | "dark";
  colors: ThemeColors;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  field: FieldPalette;
}

export const lightTokens: ThemeTokens = {
  mode: "light",
  field: lightFieldPalette,
  borders: {
    inverse: "1px solid rgba(9,9,11,0.08)",
    paper: "1px solid rgba(9,9,11,0.08)",
    hairline: "1px solid rgba(9,9,11,0.07)",
    cell: "none",
    headCell: "1px solid rgba(9,9,11,0.07)",
    dialog: "1px solid rgba(9,9,11,0.08)",
    contained: "none",
    focus: "2px solid rgba(79,70,229,0.55)",
  },
  shadows: {
    appBar: "rgba(9,9,11,0.04)",
    paper: "rgba(16,24,40,0.04)",
    paperSoft: "rgba(16,24,40,0.03)",
    card: "rgba(16,24,40,0.04)",
    cardHover: "rgba(16,24,40,0.08)",
    dialog: "rgba(16,24,40,0.18)",
    dialogSoft: "rgba(16,24,40,0.06)",
    menu: "0 12px 32px -8px rgba(16,24,40,0.18), 0 2px 6px rgba(16,24,40,0.06)",
    popup: "rgba(16,24,40,0.16)",
    popupSoft: "rgba(16,24,40,0.06)",
    fab: "rgba(16,24,40,0.18)",
    fabHover: "rgba(16,24,40,0.24)",
    button: "rgba(16,24,40,0.12)",
    chip: "rgba(16,24,40,0.08)",
  },
  colors: {
    canvas: "#f6f6f7",
    surface: "#ffffff",
    surfaceSunken: "#fafafa",
    menuSurface: "#ffffff",

    inverseBg: "#18181b",
    inverseBgHover: "#27272a",
    inverseBgActive: "#3f3f46",
    onInverse: "#fafafa",
    inverseHover: "rgba(255,255,255,0.12)",
    emphasisBg: "#18181b",
    emphasisBgHover: "#27272a",
    onEmphasis: "#fafafa",
    onEmphasisHover: "#ffffff",
    appBarBg: "#ffffff",

    text: "#09090b",
    textMuted: "#71717a",
    textSubtle: "#a1a1aa",
    textStrong: "#09090b",
    textButton: "#18181b",
    textOnSunken: "#27272a",
    textOnInverse: "#ffffff",

    border: "rgba(9,9,11,0.08)",
    borderStrong: "rgba(9,9,11,0.14)",
    borderHairline: "rgba(9,9,11,0.07)",
    borderDivider: "rgba(9,9,11,0.08)",
    borderChip: "rgba(9,9,11,0.12)",

    hover: "rgba(9,9,11,0.045)",
    hoverSoft: "rgba(9,9,11,0.03)",
    hoverStrong: "rgba(9,9,11,0.07)",
    hoverSurface: "rgba(9,9,11,0.03)",
    selected: "rgba(9,9,11,0.06)",
    focusOutline: "rgba(9,9,11,0.3)",
    disabled: "rgba(9,9,11,0.06)",
    disabledText: "rgba(9,9,11,0.32)",

    accent: "#4f46e5",
    accentSoft: "rgba(79,70,229,0.08)",
    accentStrong: "#4338ca",
    onAccent: "#ffffff",
    avatarBg: "#eef2ff",
    iconColor: "#52525b",
    chipBgHover: "rgba(9,9,11,0.07)",
    chipOutlinedText: "#3f3f46",

    primary: "#18181b",
    onPrimary: "#fafafa",
    primaryHover: "#27272a",
    primaryActive: "#3f3f46",
    primarySoft: "#3f3f46",
    primaryDeep: "#09090b",
    secondaryMain: "#ffffff",
    secondarySoft: "#f4f4f5",
    secondaryDeep: "#e4e4e7",
    secondaryOn: "#09090b",
    divider: "rgba(9,9,11,0.08)",
    actionHover: "rgba(9,9,11,0.045)",
    actionSelected: "rgba(9,9,11,0.06)",
    actionDisabled: "rgba(9,9,11,0.3)",
    actionDisabledBg: "rgba(9,9,11,0.06)",

    error: "#dc2626",
    errorLight: "#f87171",
    errorDark: "#b91c1c",
    errorSoft: "rgba(220,38,38,0.08)",
    warning: "#d97706",
    warningLight: "#fbbf24",
    warningDark: "#b45309",
    warningSoft: "rgba(217,119,6,0.1)",
    info: "#0284c7",
    infoLight: "#38bdf8",
    infoDark: "#0369a1",
    infoSoft: "rgba(2,132,199,0.08)",
    success: "#16a34a",
    successLight: "#4ade80",
    successDark: "#15803d",
    successSoft: "rgba(22,163,74,0.09)",

    tableHeadBg: "#fafafa",
    tableHeadText: "#71717a",
    tableRowOdd: "#ffffff",
    tableRowEven: "#ffffff",

    chipTagBg: "rgba(9,9,11,0.06)",
  },
};

export const darkTokens: ThemeTokens = {
  mode: "dark",
  field: darkFieldPalette,
  borders: {
    inverse: "1px solid rgba(255,255,255,0.08)",
    paper: "1px solid rgba(255,255,255,0.08)",
    hairline: "1px solid rgba(255,255,255,0.07)",
    cell: "none",
    headCell: "1px solid rgba(255,255,255,0.07)",
    dialog: "1px solid rgba(255,255,255,0.1)",
    contained: "none",
    focus: "2px solid rgba(129,140,248,0.6)",
  },
  shadows: {
    appBar: "rgba(0,0,0,0.4)",
    paper: "rgba(0,0,0,0.3)",
    paperSoft: "rgba(0,0,0,0.2)",
    card: "rgba(0,0,0,0.25)",
    cardHover: "rgba(0,0,0,0.4)",
    dialog: "rgba(0,0,0,0.6)",
    dialogSoft: "rgba(0,0,0,0.35)",
    menu: "0 16px 40px -8px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.35)",
    popup: "rgba(0,0,0,0.55)",
    popupSoft: "rgba(0,0,0,0.3)",
    fab: "rgba(0,0,0,0.45)",
    fabHover: "rgba(0,0,0,0.55)",
    button: "rgba(0,0,0,0.4)",
    chip: "rgba(0,0,0,0.3)",
  },
  colors: {
    canvas: "#09090b",
    surface: "#131316",
    surfaceSunken: "#0f0f12",
    menuSurface: "#18181b",

    inverseBg: "#27272a",
    inverseBgHover: "#3f3f46",
    inverseBgActive: "#52525b",
    onInverse: "#fafafa",
    inverseHover: "rgba(255,255,255,0.12)",
    emphasisBg: "#18181b",
    emphasisBgHover: "#27272a",
    onEmphasis: "#fafafa",
    onEmphasisHover: "#ffffff",
    appBarBg: "#0c0c0e",

    text: "#fafafa",
    textMuted: "#a1a1aa",
    textSubtle: "#71717a",
    textStrong: "#fafafa",
    textButton: "#e4e4e7",
    textOnSunken: "#e4e4e7",
    textOnInverse: "#09090b",

    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.16)",
    borderHairline: "rgba(255,255,255,0.07)",
    borderDivider: "rgba(255,255,255,0.08)",
    borderChip: "rgba(255,255,255,0.14)",

    hover: "rgba(255,255,255,0.06)",
    hoverSoft: "rgba(255,255,255,0.035)",
    hoverStrong: "rgba(255,255,255,0.09)",
    hoverSurface: "rgba(255,255,255,0.035)",
    selected: "rgba(255,255,255,0.09)",
    focusOutline: "rgba(255,255,255,0.3)",
    disabled: "rgba(255,255,255,0.07)",
    disabledText: "rgba(255,255,255,0.3)",

    accent: "#818cf8",
    accentSoft: "rgba(129,140,248,0.13)",
    accentStrong: "#a5b4fc",
    onAccent: "#0b0b1a",
    avatarBg: "rgba(129,140,248,0.16)",
    iconColor: "#a1a1aa",
    chipBgHover: "rgba(255,255,255,0.1)",
    chipOutlinedText: "#d4d4d8",

    primary: "#fafafa",
    onPrimary: "#09090b",
    primaryHover: "#e4e4e7",
    primaryActive: "#d4d4d8",
    primarySoft: "#e4e4e7",
    primaryDeep: "#a1a1aa",
    secondaryMain: "#18181b",
    secondarySoft: "#27272a",
    secondaryDeep: "#09090b",
    secondaryOn: "#fafafa",
    divider: "rgba(255,255,255,0.08)",
    actionHover: "rgba(255,255,255,0.06)",
    actionSelected: "rgba(255,255,255,0.09)",
    actionDisabled: "rgba(255,255,255,0.3)",
    actionDisabledBg: "rgba(255,255,255,0.07)",

    error: "#f87171",
    errorLight: "#fca5a5",
    errorDark: "#dc2626",
    errorSoft: "rgba(248,113,113,0.12)",
    warning: "#fbbf24",
    warningLight: "#fcd34d",
    warningDark: "#d97706",
    warningSoft: "rgba(251,191,36,0.12)",
    info: "#38bdf8",
    infoLight: "#7dd3fc",
    infoDark: "#0284c7",
    infoSoft: "rgba(56,189,248,0.12)",
    success: "#4ade80",
    successLight: "#86efac",
    successDark: "#16a34a",
    successSoft: "rgba(74,222,128,0.12)",

    tableHeadBg: "#0f0f12",
    tableHeadText: "#a1a1aa",
    tableRowOdd: "#131316",
    tableRowEven: "#131316",

    chipTagBg: "rgba(255,255,255,0.09)",
  },
};

