import { SxProps, Theme } from "@mui/material";

// Los filtros de la toolbar usan el mismo estilo de campo que el resto de la
// app (ver src/theme/fieldStyles.ts); aquí solo se ajusta la altura y el
// espacio para la flecha del select.
const filterFieldStyles = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    color: theme.palette.primary.main,
    fontSize: "24px",
    right: "12px",
    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  "&.Mui-focused .MuiSelect-icon": {
    transform: "rotate(180deg)",
  },
});

export const formControlStyles: SxProps<Theme> = (theme) => ({
  height: 56,
  mb: 1,
  ...filterFieldStyles(theme),
});

export const selectStyles: SxProps<Theme> = (theme) => ({
  ...filterFieldStyles(theme),
  height: 56,
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    paddingRight: "42px !important",
  },
  "& .MuiSelect-select": {
    paddingRight: "42px !important",
  },
});

export const datePickerTextFieldStyles: SxProps<Theme> = (theme) => ({
  ...filterFieldStyles(theme),
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    "& input": {
      color: theme.palette.text.primary,
      outline: "none",
      boxShadow: "none",
    },
  },
});

// Inline edit text fields: neutral focus (no colored underline/glow)
// Usa selectores top-level (NO bajo "& .MuiOutlinedInput-root") porque
// textFieldStyles hace un spread shallow de customSx: anidar bajo esa clave
// reemplazaría todo el objeto root base (bordes, paddings, etc).
export const inlineEditTextfieldSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root::after": { display: "none" },
  "& .MuiOutlinedInput-root.Mui-focused": {
    boxShadow: "none",
  },
};

// Body cell: hairline row separator, no vertical grid (see theme MuiTableCell).
export const tableCellStyles: SxProps<Theme> = (theme) => ({
  borderBottom: theme.tokens.borders.hairline,
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: theme.tokens.colors.textOnSunken,
});

// Permission chip (roles table)
export const permissionChipStyles = (theme: Theme): SxProps<Theme> => ({
  fontWeight: 600,
  color: theme.tokens.colors.text,
  backgroundColor: theme.tokens.colors.chipTagBg,
  px: 1,
  py: 0.25,
  borderRadius: "6px",
  fontSize: "0.75rem",
  mb: 0.5,
  display: "inline-flex",
  alignItems: "center",
});

export const viewMoreLessStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  cursor: "pointer",
  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
  textDecoration: "underline",
  "&:hover": {
    textDecoration: "none",
  },
  display: "flex",
  alignItems: "center",
  height: "28px",
  mt: 1,
});

export const emailLinkStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
});

// Sticky head cell: quiet sunken strip with small uppercase labels.
export const tableHeadCellStyles = (theme: Theme, topOffset: number | string = 0): SxProps<Theme> => ({
  position: "sticky",
  top: topOffset,
  zIndex: 10,
  backgroundColor: theme.tokens.colors.tableHeadBg,
  color: theme.tokens.colors.tableHeadText,
  fontWeight: 600,
  fontSize: "0.6875rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "10px 16px",
  whiteSpace: "nowrap",
  borderBottom: theme.tokens.borders.headCell,
});

// Dropdown menu props for multi-select fields (menu look comes from the theme).
export const premiumMenuProps = {
  PaperProps: {
    sx: (theme: Theme) => ({
      maxHeight: 360,
      overflowY: "auto",
      marginTop: "6px",
      "& .MuiMenuItem-root": { gap: "10px" },
      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "transparent",
        fontWeight: 600,
        "&:hover": { backgroundColor: theme.tokens.colors.hover },
      },
      "& .MuiCheckbox-root": { padding: "4px" },
      "& .MuiListItemText-primary": { fontSize: "0.875rem", fontWeight: 500 },
    }),
  },
  anchorOrigin: {
    vertical: "bottom" as const,
    horizontal: "left" as const,
  },
  transformOrigin: {
    vertical: "top" as const,
    horizontal: "left" as const,
  },
};
