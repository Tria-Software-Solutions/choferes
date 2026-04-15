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
// - validateField: function to validate the field value

interface CustomTextFieldProps extends Omit<TextFieldProps, "InputProps"> {
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  InputProps?: TextFieldProps["InputProps"];
  sx?: SxProps<Theme>;
  validateField?: (name: string, value: string | string[] | boolean) => boolean;
}

const TextfieldComponent: React.FC<CustomTextFieldProps> = ({
  icon,
  endAdornment,
  sx,
  InputProps,
  validateField,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (validateField && props.name) {
      validateField(props.name, e.target.value);
    }
    // If there's an onChange prop, call it
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <TextField
      variant="outlined"
      fullWidth
      {...props}
      onChange={handleChange}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment position="start" sx={inputAdornmentStyles}>
            {icon}
          </InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          // Check if endAdornment is already an InputAdornment by checking its type
          React.isValidElement(endAdornment) && (endAdornment as any).type?.displayName === 'InputAdornment' 
            ? endAdornment 
            : (
              <InputAdornment position="end">
                {endAdornment}
              </InputAdornment>
            )
        ) : undefined,
        ...InputProps,
      }}
      sx={textFieldStyles(sx ?? {})}
    />
  );
};

export default TextfieldComponent;
