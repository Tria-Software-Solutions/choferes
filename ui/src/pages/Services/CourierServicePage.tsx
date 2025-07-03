import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useSelector /*useDispatch*/ } from "react-redux";
import { RootState /*AppDispatch*/ } from "../../store/store";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMidnightDate, isTodayOrFuture } from "../../utils/dates";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../../utils/export";
import { capitalizeFirstLetter } from "../../utils/string";
import {
  PAGE_TITLE,
  // PERMISSIONS,
  COURIER_SERVICE_PAGE,
} from "../../constants/constants";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Courier } from "../../models/Courier";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import AddCourierForm from "../Forms/AddCourierForm";
import DialogComponent from "../../components/Dialog/DialogComponent";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { NOTIFICATIONS } from "../../constants/constants";

// CourierServicePage component for managing courier services
const CourierServicePage: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [openAddCourierModal, setOpenAddCourierModal] = useState(false);
  const [isCreatingCourier, setIsCreatingCourier] = useState(false);
  const [isDeletingCourier, setIsDeletingCourier] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Updates total count when filtered couriers change
  useEffect(() => {
    setTotalCount(filteredCouriers.length);
  }, [filteredCouriers]);

  // Adjusts rows per page based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

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

  // Handles search bar input change
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    [],
  );

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
      createdAt: courier.createdAt,
    });
  };

  // Handles updating a courier
  const handleUpdate = async (id: number) => {
    try {
      // TODO: Implementar actualización cuando se conecte con el backend
      showNotification(NOTIFICATIONS.COURIER_UPDATE_SUCCESS);
      setEditRowId(null);
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_UPDATE_ERROR);
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
        prev.filter((courier) => courier.id !== courierToDelete),
      );
      setFilteredWeekCouriers((prev) =>
        prev.filter((courier) => courier.id !== courierToDelete),
      );

      setOpenDeleteDialog(false);
      setCourierToDelete(null);

      showNotification(NOTIFICATIONS.COURIER_DELETE_SUCCESS);
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_DELETE_ERROR);
    } finally {
      setIsDeletingCourier(false);
    }
  };

  // Handles navigation to next/previous/current date
  const handleDateChange = useCallback((newDate: Date | null) => {
    if (newDate) setSelectedDate(newDate);
  }, []);

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

  const exportOptions = useMemo(() => {
    const excelOption = exportToExcel;
    const pdfOption = exportToPDF;
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      excelOption,
      pdfOption,
      filteredWeekCouriers,
      `reporte-de-servicios-de-mensajeria-${exportFileFormattedDate(
        selectedDate || new Date(),
      )}`,
    );
  }, [filteredWeekCouriers, selectedDate]);

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
      showNotification(NOTIFICATIONS.COURIER_CREATE_SUCCESS);
    } catch (error) {
      showNotification(NOTIFICATIONS.COURIER_CREATE_ERROR);
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
        sx={{ mb: 3 }}
      >
        <Box display="flex" alignItems="center">
          <LocalShippingIcon fontSize={isSmallScreen ? "small" : "large"} />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen
                ? PAGE_TITLE.COURIER_SERVICE_SIMPLIFIED
                : PAGE_TITLE.COURIER_SERVICE}
            </Typography>
          </Box>
        </Box>
        {/* Temporarily show export button without permission check */}
        <Box sx={{ minHeight: 65 }}>
          {filteredWeekCouriers.length > 0 && (
            <CustomSpeedDial
              actions={exportOptions}
              mainIcon={<DownloadRoundedIcon />}
              openIcon={<CloseRoundedIcon />}
              direction="left"
            />
          )}
        </Box>
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
                {filteredCouriers && (
                  <SearchBar
                    placeholder={COURIER_SERVICE_PAGE.SEARCH_PLACEHOLDER}
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAddCourierModal}
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
                      label={COURIER_SERVICE_PAGE.DATE_PICKER_LABEL}
                      value={selectedDate || null}
                      maxDate={new Date()}
                      views={["year", "month", "day"]}
                      slots={{ toolbar: () => null }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          variant: "outlined",
                          sx: {
                            height: "56px",
                            minWidth: "180px",
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              borderRadius: 2,
                              backgroundColor: "#ffffff",
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#000000",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#000000",
                                borderWidth: 2,
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#ffffff",
                                outline: "none",
                                boxShadow: "none",
                              },
                              "& input": {
                                outline: "none",
                                boxShadow: "none",
                              },
                            },
                          },
                        },
                      }}
                      closeOnSelect
                      onChange={(date) => handleDateChange(date)}
                    />
                  </LocalizationProvider>
                  <ButtonGroup variant="contained" sx={{ height: "56px" }}>
                    <Tooltip title={COURIER_SERVICE_PAGE.TOOLTIP_PREV_DAY} arrow>
                      <Button onClick={handlePreviousDate}>
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={COURIER_SERVICE_PAGE.TOOLTIP_NEXT_DAY} arrow>
                      <Button disabled={isTodayOrFuture(selectedDate)} onClick={handleNextDate}>
                        <ArrowForwardIosRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={COURIER_SERVICE_PAGE.TOOLTIP_CURRENT_DAY} arrow>
                      <Button disabled={isTodayOrFuture(selectedDate)} onClick={handleCurrentDate}>
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleOpenAddCourierModal}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    px: 3,
                    py: 1.5,
                    fontSize: "1rem",
                    minHeight: 56,
                  }}
                >
                  {COURIER_SERVICE_PAGE.ADD}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredCouriers.length > 0 ? (
            <EditableTable<Courier>
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
                {COURIER_SERVICE_PAGE.NO_SERVICES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={COURIER_SERVICE_PAGE.DIALOG_DELETE_TITLE}
        message={COURIER_SERVICE_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={COURIER_SERVICE_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={COURIER_SERVICE_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingCourier}
        paperSx={{
          minWidth: { xs: "80vw", sm: 320 },
          maxWidth: { xs: "90vw", sm: 400 },
        }}
        icon={<DeleteOutlineIcon color="error" />}
      />
      <DialogComponent
        open={openAddCourierModal}
        onClose={handleCloseAddCourierModal}
        title={COURIER_SERVICE_PAGE.DIALOG_ADD_TITLE}
        subtitle={COURIER_SERVICE_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={{
          minWidth: { xs: "90vw", sm: 500, md: 700 },
          maxWidth: { xs: "98vw", sm: 700 },
        }}
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
