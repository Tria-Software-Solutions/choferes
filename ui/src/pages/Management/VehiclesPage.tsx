import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Vehicle } from "../../models/Vehicle";
import { useVehicles } from "../../hooks/useVehicle";
import SearchBar from "../../components/SearchBar/SearchBar";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
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
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMidnightDate, isTodayOrFuture } from "../../utils/dates";
import { maskLicensePlate, maskParkingLot } from "../../utils/mask";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../../utils/export";
import { capitalizeFirstLetter } from "../../utils/string";
import {
  BRANDS_LIST,
  COLORS_LIST,
  PAGE_TITLE,
  PERMISSIONS,
} from "../../constants/constants";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const VehiclesPage: React.FC = () => {
  const { userPermissions } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    vehicles,
    allVehicles,
    setAllVehicles,
    isLoadingVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  } = useVehicles(format(selectedDate, "yyyy-MM-dd"));
  const { showNotification } = useAppNotifications();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filteredWeekVehicles, setFilteredWeekVehicles] = useState<Vehicle[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({
    ticket: "",
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
  });
  const [editFields, setEditFields] = useState({
    ticket: "",
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openTicketTooltip, setOpenTicketTooltip] = useState(false);
  const [openLicensePlateTooltip, setOpenLicensePlateTooltip] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [searchBrandTerm, setSearchBrandTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState(BRANDS_LIST);
  const [searchColorTerm, setSearchColorTerm] = useState("");
  const [filteredColors, setFilteredColors] = useState(COLORS_LIST);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen]);

  const cleanedFilter = useMemo(
    () => filter.replace(/[\s-]/g, "").toLowerCase(),
    [filter]
  );

  useEffect(() => {
    const allVehicles = Object.values(vehicles).flat();
    const filtered = allVehicles.filter((vehicle) => {
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

    setFilteredVehicles(filtered);
    setTotalCount(filtered.length);
  }, [vehicles, cleanedFilter]);

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
      const parkedDate = new Date(vehicle.createdAt);
      return parkedDate >= startOfWeek && parkedDate <= endOfWeek;
    });

    setFilteredWeekVehicles(vehiclesThisWeek);
  }, [allVehicles, selectedDate]);

  const validateFields = useCallback((fields: typeof addFields) => {
    const regex = {
      number: /^\d+$/,
      plate: /^(?:[A-ZÑ]{3}-\d{3}|\d{6})$/,
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      parkingLot: /^ATP[1-9]-\d{3,4}$/,
    };

    return (
      regex.number.test(fields.ticket) &&
      regex.plate.test(fields.licensePlate.trim()) &&
      regex.text.test(fields.brand) &&
      regex.text.test(fields.color) &&
      regex.parkingLot.test(fields.parkingLot.trim())
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

  const handleAdd = () => {
    try {
      setAllVehicles((prevVehicles) => {
        const newId =
          prevVehicles.length > 0
            ? Math.max(...prevVehicles.map((vehicle) => vehicle.id)) + 1
            : 1;

        const newVehicle: Vehicle = {
          id: newId,
          ticket: addFields.ticket,
          licensePlate: addFields.licensePlate,
          brand: addFields.brand,
          color: addFields.color,
          parkingLot: addFields.parkingLot,
          notes: addFields.notes,
          createdAt: selectedDate,
        };
        createVehicle(newVehicle);
        return [...prevVehicles, newVehicle];
      });
      setAddFields({
        ticket: "",
        licensePlate: "",
        brand: "",
        color: "",
        parkingLot: "",
        notes: "",
      });
      setSearchBrandTerm("");
      setSearchColorTerm("");
      showNotification(
        "El registro del vehículo fue exitoso",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al registrar el vehículo",
        "error",
        5000,
        false
      );
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditRowId(vehicle.id);
    setEditFields({
      ticket: vehicle.ticket,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      color: vehicle.color,
      parkingLot: vehicle.parkingLot,
      notes: vehicle.notes,
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = useCallback(
    (id: number) => {
      try {
        const updatedVehicle = {
          ...editFields,
        };
        updateVehicle(id, updatedVehicle);
        setEditRowId(null);
        setEditFields({
          ticket: "",
          licensePlate: "",
          brand: "",
          color: "",
          parkingLot: "",
          notes: "",
        });
        showNotification(
          "La actualización del vehículo fue exitosa",
          "success",
          3000,
          false
        );
      } catch (error) {
        console.error(error);
        showNotification(
          "Ha ocurrido un error al actualizar el vehículo",
          "error",
          5000,
          false
        );
      }
    },
    [editFields, updateVehicle, showNotification]
  );

  const handleOpenDialog = (id: number) => {
    setOpenDialog(true);
    setVehicleToDelete(id);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setVehicleToDelete(null);
  };

  const handleDelete = () => {
    try {
      if (vehicleToDelete !== null) {
        deleteVehicle(vehicleToDelete);
        handleCloseDialog();
      }
      showNotification(
        "La eliminación del vehículo fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el vehículo",
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

  const showTemporaryTooltip = (
    setTooltip: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setTooltip(true);
    setTimeout(() => setTooltip(false), 2000);
  };

  const handleSearchChangeBrand = (
    event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => {
    setSearchBrandTerm(value);
    const filtered = BRANDS_LIST.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBrands(filtered);
  };

  const handleSearchChangeColor = (
    event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => {
    setSearchColorTerm(value);
    const filtered = COLORS_LIST.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredColors(filtered);
  };

  const checkTicketExistenceInAllVehicles = (
    ticket: string
  ): Vehicle | undefined => {
    return allVehicles.find((vehicle) => String(vehicle.ticket) === ticket);
  };

  const getNextTicketNumber = (): string => {
    if (vehicles.length === 0) return "";
    const lastTicket = vehicles
      .map((vehicle) => vehicle.ticket)
      .filter((ticket) => ticket && /^\d+$/.test(ticket))
      .map((ticket) => BigInt(ticket!));
    if (lastTicket.length === 0) return "";
    const maxTicket = lastTicket.reduce(
      (max, current) => (current > max ? current : max),
      BigInt(0)
    );
    return (maxTicket + BigInt(1)).toString();
  };

  const handleTicketOnFocus = () => {
    if (addFields.ticket && /^\d+$/.test(addFields.ticket)) {
      return;
    }
    let nextTicket = getNextTicketNumber();
    while (checkTicketExistenceInAllVehicles(nextTicket)) {
      nextTicket = (BigInt(nextTicket) + BigInt(1)).toString();
    }
    setAddFields((prevFields) => ({ ...prevFields, ticket: nextTicket }));
  };

  const handleTicketChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (!/^\d*$/.test(value)) return;
    if (checkTicketExistenceInAllVehicles(value)) {
      showTemporaryTooltip(setOpenTicketTooltip);
      return;
    }
    setAddFields((prevFields) => ({ ...prevFields, ticket: value }));
  };

  const checkLicensePlateExistence = (licensePlate: string): boolean => {
    return vehicles.some((vehicle) => vehicle.licensePlate === licensePlate);
  };

  const checkLicensePlateExistenceInAllVehicles = (
    licensePlate: string
  ): Vehicle | undefined => {
    return allVehicles.find((vehicle) => vehicle.licensePlate === licensePlate);
  };

  const handleLicensePlateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const maskedValue = maskLicensePlate(event.target.value);

    if (checkLicensePlateExistence(maskedValue)) {
      showTemporaryTooltip(setOpenLicensePlateTooltip);
      return;
    }

    const existingVehicle =
      checkLicensePlateExistenceInAllVehicles(maskedValue);

    setAddFields((prevState) => ({
      ...prevState,
      licensePlate: maskedValue,
      brand: existingVehicle?.brand || "",
      color: existingVehicle?.color || "",
    }));
  };

  const handleParkingLotChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskParkingLot(rawValue);
    setAddFields((prevState) => ({ ...prevState, parkingLot: maskedValue }));
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
      filteredWeekVehicles,
      `reporte-de-vehiculos-${exportFileFormattedDate(
        selectedDate || new Date()
      )}`,
      excelOption,
      pdfOption
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
        <Typography variant={isSmallScreen ? "h5" : "h2"} sx={{ flexGrow: 1 }}>
          {isSmallScreen ? PAGE_TITLE.VEHICLES_SIMPLIFIED : PAGE_TITLE.VEHICLES}
        </Typography>
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
            <Grid item xs={12} md={6}>
              {filteredVehicles && (
                <SearchBar
                  placeholder="Buscar vehículo"
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
                    <Grid item xs={6} sm={4} md={2} lg={1}>
                      <Tooltip
                        title="Este número de boleta ya está registrado"
                        open={openTicketTooltip}
                        disableHoverListener
                        placement="bottom"
                        arrow
                      >
                        <TextField
                          label="Boleta"
                          variant="outlined"
                          fullWidth
                          value={addFields.ticket}
                          onFocus={handleTicketOnFocus}
                          onChange={handleTicketChange}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1}>
                      <Tooltip
                        title="Esta placa ya está registrada"
                        open={openLicensePlateTooltip}
                        disableHoverListener
                        placement="bottom"
                        arrow
                      >
                        <TextField
                          label="Placa"
                          variant="outlined"
                          fullWidth
                          value={addFields.licensePlate}
                          onChange={handleLicensePlateChange}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2} lg={2}>
                      <FormControl variant="outlined" fullWidth>
                        <Autocomplete
                          value={
                            addFields.brand
                              ? {
                                  value: addFields.brand,
                                  label: addFields.brand,
                                }
                              : null
                          }
                          onChange={(event, newValue) => {
                            if (newValue) {
                              setAddFields((prev) => ({
                                ...prev,
                                brand: newValue.value,
                              }));
                            } else {
                              setAddFields((prev) => ({ ...prev, brand: "" }));
                            }
                            setSearchBrandTerm("");
                            setFilteredBrands(BRANDS_LIST);
                          }}
                          inputValue={searchBrandTerm}
                          onInputChange={handleSearchChangeBrand}
                          options={filteredBrands}
                          getOptionLabel={(option) => option.label}
                          noOptionsText="Sin coincidencias"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Marca"
                              variant="outlined"
                              fullWidth
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2} lg={2}>
                      <FormControl variant="outlined" fullWidth>
                        <Autocomplete
                          value={
                            addFields.color
                              ? {
                                  value: addFields.color,
                                  label: addFields.color,
                                }
                              : null
                          }
                          onChange={(event, newValue) => {
                            if (newValue) {
                              setAddFields((prev) => ({
                                ...prev,
                                color: newValue.value,
                              }));
                            } else {
                              setAddFields((prev) => ({ ...prev, color: "" }));
                            }
                            setSearchColorTerm("");
                            setFilteredColors(COLORS_LIST);
                          }}
                          inputValue={searchColorTerm}
                          onInputChange={handleSearchChangeColor}
                          options={filteredColors}
                          getOptionLabel={(option) => option.label}
                          noOptionsText="Sin coincidencias"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Color"
                              variant="outlined"
                              fullWidth
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1}>
                      <TextField
                        label="Espacio"
                        variant="outlined"
                        fullWidth
                        value={addFields.parkingLot}
                        onChange={handleParkingLotChange}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2} lg={5}>
                      <TextField
                        label="Observaciones"
                        variant="outlined"
                        fullWidth
                        value={addFields.notes}
                        onChange={(e) =>
                          setAddFields({ ...addFields, notes: e.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                  <Tooltip title="Agregar Vehículo" arrow>
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
                        onClick={handleAdd}
                        disabled={!isAddFormValid}
                      >
                        <DirectionsCarIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                </Box>
              </Grid>
            )}
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
              ]}
              groupByDate={selectedDate}
              editRowId={editRowId}
              editFields={editFields}
              setEditField={(field, value) =>
                setEditFields({ ...editFields, [field]: value })
              }
              handleEditClick={handleEditClick}
              handleCancelClick={handleCancelClick}
              handleSaveClick={handleSaveClick}
              handleOpenDialog={handleOpenDialog}
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              permissions={userPermissions}
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
                  })
                )}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                No se encontraron vehículos para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este vehículo?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button color="secondary" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;
