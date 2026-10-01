import React, { useEffect, useState } from "react";
import { Box, Button, Grid, MenuItem, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  IconCheck,
  IconHash,
  IconId,
  IconInfoCircle,
  IconLoader2,
  IconNotebook,
  IconX,
} from "@tabler/icons-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { LICENSE_TYPES } from "@choferes/shared";
import type { EmployeeLicense } from "../../../models/EmployeeLicense";
import { createMyLicenseRequest } from "../../../services/meService";
import { formatStoredDate, parseStoredDate } from "../../../utils/dates";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import { actionsBox, actionsInnerBox, cancelButton, submitButton } from "../../Forms/sharedStyles";

interface MyLicenseRequestDialogProps {
  open: boolean;
  onClose: () => void;
  /** null/undefined = pedir una licencia nueva. */
  license?: EmployeeLicense | null;
  /** Recarga el panel cuando la solicitud queda registrada. */
  onRequested: () => Promise<void> | void;
}

/**
 * Autoservicio de licencias: el empleado propone crear o corregir una licencia
 * y la solicitud queda pendiente. No escribe el expediente: administración la
 * revisa en la ficha del empleado.
 */
export const MyLicenseRequestDialog: React.FC<MyLicenseRequestDialogProps> = ({
  open,
  onClose,
  license,
  onRequested,
}) => {
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
    setIsSubmitting(false);
  }, [open, license]);

  const rangeInvalid =
    Boolean(issuedAt && expiresAt) &&
    new Date(expiresAt).getTime() < new Date(issuedAt).getTime();
  const canSubmit = Boolean(licenseType) && !rangeInvalid && !isSubmitting;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createMyLicenseRequest({
        action: isEditing ? "update" : "create",
        licenseId: license?.id ?? null,
        licenseType,
        licenseNumber: licenseNumber.trim() || null,
        issuedAt: issuedAt || null,
        expiresAt: expiresAt || null,
        notes: notes.trim() || null,
      });
      showNotification("Solicitud enviada. Queda pendiente de revisión.", {
        severity: "success",
      });
      onClose();
      await onRequested();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "No se pudo enviar la solicitud";
      showNotification(message, { severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={handleClose}
      title={isEditing ? "Solicitar cambio de licencia" : "Solicitar nueva licencia"}
      subtitle="La solicitud queda pendiente de revisión"
      hideActions
      paperSx={{ maxWidth: 520 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: theme.tokens.colors.textMuted,
          }}
        >
          <IconInfoCircle size={16} />
          <Typography variant="caption">
            Administración revisa el cambio antes de aplicarlo a tu expediente.
          </Typography>
        </Box>

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
                  textField: { size: "small", fullWidth: true, error: rangeInvalid },
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
                    helperText: rangeInvalid
                      ? "No puede ser anterior a la expedición"
                      : undefined,
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

        <Box sx={[actionsBox(theme), { mt: 0 }]}>
          <Button
            variant="text"
            startIcon={<IconX size={18} />}
            onClick={handleClose}
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
              Enviar solicitud
            </Button>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default MyLicenseRequestDialog;
