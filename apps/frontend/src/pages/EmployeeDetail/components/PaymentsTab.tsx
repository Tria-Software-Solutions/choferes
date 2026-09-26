import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { Eye, Inbox, RefreshCcw, Trash2 } from "lucide-react";
import { Employee } from "../../../models/Employee";
import { Payment, PaymentStatus } from "../../../models/Payment";
import { AppDispatch } from "../../../store/store";
import {
  deletePayment,
  fetchPayments,
  recalculatePayment,
  selectIsLoadingPayments,
  selectPayments,
  selectPaymentsError,
} from "../../../store/slices/paymentSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PERMISSIONS from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import GeneratePaymentDialog from "./GeneratePaymentDialog";
import PaymentBoletaDialog from "./PaymentBoletaDialog";
import { formatMoney, getBiweeklyPeriodLabel } from "../../../utils/paymentSlipPdf";
import {
  cardStackStyles,
  sectionPaperStyles,
  sectionTitleStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface PaymentsTabProps {
  employee: Employee;
  onEmployeeRefresh: () => Promise<void> | void;
}

const STATUS: Record<PaymentStatus, { label: string; color: "warning" | "success" | "default" }> = {
  pending: { label: "Pendiente", color: "warning" },
  sent: { label: "Enviada", color: "success" },
  cancelled: { label: "Cancelada", color: "default" },
};

const errorMessage = (error: unknown, fallback: string): string =>
  typeof error === "string" && error.trim().length > 0
    ? error
    : error instanceof Error
      ? error.message
      : fallback;

// Biweekly payments (boletas) of a single employee. The breakdown is always
// computed server-side; this tab only triggers actions and renders the result.
const PaymentsTab: React.FC<PaymentsTabProps> = ({ employee, onEmployeeRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const payments = useSelector(selectPayments);
  const isLoading = useSelector(selectIsLoadingPayments);
  const loadError = useSelector(selectPaymentsError);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [boletaPayment, setBoletaPayment] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const canCreate = userPermissions.includes(PERMISSIONS.CREATE_PAYMENT);
  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_PAYMENT);
  const canDelete = userPermissions.includes(PERMISSIONS.DELETE_PAYMENT);

  useEffect(() => {
    void dispatch(fetchPayments({ employeeId: employee.id, limit: 10000 }));
  }, [dispatch, employee.id]);

  const reload = async () => {
    await dispatch(fetchPayments({ employeeId: employee.id, limit: 10000 }));
  };

  const totalPayable = useMemo(
    () => payments.reduce((total, payment) => total + Number(payment.totalPayable || 0), 0),
    [payments],
  );

  const handleRecalculate = async (payment: Payment) => {
    setBusyId(payment.id);
    try {
      await dispatch(recalculatePayment(payment.id)).unwrap();
      showNotification("Pago recalculado", { severity: "success" });
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo recalcular el pago"), {
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await dispatch(deletePayment(deleteTarget.id)).unwrap();
      showNotification("Pago eliminado", { severity: "success" });
      setDeleteTarget(null);
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo eliminar el pago"), {
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={sectionPaperStyles(theme)}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography sx={{ ...sectionTitleStyles, mb: 0 }}>Pagos quincenales</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {payments.length} boleta{payments.length === 1 ? "" : "s"} ·{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {formatMoney(totalPayable, "CRC")}
              </Box>
            </Typography>
            {canCreate && (
              <Button
                variant="text"
                onClick={() => setIsGenerateOpen(true)}
                sx={{
                  px: 0.5,
                  minHeight: 32,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "text.primary",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    textDecorationThickness: "1px",
                  },
                }}
              >
                Generar pago
              </Button>
            )}
          </Box>
        </Box>

        {isLoading && payments.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && payments.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : payments.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">No hay pagos registrados</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Quincena</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Periodo</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Salario
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Total
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Estado</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => {
                  const status = STATUS[payment.status] ?? STATUS.pending;
                  const isBusy = busyId === payment.id;
                  return (
                    <TableRow
                      key={payment.id}
                      sx={{
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.03)",
                        },
                      }}
                    >
                      <TableCell sx={tableCellStyles}>
                        Q{payment.biweekNumber} · {payment.year}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        {getBiweeklyPeriodLabel(payment.biweekNumber, payment.year)}
                      </TableCell>
                      <TableCell sx={tableCellStyles} align="right">
                        {formatMoney(payment.regularSalary, payment.currency)}
                      </TableCell>
                      <TableCell sx={{ ...tableCellStyles, fontWeight: 700 }} align="right">
                        {formatMoney(payment.totalPayable, payment.currency)}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          variant={status.color === "default" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles} align="right">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            title="Ver boleta"
                            onClick={() => setBoletaPayment(payment)}
                            sx={neutralButtonStyles(theme)}
                          >
                            <Eye size={16} />
                          </IconButton>
                          {canEdit && (
                            <IconButton
                              size="small"
                              title="Recalcular"
                              disabled={isBusy}
                              onClick={() => void handleRecalculate(payment)}
                              sx={neutralButtonStyles(theme)}
                            >
                              <RefreshCcw size={16} />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(payment)}
                              sx={deleteButtonStyles(theme)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <GeneratePaymentDialog
        open={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        employee={employee}
        onCreated={async () => {
          await reload();
          await onEmployeeRefresh();
        }}
      />

      <PaymentBoletaDialog
        open={Boolean(boletaPayment)}
        onClose={() => setBoletaPayment(null)}
        payment={boletaPayment}
      />

      <DialogComponent
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar pago"
        message={
          deleteTarget
            ? `¿Eliminar la boleta de la quincena ${deleteTarget.biweekNumber} de ${deleteTarget.year}?`
            : ""
        }
        type="delete"
        loading={busyId === deleteTarget?.id}
      />
    </Box>
  );
};

export default PaymentsTab;
