import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import OutlinedInput from '@mui/material/OutlinedInput';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Role } from "../../models/Role";
import {
  validateName,
  validateEmail,
  validateUsername,
  validatePassword
} from '../../utils/userValidation';
import CustomTextField from '../Textfield/CustomTextField';

interface AddUserFormProps {
  onSubmit: (user: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    username: string; 
    password: string; 
    roleName: string; 
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  roles: Role[];
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  roles,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!value.trim()) {
      return "Este campo es requerido";
    }
    
    switch (name) {
      case "firstName":
      case "lastName":
        if (!nameRegex.test(value)) {
          return "Solo se permiten letras, espacios y guiones";
        }
        if (value.trim().length < 2) {
          return "Mínimo 2 caracteres";
        }
        if (value.trim().length > 50) {
          return "Máximo 50 caracteres";
        }
        break;
      case "email":
        if (!emailRegex.test(value)) {
          return "Email inválido";
        }
        break;
      case "username":
        if (!usernameRegex.test(value)) {
          return "Solo se permiten letras, números, puntos, guiones y guiones bajos";
        }
        if (value.trim().length < 3) {
          return "Mínimo 3 caracteres";
        }
        if (value.trim().length > 30) {
          return "Máximo 30 caracteres";
        }
        break;
      case "password":
        if (!passwordRegex.test(value)) {
          return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
        }
        break;
      case "roleName":
        if (!value.trim()) {
          return "Debe seleccionar un rol";
        }
        break;
    }
    
    return "";
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.roleName.trim() !== "" &&
      errors.firstName === "" &&
      errors.lastName === "" &&
      errors.email === "" &&
      errors.username === "" &&
      errors.password === "" &&
      errors.roleName === ""
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        roleName: formData.roleName.trim(),
      });
    }
  };

  const handleClearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleName: "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleName: "",
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Nombre"
            variant="outlined"
            fullWidth
            placeholder="Ej: Juan Carlos"
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<PersonOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Apellido"
            variant="outlined"
            fullWidth
            placeholder="Ej: Pérez González"
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<PersonOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Email"
            variant="outlined"
            fullWidth
            placeholder="Ej: juan.perez@empresa.com"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<EmailOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Nombre de Usuario"
            variant="outlined"
            fullWidth
            placeholder="Ej: juan.perez"
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            error={errors.username !== ""}
            helperText={errors.username}
            icon={<PersonOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password !== ""}
            helperText={errors.password}
            icon={<LockOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={errors.roleName !== ""} sx={{ marginTop: '8px',
            '& .MuiOutlinedInput-root, & .MuiSelect-select': {
              backgroundColor: '#fff',
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
                borderWidth: 2,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
              },
              '&.Mui-focused': {
                backgroundColor: '#fff',
                outline: 'none',
                boxShadow: 'none',
              },
            },
          }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.roleName}
              label="Rol"
              onChange={(e) => handleFieldChange("roleName", e.target.value)}
              input={
                <OutlinedInput
                  label="Rol"
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  }
                />
              }
              sx={{
                "& .MuiSelect-select": {
                  paddingLeft: "14px",
                  paddingRight: "14px",
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            {errors.roleName && (
              <Box sx={{ color: theme.palette.error.main, fontSize: '0.75rem', mt: 0.5 }}>
                {errors.roleName}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }} />
            </Box>
            <Box>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}>
                Información del Usuario
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
              }}>
                Completa todos los campos para crear un nuevo usuario. La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: { xs: 1, sm: 2 },
              pt: 2,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                order: { xs: 3, sm: 1 },
              }}
            >
              Limpiar
            </Button>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
              }}
            >
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                  fontWeight: 600,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                {isLoading ? 'Creando...' : 'Agregar'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm; 