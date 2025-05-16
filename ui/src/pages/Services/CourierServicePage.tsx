import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useSelector, /*useDispatch*/ } from "react-redux";
import { RootState, /*AppDispatch*/ } from "../../store/store";
import SearchBar from "../../components/SearchBar/SearchBar";
// import EditableTable from "../../components/Table/EditableTable/EditableTable";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  CircularProgress,
  Backdrop,
  InputLabel,
  Select,
  MenuItem,
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
  PERMISSIONS,
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

const CourierServicePage: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { /*couriers, allCouriers, isLoadingCourier,*/ isLoadingVehicles } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { showNotification } = useAppNotifications();
  const [filteredCouriers, /*setFilteredCouriers*/] = useState<Courier[]>([]);
  const [filteredWeekCouriers, /*setFilteredWeekCouriers*/] = useState<Courier[]>(
    []
  );
  //const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, /*setAddFields*/] = useState({
    driver: "",
    route: "",
    distance: 0,
    trackingNumber: "",
    status: "",
  });
  const [editFields, /*setEditFields*/] = useState({
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
  const [/*page*/, setPage] = useState(0);
  const [/*rowsPerPage*/, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [/*isEditFormValid*/, setIsEditFormValid] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // useEffect(() => {
  //   dispatch(fetchCouriers({}));
  //   dispatch(fetchCouriersByDate(format(selectedDate, "yyyy-MM-dd")));
  // }, [dispatch, selectedDate]);

  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

  // const cleanedFilter = useMemo(
  //   () => filter.replace(/[\s-]/g, "").toLowerCase(),
  //   [filter]
  // );

  // useEffect(() => {
  //   const allCouriers = Object.values(couriers).flat();
  //   const filtered = allCouriers.filter((courier) => {
  //     return (
  //       `${courier.name} ${courier.route} ${courier.distance} ${courier.trackingNumber} ${courier.status}`
  //         .toLowerCase()
  //         .includes(cleanedFilter)
  //     );
  //   });
  //   setFilteredCouriers(filtered);
  //   setTotalCount(filtered.length);
  // }, [couriers cleanedFilter]);

  // useEffect(() => {
  //   const date = selectedDate;
  //   const dayOfWeek = date.getDay();

  //   const startOfWeek = new Date(date);
  //   startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  //   startOfWeek.setHours(0, 0, 0, 0);

  //   const endOfWeek = new Date(startOfWeek);
  //   endOfWeek.setDate(startOfWeek.getDate() + 6);
  //   endOfWeek.setHours(23, 59, 59, 999);

  //   const couriersThisWeek = allCouriers.filter((courier) => {
  //     const serviceDate = new Date(courier.createdAt);
  //     return serviceDate >= startOfWeek && serviceDate <= endOfWeek;
  //   });

  //   setFilteredWeekCouriers(couriersThisWeek);
  // }, [allCouriers, selectedDate]);

  const validateFields = useCallback((fields: typeof addFields) => {
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

  useEffect(
    () => setIsAddFormValid(validateFields(addFields)),
    [addFields, validateFields]
  );

  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  useEffect(() => {
    setPage(0);
  }, [selectedDate]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  // const handleCreate = async () => {
  //   try {
  //     const newCourier: Courier = {
  //       id:
  //         allCouriers.length > 0
  //           ? Math.max(...allCouriers.map((courier) => courier.id)) + 1
  //           : 1,
  //       name: addFields.name,
  //       route: addFields.route,
  //       distance: addFields.distance,
  //       trackingNumber: addFields.trackingNumber,
  //       status: addFields.status,
  //     };
  //     dispatch(createCourier(newCourier));
  //     setAddFields({
  //       name: "",
  //       route: "",
  //       distance: 0,
  //       trackingNumber: "",
  //       status: "",
  //     });
  //     showNotification(
  //       "El registro del servicio fue exitoso",
  //       "success",
  //       3000,
  //       false
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     showNotification(
  //       "Ha ocurrido un error al registrar el servicio",
  //       "error",
  //       5000,
  //       false
  //     );
  //   }
  // };

  // const handleEdit = (courier: Courier) => {
  //   setEditRowId(courier.id);
  //   setEditFields({
  //     driver: courier.driver,
  //     route: courier.route,
  //     distance: courier.distance,
  //     trackingNumber: courier.trackingNumber,
  //     status: courier.status,
  //     createdAt: courier.createdAt,
  //   });
  // };

  const handleCancel = () => {
    setEditRowId(null);
  };

  // const handleUpdate = useCallback(
  //   async (id: number) => {
  //     try {
  //       const updatedCourier = {
  //         ...editFields,
  //       };
  //       await dispatch(updateCourier({ id, updatedCourier }));
  //       dispatch(fetchCouriersByDate(format(selectedDate, "yyyy-MM-dd")));
  //       setEditRowId(null);
  //       setEditFields({
  //         driver: "",
  //         route: "",
  //         distance: 0,
  //         trackingNumber: "",
  //         status: "",
  //         createdAt: new Date(),
  //       });
  //       showNotification(
  //         "La actualización del servicio fue exitosa",
  //         "success",
  //         3000,
  //         false
  //       );
  //     } catch (error) {
  //       handleCancel();
  //       console.error(error);
  //       showNotification(
  //         "Ha ocurrido un error al actualizar el servicio",
  //         "error",
  //         5000,
  //         false
  //       );
  //     }
  //   },
  //   [dispatch, editFields, selectedDate, showNotification]
  // );

  // const handleOpenDeleteDialog = (id: number) => {
  //   setOpenDeleteDialog(true);
  //   setCourierToDelete(id);
  // };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCourierToDelete(null);
  };

  const handleDelete = async () => {
    try {
      if (courierToDelete !== null) {
        // dispatch(deleteCourier(courierToDelete));
        showNotification(
          "La eliminación del servicio fue exitosa",
          "success",
          3000,
          false
        );
      }
      handleCloseDeleteDialog();
    } catch (error) {
      handleCancel();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el servicio",
        "error",
        5000,
        false
      );
    }
  };

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
    const excelOption = userPermissions.includes(
      PERMISSIONS.EXPORT_EXCEL_VEHICLES
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
      filteredWeekCouriers,
      `reporte-de-servicios-de-mensajeria-${exportFileFormattedDate(
        selectedDate || new Date()
      )}`
    );
  }, [userPermissions, filteredWeekCouriers, selectedDate]);

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
              variant={isSmallScreen ? "h5" : "h2"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen
                ? PAGE_TITLE.COURIER_SERVICE_SIMPLIFIED
                : PAGE_TITLE.COURIER_SERVICE}
            </Typography>
          </Box>
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_VEHICLES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_VEHICLES) && (
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
            <Grid item xs={12} md={6}>
              {filteredCouriers && (
                <SearchBar
                  placeholder="Buscar servicio"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{
                    maxWidth: "100%",
                  }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="flex-start"
                justifyContent="flex-end"
                gap={2}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: "row", sm: "row", md: "row" }}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={2}
                  width="100%"
                >
                  <Tooltip title="Día Anterior" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
                        onClick={handlePreviousDate}
                      >
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Día Siguiente" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleNextDate}
                      >
                        <ArrowForwardIosRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Día Actual" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
                        disabled={isTodayOrFuture(selectedDate)}
                        onClick={handleCurrentDate}
                      >
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                </Box>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Seleccionar fecha"
                    value={selectedDate || null}
                    sx={{
                      width: { xs: "100%", sm: "100%", md: "auto" },
                      mt: { xs: 2, sm: 2, md: 0 },
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
              </Box>
            </Grid>
            {userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) && (
              <Grid item xs={12} md={12}>
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "column", md: "row" }}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={2}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Chofer"
                        variant="outlined"
                        fullWidth
                        value={addFields.driver}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                      >
                        <InputLabel>Ruta</InputLabel>
                        <Select
                          label="Ruta"
                          sx={{ height: 56 }}
                          value={addFields.route}
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>GAM</MenuItem>
                          <MenuItem value={20}>GAM Express</MenuItem>
                          <MenuItem value={30}>Rural</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Kilómetros"
                        variant="outlined"
                        fullWidth
                        value={addFields.distance}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="Número de guía"
                        variant="outlined"
                        fullWidth
                        value={addFields.trackingNumber}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                      >
                        <InputLabel>Estado</InputLabel>
                        <Select
                          label="Estado"
                          sx={{ height: 56 }}
                          value={addFields.status}
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>Despachado</MenuItem>
                          <MenuItem value={20}>En Tránsito</MenuItem>
                          <MenuItem value={30}>Entregado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Tooltip title="Agregar Servicio" arrow>
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
                        // onClick={handleCreate}
                        disabled={!isAddFormValid}
                      >
                        <LocalShippingIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
          <br />
          {/* {filteredCouriers.length > 0 ? (
            <EditableTable<Courier>
              data={filteredCouriers}
              columns={[
                "driver",
                "route",
                "distance",
                "trackingNumber",
                "status",
                "createdAt",
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
          ) : ( */}
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
                  })
                )}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                No se encontraron servicios de mensajería para mostrar.
              </Typography>
            </Box>
          {/* )} */}
        </>
      )}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este servicio?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" sx={{ flex: 1 }} onClick={handleDelete}>
            Aceptar
          </Button>
          <Button
            color="secondary"
            sx={{ flex: 1 }}
            onClick={handleCloseDeleteDialog}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourierServicePage;
