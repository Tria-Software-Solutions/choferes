import React, { useEffect, useState } from "react";
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
import { FileText, Inbox, Paperclip, Pencil, ShieldAlert, Trash2 } from "lucide-react";
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
import PERMISSIONS from "../../../constants/permissions.constants";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import {
  deleteButtonStyles,
  editButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers";
import DisciplinaryFormDialog from "./DisciplinaryFormDialog";
import {
  cardStackStyles,
  sectionPaperStyles,
  sectionTitleStyles,
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

// Downloads an attachment stored as a base64 data URL.
const downloadAttachment = (attachment: DisciplinaryAttachment) => {
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

  const actions = useSelector(selectDisciplinaryActions);
  const isLoading = useSelector(selectIsLoadingDisciplinary);
  const loadError = useSelector(selectDisciplinaryError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisciplinaryAction | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const canCreate = userPermissions.includes(PERMISSIONS.CREATE_DISCIPLINARY);
  const canEdit = userPermissions.includes(PERMISSIONS.EDIT_DISCIPLINARY);
  const canDelete = userPermissions.includes(PERMISSIONS.DELETE_DISCIPLINARY);

  useEffect(() => {
    void dispatch(fetchDisciplinaryActions({ employeeId: employee.id, limit: 10000 }));
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
          <Typography sx={{ ...sectionTitleStyles, mb: 0 }}>
            Llamadas de atención y amonestaciones
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
            >
              <ShieldAlert size={16} color={theme.palette.primary.main} />
              {actions.length} registro{actions.length === 1 ? "" : "s"}
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
                Registrar
              </Button>
            )}
          </Box>
        </Box>

        {isLoading && actions.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : loadError && actions.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">{loadError}</Typography>
            <Button variant="outlined" onClick={() => void reload()}>
              Reintentar
            </Button>
          </Box>
        ) : actions.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <Inbox size={34} />
            <Typography variant="body2">No hay amonestaciones registradas</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <Table size="small" stickyHeader>
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
                      sx={{
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.03)",
                        },
                      }}
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
                                  <Paperclip size={15} />
                                ) : (
                                  <FileText size={15} />
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
                              <Pencil size={15} />
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
