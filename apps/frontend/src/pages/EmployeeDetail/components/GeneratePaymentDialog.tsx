import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconNotebook, IconReceipt } from "@tabler/icons-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import BoletaDocument from "../../../components/Boleta/BoletaDocument.component";
import { Employee } from "../../../models/Employee";
import { Payment, PaymentBreakdown } from "../../../models/Payment";
import { createPayment, getPaymentBreakdown } from "../../../services/paymentService";
import { getApiErrorMessage } from "../../../utils/apiError";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { formatMoney } from "../../../utils/paymentSlipPdf";
import { formatBoletaPeriod, getPeriodEndISO } from "../../../utils/boletaFormat";

interface GeneratePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onCreated: (payment: Payment) => void;
}

const today = new Date();
const currentYear = today.getFullYear();
const currentBiweek = today.getMonth() * 2 + (today.getDate() > 15 ? 2 : 1);
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

// Creates the slip of a specific quincena for one employee (the biweekly job
// already fills the current one automatically). Shows the computed
// "Comprobante de pago" before creating it; every amount stays editable later.
const GeneratePaymentDialog: React.FC<GeneratePaymentDialogProps> = ({
  open,
  onClose,
  employee,
  onCreated,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { showNotification } = useAppNotifications();

  const [year, setYear] = useState(currentYear);
  const [biweekNumber, setBiweekNumber] = useState(currentBiweek);
  const [notes, setNotes] = useState("");
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setIsLoadingBreakdown(true);
    getPaymentBreakdown(employee.id, biweekNumber, year)
      .then((data) => {
        if (!cancelled) setBreakdown(data);
      })
      .catch((error) => {
        if (cancelled) return;
        setBreakdown(null);
        showNotification(getApiErrorMessage(error, "No se pudo calcular la quincena"), {
          severity: "error",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBreakdown(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, year, biweekNumber, employee.id]);

  const handleSubmit = async () => {
    if (!breakdown) return;
    setIsSubmitting(true);
    try {
      const created = await createPayment({
        employeeId: employee.id,
        biweekNumber,
        year,
        notes: notes.trim() || null,
      });
      showNotification("Comprobante generado", { severity: "success" });
      onCreated(created);
      onClose();
    } catch (error) {
      showNotification(getApiErrorMessage(error, "No se pudo generar el comprobante"), {
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

  return (
    <DialogComponent
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Generar comprobante de pago"
      subtitle={employeeName}
      icon={<IconReceipt />}
      paperSx={{ maxWidth: 680, width: "100%" }}
      actions={
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button variant="text" onClick={onClose} disabled={isSubmitting} fullWidth={isSmallScreen}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={!breakdown || isLoadingBreakdown || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            fullWidth={isSmallScreen}
          >
            Generar
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5} sm={4}>
            <PlaceholderSelect
              label="Año"
              placeholder="Selecciona"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {yearOptions.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </PlaceholderSelect>
          </Grid>
          <Grid item xs={7} sm={8}>
            <PlaceholderSelect
              label="Quincena"
              placeholder="Selecciona"
              value={biweekNumber}
              formatValue={(value) => `Q${value} · ${formatBoletaPeriod(getPeriodEndISO(Number(value), year))}`}
              onChange={(event) => setBiweekNumber(Number(event.target.value))}
            >
              {Array.from({ length: 24 }, (_, index) => index + 1).map((value) => (
                <MenuItem key={value} value={value}>
                  Q{value} · {formatBoletaPeriod(getPeriodEndISO(value, year))}
                </MenuItem>
              ))}
            </PlaceholderSelect>
          </Grid>
        </Grid>

        {isLoadingBreakdown && !breakdown ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={26} />
          </Box>
        ) : breakdown ? (
          <>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {breakdown.hoursWorked} h registradas
              {breakdown.overtimeHours > 0 && ` (${breakdown.overtimeHours} h extra a ×${breakdown.overtimeMultiplier})`}
              {breakdown.hourlyRate != null && ` · ${formatMoney(breakdown.hourlyRate, "CRC")}/h`}
              {` · cargas sociales ${(breakdown.socialChargesRate * 100).toLocaleString("es-CR", { maximumFractionDigits: 2 })} %`}
            </Typography>
            {breakdown.hourlyRate == null && (
              <Alert severity="warning">
                El empleado no tiene tarifa por hora: el salario queda en ¢0,00 hasta que la registres
                en su expediente o lo edites a mano.
              </Alert>
            )}
            {breakdown.hoursWorked === 0 && (
              <Alert severity="info">No hay horas registradas en esta quincena.</Alert>
            )}
            <Box sx={{ opacity: isLoadingBreakdown ? 0.5 : 1, transition: "opacity 0.15s ease" }}>
              <BoletaDocument
                employeeName={employeeName}
                periodEnd={getPeriodEndISO(biweekNumber, year)}
                amounts={breakdown}
                total={breakdown.totalPayable}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Kilometraje, Otros y Rebajos empiezan en ¢0,00: edítalos en el comprobante después de
              generarlo.
            </Typography>
          </>
        ) : null}

        <TextfieldComponent
          name="notes"
          label="Notas internas (opcional)"
          icon={<IconNotebook size={20} color={theme.palette.text.secondary} />}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 2000 }}
          fullWidth
        />
      </Box>
    </DialogComponent>
  );
};

export default GeneratePaymentDialog;
