import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import * as DocumentService from "../../../services/documentService";
import * as UserService from "../../../services/userService";
import type { DocumentDTO, SharePermission, ShareRecipient } from "../../../services/documentService";
import type { Employee } from "../../../models/Employee";
import type { User } from "../../../models/User";

interface RecipientOption {
  key: string;
  type: "employee" | "user";
  id: number;
  label: string;
  secondary: string;
}

const PERMISSIONS: { value: SharePermission; label: string; hint: string }[] = [
  { value: "view", label: "Ver", hint: "Solo puede ver y descargar el archivo." },
  { value: "comment", label: "Comentar", hint: "Puede ver el archivo y dejar comentarios." },
  { value: "edit", label: "Editar", hint: "Puede ver, comentar y editar el archivo." },
];

interface ShareDialogProps {
  open: boolean;
  documents: DocumentDTO[];
  employees: Employee[];
  onClose: () => void;
  onShared: () => void;
}

// Comparte varios archivos con varios destinatarios (empleados y usuarios) y un
// nivel de permiso, estilo "compartir" de Google Drive.
const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  documents,
  employees,
  onClose,
  onShared,
}) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const { showNotification } = useAppNotifications();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [selected, setSelected] = useState<RecipientOption[]>([]);
  const [permission, setPermission] = useState<SharePermission>("view");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setPermission("view");
    let cancelled = false;
    setLoadingRecipients(true);
    UserService.getUsers()
      .then((data: User[]) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRecipients(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const options = useMemo<RecipientOption[]>(() => {
    const employeeOptions: RecipientOption[] = employees.map((employee) => ({
      key: `employee-${employee.id}`,
      type: "employee",
      id: employee.id,
      label: `${employee.firstName} ${employee.lastName}`.trim(),
      secondary: "Empleado",
    }));
    const userOptions: RecipientOption[] = users.map((user) => ({
      key: `user-${user.id}`,
      type: "user",
      id: user.id,
      label: `${user.firstName} ${user.lastName}`.trim() || user.username,
      secondary: user.username,
    }));
    return [...employeeOptions, ...userOptions];
  }, [employees, users]);

  const handleShare = async () => {
    if (documents.length === 0 || selected.length === 0) return;
    setSharing(true);
    try {
      const recipients: ShareRecipient[] = selected.map((option) => ({
        type: option.type,
        id: option.id,
      }));
      await DocumentService.shareDocuments({
        documentIds: documents.map((doc) => doc.id),
        recipients,
        permission,
      });
      showNotification(
        documents.length === 1 ? "Archivo compartido" : "Archivos compartidos",
        { severity: "success" },
      );
      onShared();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron compartir los archivos";
      showNotification(message, { severity: "error" });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Compartir</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2 }}>
          {documents.length === 1
            ? `Compartirás "${documents[0]?.name}".`
            : `Compartirás ${documents.length} archivos.`}
        </Typography>

        <Autocomplete
          multiple
          options={options}
          loading={loadingRecipients}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          groupBy={(option) => (option.type === "employee" ? "Empleados" : "Usuarios")}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.key}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.875rem" }} noWrap>
                  {option.label}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  {option.secondary}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destinatarios"
              placeholder="Buscar empleados o usuarios"
              margin="dense"
            />
          )}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Permiso"
          value={permission}
          onChange={(event) => setPermission(event.target.value as SharePermission)}
          helperText={PERMISSIONS.find((item) => item.value === permission)?.hint}
        >
          {PERMISSIONS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleShare()}
          disabled={sharing || selected.length === 0}
          sx={{ textTransform: "none" }}
        >
          {sharing ? "Compartiendo…" : "Compartir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
