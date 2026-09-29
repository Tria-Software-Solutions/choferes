import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import {
  IconCalendarWeek,
  IconCheck,
  IconFileText,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { createMyVacation } from "../../../services/meService";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import { formatStoredDate, parseStoredDate } from "../../../utils/dates";
import { actionsBox, actionsInnerBox, cancelButton, submitButton } from "../../Forms/sharedStyles";

// Cuenta días hábiles (lun-vie) entre dos YYYY-MM-DD, espejo de la regla del
// servidor para que el usuario vea el impacto antes de enviar la solicitud.
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

interface MyVacationRequestDialogProps {
  open: boolean;
  onClose: () => void;
  /** Saldo disponible para mostrar junto al rango elegido. */
  available?: number | null;
  /** Recarga el panel cuando la solicitud se envía. */
  onRequested: () => Promise<void> | void;
}

// Autoservicio de vacaciones: el empleado pide días y la solicitud queda
// pendiente de aprobación administrativa.
export const MyVacationRequestDialog: React.FC<MyVacationRequestDialogProps> = ({
  open,
  onClose,
  available,
  onRequested,
}) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { showNotification } = useAppNotifications();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Cada apertura empieza con el formulario en blanco.
  useEffect(() => {
    if (!open) return;
    setStartDate("");
    setEndDate("");
    setReason("");
    setIsSubmitting(false);
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createMyVacation({ startDate, endDate, reason: reason.trim() || null });
      showNotification("Solicitud de vacaciones enviada", { severity: "success" });
      onClose();
      await onRequested();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo enviar la solicitud";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={handleClose}
      title="Solicitar vacaciones"
      subtitle="La solicitud queda pendiente de aprobación"
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
                  textField: { size: "small", fullWidth: true, error: Boolean(dateError) },
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
            color: dateError ? "error.main" : colors.textMuted,
          }}
        >
          <IconCalendarWeek size={16} />
          <Typography variant="caption">
            {dateError ?? `Días hábiles: ${days}`}
            {available != null ? ` · saldo disponible: ${available}` : ""}
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
            onClick={handleClose}
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
              Solicitar
            </Button>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};
