import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { IconCalendarWeek, IconCheck, IconFileText, IconLoader2, IconX } from "@tabler/icons-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { formatStoredDate, parseStoredDate } from "../../../utils/dates";
import { Employee } from "../../../models/Employee";
import { Vacation } from "../../../models/Vacation";
import { AppDispatch } from "../../../store/store";
import { createVacation, updateVacation } from "../../../store/slices/vacationSlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import {
  actionsBox,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from "../../Forms/sharedStyles";

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Desde"
                value={parseStoredDate(startDate)}
                onChange={(date) => setStartDate(formatStoredDate(date))}
                format="d MMM yyyy"
                slots={{ toolbar: () => null }}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Hasta"
                value={parseStoredDate(endDate)}
                onChange={(date) => setEndDate(formatStoredDate(date))}
                format="d MMM yyyy"
                slots={{ toolbar: () => null }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: Boolean(dateError),
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: dateError ? "error.main" : "text.secondary",
          }}
        >
          <IconCalendarWeek size={16} />
          <Typography variant="caption">
            {dateError ?? `Días hábiles: ${days}${employee.vacationDays != null ? ` · saldo disponible: ${employee.vacationDays}` : ""}`}
          </Typography>
        </Box>

        <TextfieldComponent
          name="reason"
          label="Motivo"
          icon={<IconFileText size={20} color={theme.palette.text.secondary} />}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 1000 }}
          fullWidth
        />

        <Box sx={actionsBox(theme)}>
          <Button
            variant="text"
            startIcon={<IconX size={18} />}
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth={isSmallScreen}
            sx={cancelButton}
          >
            Cancelar
          </Button>
          <Box sx={actionsInnerBox}>
            <Button
              variant="text"
              startIcon={isSubmitting ? <IconLoader2 size={18} /> : <IconCheck size={18} />}
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              fullWidth={isSmallScreen}
              sx={submitButton}
            >
              {isEditing ? "Guardar" : "Solicitar"}
            </Button>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default VacationFormDialog;
