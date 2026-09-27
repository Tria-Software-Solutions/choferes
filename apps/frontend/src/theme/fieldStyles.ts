// Canonical field (input) styling.
//
// The look defined here is the one used by the "Configuraciones" page
// (`src/components/Textfield`), promoted to the theme so that every input in
// the app — TextField, Select, DatePicker, Autocomplete, table filters, native
// `type="date"` fields — renders identically: 10px radius, subtle translucent
// fill instead of a border, focus ring, and the same typography/placeholder.

export interface FieldPalette {
  /** Resting fill of the field. */
  fill: string;
  fillHover: string;
  fillFocus: string;
  fillError: string;
  fillDisabled: string;
  /** 1px outline in each state. */
  border: string;
  borderHover: string;
  borderFocus: string;
  borderError: string;
  /** Focus / error rings. */
  ringFocus: string;
  ringError: string;
  /** Text and placeholder colors. */
  text: string;
  placeholder: string;
  placeholderOpacity: number;
  helperText: string;
  errorText: string;
  disabledText: string;
}

export const lightFieldPalette: FieldPalette = {
  fill: "#ffffff",
  fillHover: "#ffffff",
  fillFocus: "#ffffff",
  fillError: "#ffffff",
  fillDisabled: "rgba(9,9,11,0.03)",
  border: "rgba(9,9,11,0.12)",
  borderHover: "rgba(9,9,11,0.24)",
  borderFocus: "#4f46e5",
  borderError: "#dc2626",
  ringFocus: "0 0 0 3px rgba(79,70,229,0.14)",
  ringError: "0 0 0 3px rgba(220,38,38,0.12)",
  text: "#09090b",
  placeholder: "#a1a1aa",
  placeholderOpacity: 1,
  helperText: "#71717a",
  errorText: "#dc2626",
  disabledText: "#a1a1aa",
};

export const darkFieldPalette: FieldPalette = {
  fill: "rgba(255,255,255,0.025)",
  fillHover: "rgba(255,255,255,0.035)",
  fillFocus: "rgba(255,255,255,0.035)",
  fillError: "rgba(248,113,113,0.05)",
  fillDisabled: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.1)",
  borderHover: "rgba(255,255,255,0.2)",
  borderFocus: "#818cf8",
  borderError: "#f87171",
  ringFocus: "0 0 0 3px rgba(129,140,248,0.2)",
  ringError: "0 0 0 3px rgba(248,113,113,0.18)",
  text: "#fafafa",
  placeholder: "#71717a",
  placeholderOpacity: 1,
  helperText: "#a1a1aa",
  errorText: "#f87171",
  disabledText: "#52525b",
};

export const FIELD_BORDER_RADIUS = "10px";
export const FIELD_MIN_HEIGHT = "40px";
export const FIELD_FONT_SIZE = "0.9375rem";

/**
 * Field container: fill, radius, states and adornment placement. Attach it to
 * the `MuiOutlinedInput.root` style override.
 */
export const inputRootStyles = (colors: FieldPalette) => ({
  borderRadius: FIELD_BORDER_RADIUS,
  minHeight: FIELD_MIN_HEIGHT,
  backgroundColor: colors.fill,
  color: colors.text,
  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
  "& fieldset": {
    border: `1px solid ${colors.border}`,
    borderRadius: FIELD_BORDER_RADIUS,
    transition: "border-color 0.15s ease",
  },
  "&:hover": {
    backgroundColor: colors.fillHover,
  },
  "&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) fieldset": {
    borderColor: colors.borderHover,
  },
  "&.Mui-focused": {
    backgroundColor: colors.fillFocus,
    boxShadow: colors.ringFocus,
  },
  "&.Mui-focused fieldset": {
    borderColor: colors.borderFocus,
    borderWidth: "1px",
  },
  "&.Mui-error": {
    backgroundColor: colors.fillError,
  },
  "&.Mui-error fieldset": {
    borderColor: colors.borderError,
  },
  "&.Mui-error.Mui-focused": {
    boxShadow: colors.ringError,
  },
  "&.Mui-disabled": {
    backgroundColor: colors.fillDisabled,
  },
  "&.Mui-disabled fieldset": {
    borderColor: colors.border,
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 100px ${colors.fill} inset`,
    WebkitTextFillColor: colors.text,
    borderRadius: FIELD_BORDER_RADIUS,
    transition: "background-color 5000s ease-in-out 0s",
    caretColor: colors.text,
  },
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: `0 0 0 100px ${colors.fillFocus} inset`,
    WebkitTextFillColor: colors.text,
  },
});

/**
 * The control element itself (input/textarea): typography, padding and the
 * placeholder treatment. Attach it to the `MuiOutlinedInput.root` style
 * override so it also covers multiline fields and adorned variants.
 */
export const inputControlStyles = (colors: FieldPalette) => ({
  "& input": {
    color: colors.text,
    fontSize: FIELD_FONT_SIZE,
    fontWeight: 400,
    paddingTop: "11px",
    paddingBottom: "11px",
    paddingLeft: "14px",
    paddingRight: "14px",
    "&::placeholder": {
      color: colors.placeholder,
      opacity: colors.placeholderOpacity,
      fontWeight: 400,
      fontSize: FIELD_FONT_SIZE,
    },
    "&:disabled": {
      color: colors.disabledText,
    },
  },
  "& textarea": {
    color: colors.text,
    fontSize: FIELD_FONT_SIZE,
    fontWeight: 400,
    paddingTop: "11px",
    paddingBottom: "11px",
    paddingLeft: "14px",
    paddingRight: "14px",
    lineHeight: 1.6,
    "&::placeholder": {
      color: colors.placeholder,
      opacity: colors.placeholderOpacity,
      fontSize: FIELD_FONT_SIZE,
    },
    "&:disabled": {
      color: colors.disabledText,
    },
  },
  "&.MuiInputBase-multiline .MuiInputBase-input": {
    paddingTop: "11px",
    paddingBottom: "11px",
  },
  "&.MuiInputBase-adornedStart input": {
    paddingLeft: "36px",
    paddingRight: "14px",
  },
  "&.MuiInputBase-adornedStart textarea": {
    paddingLeft: "36px",
    paddingRight: "14px",
    paddingTop: "11px",
  },
  "&.MuiInputBase-adornedEnd input": {
    paddingLeft: "14px",
    paddingRight: "40px",
  },
  "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
    paddingLeft: "36px",
    paddingRight: "40px",
  },
  // Selects render a div instead of an input; same room for the leading icon.
  "&.MuiInputBase-adornedStart .MuiSelect-select": {
    paddingLeft: "40px",
  },
});

/**
 * Leading/trailing adornments are absolutely positioned so the fill keeps a
 * single rounded surface. Attach to `MuiOutlinedInput.root`.
 */
export const inputAdornmentStyles = (colors: FieldPalette) => ({
  "& .MuiInputAdornment-root": {
    color: colors.placeholder,
  },
  "& .MuiInputAdornment-positionStart": {
    position: "absolute",
    left: "12px",
    marginRight: 0,
    zIndex: 2,
    top: "50%",
    transform: "translateY(-50%)",
    "& svg": { fontSize: "18px !important" },
  },
  "&.MuiInputBase-multiline .MuiInputAdornment-positionStart": {
    top: "22px",
    transform: "none",
  },
  "& .MuiInputAdornment-positionEnd": {
    position: "absolute",
    right: "10px",
    marginLeft: 0,
    zIndex: 2,
    pointerEvents: "auto",
  },
});

/** Helper/validation text under a field. Attach to `MuiFormHelperText.root`. */
export const helperTextStyles = (colors: FieldPalette) => ({
  margin: 0,
  marginTop: "6px",
  padding: 0,
  fontSize: "0.75rem",
  fontWeight: 500,
  color: colors.helperText,
  "&.Mui-error": {
    color: colors.errorText,
  },
});
