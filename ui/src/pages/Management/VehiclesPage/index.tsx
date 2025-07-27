import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Vehicle } from "../../../models/Vehicle";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../../store/slices/vehiclesSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import AddVehicleForm from "../../Forms/AddVehicleForm";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { createVehicleNotification } from "../../../services/notificationService";
import OCRResultModal from "../../../components/Modal/OCRModal/OCRModal.component";
import {
  OCRService,
  VehicleEntry,
  OCRResult,
} from "../../../services/ocrService";
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
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isTodayOrFuture } from "../../../utils/dates";
import {
  exportFileFormattedDate,
  exportTable,
  ExportableRecord,
} from "../../../utils/export";
import { capitalizeFirstLetter } from "../../../utils/string";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
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
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ImageIcon from "@mui/icons-material/Image";

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

// Vehicles management page component
const VehiclesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const preferencesKey = "vehicles-preferences";
  const defaultPreferences = { date: new Date().toISOString() };
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
    return prefs.date ? new Date(prefs.date) : new Date();
  });
  const { allVehicles, isLoadingVehicles } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { showNotification } = useAppNotifications();
  const [filteredWeekVehicles, setFilteredWeekVehicles] = useState<Vehicle[]>(
    []
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
  const [page, setPage] = useState(0);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [shouldRefetch] = useState(true);
  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  // File input ref for image upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // OCR states
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("vehicles", getInitialRowsPerPage);

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
        cleanedLicensePlate.includes(search) ||
        `${vehicle.ticket} ${vehicle.brand} ${vehicle.color} ${cleanedParkingLot} ${vehicle.notes}`
          .toLowerCase()
          .includes(search)
      );
    });

    return filtered;
  }, [allVehicles, selectedDate, search]);

  // Update total count when filtered vehicles change
  useEffect(() => {
    setTotalCount(filteredVehicles.length);
  }, [filteredVehicles]);

  // Fetch all vehicles on mount
  useEffect(() => {
    if (shouldRefetch) {
      dispatch(fetchVehicles({}));
    }
  }, [dispatch, shouldRefetch, location.pathname]);

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
    };

    // Dynamic parking lot validation
    const validateParkingLot = (parkingLot: string) => {
      const trimmedParkingLot = parkingLot.trim();

      // If starts with ATP, use strict validation
      if (trimmedParkingLot.toUpperCase().startsWith("ATP")) {
        return /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i.test(trimmedParkingLot);
      }

      // For any other prefix or format, consider it valid
      return true;
    };

    return (
      regex.number.test(fields.ticket) &&
      regex.plate.test(fields.licensePlate.trim()) &&
      regex.text.test(fields.brand) &&
      regex.text.test(fields.color) &&
      validateParkingLot(fields.parkingLot)
    );
  }, []);

  // Update edit form validity when fields change
  useEffect(() => {
    setIsEditFormValid(validateFields(editFields));
  }, [editFields, validateFields]);

  // Validate individual field for EditableTable
  const validateField = useCallback(
    (field: string, value: string | boolean | string[]) => {
      if (field === "parkingLot" && typeof value === "string") {
        const trimmedValue = value.trim();

        // If starts with ATP, use strict validation
        if (trimmedValue.toUpperCase().startsWith("ATP")) {
          return /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i.test(trimmedValue);
        }

        // For any other prefix or format, consider it valid
        return true;
      }

      if (field === "licensePlate" && typeof value === "string") {
        // Check if license plate already exists on the same day (excluding current row)
        const sameDayVehicles = allVehicles.filter((v) => {
          const vehicleDate = new Date(v.parkingDate);
          const editDate = new Date(editFields.parkingDate);
          const vehicleDateStr = vehicleDate.toISOString().split("T")[0];
          const editDateStr = editDate.toISOString().split("T")[0];
          return (
            vehicleDateStr === editDateStr &&
            v.licensePlate === value.trim() &&
            v.id !== editRowId
          ); // Exclude current row being edited
        });
        return sameDayVehicles.length === 0;
      }

      return true; // Default validation for other fields
    },
    [allVehicles, editFields.parkingDate, editRowId]
  );

  // Handle date picker change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
      setPreferencesObject(preferencesKey, {
        ...prefs,
        date: date.toISOString(),
      });
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
        parkingDate: (editFields.parkingDate as Date).toISOString(),
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
      showNotification(NOTIFICATIONS.VEHICLE_UPDATED, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      createVehicleNotification(
        "updated",
        `${editFields.licensePlate} - ${editFields.brand}`
      );
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.VEHICLE_UPDATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
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
      showNotification(NOTIFICATIONS.VEHICLE_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      const vehicle = allVehicles.find((v) => v.id === vehicleToDelete);
      if (vehicle) {
        createVehicleNotification(
          "deleted",
          `${vehicle.licensePlate} - ${vehicle.brand}`
        );
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.VEHICLE_DELETE_ERROR, {
        severity: "error",
        duration: 5000,
      });
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
        parkingDate: selectedDate.toISOString(),
      };

      await dispatch(createVehicle(newVehicle));
      setOpenAddVehicleModal(false);
      showNotification(NOTIFICATIONS.VEHICLE_CREATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      createVehicleNotification(
        "created",
        `${vehicleData.licensePlate} - ${vehicleData.brand}`
      );
    } catch (error) {
      showNotification(NOTIFICATIONS.VEHICLE_CREATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const getExportDataAndHeaders = () => {
    const exportRows: ExportableRecord[] = [];
    const exportHeaders = [
      "Fecha",
      "Boleta",
      "Placa",
      "Marca",
      "Color",
      "Espacio",
      "Observaciones",
    ];
    const firstRow: string[] = [
      capitalizeFirstLetter(
        format(new Date(selectedDate), "EEEE dd 'de' MMMM 'de' yyyy", {
          locale: es,
        })
      ),
      ...Array(exportHeaders.length - 1).fill(""),
    ];
    const secondRow: string[] = [...exportHeaders];
    filteredWeekVehicles.forEach((v) => {
      exportRows.push({
        Fecha: v.parkingDate
          ? format(new Date(v.parkingDate), "dd/MM/yyyy")
          : "",
        Boleta: v.ticket,
        Placa: v.licensePlate,
        Marca: v.brand,
        Color: v.color,
        Espacio: v.parkingLot,
        Observaciones: v.notes,
      });
    });
    const groupedHeaders = [firstRow, secondRow];
    return { exportRows, exportHeaders, groupedHeaders };
  };

  // Handler para exportar con groupedHeaders (solo Excel)
  const handleExport = (format: "excel" | "pdf") => {
    const { exportRows, exportHeaders, groupedHeaders } =
      getExportDataAndHeaders();
    exportTable({
      data: exportRows,
      fileName: `reporte-de-vehiculos-${exportFileFormattedDate(selectedDate || new Date())}`,
      format,
      customHeaders: exportHeaders,
      groupedHeaders: format === "excel" ? groupedHeaders : undefined,
    });
  };

  // Handler para abrir archivo de imagen
  const handleOpenImageFile = () => {
    fileInputRef.current?.click();
  };

  // Handler para procesar el archivo seleccionado con OCR
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar que sea una imagen
      if (file.type.startsWith("image/")) {
        try {
          setIsOcrLoading(true);
          setOcrError(null);
          setShowOcrModal(true);

          // Procesar la imagen con OCR
          const result = await OCRService.processImage(file);
          setOcrResult(result);

          showNotification(
            `Imagen procesada exitosamente. Se encontraron ${result.entries.length} entradas.`,
            {
              severity: "success",
              duration: 3000,
            }
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error al procesar la imagen";
          setOcrError(errorMessage);
          showNotification(errorMessage, {
            severity: "error",
            duration: 5000,
          });
        } finally {
          setIsOcrLoading(false);
        }
      } else {
        showNotification("Por favor selecciona un archivo de imagen válido", {
          severity: "error",
          duration: 3000,
        });
      }
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = "";
  };
  // OCR modal handlers
  const handleCloseOcrModal = () => {
    setShowOcrModal(false);
    setOcrResult(null);
    setOcrError(null);
  };

  const handleImportOcrData = async (entries: VehicleEntry[]) => {
    try {
      setIsCreatingVehicle(true);

      // Convert OCR entries to vehicle format and create them
      for (const entry of entries) {
        const vehicleData = {
          ticket: entry.ticket,
          licensePlate: entry.licensePlate,
          brand: entry.brand,
          color: entry.color,
          parkingLot: entry.parkingSpace,
          notes: entry.observation,
          parkingDate: selectedDate.toISOString(), // Use the currently selected date
        };

        await dispatch(createVehicle(vehicleData)).unwrap();
      }

      showNotification(
        `Se importaron ${entries.length} vehículos exitosamente.`,
        {
          severity: "success",
          duration: 5000,
        }
      );

      // Refresh the vehicles list
      dispatch(fetchVehicles({}));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al importar los datos";
      showNotification(errorMessage, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  // Use exportTable({ data: exportData, ... }) for export

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={vehiclesHeaderBoxStyles}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          sx={vehiclesTitleBoxStyles}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={vehiclesTitleStyles}
          >
            <DirectionsCarFilledIcon
              fontSize={isSmallScreen ? "small" : "large"}
              sx={vehiclesIconStyles(theme)}
            />
            {isSmallScreen
              ? PAGE_TITLE.VEHICLES_SIMPLIFIED
              : PAGE_TITLE.VEHICLES}
          </Typography>
          <Divider sx={vehiclesDividerStyles(theme)} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_VEHICLES) &&
            userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES) && (
              <Box sx={exportSpeedDialBoxStyles}>
                {filteredWeekVehicles.length > 0 && (
                  <SpeedDialComponent
                    actions={[
                      {
                        label: "Exportar a Excel",
                        icon: <DescriptionIcon />,
                        onClick: () => handleExport("excel"),
                      },
                      {
                        label: "Exportar a PDF",
                        icon: <PictureAsPdfIcon />,
                        onClick: () => handleExport("pdf"),
                      },
                    ]}
                    mainIcon={<DownloadRoundedIcon />}
                    openIcon={<CloseRoundedIcon />}
                    direction="left"
                  />
                )}
              </Box>
            )}

          {/* Botón para procesar imagen con OCR */}
          {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
            <Tooltip title="Procesar imagen" arrow>
              <IconButton
                onClick={handleOpenImageFile}
                sx={{
                  top: "-4px",
                  width: "62px",
                  height: "58px",
                  borderRadius: "8px",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : theme.palette.primary.main,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: theme.transitions.create(
                    ["background", "box-shadow", "transform"],
                    {
                      duration: theme.transitions.duration.short,
                    }
                  ),
                  fontSize: 40,
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                }}
              >
                <ImageIcon />
              </IconButton>
            </Tooltip>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Box>
      </Box>
      {isLoadingVehicles ? (
        <Box sx={loadingBoxStyles}>
          <Backdrop sx={backdropStyles(theme)} open={isLoadingVehicles}>
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
                  <SearchBarComponent
                    placeholder={MANAGEMENT.VEHICLES_PAGE.SEARCH_PLACEHOLDER}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap={1}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label={MANAGEMENT.VEHICLES_PAGE.DATE_PICKER_LABEL}
                      value={selectedDate}
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
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                  <ButtonGroup variant="contained" sx={buttonGroupSx}>
                    <Tooltip
                      title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_PREV_DAY}
                      arrow
                    >
                      <Button onClick={handlePreviousDate}>
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_NEXT_DAY}
                      arrow
                    >
                      <span>
                        <Button
                          disabled={isTodayOrFuture(selectedDate)}
                          onClick={handleNextDate}
                        >
                          <ArrowForwardIosRoundedIcon />
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_CURRENT_DAY}
                      arrow
                    >
                      <span>
                        <Button
                          disabled={isTodayOrFuture(selectedDate)}
                          onClick={handleCurrentDate}
                        >
                          <CalendarTodayRoundedIcon />
                        </Button>
                      </span>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) &&
                  !isSmallScreen && (
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenAddVehicleModal}
                      sx={addButtonDesktopStyles}
                    >
                      {MANAGEMENT.ADD}
                    </Button>
                  )}
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredVehicles.length > 0 ? (
            <EditableTableComponent<Vehicle>
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
              validateField={validateField}
            />
          ) : (
            <Box sx={noVehiclesBoxStyles}>
              <ManageSearchIcon color="disabled" sx={noVehiclesIconStyles} />
              <Typography variant="body1" color="textSecondary">
                {capitalizeFirstLetter(
                  format(selectedDate, "EEEE dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
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
        icon={<AddCircleOutlineIcon color="info" />}
      >
        <AddVehicleForm
          onSubmit={handleCreateVehicle}
          onCancel={handleCloseAddVehicleModal}
          isLoading={isCreatingVehicle}
          existingVehicles={allVehicles.map((v) => ({
            ticket: v.ticket,
            licensePlate: v.licensePlate,
            brand: v.brand,
            color: v.color,
            parkingDate: v.parkingDate,
          }))}
          getNextTicketNumber={getNextTicketNumber}
          defaultParkingDate={selectedDate}
        />
      </DialogComponent>

      {/* OCR Result Modal */}
      <OCRResultModal
        open={showOcrModal}
        onClose={handleCloseOcrModal}
        result={ocrResult}
        isLoading={isOcrLoading}
        error={ocrError}
        onImportData={handleImportOcrData}
      />
    </Box>
  );
};

export default VehiclesPage;
