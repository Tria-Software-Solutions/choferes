import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ResponsiveTable from "../../../components/Table/ResponsiveTable/ResponsiveTable.component";
import { IconEye, IconInbox, IconPencil, IconPlus, IconReceipt, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Employee } from "../../../models/Employee";
import { Payment } from "../../../models/Payment";
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
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import GeneratePaymentDialog from "./GeneratePaymentDialog";
import PaymentBoletaDialog, { PAYMENT_STATUS } from "./PaymentBoletaDialog";
import { StatusBadge } from "../../../components/Layout";
import { formatBoletaPeriod, formatColones, getPeriodEndISO } from "../../../utils/boletaFormat";
import { submitButton } from "../../Forms/sharedStyles";
import SectionHeader from "./SectionHeader";
import { getBiweeklyPeriodLabel } from "../../../utils/paymentSlipPdf";
import {
  cardStackStyles,
  fillSectionPaperStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface PaymentsTabProps {
  employee: Employee;
  onEmployeeRefresh: () => Promise<void> | void;
}


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

  const allPayments = useSelector(selectPayments);
  const isLoading = useSelector(selectIsLoadingPayments);
  // El store puede traer filas de otros empleados (p. ej. el listado completo de
  // Planilla): se muestran solo las de este empleado desde el primer cuadro y se
  // espera la primera carga antes de decidir entre lista o estado vacío.
  const [loaded, setLoaded] = useState(false);
  const payments = useMemo(
    () => allPayments.filter((item) => item.employeeId === employee.id),
    [allPayments, employee.id],
  );
  const loadError = useSelector(selectPaymentsError);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [boletaPayment, setBoletaPayment] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const canCreate = userPermissions.includes(PERMISSION_CODES.CREATE_PAYMENT);
  const canEdit = userPermissions.includes(PERMISSION_CODES.EDIT_PAYMENT);
  const canDelete = userPermissions.includes(PERMISSION_CODES.DELETE_PAYMENT);

  useEffect(() => {
    setLoaded(false);
    void dispatch(fetchPayments({ employeeId: employee.id, limit: 10000 })).finally(() =>
      setLoaded(true),
    );
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
      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconReceipt size={20} stroke={1.5} />}
          title="Pagos quincenales"
          description="Cada quincena se genera sola a partir de las horas registradas; puedes editar cualquier monto antes de enviarla."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {payments.length} boleta{payments.length === 1 ? "" : "s"} ·{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {formatColones(totalPayable)}
                </Box>
              </Typography>
              {canCreate && (
                <Button
                  variant="text"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => setIsGenerateOpen(true)}
                  sx={submitButton}
                >
                  Generar pago
                </Button>
              )}
            </Box>
          }
        />

        {(isLoading || !loaded) && payments.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && payments.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : payments.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">No hay pagos registrados</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <ResponsiveTable size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Periodo</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Quincena</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Horas
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
                  const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending;
                  const isBusy = busyId === payment.id;
                  return (
                    <TableRow
                      key={payment.id}
                      hover
                      onClick={() => setBoletaPayment(payment)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={[tableCellStyles, { fontWeight: 600, whiteSpace: "nowrap" }]}>
                        {formatBoletaPeriod(getPeriodEndISO(payment.biweekNumber, payment.year))}
                      </TableCell>
                      <TableCell sx={[tableCellStyles, { color: "text.secondary", whiteSpace: "nowrap" }]}>
                        Q{payment.biweekNumber} · {getBiweeklyPeriodLabel(payment.biweekNumber, payment.year)}
                      </TableCell>
                      <TableCell sx={tableCellStyles} align="right">
                        {payment.hoursWorked != null ? `${payment.hoursWorked} h` : "—"}
                      </TableCell>
                      <TableCell sx={[tableCellStyles, { fontWeight: 700, whiteSpace: "nowrap" }]} align="right">
                        {formatColones(payment.totalPayable)}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          <StatusBadge label={status.label} tone={status.tone} size="small" />
                          {payment.isManual && (
                            <Tooltip title="Tiene montos editados a mano">
                              <Box component="span" sx={{ display: "inline-flex", color: "text.secondary" }}>
                                <IconPencil size={14} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
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
                            onClick={(event) => {
                              event.stopPropagation();
                              setBoletaPayment(payment);
                            }}
                            sx={neutralButtonStyles(theme)}
                          >
                            <IconEye size={16} />
                          </IconButton>
                          {canEdit && (
                            <IconButton
                              size="small"
                              title="Recalcular"
                              disabled={isBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleRecalculate(payment);
                              }}
                              sx={neutralButtonStyles(theme)}
                            >
                              <IconRefresh size={16} />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteTarget(payment);
                              }}
                              sx={deleteButtonStyles(theme)}
                            >
                              <IconTrash size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </ResponsiveTable>
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
