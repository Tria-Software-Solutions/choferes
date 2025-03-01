import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Vehicle } from "../../models/Vehicle";
import { useVehicles } from "../../hooks/useVehicle";
import SplitButton from "../../components/SplitButton/SplitButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
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
import { getMidnightDate, isTodayOrFuture } from "../../utils/dates";
import { maskLicensePlate, maskParkingLot } from "../../utils/mask";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../../utils/export";
import { BRANDS, COLORS, PAGE_TITLE } from "../../constants/constants";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

const VehiclesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    vehicles,
    allVehicles,
    isLoadingVehicles,
    handleAddVehicle,
    handleUpdateVehicle,
    handleDeleteVehicle,
    setAllVehicles,
  } = useVehicles(format(selectedDate, "yyyy-MM-dd"));
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

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  const handleAdd = () => {
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
      console.log("newVehicle: ", newVehicle);
      handleAddVehicle(newVehicle);
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

  const handleSaveClick = useCallback(
    (id: number) => {
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
    },
    [editFields, handleUpdateVehicle]
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
    if (vehicleToDelete !== null) {
      handleDeleteVehicle(vehicleToDelete);
      handleCloseDialog();
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

  const handleSelectChange = (
    event: SelectChangeEvent<string>,
    setState: React.Dispatch<React.SetStateAction<string>>,
    setField: (value: string) => void,
    setCustomValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = event.target.value;
    setState(value);
    if (value !== "Otro") {
      setCustomValue("");
    }
    setField(value);
  };

  const handleBrandChange = (event: SelectChangeEvent<string>) =>
    handleSelectChange(
      event,
      setSelectedBrand,
      (value) => setAddFields((prev) => ({ ...prev, brand: value })),
      setCustomBrand
    );

  const handleCustomBrandChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomBrand(event.target.value);
    setAddFields({ ...addFields, brand: event.target.value });
  };

  const handleColorChange = (event: SelectChangeEvent<string>) =>
    handleSelectChange(
      event,
      setSelectedColor,
      (value) => setAddFields((prev) => ({ ...prev, color: value })),
      setCustomColor
    );

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
    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      exportToExcel,
      exportToPDF,
      filteredVehicles,
      `reporte-de-vehiculos-${exportFileFormattedDate(
        selectedDate || new Date()
      )}`
    );
  }, [filteredVehicles, selectedDate]);

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
          {PAGE_TITLE.VEHICLES}
        </Typography>
        {filteredVehicles.length > 0 && (
          <SplitButton
            options={exportOptions}
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
                          value={addFields.brand}
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
                          value={addFields.color}
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

export default VehiclesPage;
