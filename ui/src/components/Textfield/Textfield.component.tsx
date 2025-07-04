import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { SxProps, Theme } from "@mui/material/styles";
import { textFieldStyles, inputAdornmentStyles } from "./Textfield.styles";

// CustomTextField component wraps MUI TextField with optional start/end adornments (icons/buttons).
// Props:
// - icon: element to show at the start
// - endAdornment: element to show at the end
// - InputProps: additional input props
// - sx: custom styles

interface CustomTextFieldProps extends Omit<TextFieldProps, "InputProps"> {
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  InputProps?: TextFieldProps["InputProps"];
  sx?: SxProps<Theme>;
}

const TextfieldComponent: React.FC<CustomTextFieldProps> = ({
  icon,
  endAdornment,
  sx,
  InputProps,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      {...props}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment
            position="start"
            sx={inputAdornmentStyles}
          >
            {icon}
          </InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment
            position="end"
            sx={inputAdornmentStyles}
          >
            {endAdornment}
          </InputAdornment>
        ) : undefined,
        ...InputProps,
      }}
      sx={textFieldStyles(sx ?? {})}
    />
  );
};

export default TextfieldComponent;
