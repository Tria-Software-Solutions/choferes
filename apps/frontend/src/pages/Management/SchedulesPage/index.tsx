import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuthContext } from "../../../context/AuthContext";
import { Schedule } from "../../../models/Schedule";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../../store/slices/schedulesSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import AddScheduleForm from "../../Forms/AddScheduleForm";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { createScheduleNotification } from "../../../services/notificationService";
import { buildScheduleDays, sortSchedulesByType } from "../../../utils/schedule";
import {
  Button,
  Box,
  Typography,
  TextField,
  Switch,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Paper,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import { translateDayOptionsToSpanish } from "../../../utils/string";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { CalendarDays, Download, X, Plus, Trash2, PlusCircle, Clock } from "lucide-react";
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import { NOTIFICATIONS } from "../../../constants/constants";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  noSchedulesBoxStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeFirstLetter } from "../../../utils/string";

// Schedules management page component
const SchedulesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { schedules, isLoadingSchedules } = useSelector(
    (state: RootState) => state.schedules
  );
  const { showNotification } = useAppNotifications();
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [totalCountSchedules, setTotalCountSchedules] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
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
  const [dayHoursEditing, setDayHoursEditing] = useState<Record<string, string>>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const getInitialRowsPerPage = () => {
    if (typeof window !== "undefined") {
      const maxHeight = window.innerHeight * 0.6;
      const headHeight = 56;
      const paginationHeight = 64;
      const extra = 24;
      const availableHeight = maxHeight - headHeight - paginationHeight - extra;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      return Math.max(3, Math.min(100, rows));
    }
    return 25;
  };

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("schedules", getInitialRowsPerPage);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch schedules on mount, when debounced search changes, or when navigating back
  useEffect(() => {
    dispatch(
      fetchSchedules({ search: debouncedSearch || undefined }),
    );
  }, [dispatch, debouncedSearch, location.pathname]);

  // Filter schedules by search input (client-side for instant feedback)
  useEffect(() => {
    if (!search) {
      setFilteredSchedules(sortSchedulesByType(schedules));
      setTotalCountSchedules(schedules.length);
      return;
    }

    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const normalizedSearch = normalizeString(search).toLowerCase();

    const newFilteredSchedules = schedules.filter((schedule) => {
      const daysString = Array.isArray(schedule.days)
        ? schedule.days.map(translateDayOptionsToSpanish).join(" ")
        : translateDayOptionsToSpanish(schedule.days);

      return normalizeString(
        `${schedule.label} ${daysString} ${schedule.hours}`
      )
        .toLowerCase()
        .includes(normalizedSearch);
    });      setFilteredSchedules(sortSchedulesByType(newFilteredSchedules));
    setTotalCountSchedules(newFilteredSchedules.length);
  }, [search, schedules]);

  // Update edit form validity when fields or per-day hours change
  useEffect(() => {
    if (editRowId === null) {
      setIsEditFormValid(false);
      return;
    }

    const fields = editFields;
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    const isLabelValid =
      fields.label.trim().length > 0 && regex.text.test(fields.label);
    const isDaysValid = fields.days.length > 0;

    // Validate per-day hours: each selected day must have a valid hour value
    const isDayHoursValid =
      fields.days.length > 0 &&
      fields.days.every((day) => {
        const val = dayHoursEditing[day];
        return val !== undefined && val !== "" && !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 24;
      });

    setIsEditFormValid(isLabelValid && isDaysValid && isDayHoursValid);
  }, [editFields, dayHoursEditing, editRowId]);

  // Handle creation of a new schedule
  const handleCreate = async (newSchedule: Omit<Schedule, "id">) => {
    try {
      setIsCreatingSchedule(true);
      await dispatch(createSchedule(newSchedule));
      setOpenAddScheduleModal(false);
      showNotification(NOTIFICATIONS.SCHEDULE_CREATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      createScheduleNotification('created', newSchedule.label);
    } catch (error) {
      showNotification(NOTIFICATIONS.SCHEDULE_CREATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  // Handle editing of a schedule
  const handleEdit = (schedule: Schedule) => {
    const dayHours: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduleDays = (schedule as any).scheduleDays;
    if (scheduleDays && scheduleDays.length > 0) {
      scheduleDays.forEach((sd: { day: string; hours: number }) => {
        dayHours[sd.day] = sd.hours.toString();
      });
    }
    setEditRowId(schedule.id);
    setEditFields({
      label: schedule.label,
      days: schedule.days,
      hours: schedule.hours.toString(),
      specialSchedule: schedule.specialSchedule,
    });
    setDayHoursEditing(dayHours);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditRowId(null);
    setDayHoursEditing({});
  };

  // Handle update of a schedule
  const handleUpdate = async (id: number) => {
    try {
      const defaultHours = parseInt(editFields.hours, 10);
      const scheduleDays = buildScheduleDays(editFields.days, isNaN(defaultHours) ? 0 : defaultHours, dayHoursEditing);
      
      const updatedSchedule = {
        ...editFields,
        hours: isNaN(defaultHours) ? 0 : defaultHours,
        scheduleDays,
      };
      dispatch(updateSchedule({ id, updatedSchedule }));
      setEditRowId(null);
      setEditFields({ label: "", days: [], hours: "", specialSchedule: false });
      setDayHoursEditing({});
      showNotification(NOTIFICATIONS.SCHEDULE_UPDATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      createScheduleNotification('updated', editFields.label);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.SCHEDULE_UPDATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    }
  };

  // Open/close delete confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setOpenDeleteDialog(true);
    setScheduleToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setScheduleToDelete(null);
  };

  // Open/close add schedule modal
  const handleOpenAddModal = () => {
    setOpenAddScheduleModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddScheduleModal(false);
  };

  // Handle deletion of a schedule
  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    setIsDeletingSchedule(true);
    try {
      await dispatch(deleteSchedule(scheduleToDelete));
      setOpenDeleteDialog(false);
      setScheduleToDelete(null);
      showNotification(NOTIFICATIONS.SCHEDULE_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      const schedule = schedules.find(sch => sch.id === scheduleToDelete);
      if (schedule) {
        createScheduleNotification('deleted', schedule.label);
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.SCHEDULE_DELETE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  // When preparing data for export, only include the desired fields:
  const exportData = filteredSchedules.map((s) => {
    // Build per-day hours string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduleDays = (s as any).scheduleDays;
    let hoursDisplay = String(s.hours);
    if (scheduleDays && Array.isArray(scheduleDays) && scheduleDays.length > 0) {
      hoursDisplay = scheduleDays
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((sd: any) => `${translateDayOptionsToSpanish(sd.day)}: ${sd.hours}h`)
        .join(', ');
    }

    return {
      Nombre: s.label,
      Días: Array.isArray(s.days) ? s.days.map(translateDayOptionsToSpanish).join(', ') : translateDayOptionsToSpanish(s.days),
      Horas: hoursDisplay,
      Agregado: s.createdAt
        ? capitalizeFirstLetter(
            format(new Date(s.createdAt), "EEEE dd 'de' MMMM 'de' yyyy", {
              locale: es,
            })
          )
        : "",
      Actualizado: s.updatedAt
        ? capitalizeFirstLetter(
            format(new Date(s.updatedAt), "EEEE dd 'de' MMMM 'de' yyyy", {
              locale: es,
            })
          )
        : "",
    };
  });

  const exportOptions = useMemo(() => {
    const exportHeaders = [
      "Nombre",
      "Días",
      "Horas",
      "Agregado",
      "Actualizado",
    ];
    return createExportOptions({
      excelIcon: <ExcelIcon />,
      pdfIcon: <PdfIcon />,
      data: exportData,
      fileName: `horarios-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
    });
  }, [exportData]);

  return (
    <Box className="scrollable-content" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      {/* Premium Card with Header and Grid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          mx: { xs: 1, sm: 1.5, md: 2 },
          mb: 3,
          mt: 0,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CalendarDays size={20} strokeWidth={1.5} />
              </Box>
              <Box>
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.15rem" },
                    color: theme.palette.text.primary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {isSmallScreen ? PAGE_TITLE.SCHEDULES_SIMPLIFIED : PAGE_TITLE.SCHEDULES}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.7rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredSchedules.length} horarios configurados
                </Typography>
              </Box>
            </Box>

            {/* Export Speed Dial */}
            {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_SCHEDULES) &&
              userPermissions.includes(PERMISSIONS.EXPORT_PDF_SCHEDULES) && (
                <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
                  {filteredSchedules.length > 0 && (
                    <SpeedDialComponent
                      actions={exportOptions}
                      mainIcon={<Download size={18} strokeWidth={1.5} />}
                      openIcon={<X size={18} strokeWidth={1.5} />}
                      direction="left"
                    />
                  )}
                </Box>
              )}
          </Box>

          {/* Controls Row */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            {/* Search */}
            <Box flex={1} maxWidth={{ sm: "320px" }}>
              {filteredSchedules && (
                <SearchBarComponent
                  placeholder={MANAGEMENT.SCHEDULES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  isSearching={isLoadingSchedules && search !== ""}
                />
              )}
            </Box>

            {/* Add Button */}
            {userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES) && (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={handleOpenAddModal}
                  sx={{
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    letterSpacing: "-0.01em",
                    borderRadius: '10px',
                  }}
                >
                  {MANAGEMENT.ADD}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Add Button */}
        {userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES) && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddModal}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              {MANAGEMENT.ADD}
            </Button>
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {isLoadingSchedules ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingSchedules}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : (
            <>
              {filteredSchedules.length > 0 ? (
                <EditableTableComponent<Schedule>
                  data={filteredSchedules}
                  columns={["label", "hours", "specialSchedule"]}
                  editRowId={editRowId}
                  editFields={editFields}
                  setEditField={(field, value) =>
                    setEditFields({ ...editFields, [field]: value })
                  }
                  handleEdit={handleEdit}
                  handleCancel={handleCancel}
                  handleUpdate={handleUpdate}
                  handleOpenDeleteDialog={handleOpenDeleteDialog}
                  getRowId={(row) => row.id}
                  totalCount={totalCountSchedules}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                  isSaveDisabled={!isEditFormValid}
                  userPermissions={userPermissions}
                  renderColumnValue={(column, value, isEditing, editProps, row) => {
                    if (column === 'label') {
                      if (isEditing && editProps) {
                        return (
                          <TextField
                            value={String(editProps.editFields['label'] || '')}
                            onChange={(e) => editProps.setEditField('label', e.target.value)}
                            variant="standard"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                '&:before, &:after': { border: 'none' },
                                '&:hover:not(.Mui-disabled):before': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                padding: '4px 0',
                                '&:focus': { outline: 'none' },
                              },
                            }}
                          />
                        );
                      }
                      return (
                        <Typography
                          component="span"
                          sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                        >
                          {String(value)}
                        </Typography>
                      );
                    }
                    if (column === 'specialSchedule') {
                      if (isEditing && editProps) {
                        const isSpecial = Boolean(editProps.editFields['specialSchedule']);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5 }}>
                            <Switch
                              checked={isSpecial}
                              onChange={(e) => editProps.setEditField('specialSchedule', e.target.checked)}
                              size="small"
                              sx={{
                                '& .MuiSwitch-switchBase': {
                                  '&.Mui-checked': {
                                    '& + .MuiSwitch-track': {
                                      opacity: 1,
                                      backgroundColor: (t) => t.palette.warning.main,
                                    },
                                  },
                                  '& .MuiSwitch-thumb': {
                                    backgroundColor: isSpecial
                                      ? (t) => t.palette.warning.main
                                      : (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                  },
                                },
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: isSpecial ? 'warning.main' : 'text.disabled',
                                userSelect: 'none',
                              }}
                            >
                              {isSpecial ? 'Especial' : 'Normal'}
                            </Typography>
                          </Box>
                        );
                      }
                      const isSpecial = Boolean(value);
                      return (
                        <Chip
                          label={isSpecial ? 'Especial' : 'Normal'}
                          size="small"
                          variant={isSpecial ? 'filled' : 'outlined'}
                          color={isSpecial ? 'warning' : 'default'}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: '8px',
                            height: 24,
                          }}
                        />
                      );
                    }
                    if (column === 'hours') {
                      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      const shortNames: Record<string, string> = {
                        monday: 'L', tuesday: 'M', wednesday: 'M', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D',
                      };

                      if (isEditing && editProps) {
                        const currentDays = editProps.editFields['days'] as string[] || [];
                        return (
                          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: 0.5, alignItems: 'flex-start' }}>
                            {daysOfWeek.map((day) => {
                              const isActive = currentDays.includes(day);
                              const dayValue = isActive ? (dayHoursEditing[day] ?? editProps.editFields['hours'] ?? '') : '';
                              return (
                                <Tooltip key={day} title={isActive ? `Desactivar ${shortNames[day]}` : `Activar ${shortNames[day]}`} arrow>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: 0.25,
                                      minWidth: 32,
                                    }}
                                  >
                                    {/* Day toggle circle */}
                                    <Box
                                      onClick={() => {
                                        const newDays = isActive
                                          ? currentDays.filter((d) => d !== day)
                                          : [...currentDays, day];
                                        editProps.setEditField('days', newDays);
                                        if (isActive) {
                                          const newDayHours = { ...dayHoursEditing };
                                          delete newDayHours[day];
                                          setDayHoursEditing(newDayHours);
                                        }
                                      }}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        background: isActive
                                          ? (t) => t.palette.primary.main
                                          : (t) => t.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.04)'
                                            : 'rgba(0,0,0,0.04)',
                                        color: isActive
                                          ? '#ffffff'
                                          : (t) => t.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(0,0,0,0.2)',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                          transform: 'scale(1.15)',
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        },
                                        '&:active': { transform: 'scale(0.95)' },
                                      }}
                                    >
                                      {shortNames[day]}
                                    </Box>
                                    {/* Hours input below active day */}
                                    {isActive && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.1,
                                          backgroundColor: (t) => t.palette.mode === 'dark'
                                            ? 'rgba(99,102,241,0.06)'
                                            : 'rgba(99,102,241,0.04)',
                                          borderRadius: '6px',
                                          px: 0.4,
                                          py: 0.1,
                                        }}
                                      >
                                        <TextField
                                          type="number"
                                          value={dayValue}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => {
                                            const newDayHours = { ...dayHoursEditing };
                                            newDayHours[day] = e.target.value;
                                            setDayHoursEditing(newDayHours);
                                          }}
                                          variant="standard"
                                          inputProps={{
                                            min: '0', max: '24',
                                            style: { textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', padding: '1px 0', width: '24px' },
                                          }}
                                          sx={{
                                            '& .MuiInputBase-root': {
                                              '&:before, &:after': { border: 'none' },
                                            },
                                            '& .MuiInputBase-input': {
                                              textAlign: 'center',
                                              padding: '1px 0',
                                              width: '24px',
                                              fontSize: '0.7rem',
                                              fontWeight: 700,
                                              color: 'text.primary',
                                            },
                                          }}
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        );
                      }

                      // Non-editing: show day circles with hours below (same style as edit mode)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const scheduleDays = row && (row as any).scheduleDays;
                      const hasPerDayHours = scheduleDays && Array.isArray(scheduleDays) && scheduleDays.length > 0;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const rowDays: string[] = row ? ((row as any).days || []) : [];

                      if (hasPerDayHours && rowDays.length > 0) {
                        return (
                          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: 0.5, alignItems: 'flex-start' }}>
                            {daysOfWeek.map((day) => {
                              const isActive = rowDays.includes(day);
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              const dayEntry = scheduleDays.find((sd: any) => sd.day === day);
                              const hours = dayEntry ? dayEntry.hours : 0;
                              return (
                                <Tooltip key={day} title={`${shortNames[day]}: ${hours}h`} arrow>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: 0.25,
                                      minWidth: 32,
                                    }}
                                  >
                                    {/* Day circle */}
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        background: isActive
                                          ? (t) => t.palette.primary.main
                                          : (t) => t.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.04)'
                                            : 'rgba(0,0,0,0.04)',
                                        color: isActive
                                          ? '#ffffff'
                                          : (t) => t.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(0,0,0,0.2)',
                                      }}
                                    >
                                      {shortNames[day]}
                                    </Box>
                                    {/* Hours below active day */}
                                    {isActive && (
                                      <Typography
                                        sx={{
                                          fontSize: '0.6rem',
                                          fontWeight: 700,
                                          color: 'text.primary',
                                          lineHeight: 1,
                                        }}
                                      >
                                        {hours}h
                                      </Typography>
                                    )}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        );
                      }

                      // Fallback: show total hours
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={14} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              letterSpacing: '-0.02em',
                              color: 'text.primary',
                            }}
                          >
                            {String(value)}h
                          </Typography>
                        </Box>
                      );
                    }
                    return undefined;
                  }}
                />
              ) : (
                <Box sx={noSchedulesBoxStyles}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      borderRadius: "50%",
                      p: 3,
                      mb: 2,
                    }}
                  >
                    <CalendarDays size={48} color={theme.palette.text.disabled} />
                  </Box>
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {MANAGEMENT.NO_SCHEDULES}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    No hay horarios configurados aún
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={MANAGEMENT.DIALOG_DELETE_TITLE}
        message={MANAGEMENT.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={MANAGEMENT.DIALOG_DELETE_CONFIRM}
        cancelText={MANAGEMENT.DIALOG_DELETE_CANCEL}
        loading={isDeletingSchedule}
        paperSx={deleteDialogPaperSx ?? {}}
        icon={<Trash2 color="var(--mui-palette-error-main)" />}
      />
      <DialogComponent
        open={openAddScheduleModal}
        onClose={handleCloseAddModal}
        title={MANAGEMENT.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.SCHEDULES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<PlusCircle color="var(--mui-palette-info-main)" />}
      >
        <AddScheduleForm
          onSubmit={handleCreate}
          onCancel={handleCloseAddModal}
          isLoading={isCreatingSchedule}
        />
      </DialogComponent>
    </Box>
  );
};

export default SchedulesPage;
