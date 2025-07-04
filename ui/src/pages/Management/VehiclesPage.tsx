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
import AddVehicleForm from "../Forms/AddVehicleForm";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import DialogComponent from "../../components/Dialog/DialogComponent";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  Button,
  CircularProgress,
  Backdrop,
  Tooltip,
  ButtonGroup,
  Divider,
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
import PAGE_TITLE from "../../constants/pageTitle.constants";
import PERMISSIONS from "../../constants/permissions.constants";
import NOTIFICATIONS from "../../constants/notifications.constants";
import MANAGEMENT from "../../constants/management.constants";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
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
import {
  vehiclesHeaderBoxStyles,
  vehiclesTitleBoxStyles,
  vehiclesTitleStyles,
  vehiclesIconStyles,
  vehiclesDividerStyles,
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  searchBarBoxStyles,
  addButtonMobileStyles,
  addButtonDesktopStyles,
  datePickerSx,
  buttonGroupSx,
  noVehiclesBoxStyles,
  noVehiclesIconStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./VehiclesPage.styles";

// Vehicles management page component
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize cleaned filter for search
  const cleanedFilter = useMemo(
    () => filter.replace(/[\s-]/g, "").toLowerCase(),
    [filter],
  );

  // Memoize filtered vehicles for selected date and search
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

  // Update total count when filtered vehicles change
  useEffect(() => {
    setTotalCount(filteredVehicles.length);
  }, [filteredVehicles]);

  // Fetch all vehicles on mount
  useEffect(() => {
    if (shouldRefetch) {
      dispatch(fetchVehicles({}));
    }
  }, [dispatch, shouldRefetch]);

  // Adjust rows per page based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

  // Filter vehicles for the selected week
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

  // Validate edit fields for vehicle
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

  // Update edit form validity when fields change
  useEffect(() => {
    setIsEditFormValid(validateFields(editFields));
  }, [editFields, validateFields]);

  // Handle search bar input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // Handle date picker change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle editing of a vehicle
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

  // Cancel editing
  const handleCancel = () => {
    setEditRowId(null);
  };

  // Handle update of a vehicle
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
      showNotification(NOTIFICATIONS.VEHICLE_UPDATED, 3000, false);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.VEHICLE_UPDATE_ERROR, 5000, false);
    }
  };

  // Open/close delete confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setVehicleToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Handle deletion of a vehicle
  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    setIsDeletingVehicle(true);
    try {
      await dispatch(deleteVehicle(vehicleToDelete));
      setOpenDeleteDialog(false);
      setVehicleToDelete(null);
      showNotification(NOTIFICATIONS.VEHICLE_DELETE_SUCCESS, 3000, false);
    } catch (error) {
      showNotification(NOTIFICATIONS.VEHICLE_DELETE_ERROR, 5000, false);
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  // Handle navigation to next/previous/current date
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

  // Get the next available ticket number
  const getNextTicketNumber = (): string => {
    const tickets = allVehicles.map((vehicle) => parseInt(vehicle.ticket));
    const maxTicket = Math.max(...tickets, 0);
    return (maxTicket + 1).toString();
  };

  // Open/close add vehicle modal
  const handleOpenAddVehicleModal = () => {
    setOpenAddVehicleModal(true);
  };

  const handleCloseAddVehicleModal = () => {
    setOpenAddVehicleModal(false);
  };

  // Handle creation of a new vehicle
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
      showNotification(NOTIFICATIONS.VEHICLE_CREATE_SUCCESS, 3000, false);
    } catch (error) {
      showNotification(NOTIFICATIONS.VEHICLE_CREATE_ERROR, 5000, false);
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
        sx={vehiclesHeaderBoxStyles}
      >
        <Box display="flex" flexDirection="column" alignItems="flex-start" sx={vehiclesTitleBoxStyles}>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={vehiclesTitleStyles}
          >
            <DirectionsCarFilledIcon fontSize={isSmallScreen ? "small" : "large"} sx={vehiclesIconStyles(theme)} />
            {PAGE_TITLE.VEHICLES}
          </Typography>
          <Divider sx={vehiclesDividerStyles(theme)} />
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_VEHICLES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES) && (
            <Box sx={exportSpeedDialBoxStyles}>
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
          sx={loadingBoxStyles}
        >
          <Backdrop
            sx={backdropStyles(theme)}
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
              <Box sx={searchBarBoxStyles}>
                {filteredVehicles && (
                  <SearchBar
                    placeholder={MANAGEMENT.VEHICLES_PAGE.SEARCH_PLACEHOLDER}
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
                    sx={addButtonMobileStyles}
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
                <Box display="flex" alignItems="center" justifyContent="flex-start" gap={1}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label={MANAGEMENT.VEHICLES_PAGE.DATE_PICKER_LABEL}
                      value={selectedDate || null}
                      maxDate={new Date()}
                      views={["year", "month", "day"]}
                      slots={{ toolbar: () => null }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          variant: "outlined",
                          sx: datePickerSx,
                        },
                      }}
                      closeOnSelect
                      onChange={(date) => handleDateChange(date)}
                    />
                  </LocalizationProvider>
                  <ButtonGroup
                    variant="contained"
                    sx={buttonGroupSx}
                  >
                    <Tooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_PREV_DAY} arrow>
                      <Button onClick={handlePreviousDate}>
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_NEXT_DAY} arrow>
                      <Button disabled={isTodayOrFuture(selectedDate)} onClick={handleNextDate}>
                        <ArrowForwardIosRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_CURRENT_DAY} arrow>
                      <Button disabled={isTodayOrFuture(selectedDate)} onClick={handleCurrentDate}>
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenAddVehicleModal}
                    sx={addButtonDesktopStyles}
                  >
                    {MANAGEMENT.VEHICLES_PAGE.ADD}
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
              sx={noVehiclesBoxStyles}
            >
              <ManageSearchIcon color="disabled" sx={noVehiclesIconStyles} />
              <Typography variant="body1" color="textSecondary">
                {capitalizeFirstLetter(
                  format(selectedDate, "EEEE dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  }),
                )}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {MANAGEMENT.VEHICLES_PAGE.NO_VEHICLES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_TITLE}
        message={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingVehicle}
        paperSx={deleteDialogPaperSx ?? {}}
        icon={<DeleteOutlineIcon color="error" />}
      />
      <DialogComponent
        open={openAddVehicleModal}
        onClose={handleCloseAddVehicleModal}
        title={MANAGEMENT.VEHICLES_PAGE.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.VEHICLES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
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
