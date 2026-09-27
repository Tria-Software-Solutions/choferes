import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconBeach, IconBriefcase, IconCalendarCheck, IconCalendarX, IconCash, IconCheck, IconClockHour3, IconFileText, IconId, IconInfoCircle, IconKey, IconLoader2, IconMail, IconPencil, IconPhone, IconRotate, IconUser, IconUserCircle } from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Employee,
  EmployeeGender,
  getEmployeePositionLabel,
  TERMINATION_REASON_LABELS,
} from "../../../models/Employee";
import {
  EMPLOYEE_GENDERS,
  EMPLOYEE_POSITIONS,
  EMPLOYEE_TERMINATION_REASONS,
} from "@choferes/shared";
import { AppDispatch } from "../../../store/store";
import { updateEmployee } from "../../../store/slices/employeeSlice";
import { linkEmployeeToUser } from "../../../services/employeeService";
import { digitsOnly, maskNationalId, maskPhone } from "../../../utils/mask";
import { formatMoney } from "../../../utils/paymentSlipPdf";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PERMISSIONS from "../../../constants/permissions.constants";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import SectionHeader from "./SectionHeader";
import TempPasswordDialog from "./TempPasswordDialog";
import {
  actionsBox,
  actionsInnerBox,
  clearButton,
  submitButton,
} from "../../Forms/sharedStyles";
import { cardStackStyles, sectionPaperStyles } from "../styles";

interface PersonalInfoTabProps {
  employee: Employee;
  onEmployeeUpdated: (employee: Employee) => void;
  onEmployeeRefresh: () => Promise<void> | void;
}

// Cada sección conserva el mismo layout; sus campos se activan con el botón
// "Editar" de su encabezado.
type EditSection = "personal" | "contract" | "payment";

const infoRowStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  py: 0.75,
};

const infoIconStyles = {
  color: "text.secondary",
  flexShrink: 0,
} as const;

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

// Convierte "YYYY-MM-DD" a un Date local (medianoche) para los DatePickers.
const parseStoredDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : null;
};

// Valor inicial del formulario (estado editable) a partir del empleado. La
// cédula y los teléfonos se guardan solo con dígitos; aquí se muestran con su
// máscara y se vuelven a "limpiar" antes de comparar/guardar.
const buildFormFromEmployee = (employee: Employee) => ({
  firstName: employee.firstName ?? "",
  lastName: employee.lastName ?? "",
  email: employee.email ?? "",
  primaryPhone: maskPhone(employee.primaryPhone ?? ""),
  secondaryPhone: maskPhone(employee.secondaryPhone ?? ""),
  position: employee.position ?? "",
  gender: employee.gender ?? "",
  nationalId: maskNationalId(employee.nationalId ?? ""),
  contractStartDate: employee.contractStartDate ?? "",
  terminationDate: employee.terminationDate ?? "",
  terminationReason: employee.terminationReason ?? "",
  terminationNotes: employee.terminationNotes ?? "",
  hourlyRate: employee.hourlyRate != null ? String(employee.hourlyRate) : "",
  vacationDays: employee.vacationDays != null ? String(employee.vacationDays) : "",
});

// "X años Y meses Z días" entre dos fechas YYYY-MM-DD (calculado al vuelo).
// Devuelve null cuando no hay fecha de inicio o el rango no es válido, para que
// la interfaz pueda mostrar un texto claro en vez de un guion.
const formatTenure = (start?: string | null, end?: string | null): string | null => {
  const parse = (value?: string | null): Date | null => {
    const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  };
  // Suma meses conservando el día, sin desbordar (31 ene + 1 mes = 28/29 feb).
  const addMonths = (date: Date, months: number): Date => {
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(date.getDate(), lastDay));
    return target;
  };
  const daysBetween = (from: Date, to: Date): number =>
    Math.round((to.getTime() - from.getTime()) / 86_400_000);

  const from = parse(start);
  const to = parse(end) ?? new Date();
  if (!from || to.getTime() < from.getTime()) return null;

  let months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let days = daysBetween(addMonths(from, months), to);
  if (days < 0) {
    months -= 1;
    days = daysBetween(addMonths(from, months), to);
  }
  if (months < 0 || days < 0) return null;

  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years === 1 ? "" : "s"}`);
  if (restMonths > 0) parts.push(`${restMonths} mes${restMonths === 1 ? "" : "es"}`);
  if (days > 0) parts.push(`${days} día${days === 1 ? "" : "s"}`);
  return parts.length > 0 ? parts.join(" ") : "0 días";
};

// Read-only personal data plus the pay-related fields and the contract /
// termination data (only Gerencia/Administrativo can edit the latter).
const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  employee,
  onEmployeeUpdated,
  onEmployeeRefresh,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_EMPLOYEES);

  const [form, setForm] = useState(() => buildFormFromEmployee(employee));
  const [hasTermination, setHasTermination] = useState(Boolean(employee.terminationDate));
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<EditSection | null>(null);
  const [isActivatingAccess, setIsActivatingAccess] = useState(false);
  // Credenciales temporales recién creadas: mientras no sean null, el diálogo
  // que las muestra permanece abierto (solo se entregan una vez).
  const [credentials, setCredentials] = useState<{
    username?: string;
    tempPassword?: string;
  } | null>(null);

  // Los campos de una sección solo aceptan cambios cuando esa sección está en
  // edición (botón "Editar" en su encabezado).
  const isEditing = (section: EditSection) => canEdit && editingSection === section;

  useEffect(() => {
    setForm(buildFormFromEmployee(employee));
    setHasTermination(Boolean(employee.terminationDate));
  }, [employee]);

  // Vuelve a los valores guardados y sale del modo edición.
  const resetForm = () => {
    setForm(buildFormFromEmployee(employee));
    setHasTermination(Boolean(employee.terminationDate));
    setEditingSection(null);
  };

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Puestos predefinidos + cualquier valor heredado de cuando el puesto era
  // texto libre, para que nunca se pierda el valor guardado.
  const positionOptions = useMemo(() => {
    const base = [...EMPLOYEE_POSITIONS] as string[];
    if (form.position && !base.includes(form.position)) base.push(form.position);
    return base;
  }, [form.position]);

  const rateValue = form.hourlyRate.trim() === "" ? null : Number(form.hourlyRate);
  const daysValue = form.vacationDays.trim() === "" ? null : Number(form.vacationDays);
  const rateInvalid = rateValue !== null && (!Number.isFinite(rateValue) || rateValue < 0);
  const daysInvalid = daysValue !== null && (!Number.isInteger(daysValue) || daysValue < 0);
  // Nombre y apellido son NOT NULL en la base; el correo es opcional pero debe
  // tener formato válido si se ingresa.
  const firstNameInvalid = form.firstName.trim() === "";
  const lastNameInvalid = form.lastName.trim() === "";
  const emailInvalid =
    form.email.trim() !== "" &&
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim());
  const contactInvalid = firstNameInvalid || lastNameInvalid || emailInvalid;
  const terminationInvalid =
    hasTermination &&
    Boolean(form.terminationDate && form.contractStartDate) &&
    new Date(form.terminationDate).getTime() < new Date(form.contractStartDate).getTime();

  // Si el empleado no tiene fecha de ingreso registrada se usa la fecha en que
  // se creó el registro como referencia.
  const tenureStart = form.contractStartDate || employee.createdAt || null;
  const tenure = useMemo(
    () =>
      formatTenure(
        tenureStart,
        hasTermination ? form.terminationDate : undefined,
      ),
    [tenureStart, form.terminationDate, hasTermination],
  );

  const isDirty =
    (form.firstName.trim() || null) !== (employee.firstName ?? null) ||
    (form.lastName.trim() || null) !== (employee.lastName ?? null) ||
    (form.email.trim() || null) !== (employee.email ?? null) ||
    (digitsOnly(form.nationalId) || null) !== (employee.nationalId ?? null) ||
    (digitsOnly(form.primaryPhone) || null) !== (employee.primaryPhone ?? null) ||
    (digitsOnly(form.secondaryPhone) || null) !== (employee.secondaryPhone ?? null) ||
    (form.position.trim() || null) !== (employee.position ?? null) ||
    (form.gender.trim() || null) !== (employee.gender ?? null) ||
    (form.contractStartDate || null) !== (employee.contractStartDate ?? null) ||
    (hasTermination ? form.terminationDate || null : null) !==
      (employee.terminationDate ?? null) ||
    (hasTermination ? form.terminationReason || null : null) !==
      (employee.terminationReason ?? null) ||
    (hasTermination ? form.terminationNotes.trim() || null : null) !==
      (employee.terminationNotes ?? null) ||
    (rateValue ?? null) !== (employee.hourlyRate ?? null) ||
    (daysValue ?? null) !== (employee.vacationDays ?? null);

  const handleSave = async () => {
    if (rateInvalid || daysInvalid || terminationInvalid || contactInvalid) {
      showNotification("Revisa los valores ingresados", { severity: "warning" });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await dispatch(
        updateEmployee({
          id: employee.id,
          updatedEmployee: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim() || null,
            primaryPhone: digitsOnly(form.primaryPhone) || null,
            secondaryPhone: digitsOnly(form.secondaryPhone) || null,
            position: form.position.trim() || null,
            gender: (form.gender.trim() || null) as Employee["gender"],
            nationalId: digitsOnly(form.nationalId) || null,
            contractStartDate: form.contractStartDate || null,
            terminationDate: hasTermination ? form.terminationDate || null : null,
            terminationReason: hasTermination ? form.terminationReason || null : null,
            terminationNotes: hasTermination ? form.terminationNotes.trim() || null : null,
            hourlyRate: rateValue,
            vacationDays: daysValue,
          } as Partial<Employee>,
        }),
      ).unwrap();
      await onEmployeeRefresh();
      if (updated) onEmployeeUpdated(updated);
      setEditingSection(null);
      showNotification("Datos guardados", { severity: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron guardar los datos";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Crea (o recupera) la cuenta de login del empleado. La contraseña temporal
  // solo llega en la respuesta cuando la cuenta es nueva.
  const handleActivateAccess = async () => {
    if (!canEdit || isActivatingAccess) return;
    setIsActivatingAccess(true);
    try {
      const result = await linkEmployeeToUser(employee.id);
      if (result.created && result.tempPassword) {
        setCredentials({ username: result.username, tempPassword: result.tempPassword });
      } else {
        showNotification("El empleado ya tiene acceso al sistema", { severity: "info" });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo activar el acceso al sistema";
      showNotification(message, { severity: "error" });
    } finally {
      setIsActivatingAccess(false);
    }
  };

  const registeredAt = employee.createdAt
    ? format(new Date(employee.createdAt), "dd MMM yyyy", { locale: es })
    : null;

  // La fila muestra una fecha, así que un calendario comunica mejor el
  // "desde el ..." que un icono de usuario.
  const statusIcon = employee.isActive === false
    ? <IconCalendarX size={17} style={infoIconStyles} />
    : <IconCalendarCheck size={17} style={infoIconStyles} />;

  // Botón "Editar" a la derecha del título de cada sección.
  const editAction = (section: EditSection) =>
    canEdit && editingSection !== section ? (
      <Button
        size="small"
        variant="text"
        startIcon={<IconPencil size={16} />}
        onClick={() => setEditingSection(section)}
        disabled={isSaving}
        sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
      >
        Editar
      </Button>
    ) : undefined;

  return (
    <>
      <Box sx={cardStackStyles}>
        {/* ── Información personal ── */}
        <Paper elevation={0} sx={sectionPaperStyles(theme)}>
          <SectionHeader
            icon={<IconId size={20} stroke={1.5} />}
            title="Información personal"
            description="Datos de contacto y perfil laboral del empleado."
            actions={editAction("personal")}
          />

          {!isEditing("personal") ? (
            <>
              <Box sx={infoRowStyles}>
                <IconUser size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.firstName} {employee.lastName}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconMail size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.email || "Sin correo registrado"}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconPhone size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.primaryPhone
                    ? maskPhone(employee.primaryPhone)
                    : "Sin teléfono registrado"}
                  {employee.secondaryPhone ? ` · ${maskPhone(employee.secondaryPhone)}` : ""}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                {statusIcon}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.isActive === false ? "Inactivo" : "Activo"}
                  {registeredAt ? ` desde el ${registeredAt}` : ""}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconBriefcase size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {getEmployeePositionLabel(
                    employee.position,
                    (employee.gender || null) as EmployeeGender | null,
                  ) || "Sin puesto"}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconUserCircle size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.gender || "Sin especificar"}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconId size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.nationalId ? maskNationalId(employee.nationalId) : "Sin cédula"}
                </Typography>
              </Box>
            </>
          ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="firstName"
                label="Nombre"
                placeholder="Ej: Juan"
                icon={<IconUser size={20} color={theme.palette.text.secondary} />}
                value={form.firstName}
                onChange={(event) => update("firstName", event.target.value)}
                disabled={!isEditing("personal") || isSaving}
                error={firstNameInvalid}
                helperText={firstNameInvalid ? "El nombre es obligatorio" : undefined}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="lastName"
                label="Apellido"
                placeholder="Ej: Pérez"
                icon={<IconUser size={20} color={theme.palette.text.secondary} />}
                value={form.lastName}
                onChange={(event) => update("lastName", event.target.value)}
                disabled={!isEditing("personal") || isSaving}
                error={lastNameInvalid}
                helperText={lastNameInvalid ? "El apellido es obligatorio" : undefined}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextfieldComponent
                name="email"
                label="Correo electrónico"
                placeholder="Ej: juan.perez@empresa.com"
                icon={<IconMail size={20} color={theme.palette.text.secondary} />}
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                disabled={!isEditing("personal") || isSaving}
                error={emailInvalid}
                helperText={
                  emailInvalid
                    ? "Ingresa un correo válido"
                    : "Con este correo se crea la cuenta de acceso al sistema"
                }
                inputProps={{ maxLength: 150 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="primaryPhone"
                label="Teléfono principal"
                placeholder="Ej: 8312-3456"
                icon={<IconPhone size={20} color={theme.palette.text.secondary} />}
                value={form.primaryPhone}
                onChange={(event) => update("primaryPhone", maskPhone(event.target.value))}
                disabled={!isEditing("personal") || isSaving}
                inputProps={{ inputMode: "tel", maxLength: 9 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="secondaryPhone"
                label="Teléfono secundario"
                placeholder="Ej: 8312-3456"
                icon={<IconPhone size={20} color={theme.palette.text.secondary} />}
                value={form.secondaryPhone}
                onChange={(event) => update("secondaryPhone", maskPhone(event.target.value))}
                disabled={!isEditing("personal") || isSaving}
                inputProps={{ inputMode: "tel", maxLength: 9 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PlaceholderSelect
                label="Puesto"
                placeholder="Selecciona"
                icon={<IconBriefcase size={20} color={theme.palette.text.secondary} />}
                formatValue={(value) =>
                  getEmployeePositionLabel(String(value), (form.gender || null) as EmployeeGender | null) ??
                  String(value)
                }
                value={form.position}
                disabled={!isEditing("personal") || isSaving}
                onChange={(event) => update("position", String(event.target.value))}
              >
                <MenuItem value="">Sin puesto</MenuItem>
                {positionOptions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {getEmployeePositionLabel(pos, (form.gender || null) as EmployeeGender | null) ?? pos}
                  </MenuItem>
                ))}
              </PlaceholderSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <PlaceholderSelect
                label="Género"
                placeholder="Selecciona"
                icon={<IconUserCircle size={20} color={theme.palette.text.secondary} />}
                value={form.gender}
                disabled={!isEditing("personal") || isSaving}
                onChange={(event) => update("gender", String(event.target.value))}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {EMPLOYEE_GENDERS.map((gen) => (
                  <MenuItem key={gen} value={gen}>
                    {gen}
                  </MenuItem>
                ))}
              </PlaceholderSelect>
            </Grid>
            <Grid item xs={12}>
              <TextfieldComponent
                name="nationalId"
                label="Cédula"
                placeholder="Ej: 1-2345-6789"
                icon={<IconId size={20} color={theme.palette.text.secondary} />}
                value={form.nationalId}
                onChange={(event) => update("nationalId", maskNationalId(event.target.value))}
                disabled={!isEditing("personal") || isSaving}
                inputProps={{ inputMode: "numeric" }}
              />
            </Grid>
          </Grid>
          )}
        </Paper>

        {/* ── Contrato y egreso ── */}
        <Paper elevation={0} sx={sectionPaperStyles(theme)}>
          <SectionHeader
            icon={<IconFileText size={20} stroke={1.5} />}
            title="Contrato y egreso"
            description="Fechas de ingreso y finalización, con el motivo del egreso."
            actions={editAction("contract")}
          />

          {!isEditing("contract") ? (
            <>
              <Box sx={infoRowStyles}>
                <IconCalendarCheck size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.contractStartDate
                    ? `Ingreso: ${formatDate(employee.contractStartDate)}`
                    : "Sin fecha de ingreso registrada"}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconClockHour3 size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {tenure ? `Antigüedad: ${tenure}` : "Antigüedad sin registrar"}
                </Typography>
              </Box>
              {employee.terminationDate && (
                <>
                  <Box sx={infoRowStyles}>
                    <IconCalendarX size={17} style={infoIconStyles} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {`Egreso: ${formatDate(employee.terminationDate)}`}
                    </Typography>
                  </Box>
                  <Box sx={infoRowStyles}>
                    <IconFileText size={17} style={infoIconStyles} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.terminationReason
                        ? TERMINATION_REASON_LABELS[
                            employee.terminationReason as keyof typeof TERMINATION_REASON_LABELS
                          ] ?? employee.terminationReason
                        : "Motivo no registrado"}
                    </Typography>
                  </Box>
                  {employee.terminationNotes && (
                    <Box sx={infoRowStyles}>
                      <IconFileText size={17} style={infoIconStyles} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {employee.terminationNotes}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </>
          ) : (
          <>
          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de ingreso"
                  value={parseStoredDate(form.contractStartDate)}
                  onChange={(date) =>
                    update("contractStartDate", date ? format(date, "yyyy-MM-dd") : "")
                  }
                  format="d MMM yyyy"
                  slots={{ toolbar: () => null }}
                  disabled={!isEditing("contract") || isSaving}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  height: "100%",
                  minHeight: 40,
                }}
              >
                <IconClockHour3 size={16} style={infoIconStyles} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Antigüedad:{" "}
                  {tenure ? (
                    <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {tenure}
                    </Box>
                  ) : (
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {form.contractStartDate || employee.createdAt
                        ? "Revisa las fechas"
                        : "Sin fecha de registro"}
                    </Box>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {canEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={hasTermination}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setHasTermination(checked);
                    if (checked && !form.terminationDate) {
                      update("terminationDate", new Date().toISOString().slice(0, 10));
                    }
                  }}
                  disabled={!isEditing("contract") || isSaving}
                />
              }
              label="El empleado finalizó labores"
            />
          )}

          {hasTermination && (
            <>
              <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de finalización"
                      value={parseStoredDate(form.terminationDate)}
                      onChange={(date) =>
                        update("terminationDate", date ? format(date, "yyyy-MM-dd") : "")
                      }
                      format="d MMM yyyy"
                      slots={{ toolbar: () => null }}
                      disabled={!isEditing("contract") || isSaving}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: terminationInvalid,
                          helperText: terminationInvalid
                            ? "No puede ser anterior a la fecha de ingreso"
                            : undefined,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PlaceholderSelect
                    label="Motivo del egreso"
                    placeholder="Selecciona"
                    icon={<IconFileText size={20} color={theme.palette.text.secondary} />}
                    formatValue={(value) =>
                      TERMINATION_REASON_LABELS[value as keyof typeof TERMINATION_REASON_LABELS] ?? String(value)
                    }
                    value={form.terminationReason}
                    disabled={!isEditing("contract") || isSaving}
                    onChange={(event) => update("terminationReason", event.target.value)}
                  >
                    {EMPLOYEE_TERMINATION_REASONS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {TERMINATION_REASON_LABELS[reason]}
                      </MenuItem>
                    ))}
                  </PlaceholderSelect>
                </Grid>
                <Grid item xs={12}>
                  <TextfieldComponent
                    name="terminationNotes"
                    label="Notas del egreso"
                    placeholder="Detalles adicionales (opcional)"
                    icon={<IconFileText size={20} color={theme.palette.text.secondary} />}
                    value={form.terminationNotes}
                    onChange={(event) => update("terminationNotes", event.target.value)}
                    disabled={!isEditing("contract") || isSaving}
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 2000 }}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1.5,
                  color: theme.palette.text.secondary,
                }}
              >
                <IconInfoCircle size={16} />
                <Typography variant="caption">
                  Al guardar con fecha de finalización, el empleado queda como inactivo.
                </Typography>
              </Box>
            </>
          )}

          {!hasTermination && employee.terminationDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <IconInfoCircle size={16} />
              <Typography variant="body2">
                Empleado activo. Último egreso registrado: {formatDate(employee.terminationDate)}
              </Typography>
            </Box>
          )}
          </>
          )}
        </Paper>

        {/* ── Datos de pago y vacaciones ── */}
        <Paper elevation={0} sx={sectionPaperStyles(theme)}>
          <SectionHeader
            icon={<IconCash size={20} stroke={1.5} />}
            title="Datos de pago y vacaciones"
            description="Valores que alimentan el cálculo quincenal y la acumulación de vacaciones."
            actions={editAction("payment")}
          />

          {!isEditing("payment") ? (
            <>
              <Box sx={infoRowStyles}>
                <IconCash size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.hourlyRate != null
                    ? `Tarifa por hora: ${formatMoney(Number(employee.hourlyRate), "CRC")}`
                    : "Sin tarifa registrada"}
                </Typography>
              </Box>
              <Box sx={infoRowStyles}>
                <IconBeach size={17} style={infoIconStyles} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.vacationDays != null
                    ? `Vacaciones: ${employee.vacationDays} ${
                        employee.vacationDays === 1 ? "día" : "días"
                      }`
                    : "Sin saldo de vacaciones"}
                </Typography>
              </Box>
            </>
          ) : (
          <>
          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="hourlyRate"
                label="Tarifa por hora (₡)"
                placeholder="Ej: 2500"
                type="number"
                icon={<IconCash size={20} color={theme.palette.text.secondary} />}
                value={form.hourlyRate}
                onChange={(event) => update("hourlyRate", event.target.value)}
                disabled={!isEditing("payment") || isSaving}
                error={rateInvalid}
                helperText={
                  rateInvalid
                    ? "Debe ser un número mayor o igual a 0"
                    : "Se usa para calcular el salario quincenal (horas × tarifa)"
                }
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                name="vacationDays"
                label="Saldo de vacaciones (días)"
                placeholder="Ej: 10"
                type="number"
                icon={<IconBeach size={20} color={theme.palette.text.secondary} />}
                value={form.vacationDays}
                onChange={(event) => update("vacationDays", event.target.value)}
                disabled={!isEditing("payment") || isSaving}
                error={daysInvalid}
                helperText={
                  daysInvalid
                    ? "Debe ser un número entero mayor o igual a 0"
                    : "Días hábiles disponibles; se descuenta al aprobar vacaciones"
                }
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2.5,
              color: theme.palette.text.secondary,
            }}
          >
            <IconInfoCircle size={16} />
            <Typography variant="caption">
              Los datos de contrato alimentan la acumulación de vacaciones y el estado del empleado.
            </Typography>
          </Box>
          </>
          )}
        </Paper>

        {/* ── Acceso al sistema ── */}
        <Paper elevation={0} sx={sectionPaperStyles(theme)}>
          <SectionHeader
            icon={<IconKey size={20} stroke={1.5} />}
            title="Acceso al sistema"
            description="Crea la cuenta de login del empleado y entrega una contraseña temporal."
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2.5,
              color: theme.palette.text.secondary,
            }}
          >
            <IconInfoCircle size={16} />
            <Typography variant="caption">
              El usuario es su correo electrónico. Si ya tiene cuenta, no se crea otra.
            </Typography>
          </Box>

          {canEdit && (
            <Button
              variant="outlined"
              startIcon={
                isActivatingAccess ? (
                  <IconLoader2 size={18} className="animate-spin" />
                ) : (
                  <IconKey size={18} />
                )
              }
              onClick={() => void handleActivateAccess()}
              disabled={isActivatingAccess}
              fullWidth={isSmallScreen}
            >
              {isActivatingAccess ? "Activando…" : "Activar acceso al sistema"}
            </Button>
          )}
        </Paper>

        {editingSection !== null && (
          <Box sx={[actionsBox(theme), { mb: { xs: 1, sm: 2 } }]}>
            <Button
              variant="text"
              startIcon={<IconRotate size={18} />}
              onClick={resetForm}
              disabled={isSaving || !isDirty}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Descartar cambios
            </Button>
            <Box sx={actionsInnerBox}>
              <Button
                variant="text"
                startIcon={<IconCheck size={18} />}
                onClick={() => void handleSave()}
                disabled={
                  isSaving || !isDirty || rateInvalid || daysInvalid || terminationInvalid || contactInvalid
                }
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                Guardar cambios
              </Button>
            </Box>
          </Box>
        )}

        {/* Espacio al final del tab. */}
        <Box aria-hidden sx={{ height: { xs: 8, sm: 20 }, flexShrink: 0 }} />
      </Box>

      <TempPasswordDialog
        open={credentials !== null}
        onClose={() => setCredentials(null)}
        employeeName={`${employee.firstName} ${employee.lastName}`}
        username={credentials?.username}
        tempPassword={credentials?.tempPassword}
      />
    </>
  );
};

export default PersonalInfoTab;
