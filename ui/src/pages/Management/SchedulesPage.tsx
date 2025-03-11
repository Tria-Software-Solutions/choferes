import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { Schedule } from "../../models/Schedule";
import { useSchedules } from "../../hooks/useSchedule";
import SearchBar from "../../components/SearchBar/SearchBar";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
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
import {
  getDayOptionsSpanish,
  translateDayOptionsToSpanish,
} from "../../utils/string";
import { PAGE_TITLE, PERMISSIONS } from "../../constants/constants";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const SchedulesPage: React.FC = () => {
  const { userPermissions } = useAuth();
  const {
    schedules,
    isLoadingSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();
  const { showNotification } = useAppNotifications();
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [totalCountSchedules, setTotalCountSchedules] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({
    label: "",
    day: "",
    hours: "",
  });
  const [editFields, setEditFields] = useState({
    label: "",
    day: "",
    hours: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredSchedules(
      schedules.filter((schedule) =>
        normalizeString(
          `${schedule.label} ${translateDayOptionsToSpanish(schedule.day)} ${
            schedule.hours
          }`
        )
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
    );
    setTotalCountSchedules(filteredSchedules.length);
  }, [filter, schedules, filteredSchedules.length]);

  const validateFields = useCallback((fields: typeof addFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      time: /^[0-9]+$/,
    };

    return (
      regex.text.test(fields.label) &&
      regex.text.test(fields.day) &&
      regex.time.test(fields.hours)
    );
  }, []);

  useEffect(
    () => setIsAddFormValid(validateFields(addFields)),
    [addFields, validateFields]
  );
  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleAdd = () => {
    try {
      const newSchedule: Omit<Schedule, "id"> = {
        label: addFields.label,
        day: addFields.day,
        hours: parseInt(addFields.hours, 10),
      };
      createSchedule(newSchedule);
      setAddFields({ label: "", day: "", hours: "" });
      showNotification(
        "El registro del horario fue exitoso",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al registrar el horario",
        "error",
        5000,
        false
      );
    }
  };

  const handleEditClick = (schedule: Schedule) => {
    setEditRowId(schedule.id);
    setEditFields({
      label: schedule.label,
      day: schedule.day,
      hours: schedule.hours.toString(),
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    try {
      const updatedSchedule = {
        ...editFields,
        hours: parseInt(editFields.hours, 10),
      };
      updateSchedule(id, updatedSchedule);
      setEditRowId(null);
      setEditFields({ label: "", day: "", hours: "" });
      showNotification(
        "La actualización del horario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el horario",
        "error",
        5000,
        false
      );
    }
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setScheduleToDelete(id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setScheduleToDelete(null);
  };

  const handleDelete = () => {
    try {
      if (scheduleToDelete !== null) {
        deleteSchedule(scheduleToDelete);
        handleCloseDialog();
      }
      showNotification(
        "La eliminación del horario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el horario",
        "error",
        5000,
        false
      );
    }
  };

  const exportOptions = useMemo(() => {
    const excelOption = userPermissions.includes(
      PERMISSIONS.EXPORT_EXCEL_SCHEDULES
    )
      ? exportToExcel
      : undefined;
    const pdfOption = userPermissions.includes(PERMISSIONS.EXPORT_PDF_SCHEDULES)
      ? exportToPDF
      : undefined;
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      filteredSchedules,
      `horarios-${exportFileFormattedDate(new Date())}`,
      excelOption,
      pdfOption
    );
  }, [userPermissions, filteredSchedules]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} sx={{ flexGrow: 1 }}>
          {PAGE_TITLE.SCHEDULES}
        </Typography>
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
            <Grid item xs={12} md={6}>
              {filteredSchedules && (
                <SearchBar
                  placeholder="Buscar horario"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              )}
            </Grid>
            {userPermissions.includes(PERMISSIONS.CREATE_SCHEDULES) && (
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "column", md: "row" }}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={2}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Lugar"
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                        value={addFields.label}
                        onChange={(e) =>
                          setAddFields({ ...addFields, label: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <FormControl
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                      >
                        <InputLabel>Día</InputLabel>
                        <Select
                          label="Día"
                          sx={{ height: 56 }}
                          value={addFields.day}
                          onChange={(e) =>
                            setAddFields({ ...addFields, day: e.target.value })
                          }
                        >
                          {getDayOptionsSpanish().map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <TextField
                        label="Horas"
                        variant="outlined"
                        type="number"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                        value={addFields.hours}
                        onChange={(e) =>
                          setAddFields({ ...addFields, hours: e.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                  <Tooltip title="Agregar Horario" arrow>
                    <Box
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        display: "flex",
                        justifyContent: { xs: "stretch", md: "flex-end" },
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          minHeight: 56,
                          display: "flex",
                          justifyContent: "center",
                          lineHeight: "normal",
                          width: { xs: "100%", md: "auto" },
                        }}
                        onClick={handleAdd}
                        disabled={!isAddFormValid}
                      >
                        <PostAddRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
          <br />
          {filteredSchedules.length > 0 ? (
            <EditableTable<Schedule>
              data={filteredSchedules}
              columns={["label", "day", "hours"]}
              editRowId={editRowId}
              editFields={editFields}
              setEditField={(field, value) =>
                setEditFields({ ...editFields, [field]: value })
              }
              handleEditClick={handleEditClick}
              handleCancelClick={handleCancelClick}
              handleSaveClick={handleSaveClick}
              handleOpenDialog={handleOpenDialog}
              getRowId={(row) => row.id}
              totalCount={totalCountSchedules}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              permissions={userPermissions}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "10%",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No se encontraron horarios para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este horario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulesPage;
