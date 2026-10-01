import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Grid, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { IconCheck, IconHash, IconId, IconLoader2, IconNotebook, IconX } from "@tabler/icons-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { formatStoredDate, parseStoredDate } from "../../../utils/dates";
import { Employee } from "../../../models/Employee";
import { EmployeeLicense, LICENSE_TYPES } from "../../../models/EmployeeLicense";
import { AppDispatch } from "../../../store/store";
import { createLicense, updateLicense } from "../../../store/slices/licenseSlice";
import { createMyLicenseRequest } from "../../../services/meService";
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

interface LicenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  license?: EmployeeLicense | null;
  onSaved: () => void;
  /**
   * `request`: el propio empleado pide el cambio y queda pendiente de revisión.
   * `direct` (por defecto): quien administra licencias escribe el expediente.
   */
  mode?: "direct" | "request";
}

// Creates/edits a driver's license. The expiry status is always computed
// server-side, so this dialog only captures the raw fields.
const LicenseFormDialog: React.FC<LicenseFormDialogProps> = ({
  open,
  onClose,
  employee,
  license,
  onSaved,
  mode = "direct",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
      if (mode === "request") {
        await createMyLicenseRequest({
          action: license ? "update" : "create",
          licenseId: license?.id ?? null,
          ...payload,
        });
        showNotification("Solicitud enviada. Queda pendiente de revisión.", {
          severity: "success",
        });
      } else if (license) {
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
      title={
        mode === "request"
          ? isEditing
            ? "Solicitar cambio de licencia"
            : "Solicitar nueva licencia"
          : isEditing
            ? "Editar licencia"
            : "Nueva licencia"
      }
      subtitle={
        mode === "request"
          ? "La solicitud queda pendiente de revisión"
          : `${employee.firstName} ${employee.lastName}`
      }
      hideActions
      paperSx={{ maxWidth: 520 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <PlaceholderSelect
              label="Categoría"
              placeholder="Selecciona"
              icon={<IconId size={20} color={theme.palette.text.secondary} />}
              value={licenseType}
              onChange={(event) => setLicenseType(event.target.value)}
            >
              {LICENSE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </PlaceholderSelect>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextfieldComponent
              name="licenseNumber"
              label="Número de licencia"
              icon={<IconHash size={20} color={theme.palette.text.secondary} />}
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
              inputProps={{ maxLength: 50 }}
              fullWidth
            />
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de expedición"
                value={parseStoredDate(issuedAt)}
                onChange={(date) => setIssuedAt(formatStoredDate(date))}
                format="d MMM yyyy"
                slots={{ toolbar: () => null }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: rangeInvalid,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de vencimiento"
                value={parseStoredDate(expiresAt)}
                onChange={(date) => setExpiresAt(formatStoredDate(date))}
                format="d MMM yyyy"
                slots={{ toolbar: () => null }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: rangeInvalid,
                    helperText: rangeInvalid ? "No puede ser anterior a la expedición" : undefined,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <TextfieldComponent
          name="notes"
          label="Notas"
          icon={<IconNotebook size={20} color={theme.palette.text.secondary} />}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 1000 }}
          fullWidth
        />

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
              {mode === "request" ? "Enviar solicitud" : isEditing ? "Guardar" : "Registrar"}
            </Button>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default LicenseFormDialog;
