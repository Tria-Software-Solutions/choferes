import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Paper,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import { translateDayOptionsToSpanish } from "../../../utils/string";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { CalendarDays, Download, X, Plus, Trash2, FileText, Table, PlusCircle } from "lucide-react";
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

  // Fetch all schedules on mount
  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch, location.pathname]);

  // Filter schedules by search input
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const newFilteredSchedules = schedules.filter((schedule) => {
      const daysString = Array.isArray(schedule.days)
        ? schedule.days.map(translateDayOptionsToSpanish).join(" ")
        : translateDayOptionsToSpanish(schedule.days);

      return normalizeString(
        `${schedule.label} ${daysString} ${schedule.hours}`
      )
        .toLowerCase()
        .includes(normalizeString(search).toLowerCase());
    });

    setFilteredSchedules(newFilteredSchedules);
    setTotalCountSchedules(newFilteredSchedules.length);
  }, [search, schedules]);

  // Validate edit fields for schedule
  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      time: /^[0-9]+$/,
    };

    const isLabelValid =
      fields.label.trim().length > 0 && regex.text.test(fields.label);
    const isHoursValid =
      fields.hours.length > 0 &&
      regex.time.test(fields.hours) &&
      parseInt(fields.hours) > 0 &&
      parseInt(fields.hours) <= 24;
    const isDaysValid = fields.days.length > 0;

    return isLabelValid && isHoursValid && isDaysValid;
  }, []);

  // Update edit form validity when fields change
  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

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
    setEditRowId(schedule.id);
    setEditFields({
      label: schedule.label,
      days: schedule.days,
      hours: schedule.hours.toString(),
      specialSchedule: schedule.specialSchedule,
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditRowId(null);
  };

  // Handle update of a schedule
  const handleUpdate = async (id: number) => {
    try {
      const updatedSchedule = {
        ...editFields,
        hours: parseInt(editFields.hours, 10),
      };
      dispatch(updateSchedule({ id, updatedSchedule }));
      setEditRowId(null);
      setEditFields({ label: "", days: [], hours: "", specialSchedule: false });
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
  const exportData = filteredSchedules.map((s) => ({
    Nombre: s.label,
    Días: s.days,
    Horas: s.hours,
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
  }));

  const exportOptions = useMemo(() => {
    const exportHeaders = [
      "Nombre",
      "Días",
      "Horas",
      "Agregado",
      "Actualizado",
    ];
    return createExportOptions({
      excelIcon: <Table />,
      pdfIcon: <FileText />,
      data: exportData,
      fileName: `horarios-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
    });
  }, [exportData]);

  return (
    <Box sx={{ height: "calc(100vh - 64px - 16px)", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
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
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "10px",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarDays size={22} color={theme.palette.primary.contrastText} />
              </Box>
              <Box>
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
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
                    fontSize: "0.75rem",
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
                      mainIcon={<Download size={20} />}
                      openIcon={<X size={20} />}
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
        <Box sx={{ flex: 1, overflow: "auto" }}>
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
                  columns={["label", "days", "hours"]}
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
