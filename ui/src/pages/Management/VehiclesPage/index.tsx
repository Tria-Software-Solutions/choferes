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
import ImageUploadModal from "../../../components/Modal/ImageUploadModal/ImageUploadModal.component";
import OCRResultModal from "../../../components/Modal/OCRModal/OCRModal.component";
import { OCRResult, VehicleEntry } from "../../../services/ocrService";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { createVehicleNotification } from "../../../services/notificationService";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
  Backdrop,
  Paper,
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
import { Car, Download, ChevronLeft, ChevronRight, X, Search, Plus, Trash2, PlusCircle, RotateCcw, ScanText } from "lucide-react";
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
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
  const [openImageUploadModal, setOpenImageUploadModal] = useState(false);
  const [openOCRResultModal, setOpenOCRResultModal] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

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

      // Allow alphanumeric with letters, hyphens, and numbers
      return /^[a-zA-Z0-9-]+$/i.test(trimmedParkingLot) || trimmedParkingLot === "";
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

        // Allow alphanumeric with letters, hyphens, and numbers
        return /^[a-zA-Z0-9-]+$/i.test(trimmedValue) || trimmedValue === "";
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

  // Scan modal handlers
  const handleOpenScanModal = () => {
    setOpenImageUploadModal(true);
  };

  const handleCloseImageUploadModal = () => {
    setOpenImageUploadModal(false);
  };

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
    setOpenOCRResultModal(true);
  };

  const handleCloseOCRResultModal = () => {
    setOpenOCRResultModal(false);
    setOcrResult(null);
    setOcrError(null);
  };

  const handleImportOCRData = async (entries: VehicleEntry[]) => {
    try {
      // Convert OCR entries to vehicle data and create them
      for (const entry of entries) {
        const newVehicle = {
          ticket: entry.ticket,
          licensePlate: entry.licensePlate,
          brand: entry.brand,
          color: entry.color,
          parkingLot: entry.parkingSpace,
          notes: entry.observation,
          parkingDate: selectedDate.toISOString(),
        };
        await dispatch(createVehicle(newVehicle));
      }
      
      showNotification(`Se importaron ${entries.length} vehículos correctamente`, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notifications for each imported vehicle
      entries.forEach((entry) => {
        createVehicleNotification(
          "created",
          `${entry.licensePlate} - ${entry.brand}`
        );
      });
    } catch (error) {
      showNotification("Error al importar vehículos desde OCR", {
        severity: "error",
        duration: 5000,
      });
    }
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


  // Use exportTable({ data: exportData, ... }) for export

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
          my: 0,
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
                <Car size={22} color={theme.palette.primary.contrastText} />
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
                  {isSmallScreen ? PAGE_TITLE.VEHICLES_SIMPLIFIED : PAGE_TITLE.VEHICLES}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredVehicles.length} vehículos registrados
                </Typography>
              </Box>
            </Box>

            {/* Export Speed Dial */}
            {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_VEHICLES) &&
              userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES) && (
                <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
                  {filteredWeekVehicles.length > 0 && (
                    <SpeedDialComponent
                      actions={[
                        {
                          label: "Exportar a Excel",
                          icon: <ExcelIcon size={20} />,
                          onClick: () => handleExport("excel"),
                        },
                        {
                          label: "Exportar a PDF",
                          icon: <PdfIcon size={20} />,
                          onClick: () => handleExport("pdf"),
                        },
                      ]}
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
              {filteredVehicles && (
                <SearchBarComponent
                  placeholder={MANAGEMENT.VEHICLES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              )}
            </Box>

            {/* Date Controls & Add Button */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={1}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                gap={1}
              >
                {/* Previous Day Button */}
                <PremiumTooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_PREV_DAY}>
                  <span>
                    <Button
                      variant="outlined"
                      onClick={handlePreviousDate}
                      disableRipple
                      disableElevation
                      sx={{
                        minWidth: '44px',
                        height: '44px',
                        px: 1.5,
                        borderRadius: '10px',
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                        },
                        '&.Mui-disabled': {
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <ChevronLeft size={20} />
                    </Button>
                  </span>
                </PremiumTooltip>

                {/* Date Picker */}
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    value={selectedDate}
                    maxDate={new Date()}
                    views={["year", "month", "day"]}
                    format="EEEE d 'de' MMMM 'de' yyyy"
                    slots={{ toolbar: () => null }}
                    slotProps={{
                      textField: {
                        fullWidth: false,
                        required: true,
                        variant: "outlined",
                        sx: {
                          width: { xs: '100%', sm: '320px', md: '360px' },
                          '& .MuiOutlinedInput-root': {
                            height: "44px",
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& fieldset': {
                              borderColor: 'transparent',
                              borderWidth: '0',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              '& fieldset': {
                                borderColor: 'transparent',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(0,0,0,0.04)',
                              '& fieldset': {
                                borderColor: 'transparent',
                                borderWidth: '0',
                              },
                            },
                            '& input': {
                              textOverflow: 'ellipsis',
                              textAlign: 'center',
                            },
                          },
                        },
                      },
                    }}
                    closeOnSelect
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>

                {/* Next Day Button */}
                <PremiumTooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_NEXT_DAY}>
                  <span>
                    <Button
                      variant="outlined"
                      disabled={isTodayOrFuture(selectedDate)}
                      onClick={handleNextDate}
                      disableRipple
                      disableElevation
                      sx={{
                        minWidth: '44px',
                        height: '44px',
                        px: 1.5,
                        borderRadius: '10px',
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                        },
                        '&.Mui-disabled': {
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </span>
                </PremiumTooltip>

                {/* Current Day Button */}
                <PremiumTooltip title={MANAGEMENT.VEHICLES_PAGE.TOOLTIP_CURRENT_DAY}>
                  <span>
                    <Button
                      variant="outlined"
                      disabled={isTodayOrFuture(selectedDate)}
                      onClick={handleCurrentDate}
                      disableRipple
                      disableElevation
                      sx={{
                        minWidth: '44px',
                        height: '44px',
                        px: 1.5,
                        borderRadius: '10px',
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                        },
                        '&.Mui-disabled': {
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <RotateCcw size={18} />
                    </Button>
                  </span>
                </PremiumTooltip>
              </Box>

              {/* Add and Scan Buttons Desktop */}
              {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleOpenAddVehicleModal}
                    sx={{
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      letterSpacing: "-0.01em",
                      borderRadius: '10px',
                      height: '44px',
                    }}
                  >
                    {MANAGEMENT.ADD}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScanText size={18} />}
                    onClick={handleOpenScanModal}
                    sx={{
                      px: 2.5,
                      py: 1,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      letterSpacing: "-0.01em",
                      borderRadius: '10px',
                      height: '44px',
                      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                      '&:hover': {
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                      },
                    }}
                  >
                    Escanear
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Mobile Add and Scan Buttons */}
        {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddVehicleModal}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: '10px',
                flex: 1,
              }}
            >
              {MANAGEMENT.ADD}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScanText size={18} />}
              onClick={handleOpenScanModal}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: '10px',
                borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                flex: 1,
                '&:hover': {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              Escanear
            </Button>
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {isLoadingVehicles ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingVehicles}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : (
            <>
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
                  <Search color="disabled" style={noVehiclesIconStyles} />
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
        </Box>
      </Paper>
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
        icon={<Trash2 color="var(--mui-palette-error-main)" />}
      />
      <DialogComponent
        open={openAddVehicleModal}
        onClose={handleCloseAddVehicleModal}
        title={MANAGEMENT.VEHICLES_PAGE.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.VEHICLES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<PlusCircle color="var(--mui-palette-info-main)" />}
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
      
      {/* Image Upload Modal */}
      <ImageUploadModal
        open={openImageUploadModal}
        onClose={handleCloseImageUploadModal}
        onOCRComplete={handleOCRComplete}
        selectedDate={selectedDate}
      />
      
      {/* OCR Result Modal */}
      <OCRResultModal
        open={openOCRResultModal}
        onClose={handleCloseOCRResultModal}
        result={ocrResult}
        isLoading={false}
        error={ocrError}
        onImportData={handleImportOCRData}
      />
    </Box>
  );
};

export default VehiclesPage;
