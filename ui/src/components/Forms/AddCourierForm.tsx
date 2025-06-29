import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface AddCourierFormProps {
  onSubmit: (courier: {
    driver: string;
    route: string;
    distance: number;
    trackingNumber: string;
    status: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddCourierForm: React.FC<AddCourierFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    driver: '',
    route: '',
    distance: 0,
    trackingNumber: '',
    status: '',
  });

  const [errors, setErrors] = useState({
    driver: '',
    route: '',
    distance: '',
    trackingNumber: '',
    status: '',
  });

  const validateField = useCallback((name: string, value: string | number) => {
    const regex = {
      number: /^\d+$/,
      text: /^(?:[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+|nulo|n\/a)$/i,
    };

    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo es requerido';
    }

    switch (name) {
      case 'driver':
      case 'trackingNumber':
        if (!regex.text.test(value as string)) {
          return 'Solo se permiten letras, espacios y guiones';
        }
        break;
      case 'route':
      case 'status':
        if (!regex.text.test(value as string)) {
          return 'Solo se permiten letras, espacios y guiones';
        }
        break;
      case 'distance':
        if (typeof value === 'number' && value <= 0) {
          return 'La distancia debe ser mayor a 0';
        }
        break;
    }

    return '';
  }, []);

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return (
      formData.driver.trim() !== '' &&
      formData.route.trim() !== '' &&
      formData.distance > 0 &&
      formData.trackingNumber.trim() !== '' &&
      formData.status.trim() !== '' &&
      Object.values(errors).every(error => error === '')
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        driver: formData.driver.trim(),
        route: formData.route.trim(),
        distance: formData.distance,
        trackingNumber: formData.trackingNumber.trim(),
        status: formData.status.trim(),
      });
    }
  };

  const handleClearForm = () => {
    setFormData({
      driver: '',
      route: '',
      distance: 0,
      trackingNumber: '',
      status: '',
    });
    setErrors({
      driver: '',
      route: '',
      distance: '',
      trackingNumber: '',
      status: '',
    });
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Chofer"
            variant="outlined"
            fullWidth
            placeholder="Ej: Juan Pérez"
            value={formData.driver}
            onChange={(e) => handleFieldChange('driver', e.target.value)}
            error={errors.driver !== ''}
            helperText={errors.driver}
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
          <FormControl variant="outlined" fullWidth sx={{ marginTop: '8px' }}>
            <InputLabel>Ruta</InputLabel>
            <Select
              label="Ruta"
              value={formData.route}
              onChange={(e) => handleFieldChange('route', e.target.value)}
              error={errors.route !== ''}
              inputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                    🛣️
                  </Box>
                ),
              }}
            >
              <MenuItem value="GAM">GAM</MenuItem>
              <MenuItem value="GAM Express">GAM Express</MenuItem>
              <MenuItem value="Rural">Rural</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Distancia */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Distancia (km)"
            variant="outlined"
            fullWidth
            type="number"
            placeholder="Ej: 45"
            value={formData.distance}
            onChange={(e) => handleFieldChange('distance', parseInt(e.target.value) || 0)}
            error={errors.distance !== ''}
            helperText={errors.distance}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  📏
                </Box>
              ),
            }}
          />
        </Grid>

        {/* Número de Guía */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Número de Guía"
            variant="outlined"
            fullWidth
            placeholder="Ej: TRK001"
            value={formData.trackingNumber}
            onChange={(e) => handleFieldChange('trackingNumber', e.target.value)}
            error={errors.trackingNumber !== ''}
            helperText={errors.trackingNumber}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  📋
                </Box>
              ),
            }}
          />
        </Grid>

        {/* Estado */}
        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              label="Estado"
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              error={errors.status !== ''}
              inputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                    📊
                  </Box>
                ),
              }}
            >
              <MenuItem value="Despachado">Despachado</MenuItem>
              <MenuItem value="En Tránsito">En Tránsito</MenuItem>
              <MenuItem value="Entregado">Entregado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Información Adicional */}
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
                Información del Servicio de Mensajería
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}>
                Completa todos los campos requeridos para registrar un nuevo servicio de mensajería.
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Botones de Acción */}
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
                  minHeight: 56,
                }}
              >
                {isLoading ? 'Agregando...' : 'Agregar Servicio'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCourierForm; 