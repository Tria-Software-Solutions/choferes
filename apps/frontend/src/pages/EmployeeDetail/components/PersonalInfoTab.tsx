import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Save,
  Badge as BadgeIcon,
  Briefcase,
  CalendarDays,
  Clock3,
  IdCard,
  Mail,
  UserCheck,
  UserMinus,
} from "lucide-react";
import {
  Employee,
  TERMINATION_REASON_LABELS,
} from "../../../models/Employee";
import { EMPLOYEE_TERMINATION_REASONS } from "@choferes/shared";
import { AppDispatch } from "../../../store/store";
import { updateEmployee } from "../../../store/slices/employeeSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PERMISSIONS from "../../../constants/permissions.constants";
import { cardStackStyles, sectionPaperStyles, sectionTitleStyles } from "../styles";

interface PersonalInfoTabProps {
  employee: Employee;
  onEmployeeUpdated: (employee: Employee) => void;
  onEmployeeRefresh: () => Promise<void> | void;
}

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

// "X años Y meses" between two YYYY-MM-DD dates.
const formatTenure = (start?: string | null, end?: string | null): string => {
  const parse = (value?: string | null): Date | null => {
    const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  };
  const from = parse(start);
  const to = parse(end) ?? new Date();
  if (!from || to.getTime() < from.getTime()) return "—";

  let months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;

  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years === 1 ? "" : "s"}`);
  if (restMonths > 0 || parts.length === 0) {
    parts.push(`${restMonths} mes${restMonths === 1 ? "" : "es"}`);
  }
  return parts.join(" ");
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
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_EMPLOYEES);

  const [form, setForm] = useState({
    position: "",
    nationalId: "",
    contractStartDate: "",
    terminationDate: "",
    terminationReason: "",
    terminationNotes: "",
    hourlyRate: "",
    vacationDays: "",
  });
  const [hasTermination, setHasTermination] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      position: employee.position ?? "",
      nationalId: employee.nationalId ?? "",
      contractStartDate: employee.contractStartDate ?? "",
      terminationDate: employee.terminationDate ?? "",
      terminationReason: employee.terminationReason ?? "",
      terminationNotes: employee.terminationNotes ?? "",
      hourlyRate: employee.hourlyRate != null ? String(employee.hourlyRate) : "",
      vacationDays: employee.vacationDays != null ? String(employee.vacationDays) : "",
    });
    setHasTermination(Boolean(employee.terminationDate));
  }, [
    employee.position,
    employee.nationalId,
    employee.contractStartDate,
    employee.terminationDate,
    employee.terminationReason,
    employee.terminationNotes,
    employee.hourlyRate,
    employee.vacationDays,
  ]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const rateValue = form.hourlyRate.trim() === "" ? null : Number(form.hourlyRate);
  const daysValue = form.vacationDays.trim() === "" ? null : Number(form.vacationDays);
  const rateInvalid = rateValue !== null && (!Number.isFinite(rateValue) || rateValue < 0);
  const daysInvalid = daysValue !== null && (!Number.isInteger(daysValue) || daysValue < 0);
  const terminationInvalid =
    hasTermination &&
    Boolean(form.terminationDate && form.contractStartDate) &&
    new Date(form.terminationDate).getTime() < new Date(form.contractStartDate).getTime();

  const tenure = useMemo(
    () =>
      formatTenure(
        form.contractStartDate,
        hasTermination ? form.terminationDate : undefined,
      ),
    [form.contractStartDate, form.terminationDate, hasTermination],
  );

  const isDirty =
    (form.position.trim() || null) !== (employee.position ?? null) ||
    (form.nationalId.trim() || null) !== (employee.nationalId ?? null) ||
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
    if (rateInvalid || daysInvalid || terminationInvalid) {
      showNotification("Revisa los valores ingresados", { severity: "warning" });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await dispatch(
        updateEmployee({
          id: employee.id,
          updatedEmployee: {
            position: form.position.trim() || null,
            nationalId: form.nationalId.trim() || null,
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
      showNotification("Datos guardados", { severity: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron guardar los datos";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const statusChip = employee.isActive === false ? (
    <Chip size="small" color="default" label="Inactivo" variant="outlined" />
  ) : (
    <Chip size="small" color="success" label="Activo" />
  );

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={sectionPaperStyles(theme)}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ ...sectionTitleStyles, mb: 0 }}>Información personal</Typography>
          {statusChip}
        </Box>

        <Box sx={infoRowStyles}>
          <BadgeIcon size={17} style={infoIconStyles} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {employee.firstName} {employee.lastName}
          </Typography>
        </Box>
        <Box sx={infoRowStyles}>
          <Mail size={17} style={infoIconStyles} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {employee.email || "Sin correo registrado"}
          </Typography>
        </Box>
        <Box sx={infoRowStyles}>
          <Clock3 size={17} style={infoIconStyles} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {employee.createdAt
              ? `Registrado el ${new Date(employee.createdAt).toLocaleDateString("es-CR")}`
              : "—"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Puesto"
            size="small"
            value={form.position}
            onChange={(event) => update("position", event.target.value)}
            disabled={!canEdit || isSaving}
            inputProps={{ maxLength: 100 }}
            fullWidth
          />
          <TextField
            label="Cédula"
            size="small"
            value={form.nationalId}
            onChange={(event) => update("nationalId", event.target.value)}
            disabled={!canEdit || isSaving}
            inputProps={{ maxLength: 30 }}
            fullWidth
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionPaperStyles(theme)}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Briefcase size={18} style={infoIconStyles} />
          <Typography sx={{ ...sectionTitleStyles, mb: 0 }}>Contrato y egreso</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Fecha de ingreso"
            type="date"
            size="small"
            value={form.contractStartDate}
            onChange={(event) => update("contractStartDate", event.target.value)}
            disabled={!canEdit || isSaving}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarDays size={16} style={infoIconStyles} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Antigüedad:{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {tenure}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

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
                disabled={isSaving}
              />
            }
            label="El empleado finalizó labores"
          />
        )}

        {hasTermination && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mt: 1.5,
              }}
            >
              <TextField
                label="Fecha de finalización"
                type="date"
                size="small"
                value={form.terminationDate}
                onChange={(event) => update("terminationDate", event.target.value)}
                disabled={!canEdit || isSaving}
                InputLabelProps={{ shrink: true }}
                error={terminationInvalid}
                helperText={
                  terminationInvalid ? "No puede ser anterior a la fecha de ingreso" : undefined
                }
                fullWidth
              />
              <FormControl size="small" fullWidth disabled={!canEdit || isSaving}>
                <InputLabel id="termination-reason-label">Motivo</InputLabel>
                <Select
                  labelId="termination-reason-label"
                  label="Motivo"
                  value={form.terminationReason}
                  onChange={(event) => update("terminationReason", event.target.value)}
                >
                  {EMPLOYEE_TERMINATION_REASONS.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {TERMINATION_REASON_LABELS[reason]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Notas del egreso"
              size="small"
              value={form.terminationNotes}
              onChange={(event) => update("terminationNotes", event.target.value)}
              disabled={!canEdit || isSaving}
              multiline
              minRows={2}
              inputProps={{ maxLength: 2000 }}
              sx={{ mt: 2 }}
              fullWidth
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
                color: theme.palette.text.secondary,
              }}
            >
              <UserMinus size={16} />
              <Typography variant="caption">
                Al guardar con fecha de finalización, el empleado queda como inactivo.
              </Typography>
            </Box>
          </>
        )}

        {!hasTermination && employee.terminationDate && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <UserCheck size={16} />
            <Typography variant="body2">
              Empleado activo. Último egreso registrado: {formatDate(employee.terminationDate)}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={sectionPaperStyles(theme)}>
        <Typography sx={sectionTitleStyles}>Datos de pago y vacaciones</Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Tarifa por hora (₡)"
            type="number"
            size="small"
            value={form.hourlyRate}
            onChange={(event) => update("hourlyRate", event.target.value)}
            disabled={!canEdit || isSaving}
            error={rateInvalid}
            helperText={
              rateInvalid
                ? "Debe ser un número mayor o igual a 0"
                : "Se usa para calcular el salario quincenal (horas × tarifa)"
            }
            inputProps={{ min: 0, step: "0.01" }}
            fullWidth
          />
          <TextField
            label="Saldo de vacaciones (días)"
            type="number"
            size="small"
            value={form.vacationDays}
            onChange={(event) => update("vacationDays", event.target.value)}
            disabled={!canEdit || isSaving}
            error={daysInvalid}
            helperText={
              daysInvalid
                ? "Debe ser un número entero mayor o igual a 0"
                : "Días hábiles disponibles; se descuenta al aprobar vacaciones"
            }
            inputProps={{ min: 0, step: 1 }}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            color: "text.secondary",
          }}
        >
          <IdCard size={16} />
          <Typography variant="caption">
            Los datos de contrato alimentan la acumulación de vacaciones y el estado del empleado.
          </Typography>
        </Box>
      </Paper>

      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSave}
            disabled={
              isSaving || !isDirty || rateInvalid || daysInvalid || terminationInvalid
            }
          >
            Guardar cambios
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PersonalInfoTab;
