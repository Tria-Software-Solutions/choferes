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
} from "@mui/material";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Role } from "../../models/Role";

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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
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
          return "Formato de email inválido";
        }
        break;
      
      case "username":
        if (!usernameRegex.test(value)) {
          return "Debe empezar con letra y contener solo letras, números, puntos y guiones bajos";
        }
        break;
      
      case "password":
        if (!passwordRegex.test(value)) {
          return "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
        }
        break;
      
      case "roleName":
        if (!nameRegex.test(value)) {
          return "Solo se permiten letras, espacios y guiones";
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
        password: formData.password,
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
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            placeholder="Ej: Juan Carlos"
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  👤
                </Box>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Apellido"
            variant="outlined"
            fullWidth
            placeholder="Ej: Pérez González"
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  👤
                </Box>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            placeholder="Ej: juan.perez@empresa.com"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  📧
                </Box>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Nombre de Usuario"
            variant="outlined"
            fullWidth
            placeholder="Ej: juan.perez"
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            error={errors.username !== ""}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  🔑
                </Box>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password !== ""}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  🔒
                </Box>
              ),
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
          <FormControl fullWidth error={errors.roleName !== ""} sx={{ mt: 0 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.roleName}
              label="Rol"
              onChange={(e) => handleFieldChange("roleName", e.target.value)}
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
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: 2, color: theme.palette.info.main }}>
              ℹ️
            </Box>
            <Box>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}>
                Información del Usuario
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
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
              justifyContent: 'space-between',
              gap: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
            >
              Limpiar
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<PostAddRoundedIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm; 