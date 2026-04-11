import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useSelector /*useDispatch*/ } from "react-redux";
import { RootState /*AppDispatch*/ } from "../../../store/store";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { createCourierNotification } from "../../../services/notificationService";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Tooltip,
  Button,
  CircularProgress,
  Backdrop,
  ButtonGroup,
  Divider,
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
import { Courier } from "../../../models/Courier";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import AddCourierForm from "../../Forms/AddCourierForm";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { Plus, Trash2, Truck } from "lucide-react";
import {
  courierHeaderBoxStyles,
  courierTitleBoxStyles,
  courierTitleStyles,
  courierIconStyles,
  courierDividerStyles,
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  searchBarBoxStyles,
  addButtonMobileStyles,
  datePickerSx,
  buttonGroupSx,
  noCouriersBoxStyles,
  noCouriersIconStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import { FileText, FileType, PlusCircle } from "lucide-react";

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

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("couriers", getInitialRowsPerPage);

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
      excelIcon: <FileText size={20} />,
      pdfIcon: <FileType size={20} />,
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
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={courierHeaderBoxStyles}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          sx={courierTitleBoxStyles}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={courierTitleStyles}
          >
            <Truck
              size={isSmallScreen ? 20 : 32}
              style={courierIconStyles(theme)}
            />
            {isSmallScreen
              ? PAGE_TITLE.COURIER_SERVICE_SIMPLIFIED
              : PAGE_TITLE.COURIER_SERVICE}
          </Typography>
          <Divider sx={courierDividerStyles(theme)} />
        </Box>
        {/* Temporarily show export button without permission check */}
        <Box sx={exportSpeedDialBoxStyles}>
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
                {filteredCouriers && (
                  <SearchBarComponent
                    placeholder={
                      MANAGEMENT.COURIER_SERVICE_PAGE.SEARCH_PLACEHOLDER
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAddCourierModal}
                  sx={addButtonMobileStyles}
                >
                  <Plus size={24} />
                </Button>
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
                      label={MANAGEMENT.COURIER_SERVICE_PAGE.DATE_PICKER_LABEL}
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
                      title={MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_PREV_DAY}
                      arrow
                    >
                      <Button onClick={handlePreviousDate}>
                        <ChevronLeft size={24} />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title={MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_NEXT_DAY}
                      arrow
                    >
                      <span>
                        <Button
                          disabled={isTodayOrFuture(selectedDate)}
                          onClick={handleNextDate}
                        >
                          <ChevronRight size={24} />
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        MANAGEMENT.COURIER_SERVICE_PAGE.TOOLTIP_CURRENT_DAY
                      }
                      arrow
                    >
                      <span>
                        <Button
                          disabled={isTodayOrFuture(selectedDate)}
                          onClick={handleCurrentDate}
                        >
                          <Calendar size={24} />
                        </Button>
                      </span>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={handleOpenAddCourierModal}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    px: 3,
                    py: 1.5,
                    fontSize: "1rem",
                    minHeight: 56,
                  }}
                >
                  {MANAGEMENT.ADD}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <br />
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
              userPermissions={userPermissions || []}
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
              <Typography variant="h6" color="textSecondary">
                {MANAGEMENT.COURIER_SERVICE_PAGE.NO_SERVICES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
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
      <DialogComponent
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
      </DialogComponent>
    </Box>
  );
};

export default CourierServicePage;
