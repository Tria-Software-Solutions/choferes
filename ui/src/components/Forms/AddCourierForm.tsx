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
import CustomTextField from "../Textfield/CustomTextField";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { FORMS } from "../../constants/constants";

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
    <Box sx={{ width: "100%", p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
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
                sx={{ color: theme.palette.text.secondary }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl
            variant="outlined"
            fullWidth
            sx={{
              marginTop: "8px",
              "& .MuiOutlinedInput-root, & .MuiSelect-select": {
                backgroundColor: "#fff",
                borderRadius: 2,
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                  borderWidth: 2,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                },
                "&.Mui-focused": {
                  backgroundColor: "#fff",
                  outline: "none",
                  boxShadow: "none",
                },
              },
            }}
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
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    </InputAdornment>
                  }
                />
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 320,
                    overflowY: 'auto',
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
                sx={{ color: theme.palette.text.secondary }}
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
                sx={{ color: theme.palette.text.secondary }}
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
                        sx={{ color: theme.palette.text.secondary }}
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
                  mb: 0.5,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                {FORMS.ADD_COURIER.INFO_TITLE}
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                {FORMS.ADD_COURIER.INFO_DESC}
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
              {FORMS.ADD_COURIER.CLEAR_BUTTON}
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
                  {FORMS.ADD_COURIER.CANCEL_BUTTON}
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
