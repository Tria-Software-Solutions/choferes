import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
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
import { BadgeCheck, IdCard, Inbox, Pencil, Trash2 } from "lucide-react";
import { Employee } from "../../../models/Employee";
import { EmployeeLicense } from "../../../models/EmployeeLicense";
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
import PERMISSIONS from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  editButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import LicenseFormDialog from "./LicenseFormDialog";
import {
  cardStackStyles,
  sectionPaperStyles,
  sectionTitleStyles,
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

// Driver's licenses of a single employee, with expiry alerts (Costa Rica).
const LicensesTab: React.FC<LicensesTabProps> = ({ employee }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const licenses = useSelector(selectLicenses);
  const isLoading = useSelector(selectIsLoadingLicenses);
  const loadError = useSelector(selectLicensesError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<EmployeeLicense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeLicense | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const canCreate = userPermissions.includes(PERMISSIONS.CREATE_LICENSE);
  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_LICENSE);
  const canDelete = userPermissions.includes(PERMISSIONS.DELETE_LICENSE);

  useEffect(() => {
    void dispatch(fetchLicenses({ employeeId: employee.id, limit: 10000 }));
  }, [dispatch, employee.id]);

  const reload = async () => {
    await dispatch(fetchLicenses({ employeeId: employee.id, limit: 10000 }));
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
            mb: 1.5,
          }}
        >
          <Typography sx={{ ...sectionTitleStyles, mb: 0 }}>Licencias de conducir</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
            >
              <IdCard size={16} color={theme.palette.primary.main} />
              {licenses.length} licencia{licenses.length === 1 ? "" : "s"}
            </Typography>
            {canCreate && (
              <Button
                variant="text"
                onClick={() => handleOpenForm(null)}
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
                Nueva licencia
              </Button>
            )}
          </Box>
        </Box>

        {alerts.length > 0 && (
          <Alert
            severity={alerts.some((license) => license.status === "vencida") ? "error" : "warning"}
            icon={<BadgeCheck size={18} />}
            sx={{ mb: 1.5, borderRadius: "10px" }}
          >
            {alerts.length} licencia{alerts.length === 1 ? "" : "s"} vencida
            {alerts.length === 1 ? "" : "s"} o por vencer en los próximos 30 días.
          </Alert>
        )}

        {isLoading && licenses.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && licenses.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : licenses.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">No hay licencias registradas</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <Table size="small" stickyHeader>
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
                  return (
                    <TableRow
                      key={license.id}
                      sx={{
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.03)",
                        },
                      }}
                    >
                      <TableCell sx={{ ...tableCellStyles, fontWeight: 700 }}>
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
                          {canEdit && (
                            <IconButton
                              size="small"
                              title="Editar"
                              disabled={isBusy}
                              onClick={() => handleOpenForm(license)}
                              sx={editButtonStyles(theme)}
                            >
                              <Pencil size={15} />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(license)}
                              sx={deleteButtonStyles(theme)}
                            >
                              <Trash2 size={15} />
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

      <LicenseFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={employee}
        license={editingLicense}
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
    </Box>
  );
};

export default LicensesTab;
