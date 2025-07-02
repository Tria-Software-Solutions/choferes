import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Schedule } from "../../models/Schedule";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../store/slices/schedulesSlice";
import SearchBar from "../../components/SearchBar/SearchBar";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import AddScheduleForm from "../../components/Forms/AddScheduleForm";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import DialogComponent from "../../components/Dialog/DialogComponent";
import {
  Button,
  Grid,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../../utils/export";
import { translateDayOptionsToSpanish } from "../../utils/string";
import { PAGE_TITLE, PERMISSIONS, SCHEDULES_PAGE } from "../../constants/constants";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { NOTIFICATIONS } from "../../constants/constants";

const SchedulesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { schedules, isLoadingSchedules } = useSelector(
    (state: RootState) => state.schedules,
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
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const newFilteredSchedules = schedules.filter((schedule) => {
      const daysString = Array.isArray(schedule.days)
        ? schedule.days.map(translateDayOptionsToSpanish).join(" ")
        : translateDayOptionsToSpanish(schedule.days);

      return normalizeString(
        `${schedule.label} ${daysString} ${schedule.hours}`,
      )
        .toLowerCase()
        .includes(normalizeString(filter).toLowerCase());
    });

    setFilteredSchedules(newFilteredSchedules);
    setTotalCountSchedules(newFilteredSchedules.length);
  }, [filter, schedules]);

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

  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleCreate = async (newSchedule: Omit<Schedule, "id">) => {
    try {
      setIsCreatingSchedule(true);
      await dispatch(createSchedule(newSchedule));
      setOpenAddScheduleModal(false);
      showNotification(NOTIFICATIONS.SCHEDULE_CREATE_SUCCESS, 3000, false);
    } catch (error) {
      showNotification(NOTIFICATIONS.SCHEDULE_CREATE_ERROR, 5000, false);
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditRowId(schedule.id);
    setEditFields({
      label: schedule.label,
      days: schedule.days,
      hours: schedule.hours.toString(),
      specialSchedule: schedule.specialSchedule,
    });
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  const handleUpdate = async (id: number) => {
    try {
      const updatedSchedule = {
        ...editFields,
        hours: parseInt(editFields.hours, 10),
      };
      dispatch(updateSchedule({ id, updatedSchedule }));
      setEditRowId(null);
      setEditFields({ label: "", days: [], hours: "", specialSchedule: false });
      showNotification(NOTIFICATIONS.SCHEDULE_UPDATE_SUCCESS, 3000, false);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.SCHEDULE_UPDATE_ERROR, 5000, false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setOpenDeleteDialog(true);
    setScheduleToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setScheduleToDelete(null);
  };

  const handleOpenAddModal = () => {
    setOpenAddScheduleModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddScheduleModal(false);
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    setIsDeletingSchedule(true);
    try {
      await dispatch(deleteSchedule(scheduleToDelete));
      setOpenDeleteDialog(false);
      setScheduleToDelete(null);
      showNotification(NOTIFICATIONS.SCHEDULE_DELETE_SUCCESS, 3000, false);
    } catch (error) {
      showNotification(NOTIFICATIONS.SCHEDULE_DELETE_ERROR, 5000, false);
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  const exportOptions = useMemo(() => {
    const excelOption = userPermissions.includes(
      PERMISSIONS.EXPORT_EXCEL_SCHEDULES,
    )
      ? exportToExcel
      : undefined;
    const pdfOption = userPermissions.includes(PERMISSIONS.EXPORT_PDF_SCHEDULES)
      ? exportToPDF
      : undefined;
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      excelOption,
      pdfOption,
      filteredSchedules,
      `horarios-${exportFileFormattedDate(new Date())}`,
    );
  }, [userPermissions, filteredSchedules]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box display="flex" alignItems="center">
          <EditCalendarRoundedIcon
            fontSize={isSmallScreen ? "small" : "large"}
          />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen
                ? PAGE_TITLE.SCHEDULES_SIMPLIFIED
                : PAGE_TITLE.SCHEDULES}
            </Typography>
          </Box>
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_SCHEDULES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_SCHEDULES) && (
            <Box sx={{ minHeight: 65 }}>
              {filteredSchedules.length > 0 && (
                <CustomSpeedDial
                  actions={exportOptions}
                  mainIcon={<DownloadRoundedIcon />}
                  openIcon={<CloseRoundedIcon />}
                  direction="left"
                />
              )}
            </Box>
          )}
      </Box>
      {isLoadingSchedules ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
          }}
        >
          <Backdrop
            sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
            open={isLoadingSchedules}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {filteredSchedules && (
                  <SearchBar
                    placeholder={SCHEDULES_PAGE.SEARCH_PLACEHOLDER}
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                {userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAddModal}
                    sx={{
                      display: { xs: "flex", md: "none" },
                      minWidth: "auto",
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      p: 0,
                    }}
                  >
                    <AddRoundedIcon />
                  </Button>
                )}
              </Box>
            </Grid>
            {userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES) && (
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenAddModal}
                    sx={{ px: 3, py: 1.5, fontSize: "1rem", minHeight: 56 }}
                  >
                    {SCHEDULES_PAGE.ADD}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          <br />
          {filteredSchedules.length > 0 ? (
            <EditableTable<Schedule>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "10%",
                paddingBottom: "12%",
              }}
            >
              <ManageSearchIcon color="disabled" sx={{ fontSize: "65px" }} />
              <Typography variant="h6" color="textSecondary">
                {SCHEDULES_PAGE.NO_SCHEDULES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={SCHEDULES_PAGE.DIALOG_DELETE_TITLE}
        message={SCHEDULES_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={SCHEDULES_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={SCHEDULES_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingSchedule}
        paperSx={{
          minWidth: { xs: "80vw", sm: 320 },
          maxWidth: { xs: "90vw", sm: 400 },
        }}
        icon={<DeleteOutlineIcon color="error" />}
      />
      <DialogComponent
        open={openAddScheduleModal}
        onClose={handleCloseAddModal}
        title={SCHEDULES_PAGE.DIALOG_ADD_TITLE}
        subtitle={SCHEDULES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={{
          minWidth: { xs: "90vw", sm: 500, md: 700 },
          maxWidth: { xs: "98vw", sm: 700 },
        }}
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
