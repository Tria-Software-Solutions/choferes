import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
  Typography,
} from "@mui/material";
import CustomTextField from "../../components/Textfield/CustomTextField";
import generateSecret from "../../utils/generateSecret";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FORMS from "../../constants/forms.constants";
import NOTIFICATIONS from "../../constants/notifications.constants";
import MANAGEMENT from "../../constants/management.constants";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  updateUserPassword,
  updateUserTemporalPassword,
} from "../../store/slices/userSlice";
import {
  formBox,
  subtitle,
  temporalPasswordBox,
  generateButton,
} from './PasswordChangeForm.styles';

interface PasswordChangeFormProps {
  userId: number | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  userId,
  onClose,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [fields, setFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [temporalPassword, setTemporalPassword] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = () => {
    if (!fields.newPassword || !fields.confirmNewPassword) {
      setError(FORMS.REQUIRED_FIELD);
      return false;
    }
    if (fields.newPassword !== fields.confirmNewPassword) {
      setError(FORMS.PASSWORDS_DONT_MATCH);
      return false;
    }
    if (!passwordRegex.test(fields.newPassword)) {
      setError(FORMS.PASSWORD_COMPLEXITY);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleGenerateTemporalPassword = async () => {
    if (typeof userId !== "number") return;
    const tempPassword = generateSecret();
    setFields({ newPassword: tempPassword, confirmNewPassword: tempPassword });
    setTemporalPassword(tempPassword);
    setCopySuccess(false);
    try {
      await dispatch(
        updateUserTemporalPassword({
          id: userId,
          temporalPassword: tempPassword,
        })
      ).unwrap();
    } catch (err: unknown) {
      onError(NOTIFICATIONS.PASSWORD_UPDATE_ERROR);
    }
  };

  const handleCopyTemporalPassword = async () => {
    if (temporalPassword) {
      await navigator.clipboard.writeText(temporalPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || typeof userId !== "number") return;
    setLoading(true);
    try {
      await dispatch(
        updateUserPassword({ id: userId, password: fields.newPassword })
      ).unwrap();
      setFields({ newPassword: "", confirmNewPassword: "" });
      setTemporalPassword("");
      setCopySuccess(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setError(null);
      onSuccess();
    } catch (err: unknown) {
      setError(NOTIFICATIONS.PASSWORD_UPDATE_ERROR);
      onError(NOTIFICATIONS.PASSWORD_UPDATE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formBox}>
      <Typography variant="body2" color="textSecondary" sx={subtitle}>
        {MANAGEMENT.DIALOG_PASSWORD_SUBTITLE}
      </Typography>
      <Stack>
        <CustomTextField
          label={MANAGEMENT.DIALOG_PASSWORD_NEW}
          type={showNewPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={fields.newPassword}
          onChange={(e) => handleFieldChange("newPassword", e.target.value)}
          placeholder={MANAGEMENT.DIALOG_PASSWORD_NEW_PLACEHOLDER}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword((v) => !v)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <CustomTextField
          label={MANAGEMENT.DIALOG_PASSWORD_CONFIRM}
          type={showConfirmNewPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={fields.confirmNewPassword}
          onChange={(e) =>
            handleFieldChange("confirmNewPassword", e.target.value)
          }
          placeholder={MANAGEMENT.DIALOG_PASSWORD_CONFIRM_PLACEHOLDER}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmNewPassword((v) => !v)}
                  edge="end"
                >
                  {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleGenerateTemporalPassword}
          fullWidth
          sx={generateButton}
        >
          Generar contraseña temporal
        </Button>
        {temporalPassword && (
          <Box sx={temporalPasswordBox}>
            <CustomTextField
              label="Contraseña temporal generada"
              value={temporalPassword}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip
                    title={copySuccess ? "¡Copiado!" : "Copiar"}
                    placement="top"
                  >
                    <IconButton
                      onClick={handleCopyTemporalPassword}
                      edge="end"
                      size="small"
                    >
                      <ContentCopyIcon
                        color={copySuccess ? "success" : "inherit"}
                        fontSize="small"
                      />
                    </IconButton>
                  </Tooltip>
                ),
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
            {error}
          </Alert>
        )}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            mt: 2,
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            disabled={loading}
          >
            {MANAGEMENT.DIALOG_PASSWORD_CANCEL}
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            fullWidth
          >
            {MANAGEMENT.DIALOG_PASSWORD_CHANGE}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default PasswordChangeForm;
