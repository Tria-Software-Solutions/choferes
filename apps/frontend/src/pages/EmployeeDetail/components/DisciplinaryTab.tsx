import React, { useEffect, useMemo, useState } from "react";
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
import { IconFileText, IconInbox, IconPaperclip, IconPencil, IconPlus, IconShieldExclamation, IconTrash } from "@tabler/icons-react";
import { Employee } from "../../../models/Employee";
import {
  DisciplinaryAction,
  DISCIPLINARY_ACTION_TYPE_LABELS,
} from "../../../models/DisciplinaryAction";
import type { DisciplinaryAttachment } from "@choferes/shared";
import { AppDispatch } from "../../../store/store";
import {
  deleteDisciplinaryAction,
  fetchDisciplinaryActions,
  selectDisciplinaryActions,
  selectDisciplinaryError,
  selectIsLoadingDisciplinary,
} from "../../../store/slices/disciplinarySlice";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  editButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import DisciplinaryFormDialog from "./DisciplinaryFormDialog";
import { submitButton } from "../../Forms/sharedStyles";
import SectionHeader from "./SectionHeader";
import {
  cardStackStyles,
  fillSectionPaperStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface DisciplinaryTabProps {
  employee: Employee;
}

const SEVERITY: Record<string, { label: string; color: "default" | "warning" | "error" }> = {
  leve: { label: "Leve", color: "default" },
  grave: { label: "Grave", color: "warning" },
  muy_grave: { label: "Muy grave", color: "error" },
};

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

// Downloads an attachment stored as a base64 data URL. Anything else is
// refused: a `javascript:` URL clicked programmatically would run in the
// viewer's session (records saved before the API validated this still exist).
const downloadAttachment = (attachment: DisciplinaryAttachment) => {
  if (!/^data:[\w.+-]+\/[\w.+-]+;base64,/.test(attachment.dataUrl ?? "")) return;
  const link = document.createElement("a");
  link.href = attachment.dataUrl;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Llamadas de atención / amonestaciones of a single employee, with attachments.
const DisciplinaryTab: React.FC<DisciplinaryTabProps> = ({ employee }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const allActions = useSelector(selectDisciplinaryActions);
  const isLoading = useSelector(selectIsLoadingDisciplinary);
  // El store puede traer filas de otros empleados (p. ej. el listado completo de
  // Planilla): se muestran solo las de este empleado desde el primer cuadro y se
  // espera la primera carga antes de decidir entre lista o estado vacío.
  const [loaded, setLoaded] = useState(false);
  const actions = useMemo(
    () => allActions.filter((item) => item.employeeId === employee.id),
    [allActions, employee.id],
  );
  const loadError = useSelector(selectDisciplinaryError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisciplinaryAction | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const canCreate = userPermissions.includes(PERMISSION_CODES.CREATE_DISCIPLINARY);
  const canEdit = userPermissions.includes(PERMISSION_CODES.EDIT_DISCIPLINARY);
  const canDelete = userPermissions.includes(PERMISSION_CODES.DELETE_DISCIPLINARY);

  useEffect(() => {
    setLoaded(false);
    void dispatch(fetchDisciplinaryActions({ employeeId: employee.id, limit: 10000 })).finally(() =>
      setLoaded(true),
    );
  }, [dispatch, employee.id]);

  const reload = async () => {
    await dispatch(fetchDisciplinaryActions({ employeeId: employee.id, limit: 10000 }));
  };

  const handleOpenForm = (action: DisciplinaryAction | null) => {
    setEditingAction(action);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await dispatch(deleteDisciplinaryAction(deleteTarget.id)).unwrap();
      showNotification("Amonestación eliminada", { severity: "success" });
      setDeleteTarget(null);
    } catch (error) {
      const message =
        typeof error === "string" ? error : "No se pudo eliminar la amonestación";
      showNotification(message, { severity: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconShieldExclamation size={20} stroke={1.5} />}
          title="Llamadas de atención y amonestaciones"
          description="Registro disciplinario del empleado con sus adjuntos."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
              >
                <IconShieldExclamation size={16} color={theme.palette.primary.main} />
                {actions.length} registro{actions.length === 1 ? "" : "s"}
              </Typography>
              {canCreate && (
                <Button
                  variant="text"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => handleOpenForm(null)}
                  sx={submitButton}
                >
                  Registrar
                </Button>
              )}
            </Box>
          }
        />

        {(isLoading || !loaded) && actions.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && actions.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : actions.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">No hay amonestaciones registradas</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <ResponsiveTable size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Fecha</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Tipo</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Gravedad</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Motivo</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="center">
                    Adjuntos
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.map((action) => {
                  const severity = SEVERITY[action.severity] ?? SEVERITY.leve;
                  const attachments = Array.isArray(action.attachments)
                    ? action.attachments
                    : [];
                  const isBusy = busyId === action.id;
                  return (
                    <TableRow
                      key={action.id}
                      hover
                    >
                      <TableCell sx={tableCellStyles}>{formatDate(action.actionDate)}</TableCell>
                      <TableCell sx={tableCellStyles}>
                        {DISCIPLINARY_ACTION_TYPE_LABELS[
                          action.type as keyof typeof DISCIPLINARY_ACTION_TYPE_LABELS
                        ] ?? action.type}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          size="small"
                          label={severity.label}
                          color={severity.color}
                          variant={severity.color === "default" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.reason}
                        </Typography>
                        {action.description && (
                          <Typography
                            variant="caption"
                            title={action.description}
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {action.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={tableCellStyles} align="center">
                        {attachments.length === 0 ? (
                          "—"
                        ) : (
                          <Box
                            sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}
                          >
                            {attachments.map((attachment, index) => (
                              <IconButton
                                key={`${attachment.name}-${index}`}
                                size="small"
                                title={`Descargar ${attachment.name}`}
                                onClick={() => downloadAttachment(attachment)}
                                sx={neutralButtonStyles(theme)}
                              >
                                {attachment.mimeType?.startsWith("image/") ? (
                                  <IconPaperclip size={15} />
                                ) : (
                                  <IconFileText size={15} />
                                )}
                              </IconButton>
                            ))}
                          </Box>
                        )}
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
                              onClick={() => handleOpenForm(action)}
                              sx={editButtonStyles(theme)}
                            >
                              <IconPencil size={15} />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              title="Eliminar"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(action)}
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

      <DisciplinaryFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={employee}
        action={editingAction}
        onSaved={() => void reload()}
      />

      <DialogComponent
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar amonestación"
        message={
          deleteTarget
            ? `¿Eliminar la amonestación del ${formatDate(deleteTarget.actionDate)}?`
            : ""
        }
        type="delete"
        loading={busyId === deleteTarget?.id}
      />
    </Box>
  );
};

export default DisciplinaryTab;
