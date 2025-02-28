import React, { useCallback, useEffect, useState } from "react";
import { Vehicle } from "../models/Vehicle";
import { useVehicles } from "../hooks/useVehicle";
import SplitButton from "../components/SplitButton/SplitButton";
import SearchBar from "../components/SearchBar/SearchBar";
import EditableTable from "../components/Table/EditableTable/EditableTable";
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
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { getMidnightDate, isTodayOrFuture } from "../utils/dateUtils";
import { maskLicensePlate, maskParkingLot } from "../utils/maskUtils";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../utils/exportUtils";
import { BRANDS, COLORS, PAGE_TITLE } from "../constants/constants";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const ManageVehicles: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    vehicles,
    allVehicles,
    isLoadingVehicles,
    handleAddVehicle,
    handleUpdateVehicle,
    handleDeleteVehicle,
  } = useVehicles(selectedDate?.toLocaleDateString("fr-CA"));
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const allVehicles = Object.values(vehicles).flat();
    const cleanedFilter = filter.replace(/[\s-]/g, "").toLowerCase();
    const filtered = allVehicles.filter((vehicle) => {
      const cleanedLicensePlate = vehicle.licensePlate
        .replace(/[\s-]/g, "")
        .toLowerCase();
      const cleanedParkingLot = vehicle.parkingLot
        .replace(/[\s-]/g, "")
        .toLowerCase();
      const isLicensePlateMatch = cleanedLicensePlate.includes(cleanedFilter);
      const isOtherFieldsMatch =
        `${vehicle.ticket} ${vehicle.brand} ${vehicle.color} ${cleanedParkingLot} ${vehicle.notes}`
          .toLowerCase()
          .includes(cleanedFilter);

      return isLicensePlateMatch || isOtherFieldsMatch;
    });
    setFilteredVehicles(filtered);
    setTotalCount(filtered.length);
  }, [vehicles, filter]);

  const validateAddFields = useCallback(() => {
    const numberRegex = /^\d+$/;
    const plateRegex = /^(?:[A-ZÑ]{3}-\d{3}|\d{6})$/;
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
    const parkingLotRegex = /^ATP[1-9]-\d{3,4}$/;
    const isTicketValid =
      numberRegex.test(addFields.ticket.toString()) && addFields.ticket !== "";
    const isLicensePlateValid =
      plateRegex.test(addFields.licensePlate.trim()) &&
      addFields.licensePlate !== "";
    const isModelValid =
      textRegex.test(addFields.brand) && addFields.brand !== "";
    const isColorValid =
      textRegex.test(addFields.color) && addFields.color !== "";
    const isParkingLotValid =
      parkingLotRegex.test(addFields.parkingLot.trim()) &&
      addFields.parkingLot !== "";
    setIsAddFormValid(
      isTicketValid &&
        isLicensePlateValid &&
        isModelValid &&
        isColorValid &&
        isParkingLotValid
    );
  }, [addFields]);

  const validateEditFields = useCallback(() => {
    const numberRegex = /^\d+$/;
    const plateRegex = /^(?:[A-ZÑ]{3}-\d{3}|\d{6})$/;
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const parkingLotRegex = /^ATP[1-9]-\d{3,4}$/;
    const isTicketValid =
      numberRegex.test(editFields.ticket.toString()) &&
      editFields.ticket !== "";
    const isLicensePlateValid =
      plateRegex.test(editFields.licensePlate.trim()) &&
      editFields.licensePlate !== "";
    const isModelValid =
      textRegex.test(editFields.brand) && editFields.brand !== "";
    const isColorValid =
      textRegex.test(editFields.color) && editFields.color !== "";
    const isParkingLotValid =
      parkingLotRegex.test(editFields.parkingLot.trim()) &&
      editFields.parkingLot !== "";
    setIsEditFormValid(
      isTicketValid &&
        isLicensePlateValid &&
        isModelValid &&
        isColorValid &&
        isParkingLotValid
    );
  }, [editFields]);

  useEffect(() => {
    validateAddFields();
  }, [validateAddFields]);

  useEffect(() => {
    if (editRowId !== null) {
      validateEditFields();
    }
  }, [editFields, editRowId, validateEditFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleAdd = () => {
    const newVehicle: Vehicle = {
      id: Math.max(...vehicles.map((vehicle) => vehicle.id)) + 1,
      ticket: addFields.ticket,
      licensePlate: addFields.licensePlate,
      brand: addFields.brand,
      color: addFields.color,
      parkingLot: addFields.parkingLot,
      notes: addFields.notes,
      createdAt: selectedDate,
    };
    handleAddVehicle(newVehicle);
    setAddFields({
      ticket: "",
      licensePlate: "",
      brand: "",
      color: "",
      parkingLot: "",
      notes: "",
    });
    setSelectedBrand("");
    setSelectedColor("");
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

  const handleSaveClick = (id: number) => {
    const updatedVehicle = {
      ...editFields,
    };
    handleUpdateVehicle(id, updatedVehicle);
    setEditRowId(null);
    setEditFields({
      ticket: "",
      licensePlate: "",
      brand: "",
      color: "",
      parkingLot: "",
      notes: "",
    });
  };

  const handleOpenDialog = (id: number) => {
    setOpenDialog(true);
    setVehicleToDelete(id);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setVehicleToDelete(null);
  };

  const handleDelete = () => {
    if (vehicleToDelete !== null) {
      handleDeleteVehicle(vehicleToDelete);
      handleCloseDialog();
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) setSelectedDate(newDate);
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

  const handleBrandChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedBrand(value);
    if (value !== "Otro") {
      setCustomBrand("");
    }
    setAddFields({ ...addFields, brand: event.target.value });
  };

  const handleCustomBrandChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomBrand(event.target.value);
    setAddFields({ ...addFields, brand: event.target.value });
  };

  const handleColorChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedColor(value);
    if (value !== "Otro") {
      setCustomColor("");
    }
    setAddFields({ ...addFields, color: event.target.value });
  };

  const handleCustomColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomColor(event.target.value);
    setAddFields({ ...addFields, color: event.target.value });
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
    let value = event.target.value.trim();
    if (!/^\d*$/.test(value)) {
      return;
    }

    if (checkTicketExistenceInAllVehicles(value)) {
      setOpenTicketTooltip(true);
      setTimeout(() => setOpenTicketTooltip(false), 2000);
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
    const rawValue = event.target.value;
    const maskedValue = maskLicensePlate(rawValue);

    if (checkLicensePlateExistence(maskedValue)) {
      setOpenLicensePlateTooltip(true);
      setTimeout(() => setOpenLicensePlateTooltip(false), 2000);
      return;
    }

    const existingVehicle =
      checkLicensePlateExistenceInAllVehicles(maskedValue);

    setAddFields((prevState) => {
      const updatedFields = {
        ...prevState,
        licensePlate: maskedValue,
        brand: existingVehicle?.brand || "",
        color: existingVehicle?.color || "",
      };
      return updatedFields;
    });

    if (existingVehicle) {
      setSelectedBrand(existingVehicle.brand || "");
      setSelectedColor(existingVehicle.color || "");
    }
  };

  const handleParkingLotChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskParkingLot(rawValue);
    setAddFields((prevState) => ({ ...prevState, parkingLot: maskedValue }));
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} sx={{ flexGrow: 1 }}>
          {PAGE_TITLE.MANAGE_VEHICLES}
        </Typography>
        {filteredVehicles.length > 0 && (
          <SplitButton
            options={createExportOptions(
              <FontAwesomeIcon icon={faFileExcel} size="lg" />,
              <FontAwesomeIcon icon={faFilePdf} size="lg" />,
              exportToExcel,
              exportToPDF,
              filteredVehicles,
              `reporte-de-vehiculos-${exportFileFormattedDate(
                selectedDate || new Date()
              )}`
            )}
            defaultIndex={0}
            buttonIcon={<DownloadRoundedIcon />}
          />
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
          <CircularProgress />
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
            <Grid item xs={12} md={12}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={1}>
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
                  <Grid item xs={12} sm={6} md={1}>
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
                  <Grid item xs={12} sm={6} md={2}>
                    {selectedBrand === "Otro" ? (
                      <TextField
                        label="Marca"
                        variant="outlined"
                        fullWidth
                        value={customBrand}
                        onChange={handleCustomBrandChange}
                      />
                    ) : (
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Marca</InputLabel>
                        <Select
                          label="Marca"
                          value={selectedBrand}
                          onChange={handleBrandChange}
                        >
                          {BRANDS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    {selectedColor === "Otro" ? (
                      <TextField
                        label="Color"
                        variant="outlined"
                        fullWidth
                        value={customColor}
                        onChange={handleCustomColorChange}
                      />
                    ) : (
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Color</InputLabel>
                        <Select
                          label="Color"
                          value={selectedColor}
                          onChange={handleColorChange}
                        >
                          {COLORS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={1}>
                    <TextField
                      label="Espacio"
                      variant="outlined"
                      fullWidth
                      value={addFields.parkingLot}
                      onChange={handleParkingLotChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
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
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "10%",
              }}
            >
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

export default ManageVehicles;
