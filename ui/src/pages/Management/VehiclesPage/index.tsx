/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Vehicle } from "../../../models/Vehicle";
import { useReduxData, useAppDispatch } from "../../../hooks/useReduxData";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../../store/slices/vehiclesSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import DateSelectionComponent from "../../../components/DateSelection/DateSelection.component";
import AddVehicleForm from "../../Forms/AddVehicleForm";
import { es } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import AppModal from "../../../components/AppModal/AppModal.component";
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
import { format } from "date-fns";
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
import { Car, Download, X, Search, Plus, Trash2, FileText, Table, PlusCircle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  noVehiclesBoxStyles,
  noVehiclesIconStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useResponsiveTableHeight } from "../../../hooks/useResponsiveTableHeight";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";

// Vehicles management page component
const VehiclesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userPermissions } = useAuthContext();
  const preferencesKey = "vehicles-preferences";
  const defaultPreferences = { date: new Date().toISOString() };
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
    const today = new Date();
    const savedDate = prefs.date ? new Date(prefs.date) : today;
    
    // Check if saved date is today, if not use today
    const isToday = savedDate.toDateString() === today.toDateString();
    return isToday ? savedDate : today;
  });
  const { allVehicles, isLoadingVehicles } = useReduxData(
    (state) => state.vehicles,
    (prev, next) => prev.allVehicles === next.allVehicles && prev.isLoadingVehicles === next.isLoadingVehicles
  );
  const { showNotification } = useAppNotifications();

  // Use dynamic table height hook
  const { maxHeight, rowsPerPage: calculatedRowsPerPage } = useResponsiveTableHeight();
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("vehicles", () => calculatedRowsPerPage);

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

  // Fetch all vehicles on mount (only if not already loaded)
  useEffect(() => {
    if (shouldRefetch && allVehicles.length === 0) {
      dispatch(fetchVehicles({}));
    }
  }, [dispatch, shouldRefetch, allVehicles.length]);

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


  // Use exportTable({ data: exportData, ... }) for export

  return (
    <Box sx={{ height: "calc(100vh - 64px - 32px)", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
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
            py: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
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
                          icon: <Table size={20} />,
                          onClick: () => handleExport("excel"),
                        },
                        {
                          label: "Exportar a PDF",
                          icon: <FileText size={20} />,
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
            <Box flex={1} maxWidth={{ sm: "380px" }}>
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
                gap={0.5}
                flexWrap="wrap"
              >
                {/* Previous Date Button */}
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
                  }}
                >
                  <ChevronLeft size={20} />
                </Button>

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
                          width: { xs: '100%', sm: '280px' },
                          '& .MuiOutlinedInput-root': {
                            height: "44px",
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
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

                {/* Next Date Button */}
                <Button
                  variant="outlined"
                  disabled={selectedDate >= new Date()}
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

                {/* Current Date Button */}
                <Button
                  variant="outlined"
                  disabled={selectedDate.toDateString() === new Date().toDateString()}
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
              </Box>

              {/* Add Button Desktop */}
              {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
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
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Mobile Add Button */}
        {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 1.5, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddVehicleModal}
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
                  maxTableHeight={maxHeight}
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
      <AppModal
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
      <AppModal
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
      </AppModal>
    </Box>
  );
};

export default VehiclesPage;
