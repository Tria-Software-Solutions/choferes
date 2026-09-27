import { SxProps, Theme } from "@mui/material";

// The field look (10px radius, subtle fill, focus ring, typography and
// placeholder) is defined once in the theme — `src/theme/fieldStyles.ts` — so
// every input in the app matches the settings form. This only adds the spacing
// convention of that form.
export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => ({
  mb: 2.5,
  ...customSx,
});
