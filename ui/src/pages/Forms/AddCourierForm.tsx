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
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FORMS from "../../constants/forms.constants";
import CustomTextField from "../../components/Textfield/CustomTextField";
import {
  boxRoot,
  gridContainer,
  formControl,
  iconSx,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from './AddCourierForm.styles';

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
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_COURIER.DRIVER}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_COURIER.DRIVER_PLACEHOLDER}
            value={formData.driver}
            onChange={(e) => handleFieldChange("driver", e.target.value)}
            error={errors.driver !== ""}
            helperText={errors.driver}
            icon={
              <PersonOutlinedIcon
                sx={iconSx(theme)}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl
            variant="outlined"
            fullWidth
            sx={formControl(theme)}
          >
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
                      <MapOutlinedIcon
                        sx={iconSx(theme)}
                      />
                    </InputAdornment>
                  }
                />
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 320,
                    overflowY: 'auto' as React.CSSProperties['overflowY'],
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
          <CustomTextField
            label={FORMS.ADD_COURIER.DISTANCE}
            variant="outlined"
            fullWidth
            type="number"
            placeholder={FORMS.ADD_COURIER.DISTANCE_PLACEHOLDER}
            value={formData.distance}
            onChange={(e) =>
              handleFieldChange("distance", parseInt(e.target.value) || 0)
            }
            error={errors.distance !== ""}
            helperText={errors.distance}
            icon={
              <StraightenOutlinedIcon
                sx={iconSx(theme)}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_COURIER.TRACKING_NUMBER}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_COURIER.TRACKING_NUMBER_PLACEHOLDER}
            value={formData.trackingNumber}
            onChange={(e) =>
              handleFieldChange("trackingNumber", e.target.value)
            }
            error={errors.trackingNumber !== ""}
            helperText={errors.trackingNumber}
            icon={
              <AssignmentOutlinedIcon
                sx={iconSx(theme)}
              />
            }
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
                      <AssignmentOutlinedIcon
                        sx={iconSx(theme)}
                      />
                    </InputAdornment>
                  }
                />
              }
            >
              <MenuItem value="Despachado">{FORMS.ADD_COURIER.STATUS_DESPACHADO}</MenuItem>
              <MenuItem value="En Tránsito">{FORMS.ADD_COURIER.STATUS_EN_TRANSITO}</MenuItem>
              <MenuItem value="Entregado">{FORMS.ADD_COURIER.STATUS_ENTREGADO}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon
                sx={{ ...iconSx(theme), ...infoIconBox(theme) }}
              />
            </Box>
            <Box>
              <Box sx={infoTitle(theme)}>
                {FORMS.ADD_COURIER.INFO_TITLE}
              </Box>
              <Box sx={infoDesc(theme)}>
                {FORMS.ADD_COURIER.INFO_DESC}
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
                disabled={!isFormValid() || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                {isLoading ? FORMS.ADD_COURIER.LOADING_BUTTON : FORMS.ADD_COURIER.ADD_BUTTON}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCourierForm;
