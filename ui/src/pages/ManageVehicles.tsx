import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import { useVehicles } from "../hooks/useVehicle";
import { Vehicle } from "../models/Vehicle";
import SplitButton from "../components/SplitButton/SplitButton";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../utils/exportUtils";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "../components/SearchBar/SearchBar";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EditableTable from "../components/Table/EditableTable/EditableTable";
import InputMask from "react-input-mask";
import { BRANDS, COLORS } from "../constants/constants";

const ManageVehicles: React.FC = () => {
  const {
    vehicles,
    handleAddVehicle,
    handleUpdateVehicle,
    handleDeleteVehicle,
  } = useVehicles();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
  });
  const [editFields, setEditFields] = useState({
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isValid, setIsValid] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customColor, setCustomColor] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const allVehicles = Object.values(vehicles).flat();
    const filtered = allVehicles.filter((vehicle) =>
      `${vehicle.licensePlate} ${vehicle.brand} ${vehicle.color} ${vehicle.parkingLot} ${vehicle.notes}`
        .toLowerCase()
        .includes(filter.toLowerCase())
    );

    setFilteredVehicles(filtered);
    setTotalCount(filtered.length);
  }, [vehicles, filter]);

  const validateFields = useCallback(() => {
    const plateRegex = /^[A-ZÑ0-9]{3}-[A-ZÑ0-9]{3,4}$/;
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const parkingLotRegex = /^ATP[1-9]-\d{3,4}$/;
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
    setIsValid(
      isLicensePlateValid && isModelValid && isColorValid && isParkingLotValid
    );
  }, [addFields]);

  useEffect(() => {
    validateFields();
  }, [validateFields]);

  const handleAdd = () => {
    const newVehicle: Vehicle = {
      id: Math.max(...vehicles.map((vehicle) => vehicle.id)) + 1,
      licensePlate: addFields.licensePlate,
      brand: addFields.brand,
      color: addFields.color,
      parkingLot: addFields.parkingLot,
      notes: addFields.notes,
    };
    handleAddVehicle(newVehicle);
    setAddFields({
      licensePlate: "",
      brand: "",
      color: "",
      parkingLot: "",
      notes: "",
    });
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditRowId(vehicle.id);
    setEditFields({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      color: vehicle.color,
      parkingLot: vehicle.parkingLot,
      notes: vehicle.notes,
    });
  };

  const handleSaveClick = (args: { id?: number; licensePlate?: string }) => {
    if (args.id) {
      const updatedVehicle = {
        ...editFields,
      };
      handleUpdateVehicle(args.id, updatedVehicle);
      setEditRowId(null);
      setEditFields({
        licensePlate: "",
        brand: "",
        color: "",
        parkingLot: "",
        notes: "",
      });
    }
  };

  const handleOpenDialog = (args: { id?: number; licensePlate?: string }) => {
    if (args.id) {
      setDialogOpen(true);
      setVehicleToDelete(args.id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleDelete = () => {
    if (vehicleToDelete !== null) {
      handleDeleteVehicle(vehicleToDelete);
      handleCloseDialog();
    }
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
          Gestionar Vehículos
        </Typography>
        {filteredVehicles.length > 0 && (
          <SplitButton
            options={createExportOptions(
              <FontAwesomeIcon icon={faFileExcel} size="lg" />,
              <FontAwesomeIcon icon={faFilePdf} size="lg" />,
              exportToExcel,
              exportToPDF,
              filteredVehicles,
              `reporte-de-vehiculos-${exportFileFormattedDate(new Date())}`
            )}
            defaultIndex={0}
            buttonIcon={<DownloadRoundedIcon />}
          />
        )}
      </Box>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <SearchBar
            placeholder="Buscar Vehículo"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Box display="flex" alignItems="center">
            <InputMask
              mask="***-****"
              value={addFields.licensePlate}
              onChange={(e) => {
                const formattedValue = e.target.value.toUpperCase();
                setAddFields({ ...addFields, licensePlate: formattedValue });
              }}
              maskChar=" "
              alwaysShowMask={false}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Placa"
                  variant="outlined"
                  sx={{ mr: 2 }}
                  InputProps={{
                    style: { textTransform: "uppercase" },
                    inputRef: inputRef,
                  }}
                />
              )}
            </InputMask>
            {selectedColor === "Otro" ? (
              <TextField
                label="Modelo"
                variant="outlined"
                sx={{ mr: 2 }}
                value={customBrand}
                onChange={handleCustomBrandChange}
              />
            ) : (
              <FormControl variant="outlined" sx={{ mr: 2, width: 200 }}>
                <InputLabel>Modelo</InputLabel>
                <Select
                  label="Modelo"
                  sx={{ height: 56 }}
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
            {selectedColor === "Otro" ? (
              <TextField
                label="Color"
                variant="outlined"
                sx={{ mr: 2 }}
                value={customColor}
                onChange={handleCustomColorChange}
              />
            ) : (
              <FormControl variant="outlined" sx={{ mr: 2, width: 200 }}>
                <InputLabel>Color</InputLabel>
                <Select
                  label="Color"
                  sx={{ height: 56 }}
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
            <InputMask
              mask="9-99999"
              value={addFields.parkingLot.replace(/^ATP/, "")}
              onChange={(e) => {
                const formattedValue = `ATP${e.target.value}`;
                setAddFields({ ...addFields, parkingLot: formattedValue });
              }}
              maskChar={null}
              alwaysShowMask={false}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Espacio"
                  variant="outlined"
                  sx={{ mr: 2 }}
                  InputProps={{
                    startAdornment: addFields.parkingLot ? (
                      <span style={{ marginRight: "8px" }}>ATP</span>
                    ) : null,
                    style: { textTransform: "uppercase" },
                    inputRef: inputRef,
                  }}
                />
              )}
            </InputMask>
            <TextField
              label="Observaciones"
              variant="outlined"
              sx={{ mr: 2 }}
              fullWidth
              value={addFields.notes}
              onChange={(e) =>
                setAddFields({ ...addFields, notes: e.target.value })
              }
            />
            <Tooltip title="Agregar Vehículo" arrow>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ height: "56px" }}
                  onClick={handleAdd}
                  disabled={!isValid}
                >
                  <DirectionsCarIcon />
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      <br />
      {filteredVehicles.length > 0 ? (
        <EditableTable<Vehicle>
          data={filteredVehicles}
          columns={["licensePlate", "brand", "color", "parkingLot", "notes"]}
          //groupByField="createdAt"
          editRowId={editRowId}
          editFields={editFields}
          setEditField={(field, value) =>
            setEditFields({ ...editFields, [field]: value })
          }
          handleEditClick={handleEditClick}
          handleSaveClick={handleSaveClick}
          handleOpenDialog={handleOpenDialog}
          getRowId={(row) => row.licensePlate}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      ) : (
        <Typography variant="h6" color="textSecondary">
          No se encontraron vehículos para mostrar.
        </Typography>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
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
