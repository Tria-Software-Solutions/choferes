import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconCheck, IconFileDescription, IconFileText, IconFlag, IconLoader2, IconNotebook, IconPaperclip, IconTrash, IconX } from "@tabler/icons-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { formatStoredDate, parseStoredDate } from "../../../utils/dates";
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
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import {
  actionsBox,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from "../../Forms/sharedStyles";

interface DisciplinaryFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  action?: DisciplinaryAction | null;
  onSaved: () => void;
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB per file

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
// No hard limit on attachment count; each file max 10MB.
const DisciplinaryFormDialog: React.FC<DisciplinaryFormDialogProps> = ({
  open,
  onClose,
  employee,
  action,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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

    const next: DisciplinaryAttachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        showNotification(`"${file.name}" supera el máximo de 10MB`, { severity: "warning" });
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha"
                value={parseStoredDate(form.actionDate)}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, actionDate: formatStoredDate(date) }))
                }
                format="d MMM yyyy"
                slots={{ toolbar: () => null }}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <PlaceholderSelect
              label="Tipo"
              placeholder="Selecciona"
              icon={<IconFileDescription size={20} color={theme.palette.text.secondary} />}
              formatValue={(value) =>
                DISCIPLINARY_ACTION_TYPE_LABELS[value as keyof typeof DISCIPLINARY_ACTION_TYPE_LABELS] ??
                String(value)
              }
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {DISCIPLINARY_ACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {DISCIPLINARY_ACTION_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </PlaceholderSelect>
          </Grid>
        </Grid>

        <PlaceholderSelect
          label="Gravedad"
          placeholder="Selecciona"
          icon={<IconFlag size={20} color={theme.palette.text.secondary} />}
          formatValue={(value) =>
            DISCIPLINARY_SEVERITY_LABELS[value as keyof typeof DISCIPLINARY_SEVERITY_LABELS] ?? String(value)
          }
          value={form.severity}
          onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))}
        >
          {DISCIPLINARY_SEVERITIES.map((severity) => (
            <MenuItem key={severity} value={severity}>
              {DISCIPLINARY_SEVERITY_LABELS[severity]}
            </MenuItem>
          ))}
        </PlaceholderSelect>

        <TextfieldComponent
          name="reason"
          label="Motivo"
          icon={<IconFileDescription size={20} color={theme.palette.text.secondary} />}
          value={form.reason}
          onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          inputProps={{ maxLength: 500 }}
          required
          fullWidth
        />

        <TextfieldComponent
          name="description"
          label="Descripción"
          icon={<IconNotebook size={20} color={theme.palette.text.secondary} />}
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
              Adjuntos ({attachments.length}) · documentos o imágenes, máx. 10MB c/u
            </Typography>
            <Button
              size="small"
              startIcon={<IconPaperclip size={15} />}
              onClick={() => fileInputRef.current?.click()}
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
                  icon={<IconFileText size={14} />}
                  label={`${attachment.name} · ${formatSize(attachment.size)}`}
                  onDelete={() => removeAttachment(index)}
                  deleteIcon={<IconTrash size={14} />}
                  variant="outlined"
                  sx={{ maxWidth: "100%" }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box sx={actionsBox(theme)}>
          <Button
            variant="text"
            startIcon={<IconX size={18} />}
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth={isSmallScreen}
            sx={cancelButton}
          >
            Cancelar
          </Button>
          <Box sx={actionsInnerBox}>
            <Button
              variant="text"
              startIcon={isSubmitting ? <IconLoader2 size={18} /> : <IconCheck size={18} />}
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              fullWidth={isSmallScreen}
              sx={submitButton}
            >
              {isEditing ? "Guardar" : "Registrar"}
            </Button>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default DisciplinaryFormDialog;
