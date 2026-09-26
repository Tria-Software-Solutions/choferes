import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, TextField, Typography } from "@mui/material";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { Employee } from "../../../models/Employee";
import { Vacation } from "../../../models/Vacation";
import { AppDispatch } from "../../../store/store";
import { createVacation, updateVacation } from "../../../store/slices/vacationSlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";

interface VacationFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  /** When provided the dialog edits it; otherwise it creates a new request. */
  vacation?: Vacation | null;
  onSaved: () => void;
}

// Counts business days (Mon-Fri) between two YYYY-MM-DD strings, inclusive —
// mirrors the server-side rule so the user sees the impact before saving.
const countBusinessDays = (startDate: string, endDate: string): number => {
  const parse = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };
  const start = parse(startDate);
  const end = parse(endDate);
  if (!start || !end || end.getTime() < start.getTime()) return 0;

  let days = 0;
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const VacationFormDialog: React.FC<VacationFormDialogProps> = ({
  open,
  onClose,
  employee,
  vacation,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useAppNotifications();

  const isEditing = Boolean(vacation);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form every time it opens (fresh request or the one being edited).
  useEffect(() => {
    if (!open) return;
    setStartDate(vacation?.startDate ?? "");
    setEndDate(vacation?.endDate ?? "");
    setReason(vacation?.reason ?? "");
  }, [open, vacation]);

  const days = useMemo(() => countBusinessDays(startDate, endDate), [startDate, endDate]);

  const rangeInvalid =
    Boolean(startDate && endDate) &&
    new Date(endDate).getTime() < new Date(startDate).getTime();

  const dateError = rangeInvalid
    ? "La fecha final no puede ser anterior a la inicial"
    : startDate && endDate && days === 0
      ? "El rango no incluye ningún día hábil"
      : null;

  const canSubmit = Boolean(startDate && endDate) && !dateError && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const payload = {
        startDate,
        endDate,
        reason: reason.trim() || null,
      };
      if (vacation) {
        await dispatch(updateVacation({ id: vacation.id, input: payload })).unwrap();
        showNotification("Solicitud actualizada", { severity: "success" });
      } else {
        await dispatch(createVacation({ employeeId: employee.id, ...payload })).unwrap();
        showNotification("Solicitud registrada", { severity: "success" });
      }
      onSaved();
      onClose();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la solicitud";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar solicitud" : "Nueva solicitud de vacaciones"}
      subtitle={`${employee.firstName} ${employee.lastName}`}
      hideActions
      paperSx={{ maxWidth: 520 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={Boolean(dateError)}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: dateError ? "error.main" : "text.secondary",
          }}
        >
          <CalendarDays size={16} />
          <Typography variant="caption">
            {dateError ?? `Días hábiles: ${days}${employee.vacationDays != null ? ` · saldo disponible: ${employee.vacationDays}` : ""}`}
          </Typography>
        </Box>

        <TextField
          label="Motivo"
          size="small"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 1000 }}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={isSubmitting ? <Loader2 size={16} /> : <Save size={16} />}
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {isEditing ? "Guardar" : "Solicitar"}
          </Button>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default VacationFormDialog;
