import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Vehicle } from "../../models/Vehicle";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../store/slices/vehiclesSlice";
import SearchBar from "../../components/SearchBar/SearchBar";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import AddVehicleForm from "../../components/Forms/AddVehicleForm";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import DialogComponent from "../../components/Dialog/DialogComponent";
import {
  Box,
  Typography,
  useMediaQuery,
  Grid,
  Button,
  CircularProgress,
  Backdrop,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isTodayOrFuture } from "../../utils/dates";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../../utils/export";
import { capitalizeFirstLetter } from "../../utils/string";
import { PAGE_TITLE, PERMISSIONS, VEHICLES_PAGE } from "../../constants/constants";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const VehiclesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { allVehicles, isLoadingVehicles } = useSelector(
    (state: RootState) => state.vehicles,
  );
  const { showNotification } = useAppNotifications();
  const [filteredWeekVehicles, setFilteredWeekVehicles] = useState<Vehicle[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    ticket: "",
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
    parkingDate: new Date(),
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [shouldRefetch] = useState(true);
  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const cleanedFilter = useMemo(
    () => filter.replace(/[\s-]/g, "").toLowerCase(),
    [filter],
  );

  const filteredVehicles = useMemo(() => {
    const vehiclesForSelectedDate = allVehicles.filter((vehicle) => {
      const vehicleDate = new Date(vehicle.parkingDate);
      const selectedDateMidnight = new Date(selectedDate);
      selectedDateMidnight.setHours(0, 0, 0, 0);

      const vehicleDateMidnight = new Date(vehicleDate);
      vehicleDateMidnight.setHours(0, 0, 0, 0);

      const vehicleDateStr = vehicleDateMidnight.toISOString().split("T")[0];
      const selectedDateStr = selectedDateMidnight.toISOString().split("T")[0];

      return vehicleDateStr === selectedDateStr;
    });

    const filtered = vehiclesForSelectedDate.filter((vehicle) => {
      const cleanedLicensePlate = vehicle.licensePlate
        .replace(/[\s-]/g, "")
        .toLowerCase();
      const cleanedParkingLot = vehicle.parkingLot
        .replace(/[\s-]/g, "")
        .toLowerCase();

      return (
        cleanedLicensePlate.includes(cleanedFilter) ||
        `${vehicle.ticket} ${vehicle.brand} ${vehicle.color} ${cleanedParkingLot} ${vehicle.notes}`
          .toLowerCase()
          .includes(cleanedFilter)
      );
    });

    return filtered;
  }, [allVehicles, selectedDate, cleanedFilter]);

  useEffect(() => {
    setTotalCount(filteredVehicles.length);
  }, [filteredVehicles]);

  useEffect(() => {
    if (shouldRefetch) {
      dispatch(fetchVehicles({}));
    }
  }, [dispatch, shouldRefetch]);

  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const date = selectedDate;
    const dayOfWeek = date.getDay();

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const vehiclesThisWeek = allVehicles.filter((vehicle) => {
      const parkedDate = new Date(vehicle.parkingDate);
      return parkedDate >= startOfWeek && parkedDate <= endOfWeek;
    });

    setFilteredWeekVehicles(vehiclesThisWeek);
  }, [allVehicles, selectedDate]);

  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      number: /^\d+$/,
      plate: /^(?:[A-ZÑ]{3}-\d{3}|\d{6}|nulo|n\/a)$/i,
      text: /^(?:[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+|nulo|n\/a)$/i,
      parkingLot: /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i,
    };

    return (
      regex.number.test(fields.ticket) &&
      regex.plate.test(fields.licensePlate.trim()) &&
      regex.text.test(fields.brand) &&
      regex.text.test(fields.color) &&
      regex.parkingLot.test(fields.parkingLot.trim())
    );
  }, []);

  useEffect(() => {
    setIsEditFormValid(validateFields(editFields));
  }, [editFields, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditRowId(vehicle.id);
    setEditFields({
      ticket: vehicle.ticket,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      color: vehicle.color,
      parkingLot: vehicle.parkingLot,
      notes: vehicle.notes,
      parkingDate: new Date(vehicle.parkingDate),
    });
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  const handleUpdate = async (id: number) => {
    try {
      const updatedVehicle = {
        ticket: editFields.ticket,
        licensePlate: editFields.licensePlate,
        brand: editFields.brand,
        color: editFields.color,
        parkingLot: editFields.parkingLot,
        notes: editFields.notes,
        parkingDate: editFields.parkingDate,
      };
      await dispatch(updateVehicle({ id, updatedVehicle }));
      setEditRowId(null);
      setEditFields({
        ticket: "",
        licensePlate: "",
        brand: "",
        color: "",
        parkingLot: "",
        notes: "",
        parkingDate: new Date(),
      });
      showNotification(
        "La actualización del vehículo fue exitosa",
        3000,
        false,
      );
    } catch (error) {
      handleCancel();
      showNotification(
        "Ha ocurrido un error al actualizar el vehículo",
        5000,
        false,
      );
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setVehicleToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    setIsDeletingVehicle(true);
    try {
      await dispatch(deleteVehicle(vehicleToDelete));
      setOpenDeleteDialog(false);
      setVehicleToDelete(null);
      showNotification("Vehículo eliminado exitosamente", 3000, false);
    } catch (error) {
      showNotification("Error al eliminar el vehículo", 5000, false);
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const handlePreviousDate = () => {
    const previousDate = new Date(selectedDate);
    previousDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDate);
  };

  const handleCurrentDate = () => {
    setSelectedDate(new Date());
  };

  const getNextTicketNumber = (): string => {
    const tickets = allVehicles.map((vehicle) => parseInt(vehicle.ticket));
    const maxTicket = Math.max(...tickets, 0);
    return (maxTicket + 1).toString();
  };

  const handleOpenAddVehicleModal = () => {
    setOpenAddVehicleModal(true);
  };

  const handleCloseAddVehicleModal = () => {
    setOpenAddVehicleModal(false);
  };

  const handleCreateVehicle = async (vehicleData: {
    ticket: string;
    licensePlate: string;
    brand: string;
    color: string;
    parkingLot: string;
    notes: string;
  }) => {
    setIsCreatingVehicle(true);
    try {
      const newVehicle = {
        ticket: vehicleData.ticket,
        licensePlate: vehicleData.licensePlate,
        brand: vehicleData.brand,
        color: vehicleData.color,
        parkingLot: vehicleData.parkingLot,
        notes: vehicleData.notes,
        parkingDate: selectedDate,
      };

      await dispatch(createVehicle(newVehicle));
      setOpenAddVehicleModal(false);
      showNotification("Vehículo creado exitosamente", 3000, false);
    } catch (error) {
      showNotification("Error al crear el vehículo", 5000, false);
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const exportOptions = useMemo(() => {
    const excelOption = userPermissions.includes(
      PERMISSIONS.EXPORT_EXCEL_VEHICLES,
    )
      ? exportToExcel
      : undefined;
    const pdfOption = userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES)
      ? exportToPDF
      : undefined;
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      excelOption,
      pdfOption,
      filteredWeekVehicles,
      `reporte-de-vehiculos-${exportFileFormattedDate(selectedDate || new Date())}`,
    );
  }, [userPermissions, filteredWeekVehicles, selectedDate]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box display="flex" alignItems="center">
          <DirectionsCarIcon fontSize={isSmallScreen ? "small" : "large"} />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen
                ? PAGE_TITLE.VEHICLES_SIMPLIFIED
                : PAGE_TITLE.VEHICLES}
            </Typography>
          </Box>
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_VEHICLES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES) && (
            <Box sx={{ minHeight: 65 }}>
              {filteredWeekVehicles.length > 0 && (
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
      {isLoadingVehicles ? (
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
            open={isLoadingVehicles}
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
                {filteredVehicles && (
                  <SearchBar
                    placeholder={VEHICLES_PAGE.SEARCH_PLACEHOLDER}
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAddVehicleModal}
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
            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems={{ xs: "stretch", sm: "stretch", md: "center" }}
                justifyContent="flex-end"
                gap={2}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={2}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label={VEHICLES_PAGE.DATE_PICKER_LABEL}
                      value={selectedDate || null}
                      sx={{
                        width: { xs: "100%", sm: "100%", md: "200px" },
                      }}
                      maxDate={new Date()}
                      views={["year", "month", "day"]}
                      slots={{
                        toolbar: () => null,
                      }}
                      slotProps={{
                        textField: {
                          inputProps: { readOnly: true },
                          onMouseDown: (e) => e.preventDefault(),
                        },
                        actionBar: {
                          actions: [],
                        },
                      }}
                      closeOnSelect
                      onChange={(date) => handleDateChange(date)}
                    />
                  </LocalizationProvider>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={1}
                  >
                    <Tooltip title={VEHICLES_PAGE.TOOLTIP_PREV_DAY} arrow>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          minWidth: "56px",
                        }}
                        onClick={handlePreviousDate}
                      >
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={VEHICLES_PAGE.TOOLTIP_NEXT_DAY} arrow>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          minWidth: "56px",
                        }}
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleNextDate}
                      >
                        <ArrowForwardIosRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={VEHICLES_PAGE.TOOLTIP_CURRENT_DAY} arrow>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          minWidth: "56px",
                        }}
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleCurrentDate}
                      >
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
                {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenAddVehicleModal}
                    sx={{
                      display: { xs: "none", md: "flex" },
                      px: 3,
                      py: 1.5,
                      fontSize: "1rem",
                      minHeight: 56,
                    }}
                  >
                    {VEHICLES_PAGE.ADD}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredVehicles.length > 0 ? (
            <EditableTable<Vehicle>
              data={filteredVehicles}
              columns={[
                "ticket",
                "licensePlate",
                "brand",
                "color",
                "parkingLot",
                "notes",
                "parkingDate",
              ]}
              groupByDate={selectedDate}
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
              totalCount={totalCount}
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
              <Typography variant="body1" color="textSecondary">
                {capitalizeFirstLetter(
                  format(selectedDate, "EEEE dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  }),
                )}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {VEHICLES_PAGE.NO_VEHICLES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={VEHICLES_PAGE.DIALOG_DELETE_TITLE}
        message={VEHICLES_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={VEHICLES_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={VEHICLES_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingVehicle}
        paperSx={{
          minWidth: { xs: "80vw", sm: 320 },
          maxWidth: { xs: "90vw", sm: 400 },
        }}
        icon={<DeleteOutlineIcon color="error" />}
      />
      <DialogComponent
        open={openAddVehicleModal}
        onClose={handleCloseAddVehicleModal}
        title={VEHICLES_PAGE.DIALOG_ADD_TITLE}
        subtitle={VEHICLES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={{
          minWidth: { xs: "90vw", sm: 500, md: 700 },
          maxWidth: { xs: "98vw", sm: 700 },
        }}
      >
        <AddVehicleForm
          onSubmit={handleCreateVehicle}
          onCancel={handleCloseAddVehicleModal}
          isLoading={isCreatingVehicle}
          existingVehicles={allVehicles.map((v) => ({
            ticket: v.ticket,
            licensePlate: v.licensePlate,
          }))}
          getNextTicketNumber={getNextTicketNumber}
          defaultParkingDate={selectedDate}
        />
      </DialogComponent>
    </Box>
  );
};

export default VehiclesPage;
