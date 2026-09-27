import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  IconArrowBackUp,
  IconDownload,
  IconMail,
  IconPencil,
  IconReceipt,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Payment,
  PaymentAmountField,
  PaymentAmounts,
  PaymentStatus,
  PAYMENT_CONCEPTS,
} from "../../../models/Payment";
import { AppDispatch } from "../../../store/store";
import {
  recalculatePayment,
  sendPaymentEmail,
  updatePayment,
} from "../../../store/slices/paymentSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PERMISSIONS from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import BoletaDocument from "../../../components/Boleta/BoletaDocument.component";
import { StatusBadge } from "../../../components/Layout";
import type { StatTone } from "../../../components/Layout/StatCard.component";
import {
  buildPaymentSlipBase64,
  downloadPaymentSlip,
  formatMoney,
  getBiweeklyPeriodLabel,
} from "../../../utils/paymentSlipPdf";
import { getPeriodEndISO } from "../../../utils/boletaFormat";

interface PaymentBoletaDialogProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: StatTone }> = {
  pending: { label: "Pendiente", tone: "warning" },
  sent: { label: "Enviada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "default" },
};

const FIELD_LABEL = Object.fromEntries(
  PAYMENT_CONCEPTS.map(({ field, label }) => [field, label]),
) as Record<PaymentAmountField, string>;

const round2 = (value: number) => Math.round(value * 100) / 100;

const amountsOf = (payment: Payment): PaymentAmounts => ({
  regularSalary: Number(payment.regularSalary) || 0,
  overtimePay: Number(payment.overtimePay) || 0,
  mileage: Number(payment.mileage) || 0,
  others: Number(payment.others) || 0,
  socialCharges: Number(payment.socialCharges) || 0,
  deductions: Number(payment.deductions) || 0,
});

const totalOf = (amounts: PaymentAmounts) =>
  round2(
    amounts.regularSalary +
      amounts.overtimePay +
      amounts.mileage +
      amounts.others -
      amounts.socialCharges -
      amounts.deductions,
  );

const parseAmount = (raw: string): number | null => {
  const normalized = raw.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (normalized === "") return 0;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

/**
 * Automatic value of each concept, mirroring the server rules with the data
 * stored on the slip (hours, overtime, rate): lets the editor preview the
 * total live. The server recomputes everything on save.
 */
const resolvePreview = (
  payment: Payment,
  manual: Set<PaymentAmountField>,
  draft: Record<PaymentAmountField, string>,
): PaymentAmounts => {
  const stored = amountsOf(payment);
  const rate = payment.hourlyRate ?? payment.employee?.hourlyRate ?? null;
  const hours = payment.hoursWorked ?? null;
  const overtimeHours = payment.overtimeHours ?? 0;
  const pick = (field: PaymentAmountField, automatic: number | null) =>
    manual.has(field) ? parseAmount(draft[field]) ?? 0 : automatic ?? stored[field];

  const regularSalary = pick(
    "regularSalary",
    rate !== null && hours !== null ? round2((hours - overtimeHours) * rate) : null,
  );
  const overtimePay = pick(
    "overtimePay",
    rate !== null ? round2(overtimeHours * rate * (payment.overtimeMultiplier ?? 1.5)) : null,
  );
  return {
    regularSalary,
    overtimePay,
    mileage: pick("mileage", 0),
    others: pick("others", 0),
    socialCharges: pick(
      "socialCharges",
      payment.socialChargesRate !== undefined
        ? round2((regularSalary + overtimePay) * payment.socialChargesRate)
        : null,
    ),
    deductions: pick("deductions", 0),
  };
};

const errorMessage = (error: unknown, fallback: string) =>
  typeof error === "string" ? error : error instanceof Error ? error.message : fallback;

// The pay slip: an exact on-screen replica of the "Comprobante de pago" that
// can be edited cell by cell (automatic values stay automatic until typed
// over), downloaded as PDF or emailed to the employee.
const PaymentBoletaDialog: React.FC<PaymentBoletaDialogProps> = ({ open, onClose, payment }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canSend = userPermissions.includes(PERMISSIONS.SEND_PAYMENT_EMAIL);
  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_PAYMENT);

  const [current, setCurrent] = useState<Payment | null>(payment);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<PaymentAmountField, string>>(
    {} as Record<PaymentAmountField, string>,
  );
  const [manual, setManual] = useState<Set<PaymentAmountField>>(new Set());
  const [notesDraft, setNotesDraft] = useState("");
  const [busy, setBusy] = useState<"save" | "send" | "download" | "recalc" | null>(null);

  useEffect(() => {
    setCurrent(payment);
    setEditing(false);
  }, [payment]);

  const merge = (updated: Payment) =>
    setCurrent((prev) => ({ ...updated, employee: updated.employee ?? prev?.employee }));

  const employeeName = current?.employee
    ? `${current.employee.firstName} ${current.employee.lastName}`.trim()
    : current
      ? `Empleado #${current.employeeId}`
      : "";
  const employeeEmail = current?.employee?.email ?? null;
  const status = current ? PAYMENT_STATUS[current.status] ?? PAYMENT_STATUS.pending : null;

  const previewAmounts = useMemo(
    () => (current ? (editing ? resolvePreview(current, manual, draft) : amountsOf(current)) : null),
    [current, editing, manual, draft],
  );
  const previewTotal = previewAmounts ? totalOf(previewAmounts) : 0;
  const invalidField = editing
    ? PAYMENT_CONCEPTS.find(({ field }) => manual.has(field) && parseAmount(draft[field]) === null)
    : undefined;

  const startEditing = () => {
    if (!current) return;
    const amounts = amountsOf(current);
    setDraft(
      Object.fromEntries(
        PAYMENT_CONCEPTS.map(({ field }) => [field, amounts[field].toFixed(2)]),
      ) as Record<PaymentAmountField, string>,
    );
    setManual(new Set(current.manualFields ?? []));
    setNotesDraft(current.notes ?? "");
    setEditing(true);
  };

  const setFieldValue = (field: PaymentAmountField, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setManual((prev) => new Set(prev).add(field));
  };

  const resetField = (field: PaymentAmountField) => {
    setManual((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const handleSave = async () => {
    if (!current || invalidField) return;
    const stored = new Set(current.manualFields ?? []);
    const input: Record<string, unknown> = {};
    manual.forEach((field) => {
      input[field] = parseAmount(draft[field]) ?? 0;
    });
    const automaticFields = Array.from(stored).filter((field) => !manual.has(field));
    if (automaticFields.length > 0) input.automaticFields = automaticFields;
    if ((current.notes ?? "") !== notesDraft) input.notes = notesDraft.trim() || null;

    setBusy("save");
    try {
      const updated = await dispatch(updatePayment({ id: current.id, input })).unwrap();
      merge(updated);
      setEditing(false);
      showNotification("Boleta actualizada", { severity: "success" });
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo guardar la boleta"), { severity: "error" });
    } finally {
      setBusy(null);
    }
  };

  const handleRecalculate = async () => {
    if (!current) return;
    setBusy("recalc");
    try {
      const updated = await dispatch(recalculatePayment(current.id)).unwrap();
      merge(updated);
      showNotification("Montos automáticos actualizados con las horas registradas", {
        severity: "success",
      });
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo recalcular"), { severity: "error" });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    if (!current) return;
    setBusy("download");
    try {
      await downloadPaymentSlip(current);
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo generar el PDF"), { severity: "error" });
    } finally {
      setBusy(null);
    }
  };

  const handleSend = async () => {
    if (!current) return;
    if (!employeeEmail) {
      showNotification("El empleado no tiene correo registrado", { severity: "warning" });
      return;
    }
    setBusy("send");
    try {
      const attachment = await buildPaymentSlipBase64(current);
      const updated = await dispatch(sendPaymentEmail({ id: current.id, ...attachment })).unwrap();
      merge(updated);
      showNotification(`Comprobante enviado a ${employeeEmail}`, { severity: "success" });
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo enviar la boleta"), { severity: "error" });
    } finally {
      setBusy(null);
    }
  };

  // Editable value cell inside the paper (fixed paper colors on purpose).
  const renderAmountEditor = (field: PaymentAmountField) => {
    const isManual = manual.has(field);
    const value = isManual ? draft[field] : (previewAmounts?.[field] ?? 0).toFixed(2);
    const invalid = isManual && parseAmount(draft[field]) === null;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            px: 0.75,
            height: 28,
            borderRadius: "5px",
            border: `1px solid ${invalid ? "#dc2626" : isManual ? "#a5b4fc" : "#e4e4e7"}`,
            backgroundColor: isManual ? "#eef2ff" : "#fafafa",
            "&:focus-within": { borderColor: "#4f46e5", boxShadow: "0 0 0 3px rgba(79,70,229,0.15)" },
          }}
        >
          <Box component="span" sx={{ color: "#71717a" }}>
            ¢
          </Box>
          <Box
            component="input"
            inputMode="decimal"
            aria-label={FIELD_LABEL[field]}
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue(field, event.target.value)
            }
            sx={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 0,
              background: "transparent",
              font: "inherit",
              color: isManual ? "#242424" : "#52525b",
              p: 0,
            }}
          />
        </Box>
        {isManual ? (
          <Tooltip title="Volver al valor automático">
            <IconButton
              size="small"
              onClick={() => resetField(field)}
              aria-label={`${FIELD_LABEL[field]}: volver a automático`}
              sx={{ color: "#4f46e5", width: 28, height: 28 }}
            >
              <IconArrowBackUp size={16} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Calculado automáticamente">
            <Box
              component="span"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                alignItems: "center",
                gap: 0.25,
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#71717a",
                width: 50,
              }}
            >
              <IconSparkles size={12} /> Auto
            </Box>
          </Tooltip>
        )}
      </Box>
    );
  };

  const manualList = (current?.manualFields ?? []).map((field) => FIELD_LABEL[field]).filter(Boolean);
  const rate = current?.hourlyRate ?? current?.employee?.hourlyRate ?? null;

  const actions = current && (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column-reverse", sm: "row" },
        flexWrap: { sm: "wrap" },
        alignItems: { sm: "center" },
        justifyContent: "flex-end",
        gap: 1,
        width: "100%",
        "& .MuiButton-root": { whiteSpace: "nowrap" },
      }}
    >
      {editing ? (
        <>
          <Box sx={{ flex: 1 }} />
          <Button variant="text" onClick={() => setEditing(false)} disabled={busy === "save"}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={busy === "save" || Boolean(invalidField)}
            startIcon={busy === "save" ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Guardar cambios
          </Button>
        </>
      ) : (
        <>
          {canEdit && current.status !== "cancelled" ? (
            <Tooltip title="Actualiza los montos automáticos con las horas registradas; lo editado a mano se conserva">
              <span>
                <Button
                  variant="text"
                  startIcon={
                    busy === "recalc" ? <CircularProgress size={14} color="inherit" /> : <IconRefresh size={16} />
                  }
                  onClick={() => void handleRecalculate()}
                  disabled={busy !== null}
                  fullWidth={isSmallScreen}
                >
                  Recalcular
                </Button>
              </span>
            </Tooltip>
          ) : null}
          <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />
          <Button
            variant="outlined"
            startIcon={
              busy === "download" ? <CircularProgress size={14} color="inherit" /> : <IconDownload size={16} />
            }
            onClick={() => void handleDownload()}
            disabled={busy !== null}
          >
            Descargar PDF
          </Button>
          {canEdit && current.status !== "cancelled" && (
            <Button
              variant="outlined"
              startIcon={<IconPencil size={16} />}
              onClick={startEditing}
              disabled={busy !== null}
            >
              Editar
            </Button>
          )}
          {canSend && current.status !== "cancelled" && (
            <Button
              variant="contained"
              startIcon={busy === "send" ? <CircularProgress size={14} color="inherit" /> : <IconMail size={16} />}
              onClick={() => void handleSend()}
              disabled={busy !== null || !employeeEmail}
            >
              {current.status === "sent" ? "Reenviar" : "Enviar por correo"}
            </Button>
          )}
        </>
      )}
    </Box>
  );

  return (
    <DialogComponent
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={editing ? "Editar comprobante" : "Comprobante de pago"}
      subtitle={current ? `${employeeName} · Quincena ${current.biweekNumber} de ${current.year}` : undefined}
      icon={<IconReceipt />}
      paperSx={{ maxWidth: 720, width: "100%" }}
      actions={actions}
    >
      {!current || !previewAmounts ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={26} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          {/* Slip facts: status, origin, the hours the amounts come from */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              p: 1.25,
              borderRadius: "10px",
              border: borders.hairline,
              backgroundColor: colors.surfaceSunken,
            }}
          >
            {status && <StatusBadge label={status.label} tone={status.tone} size="small" />}
            {current.autoGenerated && (
              <StatusBadge label="Generada automáticamente" tone="accent" size="small" icon={<IconSparkles size={12} />} />
            )}
            {manualList.length > 0 && (
              <StatusBadge label={`Editado a mano: ${manualList.join(", ")}`} tone="info" size="small" />
            )}
            <Typography variant="caption" sx={{ color: colors.textMuted, ml: { sm: "auto" } }}>
              {getBiweeklyPeriodLabel(current.biweekNumber, current.year)}
              {current.hoursWorked != null && ` · ${current.hoursWorked} h`}
              {current.overtimeHours ? ` (${current.overtimeHours} h extra)` : ""}
              {rate != null && ` · ${formatMoney(rate, "CRC")}/h`}
            </Typography>
          </Box>

          {editing && (
            <Typography variant="body2" sx={{ color: colors.textMuted }}>
              Escribe sobre cualquier monto para fijarlo a mano; los demás siguen calculándose
              solos con las horas registradas. Usa{" "}
              <Box component="span" sx={{ display: "inline-flex", verticalAlign: "middle" }}>
                <IconArrowBackUp size={14} />
              </Box>{" "}
              para devolver un monto a automático.
            </Typography>
          )}

          <BoletaDocument
            employeeName={employeeName}
            periodEnd={getPeriodEndISO(current.biweekNumber, current.year)}
            amounts={previewAmounts}
            total={previewTotal}
            renderAmount={editing ? renderAmountEditor : undefined}
          />

          {invalidField && (
            <Typography variant="caption" sx={{ color: "error.main" }}>
              {invalidField.label}: ingresa un monto válido (número mayor o igual a 0).
            </Typography>
          )}

          {editing ? (
            <TextField
              label="Notas internas (no se imprimen)"
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              multiline
              minRows={2}
              inputProps={{ maxLength: 2000 }}
              fullWidth
            />
          ) : (
            current.notes && (
              <Box>
                <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600 }}>
                  Notas internas
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {current.notes}
                </Typography>
              </Box>
            )
          )}

          {!editing && (
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              {employeeEmail
                ? current.emailSentAt
                  ? `Enviada a ${employeeEmail} el ${new Date(current.emailSentAt).toLocaleString("es-CR")}.`
                  : `Se enviará a ${employeeEmail} con el PDF adjunto.`
                : "El empleado no tiene correo registrado: agrégalo en su expediente para poder enviarla."}
              {current.status === "pending" && current.emailSentAt && " Tiene cambios sin reenviar."}
            </Typography>
          )}
        </Box>
      )}
    </DialogComponent>
  );
};

export default PaymentBoletaDialog;
