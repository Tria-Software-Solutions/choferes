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
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import { Schedule } from '../../models/Schedule';
import { DAYS_LIST } from '../../constants/constants';
import { translateDayOptionsToSpanish } from '../../utils/string';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CustomTextField from '../Textfield/CustomTextField';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
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
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Nombre del Horario"
            variant="outlined"
            fullWidth
            placeholder="Ej: Horario Matutino"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            icon={<CalendarMonthOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
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
            icon={<AccessTimeOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
            endAdornment={
              <Box sx={{ ml: 1, color: theme.palette.text.secondary }}>
                horas
              </Box>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth sx={{
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
            <InputLabel>Días de Trabajo</InputLabel>
            <Select
              multiple
              label="Días de Trabajo"
              value={formData.days}
              input={
                <OutlinedInput
                  label="Días de Trabajo"
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarMonthOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  }
                />
              }
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
                        fontSize: 'clamp(0.625rem, 1vw, 0.75rem)',
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
                      sx: { 
                        fontWeight: 500,
                        fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                      }
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
                fontSize: 'clamp(0.625rem, 1vw, 0.75rem)',
              }}>
                Seleccione al menos un día
              </Typography>
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
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.warning.main }}>
              <WarningAmberOutlinedIcon sx={{ color: theme.palette.warning.main, mr: { xs: 1, sm: 2 } }} />
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
                      fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    }}>
                      Horario Especial
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: theme.palette.text.secondary,
                      fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                    }}>
                      Marque esta opción si es un horario con condiciones especiales
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
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
                disabled={!isFormValid || isLoading}
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
                {isLoading ? 'Agregando...' : 'Agregar'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddScheduleForm; 