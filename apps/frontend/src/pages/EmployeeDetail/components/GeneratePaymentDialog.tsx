import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Calculator, Loader2 } from "lucide-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { Employee } from "../../../models/Employee";
import { Payment, PaymentBreakdown } from "../../../models/Payment";
import {
  createPayment,
  getPaymentBreakdown,
} from "../../../services/paymentService";
import { getApiErrorMessage } from "../../../utils/apiError";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { getBiweeklyPeriodLabel, formatMoney } from "../../../utils/paymentSlipPdf";

interface GeneratePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onCreated: (payment: Payment) => void;
}

const AMOUNT_FIELDS = [
  { key: "overtimePay", label: "Horas extra" },
  { key: "mileage", label: "Millaje" },
  { key: "others", label: "Otros ingresos" },
  { key: "socialCharges", label: "Cargas sociales" },
  { key: "deductions", label: "Deducciones" },
] as const;

type AmountKey = (typeof AMOUNT_FIELDS)[number]["key"];

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

// Creates a biweekly payment: pick the period, the server previews the
// breakdown (hours × hourlyRate) and the optional amounts can be entered.
const GeneratePaymentDialog: React.FC<GeneratePaymentDialogProps> = ({
  open,
  onClose,
  employee,
  onCreated,
}) => {
  const theme = useTheme();
  const { showNotification } = useAppNotifications();

  const [year, setYear] = useState(currentYear);
  const [biweekNumber, setBiweekNumber] = useState(1);
  const [payDate, setPayDate] = useState("");
  const [notes, setNotes] = useState("");
  const [amounts, setAmounts] = useState<Record<AmountKey, string>>({
    overtimePay: "0",
    mileage: "0",
    others: "0",
    socialCharges: "0",
    deductions: "0",
  });
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBreakdown = async (targetYear: number, targetBiweek: number) => {
    setIsLoadingBreakdown(true);
    try {
      const data = await getPaymentBreakdown(employee.id, targetBiweek, targetYear);
      setBreakdown(data);
    } catch (error) {
      setBreakdown(null);
      showNotification(getApiErrorMessage(error, "No se pudo calcular la quincena"), {
        severity: "error",
      });
    } finally {
      setIsLoadingBreakdown(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadBreakdown(year, biweekNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, year, biweekNumber, employee.id]);

  const amountError = useMemo(() => {
    for (const field of AMOUNT_FIELDS) {
      const raw = amounts[field.key];
      if (raw.trim() === "") return `${field.label}: ingresa un monto (o 0)`;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        return `${field.label}: debe ser un número mayor o igual a 0`;
      }
    }
    return null;
  }, [amounts]);

  const canSubmit = Boolean(breakdown) && !isLoadingBreakdown && !amountError;

  const handleSubmit = async () => {
    if (!breakdown || amountError) return;
    setIsSubmitting(true);
    try {
      const created = await createPayment({
        employeeId: employee.id,
        biweekNumber,
        year,
        payDate: payDate || null,
        notes: notes.trim() || null,
        overtimePay: Number(amounts.overtimePay),
        mileage: Number(amounts.mileage),
        others: Number(amounts.others),
        socialCharges: Number(amounts.socialCharges),
        deductions: Number(amounts.deductions),
      });
      showNotification("Pago generado", { severity: "success" });
      onCreated(created);
      onClose();
    } catch (error) {
      showNotification(getApiErrorMessage(error, "No se pudo generar el pago"), {
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewTotal = breakdown
    ? breakdown.regularSalary +
      Number(amounts.overtimePay || 0) +
      Number(amounts.mileage || 0) +
      Number(amounts.others || 0) -
      Number(amounts.socialCharges || 0) -
      Number(amounts.deductions || 0)
    : 0;

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="Generar pago quincenal"
      subtitle={`${employee.firstName} ${employee.lastName}`}
      hideActions
      paperSx={{ maxWidth: 560 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="gen-year-label">Año</InputLabel>
            <Select
              labelId="gen-year-label"
              label="Año"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {yearOptions.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="gen-biweek-label">Quincena</InputLabel>
            <Select
              labelId="gen-biweek-label"
              label="Quincena"
              value={biweekNumber}
              onChange={(event) => setBiweekNumber(Number(event.target.value))}
            >
              {Array.from({ length: 24 }, (_, index) => index + 1).map((value) => (
                <MenuItem key={value} value={value}>
                  Quincena {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {getBiweeklyPeriodLabel(biweekNumber, year)}
          </Typography>
          {isLoadingBreakdown ? (
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Loader2 size={14} /> Calculando...
            </Typography>
          ) : breakdown ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                {breakdown.hoursWorked.toFixed(2)} h ×{" "}
                {breakdown.hourlyRate != null
                  ? formatMoney(breakdown.hourlyRate, "CRC")
                  : "sin tarifa"}{" "}
                = {formatMoney(breakdown.regularSalary, "CRC")}
              </Typography>
              {breakdown.hourlyRate == null && (
                <Typography variant="caption" sx={{ color: "warning.main" }}>
                  El empleado no tiene tarifa por hora registrada: el salario será 0.
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ color: "error.main", mt: 0.5 }}>
              No se pudo calcular el periodo
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {AMOUNT_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              type="number"
              size="small"
              value={amounts[field.key]}
              onChange={(event) =>
                setAmounts((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
            />
          ))}
          <TextField
            label="Fecha de pago"
            type="date"
            size="small"
            value={payDate}
            onChange={(event) => setPayDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <TextField
          label="Notas"
          size="small"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 2000 }}
          fullWidth
        />

        <Divider />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total estimado
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
            {formatMoney(previewTotal, "CRC")}
          </Typography>
        </Box>

        {amountError && (
          <Typography variant="caption" sx={{ color: "error.main" }}>
            {amountError}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSubmitting ? <Loader2 size={16} /> : <Calculator size={16} />
            }
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            Generar
          </Button>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default GeneratePaymentDialog;
