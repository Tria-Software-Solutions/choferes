import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { SxProps, Theme } from '@mui/material/styles';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'InputProps'> {
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  InputProps?: TextFieldProps['InputProps'];
  sx?: SxProps<Theme>;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
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
          <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {icon}
          </InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {endAdornment}
          </InputAdornment>
        ) : undefined,
        ...InputProps,
      }}
      sx={{
        mb: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
            borderWidth: 2,
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            outline: 'none',
            boxShadow: 'none',
          },
          '& input': {
            outline: 'none',
            boxShadow: 'none',
          },
        },
        ...sx,
      }}
    />
  );
};

export default CustomTextField; 