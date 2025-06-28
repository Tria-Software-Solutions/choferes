import React, { useState, useCallback, useEffect } from 'react';
import {
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Switch,
  OutlinedInput,
  Button,
  useTheme,
} from '@mui/material';
import { Schedule } from '../../models/Schedule';
import { DAYS_LIST } from '../../constants/constants';
import { translateDayOptionsToSpanish } from '../../utils/string';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface AddScheduleFormProps {
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddScheduleForm: React.FC<AddScheduleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<{
    label: string;
    days: string[];
    hours: string;
    specialSchedule: boolean;
  }>({
    label: "",
    days: [],
    hours: "",
    specialSchedule: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const validateFields = useCallback((fields: typeof formData) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      time: /^[0-9]+$/,
    };

    const isLabelValid = fields.label.trim().length > 0 && regex.text.test(fields.label);
    const isHoursValid = fields.hours.length > 0 && regex.time.test(fields.hours) && 
                        parseInt(fields.hours) > 0 && parseInt(fields.hours) <= 24;
    const isDaysValid = fields.days.length > 0;

    return isLabelValid && isHoursValid && isDaysValid;
  }, []);

  useEffect(() => {
    setIsFormValid(validateFields(formData));
  }, [formData, validateFields]);

  const handleSubmit = () => {
    if (isFormValid) {
      const newSchedule: Omit<Schedule, 'id'> = {
        label: formData.label,
        days: formData.days,
        hours: parseInt(formData.hours, 10),
        specialSchedule: formData.specialSchedule,
      };
      onSubmit(newSchedule);
    }
  };

  const handleClearForm = () => {
    setFormData({ label: "", days: [], hours: "", specialSchedule: false });
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* Nombre del Horario */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nombre del Horario"
            variant="outlined"
            fullWidth
            placeholder="Ej: Lugar"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            error={formData.label.length > 0 && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/.test(formData.label)}
            helperText={
              formData.label.length > 0 && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/.test(formData.label)
                ? "Solo se permiten letras, espacios y guiones"
                : ""
            }
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  📋
                </Box>
              ),
            }}
          />
        </Grid>

        {/* Horas de Trabajo */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Horas de Trabajo"
            variant="outlined"
            type="number"
            fullWidth
            placeholder="Ej: 8"
            value={formData.hours}
            onChange={(e) =>
              setFormData({ ...formData, hours: e.target.value })
            }
            error={formData.hours.length > 0 && (!/^[0-9]+$/.test(formData.hours) || parseInt(formData.hours) <= 0 || parseInt(formData.hours) > 24)}
            helperText={
              formData.hours.length > 0 && (!/^[0-9]+$/.test(formData.hours) || parseInt(formData.hours) <= 0 || parseInt(formData.hours) > 24)
                ? "Ingrese un número válido entre 1 y 24"
                : ""
            }
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  ⏰
                </Box>
              ),
              endAdornment: (
                <Box sx={{ ml: 1, color: theme.palette.text.secondary }}>
                  horas
                </Box>
              ),
            }}
          />
        </Grid>

        {/* Días de la Semana */}
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Días de Trabajo</InputLabel>
            <Select
              multiple
              label="Días de Trabajo"
              value={formData.days}
              input={<OutlinedInput label="Días de Trabajo" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Box
                      key={value}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {translateDayOptionsToSpanish(value)}
                    </Box>
                  ))}
                </Box>
              )}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days: Array.isArray(e.target.value)
                    ? e.target.value
                    : [e.target.value],
                })
              }
              error={formData.days.length === 0}
            >
              {DAYS_LIST.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox
                    checked={formData.days.includes(option.value)}
                  />
                  <ListItemText 
                    primary={option.label}
                    primaryTypographyProps={{
                      sx: { fontWeight: 500 }
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
            {formData.days.length === 0 && (
              <Typography variant="caption" sx={{ 
                mt: 0.5, 
                display: 'block',
                color: theme.palette.error.main,
              }}>
                Seleccione al menos un día
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Horario Especial */}
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
            <Box sx={{ mr: 2, color: theme.palette.warning.main }}>
              ⚠️
            </Box>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.specialSchedule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialSchedule: e.target.checked,
                      })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}>
                      Horario Especial
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: theme.palette.text.secondary,
                    }}>
                      Marque esta opción si es un horario con condiciones especiales
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
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
                disabled={!isFormValid || isLoading}
                startIcon={<PostAddRoundedIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                {isLoading ? 'Creando...' : 'Crear Horario'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddScheduleForm; 