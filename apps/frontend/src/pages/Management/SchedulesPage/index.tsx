import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  setScheduleOrder,
} from "../../../store/slices/schedulesSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import StickyDataGridComponent from "../../../components/Table/StickyDataGrid/StickyDataGrid.component";
import { GridColDef } from "@mui/x-data-grid";
import { renderActionButtons } from "../../../components/Table/EditableTable/helpers";
import ExportMenu from "../../../components/ExportMenu/ExportMenu.component";
import AddScheduleForm from "../../Forms/AddScheduleForm";
import { dayHoursInputSx } from "../../Forms/AddScheduleForm/styles";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import ReorderDialog from "../../../components/ReorderDialog/ReorderDialog.component";
import { createScheduleNotification } from "../../../services/notificationService";
import { buildScheduleDays, sortSchedulesByType } from "../../../utils/schedule";
import * as UserService from "../../../services/userService";
import {
  Button,
  Box,
  Typography,
  TextField,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import { translateDayOptionsToSpanish } from "../../../utils/string";
import APPBAR_MENU from "../../../constants/appbar.constants";
import NavIcon from "../../../components/NavIcon/NavIcon.component";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { IconCalendarWeek, IconCirclePlus, IconClock, IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  EmptyState,
  LoadingState,
  PageBody,
  PageCard,
  PageContainer,
  PageHeader,
} from "../../../components/Layout";
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import { NOTIFICATIONS } from "../../../constants/constants";
import {
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
  const { currentUser, userPermissions } = useAuthContext();
  const { schedules, isLoadingSchedules, customOrderIds } = useSelector(
    (state: RootState) => state.schedules
  );
  const { showNotification } = useAppNotifications();
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
    label: string;
    days: string[];
    hours: string;
  }>({
    label: "",
    days: [],
    hours: "",
  });
  const [dayHoursEditing, setDayHoursEditing] = useState<Record<string, string>>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);
  const [openReorderDialog, setOpenReorderDialog] = useState(false);

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

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const shortNames: Record<string, string> = {
  monday: 'L', tuesday: 'M', wednesday: 'M', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D',
};

  const { search, setSearch } =
    useTablePreferences("schedules", getInitialRowsPerPage);

  const debouncedSearch = useDebounce(search, 400);

  const hasEditPermissions = userPermissions.includes(PERMISSIONS.EDIT_SCHEDULES);
  const hasDeletePermissions = userPermissions.includes(PERMISSIONS.DELETE_SCHEDULES);

  // Fetch schedules on mount, when debounced search changes, or when navigating back
  useEffect(() => {
    dispatch(
      fetchSchedules({ search: debouncedSearch || undefined }),
    );
  }, [dispatch, debouncedSearch, location.pathname]);

  // Filter schedules by search input (client-side for instant feedback)
  useEffect(() => {
    if (!search) {
      setFilteredSchedules(sortSchedulesByType(schedules, customOrderIds));
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
    });
    setFilteredSchedules(sortSchedulesByType(newFilteredSchedules, customOrderIds));
  }, [search, schedules, customOrderIds]);

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
      await dispatch(createSchedule(newSchedule)).unwrap();
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
      await dispatch(updateSchedule({ id, updatedSchedule })).unwrap();
      setEditRowId(null);
      setEditFields({ label: "", days: [], hours: "" });
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

  // Handle saving the custom schedule order
  const handleReorderSave = useCallback(async (orderedIds: number[]) => {
    // Apply order locally
    dispatch(setScheduleOrder(orderedIds));
    // Save to user settings in DB
    if (currentUser?.id) {
      try {
        await UserService.updateUserSettings(currentUser.id, {
          scheduleOrder: orderedIds,
        });
      } catch {
        // Silently fail - order still works locally
      }
    }
  }, [dispatch, currentUser?.id]);

  // Handle deletion of a schedule
  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    setIsDeletingSchedule(true);
    try {
      await dispatch(deleteSchedule(scheduleToDelete)).unwrap();
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

  // Memoize export data so the DataGrid columns stay stable and exportOptions
  // only recomputes when the filtered list actually changes
  const exportData = useMemo(
    () =>
      filteredSchedules.map((s) => {
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
      }),
    [filteredSchedules]
  );

  const exportOptions = useMemo(() => {
    // Excel y PDF comparten las mismas columnas: "Días" y "Horas" se fusionan
    // en "Días y Horas" y se omite "Actualizado". Horas ya incluye cada día
    // con su hora ("lunes: 8h, martes: 8h"), así que se usa ese detalle como
    // contenido de la columna fusionada.
    const exportHeaders = ["Nombre", "Días y Horas", "Agregado"];
    const exportRows = exportData.map((s) => {
      const { Días, Horas, Actualizado: _omit, ...rest } = s;
      return {
        ...rest,
        "Días y Horas": Horas || Días,
      };
    });
    return createExportOptions({
      excelIcon: <ExcelIcon />,
      pdfIcon: <PdfIcon />,
      data: exportRows,
      fileName: `horarios-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
      title: "Reporte de Horarios",
    });
  }, [exportData]);

  // Stable getRowId so the memoized StickyDataGrid doesn't re-render on every
  // parent render (inline arrows create a new reference each time)
  const getRowId = useCallback((row: Schedule) => row.id, []);

  // Columnas del DataGrid (header sticky garantizado por arquitectura de MUI X Data Grid)
  const columns = useMemo<GridColDef<Schedule>[]>(
    () => [
      {
        field: "label",
        headerName: "Nombre",
        flex: 1,
        minWidth: 200,
        sortable: true,
        renderCell: (params) => {
          const rowId = Number(params.id);
          const isEditing = editRowId === rowId;

          if (isEditing) {
            return (
              <Box
                sx={{ width: '100%', minWidth: 0 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <TextField
                  value={String(editFields.label || '')}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, label: e.target.value }))}
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
              </Box>
            );
          }
          return (
            <Typography
              component="span"
              sx={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {String(params.value)}
            </Typography>
          );
        },
      },
      {
        field: "hours",
        headerName: "Horas",
        flex: 1.8,
        minWidth: isSmallScreen ? 240 : 360,
        sortable: true,
        renderCell: (params) => {
          const rowId = Number(params.id);
          const isEditing = editRowId === rowId;

          if (isEditing) {
            const currentDays = (editFields.days as string[]) || [];
            return (
              <Box
                sx={{ display: 'flex', gap: 0.75, flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: 0.5, alignItems: 'flex-start', width: '100%' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {daysOfWeek.map((day) => {
                  const isActive = currentDays.includes(day);
                  const dayValue = isActive ? (dayHoursEditing[day] ?? editFields.hours ?? '') : '';
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
                            setEditFields((prev) => ({ ...prev, days: newDays }));
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
                              ? (t) => t.tokens.colors.inverseBg
                              : (t) => t.tokens.colors.hover,
                            color: isActive
                              ? (t) => t.tokens.colors.onInverse
                              : (t) => t.tokens.colors.textSubtle,
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
                          <TextField
                            type="number"
                            value={dayValue}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newDayHours = { ...dayHoursEditing };
                              newDayHours[day] = e.target.value;
                              setDayHoursEditing(newDayHours);
                            }}
                            inputProps={{ min: 0, max: 24, step: 0.5, inputMode: 'decimal' }}
                            sx={dayHoursInputSx(theme, dayValue !== '')}
                          />
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
          const scheduleDays = params.row && (params.row as any).scheduleDays;
          const hasPerDayHours = scheduleDays && Array.isArray(scheduleDays) && scheduleDays.length > 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rowDays: string[] = params.row ? ((params.row as any).days || []) : [];

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
                              ? (t) => t.tokens.colors.inverseBg
                              : (t) => t.tokens.colors.hover,
                            color: isActive
                              ? (t) => t.tokens.colors.onInverse
                              : (t) => t.tokens.colors.textSubtle,
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
              <IconClock size={14} stroke={1.5} style={{ opacity: 0.4 }} />
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {String(params.value)}h
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        width: isSmallScreen ? 64 : 150,
        minWidth: isSmallScreen ? 64 : 150,
        align: "right",
        headerAlign: "right",
        renderCell: (params) =>
          renderActionButtons({
            row: params.row as Schedule,
            editRowId,
            getRowId: (row) => row.id,
            currentUser: currentUser || undefined,
            hasEditPermissions,
            hasDeletePermissions,
            isExpanded: false,
            handleEditClick: handleEdit,
            handleSaveClick: handleUpdate,
            handleCancelClick: handleCancel,
            handleOpenDeleteDialog,
            isSaveDisabled: !isEditFormValid,
            isSmallScreen,
            theme,
          }),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      editRowId,
      editFields,
      dayHoursEditing,
      isEditFormValid,
      isSmallScreen,
      theme,
      currentUser,
      hasEditPermissions,
      hasDeletePermissions,
      handleEdit,
      handleUpdate,
      handleCancel,
      handleOpenDeleteDialog,
    ]
  );

  const canExport =
    userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_SCHEDULES) &&
    userPermissions.includes(PERMISSIONS.EXPORT_PDF_SCHEDULES);
  const canReorder = userPermissions.includes(PERMISSIONS.REORDER_SCHEDULES);
  const canCreate = userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES);

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.SCHEDULES} />}
          title={PAGE_TITLE.SCHEDULES}
          mobileTitle={PAGE_TITLE.SCHEDULES_SIMPLIFIED}
          subtitle={`${filteredSchedules.length} horarios configurados`}
          actions={
            canExport ? (
              <ExportMenu actions={exportOptions} disabled={filteredSchedules.length === 0} />
            ) : undefined
          }
          toolbar={
            <Box sx={{ flex: 1, maxWidth: { sm: 320 }, minWidth: { xs: "100%", sm: 200 } }}>
              <SearchBarComponent
                placeholder={MANAGEMENT.SCHEDULES_PAGE.SEARCH_PLACEHOLDER}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                isSearching={isLoadingSchedules && search !== ""}
              />
            </Box>
          }
          toolbarEnd={
            canReorder || canCreate ? (
              <>
                {canReorder && (
                  <Button
                    variant="outlined"
                    startIcon={<IconGripVertical size={16} />}
                    onClick={() => setOpenReorderDialog(true)}
                    disabled={filteredSchedules.length < 2}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: 'text.primary',
                      borderColor: theme.tokens.colors.border,
                      backgroundColor: theme.tokens.colors.hoverSoft,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: theme.tokens.colors.hover,
                        borderColor: theme.tokens.colors.borderStrong,
                      },
                    }}
                  >
                    Ordenar
                  </Button>
                )}
                {canCreate && (
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleOpenAddModal}
                  >
                    {MANAGEMENT.SCHEDULES_PAGE.ADD}
                  </Button>
                )}
              </>
            ) : undefined
          }
        />

        <PageBody>
          {isLoadingSchedules && filteredSchedules.length === 0 ? (
            <LoadingState label="Cargando horarios…" />
          ) : filteredSchedules.length > 0 ? (
            <StickyDataGridComponent<Schedule>
              rows={filteredSchedules}
              columns={columns}
              getRowId={getRowId}
              disableRowVirtualization={editRowId !== null}
            />
          ) : (
            <EmptyState
              icon={<IconCalendarWeek />}
              title={MANAGEMENT.NO_SCHEDULES}
              description={
                search ? "Prueba con otro término de búsqueda." : "No hay horarios configurados aún."
              }
              action={
                canCreate && !search ? (
                  <Button
                    variant="outlined"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleOpenAddModal}
                  >
                    {MANAGEMENT.SCHEDULES_PAGE.ADD}
                  </Button>
                ) : undefined
              }
            />
          )}
        </PageBody>
      </PageCard>
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
        icon={<IconTrash color="var(--mui-palette-error-main)" />}
      />
      <DialogComponent
        open={openAddScheduleModal}
        onClose={handleCloseAddModal}
        title={MANAGEMENT.DIALOG_ADD_TITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<IconCirclePlus color="var(--mui-palette-info-main)" />}
      >
        <AddScheduleForm
          onSubmit={handleCreate}
          onCancel={handleCloseAddModal}
          isLoading={isCreatingSchedule}
        />
      </DialogComponent>
      <ReorderDialog
        open={openReorderDialog}
        schedules={filteredSchedules}
        onClose={() => setOpenReorderDialog(false)}
        onSave={handleReorderSave}
      />
    </PageContainer>
  );
};

export default SchedulesPage;
