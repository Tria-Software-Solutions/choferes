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
import FORMS from "../../constants/forms.constants";
import BRANDS_LIST from "../../constants/brands.constants";
import COLORS_LIST from "../../constants/colors.constants";
import { maskLicensePlate } from "../../utils/mask";
import { maskParkingLotWithPrefix } from "../../utils/mask";
import { validateParkingLotWithPrefix } from "../../utils/userValidation";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TextfieldComponent from "../../components/Textfield/Textfield.component";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AutocompleteChangeReason, AutocompleteChangeDetails } from "@mui/material";

import { es } from "date-fns/locale";
import {
  boxRoot,
  gridContainer,
  iconSx,
  formControl,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from './AddVehicleForm.styles';

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

  const [parkingPrefix, setParkingPrefix] = useState<{ value: string; label: string }>({ value: "ATP", label: "ATP" });
  const [parkingPrefixOptions, setParkingPrefixOptions] = useState([
    { value: "ATP", label: "ATP" },
    { value: "CE", label: "CE" },
  ]);
  const [searchParkingPrefixTerm, setSearchParkingPrefixTerm] = useState("");
  const [filteredParkingPrefixes, setFilteredParkingPrefixes] = useState(parkingPrefixOptions);

  const validateField = useCallback(
    (name: string, value: string) => {
      const regex = {
        number: /^\d+$/,
        plate: /^(?:[A-ZÑ]{3}-\d{3}|\d{6}|nulo|n\/a)$/i,
        text: /^(?:[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+|nulo|n\/a)$/i,
      };

      if (!value.trim()) {
        if (name === "parkingLot" && parkingPrefix.value === "CE") {
          return ""; // Not required if prefix is CE
        }
        return FORMS.REQUIRED_FIELD;
      }

      switch (name) {
        case "ticket":
          if (!regex.number.test(value)) {
            return FORMS.POSITIVE_NUMBER_ONLY;
          }
          if (existingVehicles.some((v) => v.ticket === value)) {
            return FORMS.ALREADY_REGISTERED;
          }
          break;
        case "licensePlate":
          if (!regex.plate.test(value.trim())) {
            return FORMS.INVALID_FORMAT_EXAMPLE;
          }
          if (existingVehicles.some((v) => v.licensePlate === value)) {
            return FORMS.LICENSE_PLATE_ALREADY_REGISTERED;
          }
          break;
        case "brand":
        case "color":
          if (!regex.text.test(value)) {
            return FORMS.LETTERS_SPACES_HYPHENS;
          }
          break;
        case "parkingLot": {
          const prefix = parkingPrefix.value;
          const error = validateParkingLotWithPrefix(prefix, value, FORMS.INVALID_FORMAT_PARKING);
          if (error) return error;
          break;
        }
      }

      return "";
    },
    [existingVehicles, parkingPrefix],
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

  const handleSearchChangeParkingPrefix = (
    event: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setSearchParkingPrefixTerm(value);
    if (reason === "input") {
      const filtered = parkingPrefixOptions.filter((opt) =>
        opt.value.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredParkingPrefixes(filtered);
    }
  };

  const handleParkingPrefixChange = (
    event: React.SyntheticEvent,
    newValue: { value: string; label: string } | string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<{ value: string; label: string }> | undefined
  ) => {
    let prefixValue = "";
    if (newValue === null || newValue === "") {
      setParkingPrefix({ value: "", label: "" });
      setFormData((prev) => ({ ...prev, parkingLot: "" }));
      return;
    }
    if (typeof newValue === "object" && newValue !== null) {
      prefixValue = newValue.value.toUpperCase();
    } else if (typeof newValue === "string") {
      prefixValue = newValue.toUpperCase();
    }
    if (prefixValue) {
      if (!parkingPrefixOptions.some((opt) => opt.value === prefixValue)) {
        const newOpt = { value: prefixValue, label: prefixValue };
        setParkingPrefixOptions((prev) => [...prev, newOpt]);
        setFilteredParkingPrefixes((prev) => [...prev, newOpt]);
      }
      setParkingPrefix({ value: prefixValue, label: prefixValue });
      setSearchParkingPrefixTerm("");
      if (prefixValue === "CE") {
        setFormData((prev) => ({ ...prev, parkingLot: "CE" }));
      } else {
        setFormData((prev) => ({ ...prev, parkingLot: "" }));
      }
    }
  };

  const handleParkingLotChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskParkingLotWithPrefix(parkingPrefix.value, rawValue);
    handleFieldChange("parkingLot", maskedValue);
  };

  const handleLicensePlateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    const maskedValue = maskLicensePlate(rawValue);
    handleFieldChange("licensePlate", maskedValue);
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
    setParkingPrefix({ value: "ATP", label: "ATP" });
    setSearchParkingPrefixTerm("");
    setFilteredParkingPrefixes(parkingPrefixOptions);
  };

  return (
    <Box sx={boxRoot}>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            label={FORMS.ADD_VEHICLE.TICKET_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_VEHICLE.TICKET_PLACEHOLDER}
            value={formData.ticket}
            onChange={(e) => handleFieldChange("ticket", e.target.value)}
            error={errors.ticket !== ""}
            helperText={errors.ticket}
            icon={<ConfirmationNumberOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            label={FORMS.ADD_VEHICLE.LICENSE_PLATE_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_VEHICLE.LICENSE_PLATE_PLACEHOLDER}
            value={formData.licensePlate}
            onChange={handleLicensePlateChange}
            error={errors.licensePlate !== ""}
            helperText={errors.licensePlate}
            icon={<DirectionsCarOutlinedIcon sx={iconSx(theme)} />}
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
                <TextfieldComponent
                  {...params}
                  label={FORMS.ADD_VEHICLE.BRAND_LABEL}
                  variant="outlined"
                  fullWidth
                  error={errors.brand !== ""}
                  helperText={errors.brand}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <FactoryOutlinedIcon sx={iconSx(theme)} />
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
                <TextfieldComponent
                  {...params}
                  label={FORMS.ADD_VEHICLE.COLOR_LABEL}
                  variant="outlined"
                  fullWidth
                  error={errors.color !== ""}
                  helperText={errors.color}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <PaletteOutlinedIcon sx={iconSx(theme)} />
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl variant="outlined" sx={{ minWidth: 90, flex: '0 0 90px' }}>
              <Autocomplete
                freeSolo
                value={parkingPrefix}
                onChange={handleParkingPrefixChange}
                inputValue={searchParkingPrefixTerm.toUpperCase()}
                onInputChange={handleSearchChangeParkingPrefix}
                options={filteredParkingPrefixes.map(opt => ({ value: opt.value.toUpperCase(), label: opt.label.toUpperCase() }))}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.label
                }
                noOptionsText="Sin coincidencias"
                renderInput={(params) => (
                  <TextfieldComponent
                    {...params}
                    label="Prefijo"
                    variant="outlined"
                    fullWidth
                    sx={{ minWidth: 90 }}
                  />
                )}
              />
            </FormControl>
            <TextfieldComponent
              label={FORMS.ADD_VEHICLE.PARKING_LOT_LABEL}
              variant="outlined"
              fullWidth
              placeholder={FORMS.ADD_VEHICLE.PARKING_LOT_PLACEHOLDER.replace("ATP", parkingPrefix.value)}
              value={formData.parkingLot}
              onChange={handleParkingLotChange}
              error={errors.parkingLot !== ""}
              helperText={errors.parkingLot}
              icon={<LocalParkingOutlinedIcon sx={iconSx(theme)} />}
              InputProps={{
                readOnly: parkingPrefix.value === 'CE',
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label={FORMS.ADD_VEHICLE.PARKING_DATE_LABEL}
              value={formData.parkingDate}
              onChange={handleDateChange}
              format="EEEE d 'de' MMMM 'de' yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  variant: 'outlined',
                  sx: formControl(theme),
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <TextfieldComponent
            label={FORMS.ADD_VEHICLE.OBSERVATIONS_LABEL}
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            placeholder={FORMS.ADD_VEHICLE.OBSERVATIONS_PLACEHOLDER}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            icon={<EditNoteOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon sx={{ ...iconSx(theme), ...infoIconBox(theme) }} />
            </Box>
            <Box>
              <Box sx={infoTitle(theme)}>{FORMS.ADD_VEHICLE.INFO_TITLE}</Box>
              <Box sx={infoDesc(theme)}>
                {FORMS.ADD_VEHICLE.INFO_DESC}
                <Box
                  component="span"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      licensePlate: 'N/A',
                      brand: 'N/A',
                      color: 'N/A',
                      parkingLot: 'N/A',
                      notes: 'N/A',
                    });
                    setErrors({
                      ticket: '',
                      licensePlate: '',
                      brand: '',
                      color: '',
                      parkingLot: '',
                    });
                  }}
                  sx={{
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                  }}
                >
                  {FORMS.ADD_VEHICLE.INFO_OPTIONAL}
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Limpiar
            </Button>
            <Box sx={actionsInnerBox}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={cancelButton}
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
                sx={submitButton}
              >
                {isLoading ? FORMS.ADD_VEHICLE.BUTTON_ADDING : FORMS.ADD_VEHICLE.BUTTON_ADD}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddVehicleForm;
