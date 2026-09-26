import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FileText, Loader2, Paperclip, Save, Trash2 } from "lucide-react";
import { Employee } from "../../../models/Employee";
import {
  DisciplinaryAction,
  DISCIPLINARY_ACTION_TYPES,
  DISCIPLINARY_ACTION_TYPE_LABELS,
  DISCIPLINARY_SEVERITIES,
  DISCIPLINARY_SEVERITY_LABELS,
} from "../../../models/DisciplinaryAction";
import type { DisciplinaryAttachment } from "@choferes/shared";
import { AppDispatch } from "../../../store/store";
import {
  createDisciplinaryAction,
  updateDisciplinaryAction,
} from "../../../store/slices/disciplinarySlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";

interface DisciplinaryFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  action?: DisciplinaryAction | null;
  onSaved: () => void;
}

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // ~2MB por archivo

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Registers/edits a disciplinary action. Documents and images are read
// client-side into base64 data URLs and stored in the database.
const DisciplinaryFormDialog: React.FC<DisciplinaryFormDialogProps> = ({
  open,
  onClose,
  employee,
  action,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useAppNotifications();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(action);
  const [form, setForm] = useState({
    actionDate: new Date().toISOString().slice(0, 10),
    type: "llamada_atencion",
    severity: "leve",
    reason: "",
    description: "",
  });
  const [attachments, setAttachments] = useState<DisciplinaryAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      actionDate: action?.actionDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      type: action?.type ?? "llamada_atencion",
      severity: action?.severity ?? "leve",
      reason: action?.reason ?? "",
      description: action?.description ?? "",
    });
    setAttachments(Array.isArray(action?.attachments) ? action!.attachments! : []);
  }, [open, action]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const free = MAX_ATTACHMENTS - attachments.length;
    if (free <= 0) {
      showNotification(`Máximo ${MAX_ATTACHMENTS} archivos adjuntos`, { severity: "warning" });
      return;
    }

    const selected = Array.from(files).slice(0, free);
    const next: DisciplinaryAttachment[] = [];
    for (const file of selected) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        showNotification(`"${file.name}" supera el máximo de 2MB`, { severity: "warning" });
        continue;
      }
      try {
        next.push({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: await readAsDataUrl(file),
        });
      } catch {
        showNotification(`No se pudo leer "${file.name}"`, { severity: "error" });
      }
    }
    if (next.length > 0) {
      setAttachments((prev) => [...prev, ...next]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = form.reason.trim().length > 0 && Boolean(form.actionDate) && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const payload = {
        actionDate: form.actionDate,
        type: form.type,
        severity: form.severity,
        reason: form.reason.trim(),
        description: form.description.trim() || null,
        attachments,
      };
      if (action) {
        await dispatch(updateDisciplinaryAction({ id: action.id, input: payload })).unwrap();
        showNotification("Amonestación actualizada", { severity: "success" });
      } else {
        await dispatch(
          createDisciplinaryAction({ employeeId: employee.id, input: payload }),
        ).unwrap();
        showNotification("Amonestación registrada", { severity: "success" });
      }
      onSaved();
      onClose();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la amonestación";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar amonestación" : "Nueva amonestación"}
      subtitle={`${employee.firstName} ${employee.lastName}`}
      hideActions
      paperSx={{ maxWidth: 560 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Fecha"
            type="date"
            size="small"
            value={form.actionDate}
            onChange={(event) => setForm((prev) => ({ ...prev, actionDate: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="disciplinary-type-label">Tipo</InputLabel>
            <Select
              labelId="disciplinary-type-label"
              label="Tipo"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {DISCIPLINARY_ACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {DISCIPLINARY_ACTION_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel id="disciplinary-severity-label">Gravedad</InputLabel>
          <Select
            labelId="disciplinary-severity-label"
            label="Gravedad"
            value={form.severity}
            onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))}
          >
            {DISCIPLINARY_SEVERITIES.map((severity) => (
              <MenuItem key={severity} value={severity}>
                {DISCIPLINARY_SEVERITY_LABELS[severity]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Motivo"
          size="small"
          value={form.reason}
          onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          inputProps={{ maxLength: 500 }}
          required
          fullWidth
        />

        <TextField
          label="Descripción"
          size="small"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          multiline
          minRows={3}
          inputProps={{ maxLength: 4000 }}
          fullWidth
        />

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Adjuntos ({attachments.length}/{MAX_ATTACHMENTS}) · documentos o imágenes, máx. 2MB
            </Typography>
            <Button
              size="small"
              startIcon={<Paperclip size={15} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_ATTACHMENTS}
            >
              Adjuntar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(event) => void handleFiles(event.target.files)}
            />
          </Box>

          {attachments.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {attachments.map((attachment, index) => (
                <Chip
                  key={`${attachment.name}-${index}`}
                  icon={<FileText size={14} />}
                  label={`${attachment.name} · ${formatSize(attachment.size)}`}
                  onDelete={() => removeAttachment(index)}
                  deleteIcon={<Trash2 size={14} />}
                  variant="outlined"
                  sx={{ maxWidth: "100%" }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={isSubmitting ? <Loader2 size={16} /> : <Save size={16} />}
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {isEditing ? "Guardar" : "Registrar"}
          </Button>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default DisciplinaryFormDialog;
