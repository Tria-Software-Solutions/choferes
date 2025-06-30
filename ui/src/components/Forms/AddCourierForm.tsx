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

  const validateField = (name: string, value: string | number) => {
    if (name === "driver") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "El nombre del chofer es requerido";
      }
      if (typeof value === "string" && value.trim().length < 2) {
        return "Mínimo 2 caracteres";
      }
      if (typeof value === "string" && value.trim().length > 100) {
        return "Máximo 100 caracteres";
      }
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
      if (typeof value === "string" && !nameRegex.test(value)) {
        return "Solo se permiten letras, espacios y guiones";
      }
    }

    if (name === "route") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "La ruta es requerida";
      }
    }

    if (name === "distance") {
      if (typeof value === "number" && value <= 0) {
        return "La distancia debe ser mayor a 0";
      }
      if (typeof value === "number" && value > 1000) {
        return "La distancia no puede ser mayor a 1000 km";
      }
    }

    if (name === "trackingNumber") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "El número de guía es requerido";
      }
      if (typeof value === "string" && value.trim().length < 3) {
        return "Mínimo 3 caracteres";
      }
      if (typeof value === "string" && value.trim().length > 50) {
        return "Máximo 50 caracteres";
      }
    }

    if (name === "status") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "El estado es requerido";
      }
    }

    return "";
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

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
            label="Chofer"
            variant="outlined"
            fullWidth
            placeholder="Ej: Juan Pérez"
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
            <InputLabel>Ruta</InputLabel>
            <Select
              label="Ruta"
              value={formData.route}
              onChange={(e) => handleFieldChange("route", e.target.value)}
              error={errors.route !== ""}
              input={
                <OutlinedInput
                  label="Ruta"
                  startAdornment={
                    <InputAdornment position="start">
                      <MapOutlinedIcon
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    </InputAdornment>
                  }
                />
              }
            >
              <MenuItem value="GAM">GAM</MenuItem>
              <MenuItem value="GAM Express">GAM Express</MenuItem>
              <MenuItem value="Rural">Rural</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Distancia (km)"
            variant="outlined"
            fullWidth
            type="number"
            placeholder="Ej: 45"
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
            label="Número de Guía"
            variant="outlined"
            fullWidth
            placeholder="Ej: TRK001"
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
            <InputLabel>Estado</InputLabel>
            <Select
              label="Estado"
              value={formData.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              error={errors.status !== ""}
              input={
                <OutlinedInput
                  label="Estado"
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
              <MenuItem value="Despachado">Despachado</MenuItem>
              <MenuItem value="En Tránsito">En Tránsito</MenuItem>
              <MenuItem value="Entregado">Entregado</MenuItem>
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
                Información del Servicio de Mensajería
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                Completa todos los campos requeridos para registrar un nuevo
                servicio de mensajería.
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

export default AddCourierForm;
