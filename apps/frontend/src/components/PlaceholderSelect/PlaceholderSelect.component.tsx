import React, { ReactNode } from "react";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Select,
  SelectProps,
  SxProps,
  Theme,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconChevronDown } from "@tabler/icons-react";

// Select that follows the field convention of "Configuraciones": the theme
// renders `InputLabel` statically above the control, so a `label` here lines up
// exactly with the `Textfield` / `DatePicker` next to it. Without a `label` the
// select becomes a compact filter whose hint lives in the empty state; never mix
// both styles inside the same row or the inputs will not line up.

/**
 * Turns a stored value into the text shown inside the closed field. Selects
 * usually store machine values ("cajero", "llamada_de_atencion"), so without
 * this the field would display the raw slug while the option list shows a
 * proper label. Non-string values (years, numbers, "A1" codes) are returned
 * untouched.
 */
export const humanizeSelectValue = (value: unknown): string => {
  if (typeof value !== "string") return String(value);
  const text = value.replace(/[_-]+/g, " ").trim();
  if (!text) return text;
  // Already capitalized / all caps codes such as "A1" stay as they are.
  if (text !== text.toLowerCase()) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface PlaceholderSelectProps<T> extends Omit<SelectProps<T>, "label" | "renderValue" | "input"> {
  /** Hint rendered while nothing is selected. */
  placeholder: string;
  /** Visible label above the field (also its accessible name). */
  label?: string;
  /** Leading icon, rendered as a start adornment. */
  icon?: ReactNode;
  /** Options; usually a list of `MenuItem`. */
  children?: ReactNode;
  /** How the selected value is shown in the field (defaults to the humanized value). */
  formatValue?: (value: T) => ReactNode;
  sx?: SxProps<Theme>;
}

const PlaceholderSelect = <T,>({
  placeholder,
  label,
  icon,
  children,
  sx,
  formatValue,
  ...selectProps
}: PlaceholderSelectProps<T>) => {
  const theme = useTheme();

  return (
    <FormControl fullWidth size="small" sx={sx}>
      {label && <InputLabel shrink>{label}</InputLabel>}
      <Select<T>
        displayEmpty
        input={
          <OutlinedInput
            placeholder={placeholder}
            startAdornment={
              icon ? (
                <InputAdornment position="start">
                  <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>
                </InputAdornment>
              ) : undefined
            }
          />
        }
        renderValue={(selected) =>
          selected === "" || selected === null || selected === undefined ? (
            <Box
              component="span"
              sx={{ color: "text.secondary", opacity: 0.6, fontSize: "0.875rem" }}
            >
              {placeholder}
            </Box>
          ) : formatValue ? (
            formatValue(selected)
          ) : (
            humanizeSelectValue(selected)
          )
        }
        IconComponent={() => (
          <Box
            sx={{
              position: "absolute",
              right: 12,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              color: theme.palette.text.secondary,
            }}
          >
            <IconChevronDown size={18} />
          </Box>
        )}
        inputProps={{ "aria-label": label ?? placeholder }}
        {...selectProps}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default PlaceholderSelect;
