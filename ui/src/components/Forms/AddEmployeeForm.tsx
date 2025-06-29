import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface AddEmployeeFormProps {
  onSubmit: (employee: { firstName: string; lastName: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });

  const validateField = (name: string, value: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
    
    if (!value.trim()) {
      return "Este campo es requerido";
    }
    
    if (!nameRegex.test(value)) {
      return "Solo se permiten letras, espacios y guiones";
    }
    
    if (value.trim().length < 2) {
      return "Mínimo 2 caracteres";
    }
    
    if (value.trim().length > 50) {
      return "Máximo 50 caracteres";
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
      errors.firstName === "" &&
      errors.lastName === ""
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });
    }
  };

  const handleClearForm = () => {
    setFormData({ firstName: "", lastName: "" });
    setErrors({ firstName: "", lastName: "" });
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
              ℹ️
            </Box>
            <Box>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}>
                Información del Empleado
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
              }}>
                Ingresa el nombre completo del empleado. Solo se permiten letras, espacios y guiones.
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
                startIcon={<PostAddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                  fontWeight: 600,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                {isLoading ? 'Creando...' : (isSmallScreen ? 'Crear' : 'Crear Empleado')}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEmployeeForm; 