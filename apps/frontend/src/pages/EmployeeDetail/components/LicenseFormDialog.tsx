import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Loader2, Save } from "lucide-react";
import { Employee } from "../../../models/Employee";
import { EmployeeLicense, LICENSE_TYPES } from "../../../models/EmployeeLicense";
import { AppDispatch } from "../../../store/store";
import { createLicense, updateLicense } from "../../../store/slices/licenseSlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";

interface LicenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  license?: EmployeeLicense | null;
  onSaved: () => void;
}

// Creates/edits a driver's license. The expiry status is always computed
// server-side, so this dialog only captures the raw fields.
const LicenseFormDialog: React.FC<LicenseFormDialogProps> = ({
  open,
  onClose,
  employee,
  license,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useAppNotifications();

  const isEditing = Boolean(license);
  const [licenseType, setLicenseType] = useState<string>("B1");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLicenseType(license?.licenseType ?? "B1");
    setLicenseNumber(license?.licenseNumber ?? "");
    setIssuedAt(license?.issuedAt ?? "");
    setExpiresAt(license?.expiresAt ?? "");
    setNotes(license?.notes ?? "");
  }, [open, license]);

  const rangeInvalid =
    Boolean(issuedAt && expiresAt) &&
    new Date(expiresAt).getTime() < new Date(issuedAt).getTime();

  const canSubmit = Boolean(licenseType) && !rangeInvalid && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const payload = {
        licenseType,
        licenseNumber: licenseNumber.trim() || null,
        issuedAt: issuedAt || null,
        expiresAt: expiresAt || null,
        notes: notes.trim() || null,
      };
      if (license) {
        await dispatch(updateLicense({ id: license.id, input: payload })).unwrap();
        showNotification("Licencia actualizada", { severity: "success" });
      } else {
        await dispatch(createLicense({ employeeId: employee.id, ...payload })).unwrap();
        showNotification("Licencia registrada", { severity: "success" });
      }
      onSaved();
      onClose();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la licencia";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar licencia" : "Nueva licencia"}
      subtitle={`${employee.firstName} ${employee.lastName}`}
      hideActions
      paperSx={{ maxWidth: 520 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="license-type-label">Categoría</InputLabel>
            <Select
              labelId="license-type-label"
              label="Categoría"
              value={licenseType}
              onChange={(event) => setLicenseType(event.target.value)}
            >
              {LICENSE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Número de licencia"
            size="small"
            value={licenseNumber}
            onChange={(event) => setLicenseNumber(event.target.value)}
            inputProps={{ maxLength: 50 }}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Fecha de expedición"
            type="date"
            size="small"
            value={issuedAt}
            onChange={(event) => setIssuedAt(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Fecha de vencimiento"
            type="date"
            size="small"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={rangeInvalid}
            helperText={rangeInvalid ? "No puede ser anterior a la expedición" : undefined}
            fullWidth
          />
        </Box>

        <TextField
          label="Notas"
          size="small"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 1000 }}
          fullWidth
        />

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

export default LicenseFormDialog;
