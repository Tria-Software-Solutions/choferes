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
import ExportMenu from "../../../components/ExportMenu/ExportMenu.component";
import AddVehicleForm from "../../Forms/AddVehicleForm";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  Box,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isTodayOrFuture } from "../../../utils/dates";
import {
  exportFileFormattedDate,
  exportTable,
  ExportableRecord,
} from "../../../utils/export";
import { capitalizeFirstLetter } from "../../../utils/string";
import APPBAR_MENU from "../../../constants/appbar.constants";
import NavIcon from "../../../components/NavIcon/NavIcon.component";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { IconParking, IconCirclePlus, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import DateNavigator from "../../../components/DateNavigator/DateNavigator.component";
import {
  EmptyState,
  LoadingState,
  PageBody,
  PageCard,
  PageContainer,
  PageHeader,
} from "../../../components/Layout";
import {
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import { useDebounce } from "../../../hooks/useDebounce";
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
  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const location = useLocation();

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("vehicles", getInitialRowsPerPage);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch vehicles on mount, when debounced search changes, or when navigating back
  useEffect(() => {
    dispatch(
      fetchVehicles({
        search: debouncedSearch || undefined,
      }),
    );
  }, [dispatch, debouncedSearch, location.pathname]);

  // Memoize vehicles filtered by selected date (search is handled server-side)
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

    // Also apply client-side search for instant feedback
    if (!search) return vehiclesForSelectedDate;

    const searchLower = search.toLowerCase();
    return vehiclesForSelectedDate.filter((vehicle) => {
      const cleanedLicensePlate = vehicle.licensePlate
        .replace(/[\s-]/g, "")
        .toLowerCase();
      const cleanedParkingLot = vehicle.parkingLot
        .replace(/[\s-]/g, "")
        .toLowerCase();

      return (
        cleanedLicensePlate.includes(searchLower) ||
        `${vehicle.ticket} ${vehicle.brand} ${vehicle.color} ${cleanedParkingLot} ${vehicle.notes}`
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [allVehicles, selectedDate, search]);

  // Update total count when filtered vehicles change
  useEffect(() => {
    setTotalCount(filteredVehicles.length);
  }, [filteredVehicles]);

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
      await dispatch(updateVehicle({ id, updatedVehicle })).unwrap();
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
      await dispatch(deleteVehicle(vehicleToDelete)).unwrap();
      setOpenDeleteDialog(false);
      setVehicleToDelete(null);
      showNotification(NOTIFICATIONS.VEHICLE_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
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

      await dispatch(createVehicle(newVehicle)).unwrap();
      setOpenAddVehicleModal(false);
      showNotification(NOTIFICATIONS.VEHICLE_CREATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

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
    const banner = groupedHeaders?.[0]?.[0] ?? "";
    exportTable({
      data: exportRows,
      fileName: `reporte-de-vehiculos-${exportFileFormattedDate(selectedDate || new Date())}`,
      format,
      customHeaders: exportHeaders,
      groupedHeaders,
      title: "Reporte de Vehículos",
      subtitle: banner || undefined,
    });
  };


  // Use exportTable({ data: exportData, ... }) for export

  const canCreateVehicles = userPermissions.includes(PERMISSION_CODES.CREATE_VEHICLES);
  const canExport = userPermissions.includes(PERMISSION_CODES.EXPORT_VEHICLES);
  const selectedDateLabel = capitalizeFirstLetter(
    format(selectedDate, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es }),
  );

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.VEHICLES} />}
          title={PAGE_TITLE.VEHICLES}
          mobileTitle={PAGE_TITLE.VEHICLES_SIMPLIFIED}
          subtitle={`${filteredVehicles.length} vehículos · ${selectedDateLabel}`}
          actions={
            canExport ? (
              <ExportMenu
                disabled={filteredWeekVehicles.length === 0}
                actions={[
                  {
                    label: "Exportar a Excel",
                    icon: <ExcelIcon size={18} />,
                    onClick: () => handleExport("excel"),
                  },
                  {
                    label: "Exportar a PDF",
                    icon: <PdfIcon size={18} />,
                    onClick: () => handleExport("pdf"),
                  },
                ]}
              />
            ) : undefined
          }
          toolbar={
            <>
              <Box sx={{ flex: 1, maxWidth: { sm: 300 }, minWidth: { xs: "100%", sm: 200 } }}>
                <SearchBarComponent
                  placeholder={MANAGEMENT.VEHICLES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  isSearching={isLoadingVehicles && search !== ""}
                />
              </Box>
              <DateNavigator
                value={selectedDate}
                maxDate={new Date()}
                onChange={handleDateChange}
                onPrevious={handlePreviousDate}
                onNext={handleNextDate}
                onReset={handleCurrentDate}
                disableNext={isTodayOrFuture(selectedDate)}
                disableReset={isTodayOrFuture(selectedDate)}
                labels={{
                  previous: MANAGEMENT.VEHICLES_PAGE.TOOLTIP_PREV_DAY,
                  next: MANAGEMENT.VEHICLES_PAGE.TOOLTIP_NEXT_DAY,
                  reset: MANAGEMENT.VEHICLES_PAGE.TOOLTIP_CURRENT_DAY,
                }}
              />
            </>
          }
          toolbarEnd={
            canCreateVehicles ? (
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={handleOpenAddVehicleModal}
              >
                {MANAGEMENT.VEHICLES_PAGE.ADD}
              </Button>
            ) : undefined
          }
        />

        <PageBody>
          {isLoadingVehicles && filteredVehicles.length === 0 ? (
            <LoadingState label="Cargando vehículos…" />
          ) : filteredVehicles.length > 0 ? (
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
              permissionMap={{
                edit: PERMISSION_CODES.EDIT_VEHICLES,
                delete: PERMISSION_CODES.DELETE_VEHICLES,
              }}
              validateField={validateField}
            />
          ) : (
            <EmptyState
              icon={search ? <IconSearch /> : <IconParking />}
              title={MANAGEMENT.VEHICLES_PAGE.NO_VEHICLES}
              description={
                search
                  ? "Prueba con otro término de búsqueda."
                  : `No hay registros para el ${selectedDateLabel.toLowerCase()}.`
              }
              action={
                canCreateVehicles && !search ? (
                  <Button
                    variant="outlined"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleOpenAddVehicleModal}
                  >
                    {MANAGEMENT.VEHICLES_PAGE.ADD}
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
        title={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_TITLE}
        message={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={MANAGEMENT.VEHICLES_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingVehicle}
        paperSx={deleteDialogPaperSx ?? {}}
        icon={<IconTrash color="var(--mui-palette-error-main)" />}
      />
      <DialogComponent
        open={openAddVehicleModal}
        onClose={handleCloseAddVehicleModal}
        title={MANAGEMENT.VEHICLES_PAGE.DIALOG_ADD_TITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<IconCirclePlus color="var(--mui-palette-info-main)" />}
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
      
    </PageContainer>
  );
};

export default VehiclesPage;
