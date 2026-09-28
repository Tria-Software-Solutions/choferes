import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  MenuItem,
  Typography,
} from "@mui/material";
import { IconMail, IconRotate, IconUser, IconId, IconPhone, IconBriefcase, IconUserCircle } from "@tabler/icons-react";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import { FORMS } from "../../../constants/constants";
import { maskNationalId, maskPhone, digitsOnly } from "../../../utils/mask";
import {
  EMPLOYEE_POSITIONS,
  EMPLOYEE_GENDERS,
  getEmployeePositionLabel,
  EmployeeGender,
} from "@choferes/shared";
import {
  boxRoot,
  gridContainer,
  iconStyle,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
  formControl,
} from "./styles";

interface AddEmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  primaryPhone: string;
  secondaryPhone: string;
  position: string;
  gender: string;
  contractStartDate: string;
  hourlyRate: string;
  vacationDays: string;
}

interface AddEmployeeFormProps {
  onSubmit: (employee: {
    firstName: string;
    lastName: string;
    email?: string;
    nationalId?: string | null;
    primaryPhone?: string | null;
    secondaryPhone?: string | null;
    position?: string | null;
    gender?: string | null;
    contractStartDate?: string | null;
    hourlyRate?: number | null;
    vacationDays?: number | null;
  }) => void;
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

  // Today's date in YYYY-MM-DD for contractStartDate default
  const todayStr = useMemo(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }, []);

  const [formData, setFormData] = useState<AddEmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    nationalId: "",
    primaryPhone: "",
    secondaryPhone: "",
    position: "",
    gender: "",
    contractStartDate: todayStr,
    hourlyRate: "",
    vacationDays: "",
  });
  const [errors, setErrors] = useState<Record<keyof AddEmployeeFormData, string>>({
    firstName: "",
    lastName: "",
    email: "",
    nationalId: "",
    primaryPhone: "",
    secondaryPhone: "",
    position: "",
    gender: "",
    contractStartDate: "",
    hourlyRate: "",
    vacationDays: "",
  });

  

  // Main hook for the employee form
  // Validación de campos del formulario
  const validateField = (name: keyof AddEmployeeFormData, value: string): string => {
    if (name === "email") {
      if (!value.trim()) return "";
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
        return FORMS.EMAIL_FORMAT;
      return "";
    }

    if (name === "nationalId") {
      const digits = digitsOnly(value);
      if (!digits) return FORMS.REQUIRED_FIELD;
      if (digits.length < 1 || digits.length > 9) return "Cédula debe tener entre 1 y 9 dígitos";
      return "";
    }

    if (name === "primaryPhone") {
      const digits = digitsOnly(value);
      if (!digits) return FORMS.REQUIRED_FIELD;
      if (digits.length < 8 || digits.length > 9) return "Teléfono debe tener 8 o 9 dígitos";
      return "";
    }

    if (name === "secondaryPhone") {
      const digits = digitsOnly(value);
      if (!digits) return "";
      if (digits.length < 8 || digits.length > 9) return "Teléfono debe tener 8 o 9 dígitos";
      return "";
    }

    if (name === "position") {
      if (!value.trim()) return "";
      return "";
    }

    if (name === "gender") {
      if (!value.trim()) return "";
      if (!["Masculino", "Femenino"].includes(value)) return "Género inválido";
      return "";
    }

    if (name === "contractStartDate") {
      if (!value.trim()) return "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Fecha debe tener formato YYYY-MM-DD";
      return "";
    }

    if (name === "hourlyRate") {
      if (!value.trim()) return "";
      const num = Number(value);
      if (isNaN(num) || num < 0) return "Tarifa debe ser un número ≥ 0";
      return "";
    }

    if (name === "vacationDays") {
      if (!value.trim()) return "";
      const num = Number(value);
      if (!Number.isInteger(num) || num < 0) return "Días de vacaciones debe ser un entero ≥ 0";
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
  const handleFieldChange = (field: keyof AddEmployeeFormData, value: string) => {
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
      errors.email === "" &&
      errors.nationalId === "" &&
      errors.primaryPhone === "" &&
      errors.secondaryPhone === "" &&
      errors.contractStartDate === "" &&
      errors.hourlyRate === "" &&
      errors.vacationDays === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        nationalId: digitsOnly(formData.nationalId) || null,
        primaryPhone: digitsOnly(formData.primaryPhone) || null,
        secondaryPhone: digitsOnly(formData.secondaryPhone) || null,
        position: formData.position.trim() || null,
        gender: formData.gender.trim() || null,
        contractStartDate: formData.contractStartDate || null,
        hourlyRate:
          formData.hourlyRate.trim() === ""
            ? null
            : Number(formData.hourlyRate),
        vacationDays:
          formData.vacationDays.trim() === ""
            ? null
            : Number(formData.vacationDays),
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      nationalId: "",
      primaryPhone: "",
      secondaryPhone: "",
      position: "",
      gender: "",
      contractStartDate: todayStr,
      hourlyRate: "",
      vacationDays: "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      nationalId: "",
      primaryPhone: "",
      secondaryPhone: "",
      position: "",
      gender: "",
      contractStartDate: "",
      hourlyRate: "",
      vacationDays: "",
    });
  };

  return (
    <Box sx={boxRoot}>
      <Grid container spacing={2} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.FIRST_NAME_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.FIRST_NAME_LABEL}
            variant="outlined"
            fullWidth
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.LAST_NAME_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.LAST_NAME_LABEL}
            variant="outlined"
            fullWidth
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.NATIONAL_ID_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.NATIONAL_ID_LABEL}
            variant="outlined"
            fullWidth
            value={formData.nationalId}
            onChange={(e) => handleFieldChange("nationalId", maskNationalId(e.target.value))}
            error={errors.nationalId !== ""}
            helperText={errors.nationalId}
            icon={<IconId style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ inputMode: "numeric", maxLength: 13 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.EMAIL_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.EMAIL_LABEL}
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<IconMail style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 255 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.PRIMARY_PHONE_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.PRIMARY_PHONE_LABEL}
            variant="outlined"
            fullWidth
            value={formData.primaryPhone}
            onChange={(e) => handleFieldChange("primaryPhone", maskPhone(e.target.value))}
            error={errors.primaryPhone !== ""}
            helperText={errors.primaryPhone}
            icon={<IconPhone style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ inputMode: "tel", maxLength: 13 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.SECONDARY_PHONE_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.SECONDARY_PHONE_LABEL}
            variant="outlined"
            fullWidth
            value={formData.secondaryPhone}
            onChange={(e) => handleFieldChange("secondaryPhone", maskPhone(e.target.value))}
            error={errors.secondaryPhone !== ""}
            helperText={errors.secondaryPhone}
            icon={<IconPhone style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ inputMode: "tel", maxLength: 13 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <PlaceholderSelect
            label={FORMS.ADD_EMPLOYEE.POSITION_LABEL}
            placeholder={FORMS.ADD_EMPLOYEE.POSITION_PLACEHOLDER}
            icon={<IconBriefcase style={iconStyle} />}
            value={formData.position}
            onChange={(event) => handleFieldChange("position", String(event.target.value))}
            sx={formControl(theme)}
          >
            <MenuItem value="">Sin puesto</MenuItem>
            {EMPLOYEE_POSITIONS.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {getEmployeePositionLabel(pos, formData.gender as EmployeeGender | null) ?? pos}
              </MenuItem>
            ))}
          </PlaceholderSelect>
          {errors.position && <Typography variant="caption" sx={{ color: "error.main", mt: 0.5 }}>{errors.position}</Typography>}
        </Grid>

        <Grid item xs={12} sm={6}>
          <PlaceholderSelect
            label={FORMS.ADD_EMPLOYEE.GENDER_LABEL}
            placeholder={FORMS.ADD_EMPLOYEE.GENDER_PLACEHOLDER}
            icon={<IconUserCircle style={iconStyle} />}
            value={formData.gender}
            onChange={(event) => handleFieldChange("gender", String(event.target.value))}
            sx={formControl(theme)}
          >
            <MenuItem value="">Sin especificar</MenuItem>
            {EMPLOYEE_GENDERS.map((gen) => (
              <MenuItem key={gen} value={gen}>
                {gen}
              </MenuItem>
            ))}
          </PlaceholderSelect>
          {errors.gender && <Typography variant="caption" sx={{ color: "error.main", mt: 0.5 }}>{errors.gender}</Typography>}
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.CONTRACT_START_DATE_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.CONTRACT_START_DATE_LABEL}
            variant="outlined"
            fullWidth
            value={formData.contractStartDate || todayStr}
            onChange={(e) => handleFieldChange("contractStartDate", e.target.value)}
            error={errors.contractStartDate !== ""}
            helperText={errors.contractStartDate}
            icon={<IconId style={iconStyle} />}
            sx={formControl(theme)}
            type="date"
            inputProps={{ max: todayStr }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.HOURLY_RATE_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.HOURLY_RATE_LABEL}
            variant="outlined"
            fullWidth
            value={formData.hourlyRate}
            onChange={(e) => handleFieldChange("hourlyRate", e.target.value)}
            error={errors.hourlyRate !== ""}
            helperText={errors.hourlyRate}
            icon={<IconMail style={iconStyle} />}
            sx={formControl(theme)}
            type="number"
            inputProps={{ step: "0.01", min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_EMPLOYEE.VACATION_DAYS_PLACEHOLDER}
            label={FORMS.ADD_EMPLOYEE.VACATION_DAYS_LABEL}
            variant="outlined"
            fullWidth
            value={formData.vacationDays}
            onChange={(e) => handleFieldChange("vacationDays", e.target.value)}
            error={errors.vacationDays !== ""}
            helperText={errors.vacationDays}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            type="number"
            inputProps={{ step: 1, min: 0 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="text"
              onClick={handleClearForm}
              startIcon={<IconRotate size={16} />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Limpiar
            </Button>
            <Box sx={actionsInnerBox}>
              {onCancel && (
                <Button
                  variant="text"
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
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                Crear
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEmployeeForm;