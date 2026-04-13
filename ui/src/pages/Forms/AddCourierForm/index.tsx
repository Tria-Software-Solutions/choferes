import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { Plus, X, User, Ruler, FileText, MapPin, Info } from "lucide-react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FORMS from "../../../constants/forms.constants";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import {
  boxRoot,
  gridContainer,
  formControl,
  iconStyle,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
} from "./styles";

interface AddCourierFormProps {
  onSubmit: (courier: {
    driver: string;
    route: string;
    distance: number;
    trackingNumber: string;
    status: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddCourierForm: React.FC<AddCourierFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    driver: "",
    route: "",
    distance: 0,
    trackingNumber: "",
    status: "",
  });
  const [errors, setErrors] = useState({
    driver: "",
    route: "",
    distance: "",
    trackingNumber: "",
    status: "",
  });

  // Main hook for the courier form
  // Validación de campos del formulario
  const validateField = (name: string, value: string | number) => {
    if (name === "driver") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return FORMS.REQUIRED_FIELD;
      }
      if (typeof value === "string" && value.trim().length < 2) {
        return FORMS.MIN_2_CHARS;
      }
      if (typeof value === "string" && value.trim().length > 100) {
        return FORMS.MAX_100_CHARS;
      }
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
      if (typeof value === "string" && !nameRegex.test(value)) {
        return FORMS.NAME_LETTERS_ONLY;
      }
    }

    if (name === "route") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return FORMS.REQUIRED_FIELD;
      }
    }

    if (name === "distance") {
      if (typeof value === "number" && value <= 0) {
        return FORMS.DISTANCE_GREATER_0;
      }
      if (typeof value === "number" && value > 1000) {
        return FORMS.DISTANCE_MAX_1000;
      }
    }

    if (name === "trackingNumber") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return FORMS.REQUIRED_FIELD;
      }
      if (typeof value === "string" && value.trim().length < 3) {
        return FORMS.TRACKING_MIN_3;
      }
      if (typeof value === "string" && value.trim().length > 50) {
        return FORMS.TRACKING_MAX_50;
      }
    }

    if (name === "status") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return FORMS.REQUIRED_FIELD;
      }
    }

    return "";
  };

  // Handles field changes and validation
  const handleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Checks if the form is valid
  const isFormValid = () => {
    return (
      formData.driver.trim() !== "" &&
      formData.route.trim() !== "" &&
      formData.distance > 0 &&
      formData.trackingNumber.trim() !== "" &&
      formData.status.trim() !== "" &&
      errors.driver === "" &&
      errors.route === "" &&
      errors.distance === "" &&
      errors.trackingNumber === "" &&
      errors.status === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        driver: formData.driver.trim(),
        route: formData.route.trim(),
        distance: formData.distance,
        trackingNumber: formData.trackingNumber.trim(),
        status: formData.status.trim(),
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({
      driver: "",
      route: "",
      distance: 0,
      trackingNumber: "",
      status: "",
    });
    setErrors({
      driver: "",
      route: "",
      distance: "",
      trackingNumber: "",
      status: "",
    });
  };

  return (
    <Box sx={boxRoot}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_COURIER.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_COURIER.DRIVER_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.driver}
            onChange={(e) => handleFieldChange("driver", e.target.value)}
            error={errors.driver !== ""}
            helperText={errors.driver}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth sx={formControl(theme)}>
            <InputLabel>{FORMS.ADD_COURIER.ROUTE}</InputLabel>
            <Select
              label={FORMS.ADD_COURIER.ROUTE}
              value={formData.route}
              onChange={(e) => handleFieldChange("route", e.target.value)}
              error={errors.route !== ""}
              input={
                <OutlinedInput
                  label={FORMS.ADD_COURIER.ROUTE}
                  startAdornment={
                    <InputAdornment position="start">
                      <MapPin style={iconStyle} />
                    </InputAdornment>
                  }
                />
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 320,
                    overflowY: "auto" as React.CSSProperties["overflowY"],
                  },
                },
              }}
            >
              <MenuItem value="GAM">GAM</MenuItem>
              <MenuItem value="GAM Express">GAM Express</MenuItem>
              <MenuItem value="Rural">Rural</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_COURIER.DISTANCE_PLACEHOLDER}
            variant="outlined"
            fullWidth
            type="number"
            value={formData.distance}
            onChange={(e) =>
              handleFieldChange("distance", parseInt(e.target.value) || 0)
            }
            error={errors.distance !== ""}
            helperText={errors.distance}
            icon={<Ruler style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_COURIER.TRACKING_NUMBER_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.trackingNumber}
            onChange={(e) =>
              handleFieldChange("trackingNumber", e.target.value)
            }
            error={errors.trackingNumber !== ""}
            helperText={errors.trackingNumber}
            icon={<FileText style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>{FORMS.ADD_COURIER.STATUS}</InputLabel>
            <Select
              label={FORMS.ADD_COURIER.STATUS}
              value={formData.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              error={errors.status !== ""}
              input={
                <OutlinedInput
                  label={FORMS.ADD_COURIER.STATUS}
                  startAdornment={
                    <InputAdornment position="start">
                      <FileText style={iconStyle} />
                    </InputAdornment>
                  }
                />
              }
            >
              <MenuItem value="Despachado">
                {FORMS.ADD_COURIER.STATUS_DESPACHADO}
              </MenuItem>
              <MenuItem value="En Tránsito">
                {FORMS.ADD_COURIER.STATUS_EN_TRANSITO}
              </MenuItem>
              <MenuItem value="Entregado">
                {FORMS.ADD_COURIER.STATUS_ENTREGADO}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <Info
                style={iconStyle}
              />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>
                {FORMS.ADD_COURIER.INFO_TITLE}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {FORMS.ADD_COURIER.INFO_DESC}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<X />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              {FORMS.ADD_COURIER.CLEAR_BUTTON}
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
                  {FORMS.ADD_COURIER.CANCEL_BUTTON}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                startIcon={<Plus size={18} />}
                fullWidth={isSmallScreen}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  letterSpacing: "0.01em",
                  borderRadius: "12px",
                  minHeight: "42px",
                }}
              >
                {isLoading
                  ? FORMS.ADD_COURIER.LOADING_BUTTON
                  : FORMS.ADD_COURIER.ADD_BUTTON}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCourierForm;
