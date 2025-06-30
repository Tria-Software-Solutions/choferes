import React, { useState, useCallback } from "react";
import {
  Box,
  Grid,
  Button,
  useTheme,
  FormControl,
  Autocomplete,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { BRANDS_LIST, COLORS_LIST } from "../../constants/constants";
import { maskLicensePlate, maskParkingLot } from "../../utils/mask";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CustomTextField from "../Textfield/CustomTextField";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { es } from "date-fns/locale";

interface AddVehicleFormProps {
  onSubmit: (vehicle: {
    ticket: string;
    licensePlate: string;
    brand: string;
    color: string;
    parkingLot: string;
    notes: string;
    parkingDate: Date;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  existingVehicles?: Array<{ ticket: string; licensePlate: string }>;
  getNextTicketNumber: () => string;
  defaultParkingDate?: Date;
}

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  existingVehicles = [],
  getNextTicketNumber,
  defaultParkingDate = new Date(),
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    ticket: getNextTicketNumber(),
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
    notes: "",
    parkingDate: defaultParkingDate,
  });

  const [errors, setErrors] = useState({
    ticket: "",
    licensePlate: "",
    brand: "",
    color: "",
    parkingLot: "",
  });

  const [searchBrandTerm, setSearchBrandTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState(BRANDS_LIST);
  const [searchColorTerm, setSearchColorTerm] = useState("");
  const [filteredColors, setFilteredColors] = useState(COLORS_LIST);

  const validateField = useCallback(
    (name: string, value: string) => {
      const regex = {
        number: /^\d+$/,
        plate: /^(?:[A-ZÑ]{3}-\d{3}|\d{6}|nulo|n\/a)$/i,
        text: /^(?:[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+|nulo|n\/a)$/i,
        parkingLot: /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i,
      };

      if (!value.trim()) {
        return "Este campo es requerido";
      }

      switch (name) {
        case "ticket":
          if (!regex.number.test(value)) {
            return "Solo se permiten números";
          }
          if (existingVehicles.some((v) => v.ticket === value)) {
            return "Este número de boleta ya está registrado";
          }
          break;
        case "licensePlate":
          if (!regex.plate.test(value.trim())) {
            return "Formato inválido (ej: ABC-123, 123456, N/A)";
          }
          if (existingVehicles.some((v) => v.licensePlate === value)) {
            return "Esta placa ya está registrada";
          }
          break;
        case "brand":
        case "color":
          if (!regex.text.test(value)) {
            return "Solo se permiten letras, espacios y guiones";
          }
          break;
        case "parkingLot":
          if (!regex.parkingLot.test(value.trim())) {
            return "Formato inválido (ej: ATP1-123, N/A)";
          }
          break;
      }

      return "";
    },
    [existingVehicles],
  );

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSearchChangeBrand = (
    event: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setSearchBrandTerm(value);
    if (reason === "input") {
      const filtered = BRANDS_LIST.filter((brand) =>
        brand.value.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredBrands(filtered);
    }
  };

  const handleSearchChangeColor = (
    event: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setSearchColorTerm(value);
    if (reason === "input") {
      const filtered = COLORS_LIST.filter((color) =>
        color.value.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredColors(filtered);
    }
  };

  const handleLicensePlateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskLicensePlate(rawValue);
    handleFieldChange("licensePlate", maskedValue);
  };

  const handleParkingLotChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskParkingLot(rawValue);
    handleFieldChange("parkingLot", maskedValue);
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, parkingDate: date || new Date() }));
  };

  const isFormValid = () => {
    return (
      formData.ticket.trim() !== "" &&
      formData.licensePlate.trim() !== "" &&
      formData.brand.trim() !== "" &&
      formData.color.trim() !== "" &&
      formData.parkingLot.trim() !== "" &&
      formData.parkingDate &&
      Object.values(errors).every((error) => error === "")
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        ticket: formData.ticket.trim(),
        licensePlate: formData.licensePlate.trim(),
        brand: formData.brand.trim(),
        color: formData.color.trim(),
        parkingLot: formData.parkingLot.trim(),
        notes: formData.notes.trim(),
        parkingDate: formData.parkingDate,
      });
    }
  };

  const handleClearForm = () => {
    setFormData({
      ticket: getNextTicketNumber(),
      licensePlate: "",
      brand: "",
      color: "",
      parkingLot: "",
      notes: "",
      parkingDate: defaultParkingDate,
    });
    setErrors({
      ticket: "",
      licensePlate: "",
      brand: "",
      color: "",
      parkingLot: "",
    });
    setSearchBrandTerm("");
    setFilteredBrands(BRANDS_LIST);
    setSearchColorTerm("");
    setFilteredColors(COLORS_LIST);
  };

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Boleta"
            variant="outlined"
            fullWidth
            placeholder="Ej: 12345"
            value={formData.ticket}
            onChange={(e) => handleFieldChange("ticket", e.target.value)}
            error={errors.ticket !== ""}
            helperText={errors.ticket}
            icon={
              <ConfirmationNumberOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Placa"
            variant="outlined"
            fullWidth
            placeholder="Ej: ABC-123"
            value={formData.licensePlate}
            onChange={handleLicensePlateChange}
            error={errors.licensePlate !== ""}
            helperText={errors.licensePlate}
            icon={
              <DirectionsCarOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <Autocomplete
              freeSolo
              value={
                formData.brand
                  ? { value: formData.brand, label: formData.brand }
                  : null
              }
              onChange={(event, newValue) => {
                const brandValue =
                  typeof newValue === "object"
                    ? newValue?.value || ""
                    : newValue || "";
                handleFieldChange("brand", brandValue);
                setSearchBrandTerm("");
                setFilteredBrands(BRANDS_LIST);
              }}
              inputValue={searchBrandTerm}
              onInputChange={handleSearchChangeBrand}
              options={filteredBrands}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              noOptionsText="Sin coincidencias"
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label="Marca"
                  variant="outlined"
                  fullWidth
                  error={errors.brand !== ""}
                  helperText={errors.brand}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <FactoryOutlinedIcon
                            sx={{ color: theme.palette.text.secondary }}
                          />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <Autocomplete
              freeSolo
              value={
                formData.color
                  ? { value: formData.color, label: formData.color }
                  : null
              }
              onChange={(event, newValue) => {
                const colorValue =
                  typeof newValue === "object"
                    ? newValue?.value || ""
                    : newValue || "";
                handleFieldChange("color", colorValue);
                setSearchColorTerm("");
                setFilteredColors(COLORS_LIST);
              }}
              inputValue={searchColorTerm}
              onInputChange={handleSearchChangeColor}
              options={filteredColors}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              noOptionsText="Sin coincidencias"
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label="Color"
                  variant="outlined"
                  fullWidth
                  error={errors.color !== ""}
                  helperText={errors.color}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <PaletteOutlinedIcon
                            sx={{ color: theme.palette.text.secondary }}
                          />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Espacio de Parqueo"
            variant="outlined"
            fullWidth
            placeholder="Ej: ATP1-123"
            value={formData.parkingLot}
            onChange={handleParkingLotChange}
            error={errors.parkingLot !== ""}
            helperText={errors.parkingLot}
            icon={
              <LocalParkingOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Parqueo"
              value={formData.parkingDate}
              onChange={handleDateChange}
              format="EEEE d 'de' MMMM 'de' yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  variant: "outlined",
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            label="Observaciones"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            placeholder="Observaciones adicionales sobre el vehículo..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            icon={
              <EditNoteOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon
                sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }}
              />
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  mb: 0.5,
                }}
              >
                Información Importante
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                Completa todos los campos requeridos. La boleta y placa deben
                ser únicas.{" "}
                <Box
                  component="span"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      licensePlate: "N/A",
                      brand: "N/A",
                      color: "N/A",
                      parkingLot: "N/A",
                      notes: "N/A",
                    });
                    setErrors({
                      ticket: "",
                      licensePlate: "",
                      brand: "",
                      color: "",
                      parkingLot: "",
                    });
                  }}
                  sx={{
                    color: theme.palette.primary.main,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: 500,
                    "&:hover": {
                      color: theme.palette.primary.dark,
                    },
                  }}
                >
                  Puedes usar &quot;N/A&quot; para campos opcionales.
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              gap: { xs: 1, sm: 2 },
              pt: 2,
              borderTop: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                order: { xs: 3, sm: 1 },
              }}
            >
              Limpiar
            </Button>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 },
                width: { xs: "100%", sm: "auto" },
                order: { xs: 1, sm: 2 },
              }}
            >
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  fontWeight: 600,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                {isLoading ? "Agregando..." : "Agregar"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddVehicleForm;
