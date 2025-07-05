import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { FORMS } from "../../../constants/constants";
import {
  boxRoot,
  gridContainer,
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
} from "./styles";

interface AddEmployeeFormProps {
  onSubmit: (employee: { firstName: string; lastName: string }) => void;
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
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });

  // Main hook for the employee form
  // Validación de campos del formulario
  const validateField = (name: string, value: string) => {
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
      errors.lastName === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({ firstName: "", lastName: "" });
    setErrors({ firstName: "", lastName: "" });
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
            label={FORMS.FIRST_NAME}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_EMPLOYEE.FIRST_NAME_PLACEHOLDER}
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<PersonOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            label={FORMS.LAST_NAME}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_EMPLOYEE.LAST_NAME_PLACEHOLDER}
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<PersonOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon
                sx={{ ...iconSx(theme), ...infoIconBox(theme) }}
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
