import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Grid,
  Card,
  CardContent,
  Switch,
  FormGroup,
  useTheme,
  LinearProgress,
  Avatar,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Employee } from '../../../models/Employee';
import { Schedule } from '../../../models/Schedule';
import {
  autoGenerateModalContainerStyles,
  autoGenerateModalGridContainerStyles,
  autoGenerateModalSectionTitleStyles,
  autoGenerateModalCardStyles,
  autoGenerateModalCardContentStyles,
  autoGenerateModalSubtitleStyles,
  autoGenerateModalFormControlStyles,
  autoGenerateModalTextFieldStyles,
  autoGenerateModalFormGroupStyles,
  autoGenerateModalHelperTextStyles,
  autoGenerateModalWeekPreviewStyles,
  autoGenerateModalEmployeeListStyles,
  autoGenerateModalIndividualHoursStyles,
  autoGenerateModalCustomScheduleStyles,
  autoGenerateModalMetricsContainerStyles,
  autoGenerateModalMetricCardStyles,
  autoGenerateModalMetricValueStyles,
  autoGenerateModalMetricLabelStyles,
  autoGenerateModalProgressBarStyles,
  autoGenerateModalConfigSectionStyles,
  autoGenerateModalEmployeeCardStyles,
  autoGenerateModalSwitchStyles,
  autoGenerateModalChipStyles,
  autoGenerateModalLoadingBoxStyles,
  autoGenerateModalLoadingTextStyles,
} from './AutoGenerateModal.styles';

interface AutoGenerateModalProps {
  onGenerate: (config: AutoGenerateConfig) => Promise<void>;
  onCancel?: () => void;
  employees: Employee[];
  schedules: Schedule[];
  currentWeekStart: Date;
  isLoading?: boolean;
  onConfigChange?: (config: AutoGenerateConfig) => void;
}

export interface AutoGenerateConfig {
  mode: 'uniform' | 'individual';
  uniformHours: number;
  individualHours: Record<number, number>; // employeeId -> hours
  useExistingSchedules: boolean;
  customSchedules: Record<number, number>; // employeeId -> scheduleId
  selectedEmployees: number[]; // employeeIds
  maxHoursPerWeek?: number; // Maximum hours per week (default: 48)
}

const AutoGenerateModal: React.FC<AutoGenerateModalProps> = ({
  onGenerate,
  onCancel,
  employees,
  schedules,
  currentWeekStart,
  isLoading = false,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<AutoGenerateConfig>({
    mode: 'uniform',
    uniformHours: 48,
    individualHours: {},
    useExistingSchedules: true,
    customSchedules: {},
    selectedEmployees: employees.map(emp => emp.id),
    maxHoursPerWeek: 48,
  });

  const theme = useTheme();

  const weekDays = useMemo(() => {
    const days = [];
    let current = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      days.push(addDays(current, i));
    }
    return days;
  }, [currentWeekStart]);

  const handleConfigChange = (field: keyof AutoGenerateConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setConfig(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const handleSelectAllEmployees = () => {
    setConfig(prev => ({
      ...prev,
      selectedEmployees: employees.map(emp => emp.id)
    }));
  };

  const handleClearAllEmployees = () => {
    setConfig(prev => ({
      ...prev,
      selectedEmployees: []
    }));
  };

  const handleIndividualHoursChange = (employeeId: number, hours: number) => {
    const maxLimit = config.maxHoursPerWeek || 48;
    const clampedValue = Math.max(0, Math.min(maxLimit, hours));
    
    setConfig(prev => ({
      ...prev,
      individualHours: {
        ...prev.individualHours,
        [employeeId]: clampedValue
      }
    }));
  };

  const handleCustomScheduleChange = (employeeId: number, scheduleId: number) => {
    setConfig(prev => ({
      ...prev,
      customSchedules: {
        ...prev.customSchedules,
        [employeeId]: scheduleId
      }
    }));
  };

  // Notify parent component of config changes
  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Auto-adjust uniform hours if they exceed the new max limit
  useEffect(() => {
    if (config.mode === 'uniform' && config.uniformHours > (config.maxHoursPerWeek || 48)) {
      setConfig(prev => ({
        ...prev,
        uniformHours: config.maxHoursPerWeek || 48
      }));
    }
  }, [config.maxHoursPerWeek, config.mode, config.uniformHours]);

  // Auto-adjust individual hours if they exceed the new max limit
  useEffect(() => {
    if (config.mode === 'individual') {
      const maxLimit = config.maxHoursPerWeek || 48;
      const adjustedIndividualHours = { ...config.individualHours };
      let hasChanges = false;

      Object.keys(adjustedIndividualHours).forEach(employeeId => {
        const currentHours = adjustedIndividualHours[Number(employeeId)];
        if (currentHours > maxLimit) {
          adjustedIndividualHours[Number(employeeId)] = maxLimit;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setConfig(prev => ({
          ...prev,
          individualHours: adjustedIndividualHours
        }));
      }
    }
  }, [config.maxHoursPerWeek, config.mode, config.individualHours]);



  const selectedEmployeesList = employees.filter(emp => 
    config.selectedEmployees.includes(emp.id)
  );

  const totalEmployees = selectedEmployeesList.length;
  const totalHours = config.mode === 'uniform' 
    ? config.uniformHours * totalEmployees
    : Object.values(config.individualHours).reduce((sum, hours) => sum + hours, 0);
  
  // Dashboard metrics
  const averageHours = totalEmployees > 0 ? Math.round(totalHours / totalEmployees) : 0;
  const completionPercentage = totalEmployees > 0 ? (totalEmployees / employees.length) * 100 : 0;
  const scheduleUtilization = totalEmployees > 0 ? (config.selectedEmployees.filter(id => 
    config.customSchedules[id] || config.useExistingSchedules
  ).length / totalEmployees) * 100 : 0;

  return (
    <Box
      sx={{
        ...autoGenerateModalContainerStyles,
        pb: 0,
      }}
    >
      {/* Dashboard Metrics */}
      <Box sx={autoGenerateModalMetricsContainerStyles}>
        <Box sx={autoGenerateModalMetricCardStyles(theme)}>
          <Typography sx={autoGenerateModalMetricValueStyles(theme)}>
            {totalEmployees}
          </Typography>
          <Typography sx={autoGenerateModalMetricLabelStyles}>
            Empleados Seleccionados
          </Typography>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={autoGenerateModalProgressBarStyles(theme)}
          />
        </Box>

        <Box sx={autoGenerateModalMetricCardStyles(theme)}>
          <Typography sx={autoGenerateModalMetricValueStyles(theme)}>
            {totalHours}h
          </Typography>
          <Typography sx={autoGenerateModalMetricLabelStyles}>
            Horas Totales
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((totalHours / (totalEmployees * 40)) * 100, 100)}
            sx={autoGenerateModalProgressBarStyles(theme)}
          />
        </Box>

        <Box sx={autoGenerateModalMetricCardStyles(theme)}>
          <Typography sx={autoGenerateModalMetricValueStyles(theme)}>
            {averageHours}h
          </Typography>
          <Typography sx={autoGenerateModalMetricLabelStyles}>
            Promedio por Empleado
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((averageHours / 40) * 100, 100)}
            sx={autoGenerateModalProgressBarStyles(theme)}
          />
        </Box>

        <Box sx={autoGenerateModalMetricCardStyles(theme)}>
          <Typography sx={autoGenerateModalMetricValueStyles(theme)}>
            {Math.round(scheduleUtilization)}%
          </Typography>
          <Typography sx={autoGenerateModalMetricLabelStyles}>
            Utilización de Horarios
          </Typography>
          <LinearProgress
            variant="determinate"
            value={scheduleUtilization}
            sx={autoGenerateModalProgressBarStyles(theme)}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3, mb: 2 }} />

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={autoGenerateModalLoadingBoxStyles}>
          <CircularProgress 
            size={80} 
            thickness={4}
            sx={{
              color: (theme) => theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Typography sx={autoGenerateModalLoadingTextStyles}>
            Procesando generación de horas...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              fontSize: '0.9rem',
              opacity: 0.8,
            }}
          >
            Esto puede tomar unos segundos
          </Typography>
        </Box>
      )}

      {!isLoading && (
        <Grid container sx={{
          ...autoGenerateModalGridContainerStyles,
          width: '100%',
          minWidth: { xs: '100%', sm: '900px' }
        }}>
        {/* Left Column - Configuration */}
        <Grid item xs={12} lg={5.9} sx={{ minWidth: { xs: '100%', sm: '450px' } }}>
          <Typography
            variant="h6"
            sx={autoGenerateModalSectionTitleStyles(theme)}
          >
            <SettingsIcon />
            Configuración
          </Typography>

          {/* Hours Mode */}
          <Card sx={{
            ...autoGenerateModalCardStyles(theme),
            width: '100%',
            minWidth: { xs: '100%', sm: '450px' }
          }}>
            <CardContent sx={autoGenerateModalCardContentStyles}>
              <Typography
                variant="subtitle1"
                sx={autoGenerateModalSubtitleStyles}
              >
                Modo de Horas
              </Typography>
              <Box sx={autoGenerateModalConfigSectionStyles}>
                <FormControl sx={autoGenerateModalFormControlStyles(theme)}>
                  <RadioGroup
                    value={config.mode}
                    onChange={(e) => handleConfigChange("mode", e.target.value)}
                  >
                    <FormControlLabel
                      value="uniform"
                      control={<Radio />}
                      label="Horas uniformes para todos"
                    />
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label="Horas individuales por empleado"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

                             {/* Hours Configuration Row */}
               <Box sx={{ 
                 display: 'flex', 
                 gap: 2, 
                 flexDirection: { xs: 'column', sm: 'row' },
                 width: '100%',
                 minWidth: { xs: '100%', sm: '450px' }
               }}>
                 <Box sx={{ 
                   flex: 1, 
                   minWidth: { xs: '100%', sm: '200px' },
                   display: config.mode === "uniform" ? 'block' : 'none'
                 }}>
                   <TextField
                     label="Horas uniformes por semana"
                     type="number"
                     value={config.uniformHours}
                     onChange={(e) => {
                       const value = parseInt(e.target.value) || 0;
                       const maxLimit = config.maxHoursPerWeek || 48;
                       const clampedValue = Math.max(0, Math.min(maxLimit, value));
                       handleConfigChange("uniformHours", clampedValue);
                     }}
                     sx={{ 
                       ...autoGenerateModalTextFieldStyles(theme),
                       width: '100%'
                     }}
                     inputProps={{ 
                       min: 0, 
                       max: config.maxHoursPerWeek || 48,
                       step: 1,
                       pattern: "[0-9]*"
                     }}
                     helperText={`Máximo ${config.maxHoursPerWeek || 48} horas por semana`}
                     error={config.uniformHours < 0 || config.uniformHours > (config.maxHoursPerWeek || 48)}
                   />
                 </Box>

                 <TextField
                   label="Límite máximo de horas por semana"
                   type="number"
                   value={config.maxHoursPerWeek || 48}
                   onChange={(e) => {
                     const value = parseInt(e.target.value) || 48;
                     const clampedValue = Math.max(1, Math.min(168, value)); // 1 to 168 hours (7 days * 24 hours)
                     handleConfigChange("maxHoursPerWeek", clampedValue);
                   }}
                   sx={{ 
                     ...autoGenerateModalTextFieldStyles(theme),
                     flex: 1,
                     minWidth: { xs: '100%', sm: '200px' }
                   }}
                   inputProps={{ 
                     min: 1, 
                     max: 168,
                     step: 1,
                     pattern: "[0-9]*"
                   }}
                   helperText={config.mode === "uniform" 
                     ? "Límite máximo de horas por semana para cada empleado"
                     : "Límite máximo de horas por semana que se aplicará a todos los empleados"
                   }
                   error={(config.maxHoursPerWeek || 48) < 1 || (config.maxHoursPerWeek || 48) > 168}
                 />
               </Box>
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card sx={{
            ...autoGenerateModalCardStyles(theme),
            width: '100%',
            minWidth: { xs: '100%', sm: '450px' }
          }}>
            <CardContent sx={autoGenerateModalCardContentStyles}>
              <Typography
                variant="subtitle1"
                sx={autoGenerateModalSubtitleStyles}
              >
                Configuración de Asignaciones
              </Typography>
              <FormGroup sx={autoGenerateModalFormGroupStyles(theme)}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.useExistingSchedules}
                      onChange={(e) =>
                        handleConfigChange(
                          "useExistingSchedules",
                          e.target.checked
                        )
                      }
                      size="small"
                      sx={autoGenerateModalSwitchStyles(theme)}
                    />
                  }
                  label="Usar asignaciones existentes"
                />
              </FormGroup>

              <Typography
                variant="body2"
                sx={{
                  ...autoGenerateModalHelperTextStyles(theme),
                  mt: 0
                }}
              >
                {config.useExistingSchedules 
                  ? "Se utilizarán las asignaciones de horarios ya configuradas para cada empleado"
                  : "Selecciona horarios personalizados para cada empleado"
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Spacer between columns */}
        <Grid
          item
          xs={12}
          lg={0.2}
          sx={{ display: { xs: "none", lg: "block" } }}
        >
          <Box sx={{ width: "100%", height: "100%" }} />
        </Grid>

        {/* Right Column - Employees and Preview */}
        <Grid item xs={12} lg={5.8} sx={{ minWidth: { xs: '100%', sm: '450px' } }}>
          <Typography
            variant="h6"
            sx={autoGenerateModalSectionTitleStyles(theme)}
          >
            <PeopleIcon />
            Empleados ({selectedEmployeesList.length})
          </Typography>

          {/* Employee Selection */}
          <Card sx={{
            ...autoGenerateModalCardStyles(theme),
            width: '100%',
            minWidth: { xs: '100%', sm: '450px' }
          }}>
            <CardContent sx={autoGenerateModalCardContentStyles}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 0
              }}>
                <Typography
                  variant="subtitle1"
                  sx={autoGenerateModalSubtitleStyles}
                >
                  Seleccionar Empleados
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ 
                      fontSize: '0.8rem',
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {config.selectedEmployees.length === employees.length 
                      ? 'Quitar Selección' 
                      : 'Seleccionar Todos'
                    }
                  </Typography>
                  <Switch
                    checked={config.selectedEmployees.length === employees.length}
                    onChange={() => {
                      if (config.selectedEmployees.length === employees.length) {
                        handleClearAllEmployees();
                      } else {
                        handleSelectAllEmployees();
                      }
                    }}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: theme.palette.grey[400],
                      },
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={autoGenerateModalEmployeeListStyles}>
                {[...employees]
                  .sort((a, b) => 
                    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                  )
                  .map((employee) => (
                  <Box
                    key={employee.id}
                    sx={autoGenerateModalEmployeeCardStyles(theme)}
                    className={
                      config.selectedEmployees.includes(employee.id)
                        ? "selected"
                        : ""
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                            fontSize: "1rem",
                          }}
                        >
                          {employee.firstName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                        >
                          {`${employee.firstName} ${employee.lastName}`}
                        </Typography>
                      </Box>
                      <Switch
                        checked={config.selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        size="small"
                        sx={autoGenerateModalSwitchStyles(theme)}
                      />
                    </Box>

                    {config.selectedEmployees.includes(employee.id) && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: 1,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start'
                      }}>
                        {config.mode === "individual" && (
                          <TextField
                            label="Horas"
                            type="number"
                            size="small"
                            value={config.individualHours[employee.id] || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleIndividualHoursChange(employee.id, value);
                            }}
                            sx={autoGenerateModalIndividualHoursStyles(theme)}
                            inputProps={{ 
                              min: 0, 
                              max: config.maxHoursPerWeek || 48,
                              step: 1,
                              pattern: "[0-9]*"
                            }}
                            helperText={`Máximo ${config.maxHoursPerWeek || 48} horas`}
                            error={(config.individualHours[employee.id] || 0) < 0 || (config.individualHours[employee.id] || 0) > (config.maxHoursPerWeek || 48)}
                          />
                        )}

                        {!config.useExistingSchedules && (
                          <TextField
                            select
                            label="Asignación"
                            size="small"
                            value={config.customSchedules[employee.id] || ""}
                            onChange={(e) =>
                              handleCustomScheduleChange(
                                employee.id,
                                parseInt(e.target.value)
                              )
                            }
                            SelectProps={{
                              MenuProps: {
                                PaperProps: {
                                  style: {
                                    maxHeight: 150,
                                    overflow: 'auto',
                                    overflowY: 'scroll',
                                  },
                                },
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'left',
                                },
                              },
                            }}
                            sx={autoGenerateModalCustomScheduleStyles(theme)}
                          >
                            {schedules.map((schedule) => (
                              <MenuItem key={schedule.id} value={schedule.id}>
                                {schedule.label} ({schedule.hours}h)
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Week Preview */}
          <Card sx={{
            ...autoGenerateModalCardStyles(theme),
            width: '100%',
            minWidth: { xs: '100%', sm: '450px' }
          }}>
            <CardContent sx={autoGenerateModalCardContentStyles}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={autoGenerateModalSubtitleStyles}
                >
                  Semana Objetivo
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {format(currentWeekStart, "MMMM yyyy", { locale: es })}
                </Typography>
              </Box>
              <Box sx={autoGenerateModalWeekPreviewStyles}>
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={autoGenerateModalChipStyles(theme)}
                  >
                    {format(day, "EEE dd", { locale: es })}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      )}

      {/* Actions moved to DialogActions */}
    </Box>
  );
};

export default AutoGenerateModal; 