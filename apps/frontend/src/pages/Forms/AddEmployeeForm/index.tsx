import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { Plus, X, User, Info, Mail } from "lucide-react";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import { FORMS } from "../../../constants/constants";
import {
  boxRoot,
  gridContainer,
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

interface AddEmployeeFormProps {
  onSubmit: (employee: { firstName: string; lastName: string; email?: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Main hook for the employee form
  // Validación de campos del formulario
  const validateField = (name: string, value: string) => {
    if (name === "email") {
      if (!value.trim()) return "";
      if (!emailRegex.test(value)) return FORMS.EMAIL_FORMAT;
      return "";
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;

    if (!value.trim()) {
      return FORMS.REQUIRED_FIELD;
    }

    if (!nameRegex.test(value)) {
      return FORMS.NAME_LETTERS_ONLY;
    }

    if (value.trim().length < 2) {
      return FORMS.MIN_2_CHARS;
    }

    if (value.trim().length > 50) {
      return FORMS.MAX_50_CHARS;
    }

    return "";
  };

  // Handles field changes and validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Checks if the form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      errors.firstName === "" &&
      errors.lastName === "" &&
      errors.email === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({ firstName: "", lastName: "", email: "" });
    setErrors({ firstName: "", lastName: "", email: "" });
  };

  return (
    <Box sx={boxRoot}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_EMPLOYEE.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.FIRST_NAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.LAST_NAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.EMAIL_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<Mail style={iconStyle} />}
          />
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
                {FORMS.ADD_EMPLOYEE.INFO_TITLE}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {FORMS.ADD_EMPLOYEE.INFO_DESC}
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
                Agregar
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEmployeeForm;
