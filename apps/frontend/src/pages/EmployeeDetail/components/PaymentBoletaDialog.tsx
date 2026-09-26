import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { Download, Loader2, Mail } from "lucide-react";
import { Payment, PaymentStatus } from "../../../models/Payment";
import { AppDispatch } from "../../../store/store";
import { sendPaymentEmail } from "../../../store/slices/paymentSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PERMISSIONS from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  buildPaymentSlipBase64,
  downloadPaymentSlip,
  formatMoney,
  getBiweeklyPeriodLabel,
} from "../../../utils/paymentSlipPdf";

interface PaymentBoletaDialogProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const STATUS: Record<PaymentStatus, { label: string; color: "warning" | "success" | "default" }> = {
  pending: { label: "Pendiente", color: "warning" },
  sent: { label: "Enviada", color: "success" },
  cancelled: { label: "Cancelada", color: "default" },
};

const amountRows = (payment: Payment) => [
  { label: "Salario ordinario", value: formatMoney(payment.regularSalary, payment.currency) },
  { label: "Horas extra", value: formatMoney(payment.overtimePay, payment.currency) },
  { label: "Millaje", value: formatMoney(payment.mileage, payment.currency) },
  { label: "Otros ingresos", value: formatMoney(payment.others, payment.currency) },
  { label: "Cargas sociales", value: `− ${formatMoney(payment.socialCharges, payment.currency)}` },
  { label: "Deducciones", value: `− ${formatMoney(payment.deductions, payment.currency)}` },
];

// Shows the boleta breakdown and lets the user download it or email it to the
// employee (the PDF is generated client-side and attached server-side).
const PaymentBoletaDialog: React.FC<PaymentBoletaDialogProps> = ({ open, onClose, payment }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canSend = userPermissions.includes(PERMISSIONS.SEND_PAYMENT_EMAIL);

  const [current, setCurrent] = useState<Payment | null>(payment);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Keep a local copy so the "sent" status reflects immediately after sending.
  useEffect(() => {
    setCurrent(payment);
  }, [payment]);

  const employeeName = current?.employee
    ? `${current.employee.firstName} ${current.employee.lastName}`.trim()
    : undefined;
  const employeeEmail = current?.employee?.email ?? null;
  const status = current ? STATUS[current.status] ?? STATUS.pending : null;

  const handleDownload = async () => {
    if (!current) return;
    setIsDownloading(true);
    try {
      await downloadPaymentSlip(current);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "No se pudo generar el PDF",
        { severity: "error" },
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!current) return;
    if (!employeeEmail) {
      showNotification("El empleado no tiene correo registrado", { severity: "warning" });
      return;
    }
    setIsSending(true);
    try {
      const attachment = await buildPaymentSlipBase64(current);
      const updated = await dispatch(
        sendPaymentEmail({ id: current.id, ...attachment }),
      ).unwrap();
      setCurrent(updated);
      showNotification("Boleta enviada por correo", { severity: "success" });
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo enviar la boleta";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="Boleta de pago"
      subtitle={employeeName}
      hideActions
      paperSx={{ maxWidth: 560 }}
    >
      {!current ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={26} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Quincena {current.biweekNumber} · {current.year}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {getBiweeklyPeriodLabel(current.biweekNumber, current.year)}
              </Typography>
              {employeeEmail && (
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                  {employeeEmail}
                </Typography>
              )}
            </Box>
            {status && (
              <Chip
                size="small"
                label={status.label}
                color={status.color}
                variant={status.color === "default" ? "outlined" : "filled"}
              />
            )}
          </Box>

          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableBody>
                {amountRows(current).map((row) => (
                  <TableRow key={row.label}>
                    <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      {row.label}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontWeight: 600,
                      }}
                    >
                      {row.value}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 800, borderBottom: "none" }}>
                    Total a pagar
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, fontSize: "1rem", borderBottom: "none" }}
                  >
                    {formatMoney(current.totalPayable, current.currency)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {current.notes && (
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Notas
              </Typography>
              <Typography variant="body2">{current.notes}</Typography>
            </Box>
          )}

          {current.emailSentAt && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Enviada por correo el{" "}
              {new Date(current.emailSentAt).toLocaleString("es-CR")}
            </Typography>
          )}

          <Divider />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={isDownloading ? <Loader2 size={16} /> : <Download size={16} />}
              onClick={() => void handleDownload()}
              disabled={isDownloading || isSending}
            >
              Descargar PDF
            </Button>
            {canSend && (
              <Button
                variant="contained"
                startIcon={isSending ? <Loader2 size={16} /> : <Mail size={16} />}
                onClick={() => void handleSend()}
                disabled={isSending || isDownloading || !employeeEmail}
              >
                Enviar por correo
              </Button>
            )}
          </Box>
        </Box>
      )}
    </DialogComponent>
  );
};

export default PaymentBoletaDialog;
