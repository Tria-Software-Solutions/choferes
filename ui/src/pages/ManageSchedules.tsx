import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Schedule } from "../models/Schedule";
import { useSchedules } from "../hooks/useSchedule";
import SplitButton from "../components/SplitButton/SplitButton";
import SearchBar from "../components/SearchBar/SearchBar";
import EditableTable from "../components/Table/EditableTable/EditableTable";
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
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../utils/exportUtils";
import {
  getDayOptionsSpanish,
  translateDayOptionsToSpanish,
} from "../utils/stringUtils";
import { PAGE_TITLE } from "../constants/constants";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const ManageSchedules: React.FC = () => {
  const {
    schedules,
    isLoadingSchedules,
    fetchSchedules,
    handleAddSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
  } = useSchedules();
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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
    const fetchData = async () => {
      await fetchSchedules();
    };

    fetchData();
  }, [fetchSchedules]);

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
    setTotalCount(filteredSchedules.length);
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
    const newId =
      schedules.length > 0
        ? Math.max(...schedules.map((schedule) => schedule.id)) + 1
        : 1;
    const newSchedule: Schedule = {
      id: newId,
      label: addFields.label,
      day: addFields.day,
      hours: parseInt(addFields.hours, 10),
    };
    handleAddSchedule(newSchedule);
    setAddFields({ label: "", day: "", hours: "" });
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
    const updatedSchedule = {
      ...editFields,
      hours: parseInt(editFields.hours, 10),
    };
    handleUpdateSchedule(id, updatedSchedule);
    setEditRowId(null);
    setEditFields({ label: "", day: "", hours: "" });
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
    if (scheduleToDelete !== null) {
      handleDeleteSchedule(scheduleToDelete);
      handleCloseDialog();
    }
  };

  const exportOptions = useMemo(() => {
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      exportToExcel,
      exportToPDF,
      filteredSchedules,
      `horarios-${exportFileFormattedDate(new Date())}`
    );
  }, [filteredSchedules]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} sx={{ flexGrow: 1 }}>
          {PAGE_TITLE.MANAGE_SCHEDULES}
        </Typography>
        {filteredSchedules.length > 0 && (
          <SplitButton
            options={exportOptions}
            defaultIndex={0}
            buttonIcon={<DownloadRoundedIcon />}
          />
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
          <CircularProgress />
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
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
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

export default ManageSchedules;
