import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import ResponsiveTable from "../../../components/Table/ResponsiveTable/ResponsiveTable.component";
import { IconBan, IconCalendarWeek, IconCheck, IconInbox, IconListCheck, IconPencil, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Employee } from "../../../models/Employee";
import { Vacation, VacationStatus } from "../../../models/Vacation";
import { AppDispatch } from "../../../store/store";
import {
  deleteVacation,
  fetchVacations,
  selectIsLoadingVacations,
  selectVacations,
  selectVacationsError,
  updateVacation,
} from "../../../store/slices/vacationSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  editButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import VacationFormDialog from "./VacationFormDialog";
import { getVacationAccrual } from "../../../services/employeeService";
import { VacationAccrual } from "../../../models/VacationAccrual";
import { displayedVacationDays } from "../vacationBalance";
import { updateEmployee } from "../../../store/slices/employeeSlice";
import { submitButton } from "../../Forms/sharedStyles";
import SectionHeader from "./SectionHeader";
import {
  cardStackStyles,
  fillSectionPaperStyles,
  sectionPaperStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface VacationsTabProps {
  employee: Employee;
  onEmployeeRefresh: () => Promise<void> | void;
}

const STATUS: Record<VacationStatus, { label: string; color: "warning" | "success" | "error" }> = {
  pending: { label: "Pendiente", color: "warning" },
  approved: { label: "Aprobada", color: "success" },
  rejected: { label: "Rechazada", color: "error" },
};

// Formats a YYYY-MM-DD string as DD/MM/YYYY without timezone drift.
const formatDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

const errorMessage = (error: unknown, fallback: string): string =>
  typeof error === "string" && error.trim().length > 0
    ? error
    : error instanceof Error
      ? error.message
      : fallback;

const AccrualMetric: React.FC<{ label: string; value: string; highlight?: string }> = ({
  label,
  value,
  highlight,
}) => (
  <Box>
    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: highlight ?? "text.primary" }}>
      {value}
    </Typography>
  </Box>
);

// Vacation requests of a single employee. Approving deducts the balance and
// rejecting/deleting an approved request restores it, all handled server-side.
const VacationsTab: React.FC<VacationsTabProps> = ({ employee, onEmployeeRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const allVacations = useSelector(selectVacations);
  const isLoading = useSelector(selectIsLoadingVacations);
  // El store puede traer filas de otros empleados (p. ej. el listado completo de
  // Planilla): se muestran solo las de este empleado desde el primer cuadro y se
  // espera la primera carga antes de decidir entre lista o estado vacío.
  const [loaded, setLoaded] = useState(false);
  const vacations = useMemo(
    () => allVacations.filter((item) => item.employeeId === employee.id),
    [allVacations, employee.id],
  );
  const loadError = useSelector(selectVacationsError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [actionTarget, setActionTarget] = useState<Vacation | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacation | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [accrual, setAccrual] = useState<VacationAccrual | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const canCreate = userPermissions.includes(PERMISSION_CODES.CREATE_VACATION);
  const canEdit = userPermissions.includes(PERMISSION_CODES.EDIT_VACATION);
  const canDelete = userPermissions.includes(PERMISSION_CODES.DELETE_VACATION);

  useEffect(() => {
    setLoaded(false);
    void dispatch(fetchVacations({ employeeId: employee.id, limit: 10000 })).finally(() =>
      setLoaded(true),
    );
  }, [dispatch, employee.id]);

  const reload = async () => {
    await dispatch(fetchVacations({ employeeId: employee.id, limit: 10000 }));
  };

  // Acumulación de vacaciones según la ley de Costa Rica (art. 153).
  const loadAccrual = useCallback(async () => {
    try {
      setAccrual(await getVacationAccrual(employee.id));
    } catch {
      setAccrual(null);
    }
  }, [employee.id]);

  useEffect(() => {
    void loadAccrual();
  }, [loadAccrual]);

  const handleSyncBalance = async () => {
    if (!accrual) return;
    setIsSyncing(true);
    try {
      await dispatch(
        updateEmployee({
          id: employee.id,
          updatedEmployee: {
            vacationDays: Math.max(0, Math.round(accrual.availableDays)),
          },
        }),
      ).unwrap();
      await onEmployeeRefresh();
      await loadAccrual();
      showNotification("Saldo de vacaciones sincronizado", { severity: "success" });
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo sincronizar el saldo"), {
        severity: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const totalDays = useMemo(
    () => vacations.reduce((total, vacation) => total + Number(vacation.daysRequested || 0), 0),
    [vacations],
  );

  const handleOpenForm = (vacation: Vacation | null) => {
    setEditingVacation(vacation);
    setIsFormOpen(true);
  };

  const handleStatusChange = async () => {
    if (!actionTarget || !actionType) return;
    setBusyId(actionTarget.id);
    try {
      await dispatch(
        updateVacation({ id: actionTarget.id, input: { status: actionType } }),
      ).unwrap();
      showNotification(
        actionType === "approved" ? "Solicitud aprobada" : "Solicitud rechazada",
        { severity: "success" },
      );
      setActionTarget(null);
      setActionType(null);
      await onEmployeeRefresh();
      void loadAccrual();
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo actualizar la solicitud"), {
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
      await dispatch(deleteVacation(deleteTarget.id)).unwrap();
      showNotification("Solicitud eliminada", { severity: "success" });
      setDeleteTarget(null);
      await onEmployeeRefresh();
      void loadAccrual();
    } catch (error) {
      showNotification(errorMessage(error, "No se pudo eliminar la solicitud"), {
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  // Saldo guardado si existe; si no, el acumulado legal, para no mostrar
  // "sin asignar" cuando la ley ya reconoce días.
  const balanceDays = displayedVacationDays(employee.vacationDays, accrual);

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={sectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconCalendarWeek size={20} stroke={1.5} />}
          title="Acumulación de vacaciones"
          description="Cálculo legal de acumulación según semanas trabajadas."
          actions={
            canEdit && accrual ? (
              <Button
                variant="text"
                startIcon={<IconRefresh size={18} />}
                onClick={() => void handleSyncBalance()}
                disabled={isSyncing || accrual.availableDays <= 0}
                sx={submitButton}
              >
                {isSyncing ? "Sincronizando..." : "Sincronizar saldo"}
              </Button>
            ) : undefined
          }
        />

        {accrual ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
                mb: 1.5,
              }}
            >
              <AccrualMetric label="Acumulado" value={`${accrual.accruedDays} días`} />
              <AccrualMetric label="Gozados" value={`${accrual.takenDays} días`} />
              <AccrualMetric
                label="Disponible"
                value={`${accrual.availableDays} días`}
                highlight={theme.palette.primary.main}
              />
              <AccrualMetric label="Semanas trabajadas" value={`${accrual.weeksWorked}`} />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              2 semanas (10 días hábiles) por cada 50 semanas trabajadas (art. 153),
              prorrateado.{" "}
              {accrual.contractStartDate
                ? `Desde ${accrual.contractStartDate} hasta ${accrual.referenceDate}.`
                : "Registra la fecha de ingreso para calcular la acumulación."}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Cargando acumulación…
          </Typography>
        )}
      </Paper>

      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconListCheck size={20} stroke={1.5} />}
          title="Solicitudes"
          description="Solicitudes de vacaciones del empleado y su estado de aprobación."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
              >
                <IconCalendarWeek size={16} color={theme.palette.primary.main} />
                Saldo:{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {balanceDays != null ? `${balanceDays} días` : "sin asignar"}
                </Box>
              </Typography>
              {canCreate && (
                <Button
                  variant="text"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => handleOpenForm(null)}
                  sx={submitButton}
                >
                  Nueva solicitud
                </Button>
              )}
            </Box>
          }
        />

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
          {vacations.length} solicitude{vacations.length === 1 ? "" : "s"} · {totalDays} días
          solicitados en total
        </Typography>

        {(isLoading || !loaded) && vacations.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && vacations.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : vacations.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">No hay solicitudes de vacaciones</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <ResponsiveTable size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Periodo</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Días
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Estado</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Motivo</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vacations.map((vacation) => {
                  const status = STATUS[vacation.status] ?? STATUS.pending;
                  const isBusy = busyId === vacation.id;
                  const isPending = vacation.status === "pending";
                  return (
                    <TableRow
                      key={vacation.id}
                      hover
                    >
                      <TableCell sx={tableCellStyles}>
                        {formatDate(vacation.startDate)} – {formatDate(vacation.endDate)}
                      </TableCell>
                      <TableCell sx={[tableCellStyles, { fontWeight: 700 }]} align="right">
                        {vacation.daysRequested}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip size="small" label={status.label} color={status.color} />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        {vacation.reason || "—"}
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
                          {canEdit && isPending && (
                            <>
                              <IconButton
                                size="small"
                                title="Editar"
                                disabled={isBusy}
                                onClick={() => handleOpenForm(vacation)}
                                sx={editButtonStyles(theme)}
                              >
                                <IconPencil size={15} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Aprobar"
                                disabled={isBusy}
                                onClick={() => {
                                  setActionTarget(vacation);
                                  setActionType("approved");
                                }}
                                sx={neutralButtonStyles(theme)}
                              >
                                <IconCheck size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Rechazar"
                                disabled={isBusy}
                                onClick={() => {
                                  setActionTarget(vacation);
                                  setActionType("rejected");
                                }}
                                sx={neutralButtonStyles(theme)}
                              >
                                <IconBan size={15} />
                              </IconButton>
                            </>
                          )}
                          {canEdit && vacation.status === "approved" && (
                            <IconButton
                              size="small"
                              title="Rechazar"
                              disabled={isBusy}
                              onClick={() => {
                                setActionTarget(vacation);
                                setActionType("rejected");
                              }}
                              sx={neutralButtonStyles(theme)}
                            >
                              <IconBan size={15} />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(vacation)}
                              sx={deleteButtonStyles(theme)}
                            >
                              <IconTrash size={15} />
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

      <VacationFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={employee}
        vacation={editingVacation}
        onSaved={async () => {
          await reload();
          await onEmployeeRefresh();
        }}
      />

      <DialogComponent
        open={Boolean(actionTarget && actionType)}
        onClose={() => {
          setActionTarget(null);
          setActionType(null);
        }}
        onConfirm={() => void handleStatusChange()}
        title={actionType === "approved" ? "Aprobar vacaciones" : "Rechazar vacaciones"}
        message={
          actionTarget
            ? actionType === "approved"
              ? `Se descontarán ${actionTarget.daysRequested} días del saldo del empleado.`
              : "La solicitud quedará marcada como rechazada."
            : ""
        }
        type="warning"
        confirmText={actionType === "approved" ? "Aprobar" : "Rechazar"}
        loading={busyId === actionTarget?.id}
      />

      <DialogComponent
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar solicitud"
        message={
          deleteTarget
            ? `¿Eliminar la solicitud del ${formatDate(deleteTarget.startDate)} al ${formatDate(
                deleteTarget.endDate,
              )}?`
            : ""
        }
        type="delete"
        loading={busyId === deleteTarget?.id}
      />
    </Box>
  );
};

export default VacationsTab;
