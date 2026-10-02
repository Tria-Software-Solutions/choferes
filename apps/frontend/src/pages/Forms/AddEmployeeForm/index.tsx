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
import {
  IconBeach,
  IconCash,
  IconMail,
  IconRotate,
  IconUser,
  IconId,
  IconPhone,
  IconBriefcase,
  IconUserCircle,
  IconMapPin,
} from "@tabler/icons-react";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import IdentityFields, { IdentityValue, identityError } from "../../../components/IdentityFields/IdentityFields.component";
import PositionSelect from "../../../components/PositionSelect/PositionSelect.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import { FORMS } from "../../../constants/constants";
import { maskPhone, digitsOnly } from "../../../utils/mask";
import {
  DEFAULT_NATIONALITY,
  EMPLOYEE_GENDERS,
  computeAccruedVacationDays,
  normalizeNationalId,
} from "@choferes/shared";
import type { EmployeeGender, NationalIdType } from "@choferes/shared";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  boxRoot,
  gridContainer,
  iconStyle,
  sectionTitle,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
  formControl,
} from "./styles";

// Tarifa por hora de referencia para un empleado nuevo (salario mínimo por hora
// de Costa Rica). Viene prellena para no obligar a escribirla; se puede ajustar
// si el puesto o el contrato pagan más.
const DEFAULT_HOURLY_RATE = "1690.46";

/**
 * Saldo de vacaciones que otorga la ley (art. 153: 2 semanas remuneradas por
 * cada 50 semanas trabajadas) al día de hoy, para la fecha de ingreso indicada.
 * En un empleado nuevo casi siempre da 0 días.
 */
const accruedVacationDays = (contractStartDate: string): number =>
  computeAccruedVacationDays(contractStartDate).accruedDays;

/** El saldo se muestra sin ceros de relleno: 5, no 5.00. */
const formatVacationDays = (days: number): string => String(days);

interface AddEmployeeFormData {
  firstName: string;
  lastName: string;
  preferredName: string;
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
    preferredName?: string | null;
    nationalId?: string | null;
    nationalIdType?: NationalIdType;
    nationality?: string;
    birthDate?: string | null;
    address?: string | null;
    primaryPhone?: string | null;
    secondaryPhone?: string | null;
    position?: string | null;
    positions?: string[];
    gender?: EmployeeGender | null;
    contractStartDate?: string | null;
    hourlyRate?: number | null;
    vacationDays?: number | null;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Formulario de alta de empleado. Los campos van agrupados por secciones (como
// la ficha del empleado) para que un formulario largo se lea de arriba abajo:
// identificación, contacto, puesto y contrato/pago. Los vehículos se dan de
// alta después en la ficha; el saldo de vacaciones se propone con la regla de
// la ley (art. 153) y queda editable.
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

  const emptyFormData = (): AddEmployeeFormData => ({
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
    nationalId: "",
    primaryPhone: "",
    secondaryPhone: "",
    position: "",
    gender: "",
    contractStartDate: todayStr,
    hourlyRate: DEFAULT_HOURLY_RATE,
    vacationDays: formatVacationDays(accruedVacationDays(todayStr)),
  });

  const [formData, setFormData] = useState<AddEmployeeFormData>(emptyFormData);
  // Un empleado puede tener varios puestos; se necesita al menos uno.
  const [positions, setPositions] = useState<string[]>([]);
  // Documento (cédula, DIMEX, pasaporte u otro) con su nacionalidad y bandera.
  const [identity, setIdentity] = useState<IdentityValue>({
    nationalIdType: "cedula",
    nationalId: "",
    nationality: DEFAULT_NATIONALITY,
  });
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  // El saldo se propone calculado, pero en cuanto se toca a mano deja de
  // recalcularse: manda lo que escribió la persona.
  const [vacationDaysEdited, setVacationDaysEdited] = useState(false);
  const [errors, setErrors] = useState<Record<keyof AddEmployeeFormData, string>>({
    firstName: "",
    lastName: "",
    preferredName: "",
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
      // El puesto es obligatorio: define el rol de acceso del empleado.
      if (!value.trim()) return FORMS.REQUIRED_FIELD;
      return "";
    }

    if (name === "gender") {
      if (!value.trim()) return "";
      if (!["Masculino", "Femenino"].includes(value)) return "Género inválido";
      return "";
    }

    if (name === "preferredName") {
      // Opcional: es un apodo, no un nombre legal.
      if (!value.trim()) return "";
      if (value.trim().length > 100) return FORMS.MAX_50_CHARS;
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
      if (!Number.isFinite(num) || num < 0) return "Debe ser un número ≥ 0";
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
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // El saldo sigue a la fecha de ingreso mientras nadie lo haya tocado a mano.
      if (field === "contractStartDate" && !vacationDaysEdited) {
        next.vacationDays = formatVacationDays(accruedVacationDays(value));
      }
      return next;
    });
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
      errors.preferredName === "" &&
      positions.length > 0 &&
      errors.email === "" &&
      identity.nationalId !== "" &&
      identityError(identity) === "" &&
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
        preferredName: formData.preferredName.trim() || null,
        email: formData.email.trim() || undefined,
        nationalIdType: identity.nationalIdType,
        nationalId: normalizeNationalId(identity.nationalIdType, identity.nationalId) || null,
        nationality: identity.nationality,
        birthDate: birthDate || null,
        address: address.trim() || null,
        primaryPhone: digitsOnly(formData.primaryPhone) || null,
        secondaryPhone: digitsOnly(formData.secondaryPhone) || null,
        position: positions[0],
        positions,
        // El selector solo ofrece EMPLOYEE_GENDERS: el valor vacío es "sin
        // especificar" y viaja como null.
        gender: (formData.gender.trim() || null) as EmployeeGender | null,
        contractStartDate: formData.contractStartDate || null,
        hourlyRate:
          formData.hourlyRate.trim() === ""
            ? null
            : Number(formData.hourlyRate),
        // El campo viene con el saldo que otorga la ley (art. 153) por la
        // fecha de ingreso, y sigue siendo editable por si hay un ajuste.
        vacationDays:
          formData.vacationDays.trim() === ""
            ? null
            : Number(formData.vacationDays),
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setPositions([]);
    setIdentity({ nationalIdType: "cedula", nationalId: "", nationality: DEFAULT_NATIONALITY });
    setBirthDate("");
    setAddress("");
    setFormData(emptyFormData());
    setVacationDaysEdited(false);
    setErrors({
      firstName: "",
      lastName: "",
      preferredName: "",
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
        {/* Section: Identificación */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Identificación
          </Typography>
        </Grid>

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
            placeholder="Ej: Carlitos"
            label="Nombre preferido (apodo)"
            variant="outlined"
            fullWidth
            value={formData.preferredName}
            onChange={(e) => handleFieldChange("preferredName", e.target.value)}
            error={errors.preferredName !== ""}
            helperText={errors.preferredName}
            icon={<IconUserCircle style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100 }}
          />
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

        <IdentityFields value={identity} onChange={setIdentity} iconColor={theme.palette.text.secondary} />

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de nacimiento"
              value={birthDate ? new Date(`${birthDate}T00:00:00`) : null}
              onChange={(date) =>
                setBirthDate(date && !Number.isNaN(date.getTime()) ? format(date, "yyyy-MM-dd") : "")
              }
              format="d MMM yyyy"
              maxDate={new Date()}
              minDate={new Date(1900, 0, 1)}
              openTo="year"
              views={["year", "month", "day"]}
              slots={{ toolbar: () => null }}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <TextfieldComponent
            placeholder="Provincia, cantón, distrito y otras señas"
            label="Dirección"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<IconMapPin style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Section: Contacto */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Contacto
          </Typography>
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

        {/* Section: Puesto */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Puesto
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <PositionSelect
            label={FORMS.ADD_EMPLOYEE.POSITION_LABEL}
            placeholder={FORMS.ADD_EMPLOYEE.POSITION_PLACEHOLDER}
            icon={<IconBriefcase style={iconStyle} />}
            value={positions}
            gender={formData.gender}
            onChange={setPositions}
            sx={formControl(theme)}
          />
        </Grid>

        {/* Section: Contrato y pago */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Contrato y pago
          </Typography>
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
            icon={<IconCash style={iconStyle} />}
            sx={formControl(theme)}
            type="number"
            inputProps={{ step: "0.01", min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder="Ej: 5"
            label="Saldo de vacaciones (días)"
            variant="outlined"
            fullWidth
            value={formData.vacationDays}
            onChange={(e) => {
              setVacationDaysEdited(true);
              handleFieldChange("vacationDays", e.target.value);
            }}
            error={errors.vacationDays !== ""}
            helperText={
              errors.vacationDays ||
              "Calculado por antigüedad (art. 153). Podés ajustarlo."
            }
            icon={<IconBeach style={iconStyle} />}
            sx={formControl(theme)}
            type="number"
            inputProps={{ step: "0.01", min: 0 }}
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
