import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useSelector /*useDispatch*/ } from "react-redux";
import { RootState /*AppDispatch*/ } from "../../../store/store";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import AppModal from "../../../components/AppModal/AppModal.component";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { createCourierNotification } from "../../../services/notificationService";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
  Backdrop,
  ButtonGroup,
  Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMidnightDate, isTodayOrFuture } from "../../../utils/dates";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import { capitalizeFirstLetter } from "../../../utils/string";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { Download, ChevronLeft, ChevronRight, Calendar, X, Search } from "lucide-react";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import { Courier } from "../../../models/Courier";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import AddCourierForm from "../../Forms/AddCourierForm";
import { Plus, Trash2, Truck } from "lucide-react";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  noCouriersBoxStyles,
  noCouriersIconStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import { useResponsiveTableHeight } from "../../../hooks/useResponsiveTableHeight";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import { FileText, Table, PlusCircle } from "lucide-react";

// Define EditFieldValue type locally since it's not exported from EditableTableComponent
type EditFieldValue = string | boolean | number | string[] | Date;

// CourierServicePage component for managing courier services
const CourierServicePage: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const preferencesKey = "couriers-preferences";
  const defaultPreferences = { date: new Date().toISOString() };
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
    return prefs.date ? new Date(prefs.date) : new Date();
  });
  const { /*couriers, allCouriers, isLoadingCourier,*/ isLoadingVehicles } =
    useSelector((state: RootState) => state.vehicles);
  const { showNotification } = useAppNotifications();
  const [filteredCouriers, setFilteredCouriers] = useState<Courier[]>([
    {
      id: 1,
      driver: "Juan Pérez",
      route: "GAM",
      distance: 45,
      trackingNumber: "TRK001",
      status: "Despachado",
      createdAt: new Date(),
    },
    {
      id: 2,
      driver: "María García",
      route: "GAM Express",
      distance: 30,
      trackingNumber: "TRK002",
      status: "En Tránsito",
      createdAt: new Date(),
    },
    {
      id: 3,
      driver: "Carlos López",
      route: "Rural",
      distance: 80,
      trackingNumber: "TRK003",
      status: "Entregado",
      createdAt: new Date(),
    },
  ]);
  const [filteredWeekCouriers, setFilteredWeekCouriers] = useState<Courier[]>([
    {
      id: 1,
      driver: "Juan Pérez",
      route: "GAM",
      distance: 45,
      trackingNumber: "TRK001",
      status: "Despachado",
      createdAt: new Date(),
    },
    {
      id: 2,
      driver: "María García",
      route: "GAM Express",
      distance: 30,
      trackingNumber: "TRK002",
      status: "En Tránsito",
      createdAt: new Date(),
    },
    {
      id: 3,
      driver: "Carlos López",
      route: "Rural",
      distance: 80,
      trackingNumber: "TRK003",
      status: "Entregado",
      createdAt: new Date(),
    },
  ]);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    driver: "",
    route: "",
    distance: 0,
    trackingNumber: "",
    status: "",
    createdAt: new Date(),
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [openAddCourierModal, setOpenAddCourierModal] = useState(false);
  const [isCreatingCourier, setIsCreatingCourier] = useState(false);
  const [isDeletingCourier, setIsDeletingCourier] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Use dynamic table height hook
  const { maxHeight, rowsPerPage: calculatedRowsPerPage } = useResponsiveTableHeight();

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("couriers", () => calculatedRowsPerPage);

  // Updates total count when filtered couriers change
  useEffect(() => {
    setTotalCount(filteredCouriers.length);
  }, [filteredCouriers]);

  // Resets page when selected date changes
  useEffect(() => {
    setPage(0);
  }, [selectedDate]);

  // Validates courier fields for add/edit forms
  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      number: /^\d+$/,
      text: /^(?:[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+|nulo|n\/a)$/i,
    };

    return (
      regex.text.test(fields.driver) &&
      regex.text.test(fields.route) &&
      regex.number.test(fields.distance.toString()) &&
      regex.text.test(fields.trackingNumber) &&
      regex.text.test(fields.status)
    );
  }, []);

  // Updates edit form validity when fields change
  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  // Handles canceling edit
  const handleCancel = () => {
    setEditRowId(null);
  };

  // Handles editing a courier
  const handleEdit = (courier: Courier) => {
    setEditRowId(courier.id);
    setEditFields({
      driver: courier.driver,
      route: courier.route,
      distance: courier.distance,
      trackingNumber: courier.trackingNumber,
      status: courier.status,
      createdAt: courier.createdAt ? new Date(courier.createdAt) : new Date(),
      // Si tienes updatedAt en el formulario, haz lo mismo:
      // updatedAt: courier.updatedAt ? new Date(courier.updatedAt) : new Date(),
    });
  };

  // Handles updating a courier
  const handleUpdate = async (id: number) => {
    try {
      // TODO: Implementar actualización cuando se conecte con el backend
      showNotification(NOTIFICATIONS.COURIER_UPDATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      const courier = filteredCouriers.find(c => c.id === id);
      if (courier) {
        createCourierNotification('updated', `${courier.driver} - ${courier.route}`);
      }
      setEditRowId(null);
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_UPDATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    }
  };

  // Handles opening/closing delete dialog
  const handleOpenDeleteDialog = (id: number) => {
    setCourierToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCourierToDelete(null);
  };

  // Handles deleting a courier
  const handleDelete = async () => {
    if (!courierToDelete) return;

    setIsDeletingCourier(true);
    try {
      // Simular eliminación
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFilteredCouriers((prev) =>
        prev.filter((courier) => courier.id !== courierToDelete)
      );
      setFilteredWeekCouriers((prev) =>
        prev.filter((courier) => courier.id !== courierToDelete)
      );

      setOpenDeleteDialog(false);
      setCourierToDelete(null);

      showNotification(NOTIFICATIONS.COURIER_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      const courier = filteredCouriers.find(c => c.id === courierToDelete);
      if (courier) {
        createCourierNotification('deleted', `${courier.driver} - ${courier.route}`);
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_DELETE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsDeletingCourier(false);
    }
  };

  // Handles navigation to next/previous/current date
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

  const handleNextDate = () => {
    if (!selectedDate) return;
    const nextDay = new Date(getMidnightDate(selectedDate));
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handlePreviousDate = () => {
    if (!selectedDate) return;
    const previousDay = new Date(getMidnightDate(selectedDate));
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const handleCurrentDate = () => {
    setSelectedDate(getMidnightDate(new Date()));
  };

  // When preparing data for export, only include the desired fields:
  const exportData = filteredWeekCouriers.map((c) => ({
    Fecha: c.createdAt
      ? capitalizeFirstLetter(
          format(new Date(typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString()), "EEEE dd 'de' MMMM 'de' yyyy", {
            locale: es,
          })
        )
      : "",
    Chofer: c.driver,
    Distancia: c.distance,
    Ruta: c.route,
    Tracking: c.trackingNumber,
    Estado: c.status,
    Agregado: c.createdAt
      ? capitalizeFirstLetter(
          format(new Date(typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString()), "EEEE dd 'de' MMMM 'de' yyyy", {
            locale: es,
          })
        )
      : "",
    Actualizado: c.updatedAt
      ? capitalizeFirstLetter(
          format(new Date(typeof c.updatedAt === "string" ? c.updatedAt : c.updatedAt.toISOString()), "EEEE dd 'de' MMMM 'de' yyyy", {
            locale: es,
          })
        )
      : "",
  }));

  const exportOptions = useMemo(() => {
    const exportHeaders = [
      "Fecha",
      "Chofer",
      "Distancia",
      "Ruta",
      "Tracking",
      "Estado",
      "Agregado",
      "Actualizado",
    ];
    return createExportOptions({
      excelIcon: <Table size={20} />,
      pdfIcon: <FileText size={20} />,
      data: exportData,
      fileName: `reporte-de-servicios-de-mensajeria-${exportFileFormattedDate(selectedDate || new Date())}`,
      customHeaders: exportHeaders,
    });
  }, [exportData, selectedDate]);

  const handleOpenAddCourierModal = () => {
    setOpenAddCourierModal(true);
  };

  const handleCloseAddCourierModal = () => {
    setOpenAddCourierModal(false);
  };

  const handleCreateCourier = async (courierData: {
    driver: string;
    route: string;
    distance: number;
    trackingNumber: string;
    status: string;
  }) => {
    setIsCreatingCourier(true);
    try {
      const newCourier: Courier = {
        id: Math.max(...filteredCouriers.map((c) => c.id)) + 1,
        driver: courierData.driver,
        route: courierData.route,
        distance: courierData.distance,
        trackingNumber: courierData.trackingNumber,
        status: courierData.status,
        createdAt: new Date(),
      };

      setFilteredCouriers([...filteredCouriers, newCourier]);
      setFilteredWeekCouriers([...filteredWeekCouriers, newCourier]);

      setOpenAddCourierModal(false);
      showNotification(NOTIFICATIONS.COURIER_CREATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      
      // Add notification to menu
      createCourierNotification('created', `${courierData.driver} - ${courierData.route}`);
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_CREATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsCreatingCourier(false);
    }
  };

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
                <Truck size={22} color={theme.palette.primary.contrastText} />
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
                  {isSmallScreen ? PAGE_TITLE.COURIER_SERVICE_SIMPLIFIED : PAGE_TITLE.COURIER_SERVICE}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredCouriers.length} envíos registrados
                </Typography>
              </Box>
            </Box>

            {/* Export Speed Dial */}
            <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
              {filteredWeekCouriers.length > 0 && (
                <SpeedDialComponent
                  actions={exportOptions}
                  mainIcon={<Download size={20} />}
                  openIcon={<X size={20} />}
                  direction="left"
                />
              )}
            </Box>
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
              {filteredCouriers && (
                <SearchBarComponent
                  placeholder={MANAGEMENT.COURIER_SERVICE_PAGE.SEARCH_PLACEHOLDER}
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
              >
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    value={selectedDate}
                    maxDate={new Date()}
                    views={["year", "month", "day"]}
                    format="EEEE d 'de' MMMM"
                    slots={{ toolbar: () => null }}
                    slotProps={{
                      textField: {
                        fullWidth: false,
                        required: true,
                        variant: "outlined",
                        sx: {
                          width: { xs: '100%', sm: '200px' },
                          '& .MuiOutlinedInput-root': {
                            height: "44px",
                            borderRadius: '10px',
                          },
                        },
                      },
                    }}
                    closeOnSelect
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
                <ButtonGroup variant="contained" sx={{ height: '44px' }}>
                  <PremiumTooltip title={MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_PREV_DAY}>
                    <Button onClick={handlePreviousDate} sx={{ minWidth: '44px', height: '44px', px: 1.5 }}>
                      <ChevronLeft size={20} />
                    </Button>
                  </PremiumTooltip>
                  <PremiumTooltip title={MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_NEXT_DAY}>
                    <span>
                      <Button
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleNextDate}
                        sx={{ minWidth: '44px', height: '44px', px: 1.5 }}
                      >
                        <ChevronRight size={20} />
                      </Button>
                    </span>
                  </PremiumTooltip>
                  <PremiumTooltip title={MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_CURRENT_DAY}>
                    <span>
                      <Button
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleCurrentDate}
                        sx={{ minWidth: '44px', height: '44px', px: 1.5 }}
                      >
                        <Calendar size={18} />
                      </Button>
                    </span>
                  </PremiumTooltip>
                </ButtonGroup>
              </Box>

              {/* Add Button Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={handleOpenAddCourierModal}
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
            </Box>
          </Box>
        </Box>

        {/* Mobile Add Button */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 1.5, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Plus size={18} />}
            onClick={handleOpenAddCourierModal}
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            {MANAGEMENT.ADD}
          </Button>
        </Box>

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
              {filteredCouriers.length > 0 ? (
                <EditableTableComponent<Courier>
                  data={filteredCouriers}
                  columns={[
                    "driver",
                    "route",
                    "distance",
                    "trackingNumber",
                    "status",
                  ]}
                  groupByDate={selectedDate}
                  editRowId={editRowId}
                  editFields={editFields}
                  setEditField={(field: string, value: EditFieldValue) =>
                    setEditFields({ ...editFields, [field]: value })
                  }
                  handleEdit={handleEdit}
                  handleCancel={handleCancel}
                  handleUpdate={handleUpdate}
                  handleOpenDeleteDialog={handleOpenDeleteDialog}
                  getRowId={(row: Courier) => row.id}
                  totalCount={totalCount}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                  isSaveDisabled={!isEditFormValid}
                  userPermissions={userPermissions || []}
                  maxTableHeight={maxHeight}
                />
              ) : (
                <Box sx={noCouriersBoxStyles}>
                  <Search size={48} style={{ color: theme.palette.text.disabled, ...noCouriersIconStyles }} />
                  <Typography variant="body1" color="textSecondary">
                    {capitalizeFirstLetter(
                      format(selectedDate, "EEEE dd 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })
                    )}
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
        title={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_DELETE_TITLE}
        message={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingCourier}
        paperSx={deleteDialogPaperSx ?? {}}
        icon={<Trash2 size={24} color="red" />}
      />
      <AppModal
        open={openAddCourierModal}
        onClose={handleCloseAddCourierModal}
        title={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.COURIER_SERVICE_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<PlusCircle size={24} color="blue" />}
      >
        <AddCourierForm
          onSubmit={handleCreateCourier}
          onCancel={handleCloseAddCourierModal}
          isLoading={isCreatingCourier}
        />
      </AppModal>
    </Box>
  );
};

export default CourierServicePage;
