import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
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
import { IconAlertTriangle, IconBeach, IconBriefcase, IconCalendarCheck, IconCalendarClock, IconCalendarX, IconCash, IconCheck, IconClockHour3, IconFileText, IconId, IconInfoCircle, IconKey, IconLoader2, IconMail, IconPencil, IconPhone, IconRotate, IconUser, IconUserCircle, IconX } from "@tabler/icons-react";
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
  getRoleNameForPosition,
} from "@choferes/shared";
import { AppDispatch } from "../../../store/store";
import { updateEmployee } from "../../../store/slices/employeeSlice";
import {
  assignDefaultEmployeeRole,
  EmployeeAccess,
  getEmployeeAccess,
  linkEmployeeToUser,
} from "../../../services/employeeService";
import { digitsOnly, maskNationalId, maskPhone } from "../../../utils/mask";
import { formatMoney } from "../../../utils/paymentSlipPdf";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
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

// Celda de dato etiquetado para la vista de solo lectura.
const InfoCell: React.FC<{
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  span?: number;
}> = ({ label, icon, children, span }) => (
  <Box sx={{ gridColumn: span ? `span ${span}` : undefined }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
      {icon && (
        <Box sx={{ display: "flex", color: "text.disabled", lineHeight: 1 }}>{icon}</Box>
      )}
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}
      >
        {label}
      </Typography>
    </Box>
    <Typography component="div" variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
      {children}
    </Typography>
  </Box>
);

// Grid de dos columnas que colapsa a una en móvil.
const InfoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
      gap: { xs: 2, sm: 2.5 },
      pt: 1,
    }}
  >
    {children}
  </Box>
);

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
  scheduledTerminationDate: employee.scheduledTerminationDate ?? "",
  scheduledTerminationReason: employee.scheduledTerminationReason ?? "",
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

  const canEdit = userPermissions.includes(PERMISSION_CODES.EDIT_EMPLOYEES);
  const canManageUser = userPermissions.includes(PERMISSION_CODES.EDIT_USER) || userPermissions.includes(PERMISSION_CODES.CREATE_USERS);

  const [form, setForm] = useState(() => buildFormFromEmployee(employee));
  const [hasTermination, setHasTermination] = useState(Boolean(employee.terminationDate));
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<EditSection | null>(null);
  const [isActivatingAccess, setIsActivatingAccess] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  // Cuenta de acceso del empleado (usuario + roles). Permite avisar cuando la
  // cuenta quedó sin rol, que deja al usuario sin ver nada en la app.
  const [access, setAccess] = useState<EmployeeAccess | null>(null);
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

  // Estado de la cuenta de acceso (se recarga al cambiar de empleado).
  useEffect(() => {
    let cancelled = false;
    getEmployeeAccess(employee.id)
      .then((data) => {
        if (!cancelled) setAccess(data);
      })
      .catch(() => {
        if (!cancelled) setAccess(null);
      });
    return () => {
      cancelled = true;
    };
  }, [employee.id]);

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
    (form.scheduledTerminationDate || null) !== (employee.scheduledTerminationDate ?? null) ||
    (form.scheduledTerminationReason || null) !== (employee.scheduledTerminationReason ?? null) ||
    (rateValue ?? null) !== (employee.hourlyRate ?? null) ||
    (daysValue ?? null) !== (employee.vacationDays ?? null);

  const handleSave = async () => {
    if (form.position.trim() === "") {
      showNotification("El puesto es obligatorio", { severity: "warning" });
      return;
    }
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
            position: form.position.trim(),
            gender: (form.gender.trim() || null) as Employee["gender"],
            nationalId: digitsOnly(form.nationalId) || null,
            contractStartDate: form.contractStartDate || null,
            terminationDate: hasTermination ? form.terminationDate || null : null,
            terminationReason: hasTermination ? form.terminationReason || null : null,
            terminationNotes: hasTermination ? form.terminationNotes.trim() || null : null,
            scheduledTerminationDate: !hasTermination ? form.scheduledTerminationDate || null : null,
            scheduledTerminationReason: !hasTermination ? form.scheduledTerminationReason || null : null,
            hourlyRate: rateValue,
            vacationDays: daysValue,
          } as Partial<Employee>,
        }),
      ).unwrap();
      await onEmployeeRefresh();
      if (updated) onEmployeeUpdated(updated);
      setEditingSection(null);
      showNotification("Datos guardados", { severity: "success" });
      // Cambiar el puesto mueve la cuenta al rol de ese puesto: se vuelve a leer.
      getEmployeeAccess(employee.id)
        .then(setAccess)
        .catch(() => undefined);
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
      // La cuenta pudo quedar sin rol (o haberse reparado al re-vincular).
      setAccess(await getEmployeeAccess(employee.id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo activar el acceso al sistema";
      showNotification(message, { severity: "error" });
    } finally {
      setIsActivatingAccess(false);
    }
  };

  // Rol de acceso que le corresponde a su puesto.
  const expectedRoleName = getRoleNameForPosition(employee.position);

  // Asigna el rol de su puesto cuando la cuenta quedó sin rol.
  const handleAssignDefaultRole = async () => {
    if (!canEdit || isAssigningRole) return;
    setIsAssigningRole(true);
    try {
      const updated = await assignDefaultEmployeeRole(employee.id);
      setAccess(updated);
      showNotification(
        `Se asignó el rol "${updated.roles[0]?.name ?? expectedRoleName ?? ""}" a la cuenta`,
        { severity: "success" },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo asignar el rol";
      showNotification(message, { severity: "error" });
    } finally {
      setIsAssigningRole(false);
    }
  };

  const registeredAt = employee.createdAt
    ? format(new Date(employee.createdAt), "dd MMM yyyy", { locale: es })
    : null;

  // La fila muestra una fecha, así que un calendario comunica mejor el
  // "desde el ..." que un icono de usuario.

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
            <InfoGrid>
              <InfoCell label="Nombre completo" icon={<IconUser size={13} />} span={2}>
                {employee.firstName} {employee.lastName}
              </InfoCell>
              <InfoCell label="Cédula" icon={<IconId size={13} />}>
                {employee.nationalId ? maskNationalId(employee.nationalId) : "Sin cédula"}
              </InfoCell>
              <InfoCell label="Estado">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    label={employee.isActive === false ? "Inactivo" : "Activo"}
                    color={employee.isActive === false ? "error" : "success"}
                    variant="outlined"
                    sx={{ height: 22, fontWeight: 700, fontSize: "0.7rem" }}
                  />
                  {registeredAt && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      desde el {registeredAt}
                    </Typography>
                  )}
                </Box>
              </InfoCell>
              <InfoCell label="Puesto" icon={<IconBriefcase size={13} />}>
                {getEmployeePositionLabel(
                  employee.position,
                  (employee.gender || null) as EmployeeGender | null,
                ) || "Sin puesto"}
              </InfoCell>
              <InfoCell label="Género" icon={<IconUserCircle size={13} />}>
                {employee.gender || "Sin especificar"}
              </InfoCell>
              <InfoCell label="Teléfono" icon={<IconPhone size={13} />}>
                {employee.primaryPhone
                  ? maskPhone(employee.primaryPhone)
                  : "Sin teléfono registrado"}
                {employee.secondaryPhone ? (
                  <Typography component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {" · "}{maskPhone(employee.secondaryPhone)}
                  </Typography>
                ) : null}
              </InfoCell>
              <InfoCell label="Correo electrónico" icon={<IconMail size={13} />}>
                {employee.email || "Sin correo registrado"}
              </InfoCell>
            </InfoGrid>
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
            <Grid item xs={12} sm={6}>
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
                {positionOptions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {getEmployeePositionLabel(pos, (form.gender || null) as EmployeeGender | null) ?? pos}
                  </MenuItem>
                ))}
              </PlaceholderSelect>
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
              {/* Scheduled termination banner */}
              {employee.scheduledTerminationDate && !employee.terminationDate && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: "warning.main",
                    color: "warning.contrastText",
                    opacity: 0.9,
                  }}
                >
                  <IconAlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Finalización programada: {formatDate(employee.scheduledTerminationDate)}
                    </Typography>
                    {employee.scheduledTerminationReason && (
                      <Typography variant="caption">
                        Motivo:{" "}
                        {TERMINATION_REASON_LABELS[
                          employee.scheduledTerminationReason as keyof typeof TERMINATION_REASON_LABELS
                        ] ?? employee.scheduledTerminationReason}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              <InfoGrid>
                <InfoCell label="Fecha de ingreso" icon={<IconCalendarCheck size={13} />}>
                  {employee.contractStartDate
                    ? formatDate(employee.contractStartDate)
                    : "Sin fecha registrada"}
                </InfoCell>
                <InfoCell label="Antigüedad" icon={<IconClockHour3 size={13} />}>
                  {tenure ?? "Sin registrar"}
                </InfoCell>
                {employee.terminationDate && (
                  <>
                    <InfoCell label="Fecha de egreso" icon={<IconCalendarX size={13} />}>
                      {formatDate(employee.terminationDate)}
                    </InfoCell>
                    <InfoCell label="Motivo del egreso" icon={<IconFileText size={13} />}>
                      {employee.terminationReason
                        ? TERMINATION_REASON_LABELS[
                            employee.terminationReason as keyof typeof TERMINATION_REASON_LABELS
                          ] ?? employee.terminationReason
                        : "No registrado"}
                    </InfoCell>
                    {employee.terminationNotes && (
                      <InfoCell label="Notas" icon={<IconFileText size={13} />} span={2}>
                        {employee.terminationNotes}
                      </InfoCell>
                    )}
                  </>
                )}
              </InfoGrid>
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
                <IconClockHour3 size={16} style={{ color: "text.secondary", flexShrink: 0 }} />
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

          {/* Scheduled (future) termination — only visible when not already terminated */}
          {!hasTermination && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <IconCalendarClock size={17} style={{ color: theme.palette.warning.main, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Programar finalización de labores
                </Typography>
              </Box>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de finalización programada"
                      value={parseStoredDate(form.scheduledTerminationDate)}
                      onChange={(date) =>
                        update("scheduledTerminationDate", date ? format(date, "yyyy-MM-dd") : "")
                      }
                      format="d MMM yyyy"
                      minDate={new Date()}
                      slots={{ toolbar: () => null }}
                      disabled={!isEditing("contract") || isSaving}
                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PlaceholderSelect
                    label="Motivo (opcional)"
                    placeholder="Selecciona"
                    icon={<IconFileText size={20} color={theme.palette.text.secondary} />}
                    formatValue={(value) =>
                      TERMINATION_REASON_LABELS[value as keyof typeof TERMINATION_REASON_LABELS] ?? String(value)
                    }
                    value={form.scheduledTerminationReason}
                    disabled={!isEditing("contract") || isSaving || !form.scheduledTerminationDate}
                    onChange={(event) => update("scheduledTerminationReason", event.target.value)}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    {EMPLOYEE_TERMINATION_REASONS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {TERMINATION_REASON_LABELS[reason]}
                      </MenuItem>
                    ))}
                  </PlaceholderSelect>
                </Grid>
                {form.scheduledTerminationDate && (
                  <Grid item xs={12}>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<IconX size={15} />}
                      onClick={() => {
                        update("scheduledTerminationDate", "");
                        update("scheduledTerminationReason", "");
                      }}
                      disabled={!isEditing("contract") || isSaving}
                      sx={{ color: "text.secondary", textTransform: "none" }}
                    >
                      Quitar programación
                    </Button>
                  </Grid>
                )}
              </Grid>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, color: "text.secondary" }}>
                <IconInfoCircle size={16} />
                <Typography variant="caption">
                  El sistema desactivará automáticamente al empleado en esa fecha.
                </Typography>
              </Box>
            </>
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
            <InfoGrid>
              <InfoCell label="Tarifa por hora" icon={<IconCash size={13} />}>
                {employee.hourlyRate != null
                  ? formatMoney(Number(employee.hourlyRate), "CRC")
                  : "Sin tarifa registrada"}
              </InfoCell>
              <InfoCell label="Vacaciones disponibles" icon={<IconBeach size={13} />}>
                {employee.vacationDays != null
                  ? `${employee.vacationDays} ${employee.vacationDays === 1 ? "día" : "días"}`
                  : "Sin saldo"}
              </InfoCell>
            </InfoGrid>
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
            description="Crea la cuenta de login del empleado y entrega una contraseña temporal. El rol de la cuenta es el de su puesto."
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
              El usuario es su correo electrónico. Si ya tiene cuenta, no se crea otra. La cuenta
              recibe el rol &quot;{expectedRoleName}&quot;
              {employee.position === "supervisor" ? " (un supervisor siempre lo tiene)" : ""} y
              cambia si cambia su puesto.
            </Typography>
          </Box>

          {access?.hasUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
              {/* Estado de la cuenta: usuario vinculado y sus roles. */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip size="small" label={`@${access.username}`} sx={{ fontWeight: 600 }} />
                {access.roles.length > 0 ? (
                  access.roles.map((role) => (
                    <Chip key={role.id} size="small" variant="outlined" label={role.name} />
                  ))
                ) : (
                  <Chip size="small" color="error" variant="outlined" label="Sin rol" />
                )}
              </Box>

              {access.needsRole && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.5,
                    p: 1.75,
                    borderRadius: "12px",
                    backgroundColor: theme.tokens.colors.warningSoft,
                    border: `1px solid ${theme.tokens.colors.warning}`,
                  }}
                >
                  <IconAlertTriangle
                    size={20}
                    color={theme.tokens.colors.warning}
                    style={{ flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: theme.tokens.colors.text,
                      }}
                    >
                      Esta cuenta no tiene ningún rol
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: theme.tokens.colors.textMuted,
                        lineHeight: 1.45,
                      }}
                    >
                      Sin un rol el usuario no ve ninguna sección de la app. Asígnale el rol
                      &quot;{expectedRoleName}&quot; (el de su puesto) para que pueda entrar.
                    </Typography>
                  </Box>
                  {canManageUser && (
                    <Button
                      size="small"
                      variant="text"
                      startIcon={
                        isAssigningRole ? (
                          <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                          <IconKey size={16} />
                        )
                      }
                      onClick={() => void handleAssignDefaultRole()}
                      disabled={isAssigningRole}
                      sx={{
                        flexShrink: 0,
                        fontWeight: 600,
                        color: theme.tokens.colors.text,
                        backgroundColor: theme.palette.background.paper,
                        "&:hover": { backgroundColor: theme.tokens.colors.hover },
                      }}
                    >
                      Asignar rol {expectedRoleName}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}

          {canManageUser && (
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
