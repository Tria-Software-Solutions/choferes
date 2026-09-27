// Static (non-floating) field labels.
//
// By default MUI positions `InputLabel` absolutely inside the control and
// animates its transform: it sits inside the field until the control is
// focused/filled, then it jumps to the outline notch. These helpers pin the
// label above the field so it never moves, and are shared by every theme and
// component style in this app.

export const STATIC_LABEL_FONT_SIZE = "0.75rem";

export const STATIC_LABEL_SPACING = "6px";

/**
 * Neutralizes the floating-label behavior. It has to win over MUI's
 * `MuiInputLabel` `props` variants (`outlined`, `sizeSmall`, `shrink`,
 * `filled`), which set `position`, `transform` and `maxWidth` with the same
 * specificity but are injected before the theme `styleOverrides`.
 */
export const staticLabelBase = {
  position: "static" as const,
  left: "auto",
  top: "auto",
  transform: "none",
  transformOrigin: "unset" as const,
  transition: "none",
  maxWidth: "100%",
  margin: 0,
  marginBottom: STATIC_LABEL_SPACING,
  display: "block",
  pointerEvents: "auto" as const,
  userSelect: "none" as const,
  fontSize: STATIC_LABEL_FONT_SIZE,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: "0.01em",
  color: "#6b7280",
};

interface StaticLabelColors {
  /** Resting color. */
  color: string;
  /** Focus color. Defaults to `color` (focus only changes color, never position). */
  focusedColor?: string;
  /** Invalid state color. */
  errorColor?: string;
  /** Disabled state color. */
  disabledColor?: string;
}

/**
 * Builds the label style override for a theme slot (`MuiInputLabel.root`,
 * `MuiFormControl.root > & .MuiInputLabel-root`, ...) or an `sx` prop.
 */
export const staticLabelStyles = ({
  color,
  focusedColor,
  errorColor,
  disabledColor,
}: StaticLabelColors) => ({
  ...staticLabelBase,
  color,
  "&.Mui-focused": { color: focusedColor ?? color },
  ...(errorColor ? { "&.Mui-error": { color: errorColor } } : {}),
  ...(disabledColor ? { "&.Mui-disabled": { color: disabledColor } } : {}),
});
