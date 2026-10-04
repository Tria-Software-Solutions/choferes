import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
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
import { IconAlertTriangle, IconCheck, IconClock, IconId, IconInbox, IconPencil, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { Employee } from "../../../models/Employee";
import { EmployeeLicense } from "../../../models/EmployeeLicense";
import { LicenseRequest } from "../../../models/LicenseRequest";
import { AppDispatch } from "../../../store/store";
import {
  deleteLicense,
  fetchLicenses,
  selectIsLoadingLicenses,
  selectLicenses,
  selectLicensesError,
} from "../../../store/slices/licenseSlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import {
  deleteButtonStyles,
  editButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import LicenseFormDialog from "./LicenseFormDialog";
import SectionHeader from "./SectionHeader";
import { submitButton } from "../../Forms/sharedStyles";
import {
  getLicenseRequests,
  approveLicenseRequest,
  rejectLicenseRequest,
} from "../../../services/licenseRequestService";
import { getMyLicenseRequests } from "../../../services/meService";
import {
  cardStackStyles,
  fillSectionPaperStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface LicensesTabProps {
  employee: Employee;
}

const STATUS: Record<
  string,
  { label: string; color: "success" | "warning" | "error" | "default" }
> = {
  vigente: { label: "Vigente", color: "success" },
  por_vencer: { label: "Por vencer", color: "warning" },
  vencida: { label: "Vencida", color: "error" },
  sin_vencimiento: { label: "Sin vencimiento", color: "default" },
};

// Formats a YYYY-MM-DD string as DD/MM/YYYY without timezone drift.
const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

const describeRequest = (request: LicenseRequest): string => {
  const type = request.payload?.licenseType ?? request.license?.licenseType ?? "";
  if (request.action === "create") return `Nueva licencia ${type}`.trim();
  if (request.action === "update") return `Cambio de la licencia ${type}`.trim();
  return `Eliminar la licencia ${type}`.trim();
};

// Driver's licenses of a single employee, with expiry alerts (Costa Rica).
// Aquí también se revisan las solicitudes que el empleado envía desde su panel:
// aprobar aplica el cambio, rechazar solo la cierra.
const LicensesTab: React.FC<LicensesTabProps> = ({ employee }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const allLicenses = useSelector(selectLicenses);
  const isLoading = useSelector(selectIsLoadingLicenses);
  // El store puede traer filas de otros empleados (p. ej. el listado completo de
  // Planilla): se muestran solo las de este empleado desde el primer cuadro y se
  // espera la primera carga antes de decidir entre lista o estado vacío.
  const [loaded, setLoaded] = useState(false);
  const licenses = useMemo(
    () => allLicenses.filter((item) => item.employeeId === employee.id),
    [allLicenses, employee.id],
  );
  const loadError = useSelector(selectLicensesError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<EmployeeLicense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeLicense | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [reviewBusyId, setReviewBusyId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LicenseRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const canCreate = userPermissions.includes(PERMISSION_CODES.CREATE_LICENSE);
  const canEdit = userPermissions.includes(PERMISSION_CODES.EDIT_LICENSE);
  const canDelete = userPermissions.includes(PERMISSION_CODES.DELETE_LICENSE);
  // Autoservicio: el empleado pide el cambio desde su panel (su permiso es
  // `my-panel:view`) y lo resuelve quien administra licencias.
  const canRequest = userPermissions.includes(PERMISSION_CODES.VIEW_MY_PANEL);
  const canReview = canEdit;
  // Quien administra licencias escribe directo; los demás piden el cambio.
  const isDirect = canCreate || canEdit || canDelete;

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests],
  );
  const pendingByLicense = useMemo(() => {
    const map = new Map<number, LicenseRequest>();
    pendingRequests
      .filter((request) => request.licenseId != null)
      .forEach((request) => map.set(request.licenseId as number, request));
    return map;
  }, [pendingRequests]);

  useEffect(() => {
    setLoaded(false);
    void dispatch(fetchLicenses({ employeeId: employee.id, limit: 10000 })).finally(() =>
      setLoaded(true),
    );
  }, [dispatch, employee.id]);

  const loadRequests = useCallback(async () => {
    if (!canReview && !canRequest) {
      setRequests([]);
      return;
    }
    try {
      setRequests(
        canReview ? await getLicenseRequests({ employeeId: employee.id }) : await getMyLicenseRequests(),
      );
    } catch {
      setRequests([]);
    }
  }, [canReview, canRequest, employee.id]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const reload = async () => {
    await Promise.all([
      dispatch(fetchLicenses({ employeeId: employee.id, limit: 10000 })),
      loadRequests(),
    ]);
  };

  const alerts = useMemo(
    () => licenses.filter((license) => license.status === "vencida" || license.status === "por_vencer"),
    [licenses],
  );

  const handleOpenForm = (license: EmployeeLicense | null) => {
    setEditingLicense(license);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await dispatch(deleteLicense(deleteTarget.id)).unwrap();
      showNotification("Licencia eliminada", { severity: "success" });
      setDeleteTarget(null);
    } catch (error) {
      const message =
        typeof error === "string" ? error : "No se pudo eliminar la licencia";
      showNotification(message, { severity: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (id: number) => {
    setReviewBusyId(id);
    try {
      await approveLicenseRequest(id);
      showNotification("Solicitud aprobada y licencia actualizada", { severity: "success" });
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo aprobar la solicitud";
      showNotification(message, { severity: "error" });
    } finally {
      setReviewBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    setReviewBusyId(id);
    try {
      await rejectLicenseRequest(id, rejectNotes.trim() || null);
      showNotification("Solicitud rechazada", { severity: "success" });
      setRejectTarget(null);
      setRejectNotes("");
      await loadRequests();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo rechazar la solicitud";
      showNotification(message, { severity: "error" });
    } finally {
      setReviewBusyId(null);
    }
  };

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconId size={20} stroke={1.5} />}
          title="Licencias de conducir"
          description="Licencias del empleado y su fecha de vencimiento."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
              >
                <IconId size={16} color={theme.palette.primary.main} />
                {licenses.length} licencia{licenses.length === 1 ? "" : "s"}
              </Typography>
              {(canCreate || (!isDirect && canRequest)) && (
                <Button
                  variant="text"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => handleOpenForm(null)}
                  sx={submitButton}
                >
                  {isDirect ? "Nueva licencia" : "Solicitar licencia"}
                </Button>
              )}
            </Box>
          }
        />

        {/* Solicitudes del propio empleado: se revisan desde aquí. */}
        {pendingRequests.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
            {pendingRequests.map((request) => {
              const isBusy = reviewBusyId === request.id;
              return (
                <Box
                  key={request.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: "12px",
                    border: `1px solid ${theme.tokens.colors.warning}55`,
                    backgroundColor: theme.tokens.colors.warningSoft,
                  }}
                >
                  <IconClock size={18} style={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                      {describeRequest(request)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      En revisión desde el {formatDate(request.createdAt?.slice(0, 10))}
                    </Typography>
                  </Box>
                  {canReview ? (
                    <>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<IconCheck size={16} />}
                        onClick={() => void handleApprove(request.id)}
                        disabled={isBusy}
                        sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={<IconX size={16} />}
                        onClick={() => {
                          setRejectNotes("");
                          setRejectTarget(request);
                        }}
                        disabled={isBusy}
                        sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Chip size="small" color="warning" label="En revisión" />
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {alerts.length > 0 && (
          <Alert
            severity={alerts.some((license) => license.status === "vencida") ? "error" : "warning"}
            icon={<IconAlertTriangle size={18} />}
            sx={{ mb: 1.5, borderRadius: "10px" }}
          >
            {alerts.length} licencia{alerts.length === 1 ? "" : "s"} vencida
            {alerts.length === 1 ? "" : "s"} o por vencer en los próximos 30 días.
          </Alert>
        )}

        {(isLoading || !loaded) && licenses.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && licenses.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : licenses.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">No hay licencias registradas</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <ResponsiveTable size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Tipo</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Número</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Expedición</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Vencimiento</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Estado</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {licenses.map((license) => {
                  const status = STATUS[license.status ?? "sin_vencimiento"];
                  const isBusy = busyId === license.id;
                  const pending = pendingByLicense.get(license.id);
                  return (
                    <TableRow
                      key={license.id}
                      hover
                    >
                      <TableCell sx={[tableCellStyles, { fontWeight: 700 }]}>
                        {license.licenseType}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        {license.licenseNumber || "—"}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>{formatDate(license.issuedAt)}</TableCell>
                      <TableCell sx={tableCellStyles}>
                        {formatDate(license.expiresAt)}
                        {license.daysUntilExpiry != null && license.daysUntilExpiry >= 0 && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ color: "text.secondary", ml: 0.75 }}
                          >
                            ({license.daysUntilExpiry} d)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          <Chip
                            size="small"
                            label={status.label}
                            color={status.color}
                            variant={status.color === "default" ? "outlined" : "filled"}
                          />
                          {pending && (
                            <Chip
                              size="small"
                              color="warning"
                              variant="outlined"
                              label={pending.action === "delete" ? "Baja en revisión" : "Cambio en revisión"}
                            />
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
                          {canEdit ? (
                            <IconButton
                              size="small"
                              title="Editar"
                              disabled={isBusy}
                              onClick={() => handleOpenForm(license)}
                              sx={editButtonStyles(theme)}
                            >
                              <IconPencil size={15} />
                            </IconButton>
                          ) : canRequest ? (
                            <IconButton
                              size="small"
                              title="Solicitar cambio"
                              disabled={isBusy}
                              onClick={() => handleOpenForm(license)}
                              sx={editButtonStyles(theme)}
                            >
                              <IconPencil size={15} />
                            </IconButton>
                          ) : null}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(license)}
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

      <LicenseFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={employee}
        license={editingLicense}
        mode={isDirect ? "direct" : "request"}
        onSaved={() => void reload()}
      />

      <DialogComponent
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar licencia"
        message={
          deleteTarget
            ? `¿Eliminar la licencia ${deleteTarget.licenseType}${
                deleteTarget.licenseNumber ? ` (${deleteTarget.licenseNumber})` : ""
              }?`
            : ""
        }
        type="delete"
        loading={busyId === deleteTarget?.id}
      />

      <DialogComponent
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => void handleReject()}
        title="Rechazar solicitud"
        message={rejectTarget ? describeRequest(rejectTarget) : ""}
        type="warning"
        confirmText="Rechazar"
        loading={rejectTarget ? reviewBusyId === rejectTarget.id : false}
      >
        <TextfieldComponent
          name="reviewNotes"
          label="Motivo (opcional)"
          placeholder="¿Por qué no se aplica el cambio?"
          value={rejectNotes}
          onChange={(event) => setRejectNotes(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 1000 }}
          fullWidth
        />
      </DialogComponent>
    </Box>
  );
};

export default LicensesTab;
