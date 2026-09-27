import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Alert,
  Typography,
  useTheme,
  Grid,
} from "@mui/material";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import generateSecret from "../../../utils/generateSecret";
import { IconCopy, IconEye, IconEyeOff, IconInfoCircle } from "@tabler/icons-react";
import FORMS, { PASSWORD_INFO_TITLE, PASSWORD_INFO_DESC } from "../../../constants/forms.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import {
  updateUserPassword,
  updateUserTemporalPassword,
} from "../../../store/slices/userSlice";
import {
  formBox,
  subtitle,
  temporalPasswordBox,
} from "./styles";
import { actionsBox, actionsInnerBox } from '../sharedStyles';
import { infoBox, infoIconBox, infoTitle, infoDesc, iconStyle, formControl } from '../sharedStyles';
import { validatePassword, validatePasswordMatch } from '../../../utils/userValidation';

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
  const theme = useTheme();

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
    let tempPassword = generateSecret();
    // Ensure the generated password passes validation
    while (validatePassword(tempPassword)) {
      tempPassword = generateSecret();
    }
    setFields({ newPassword: tempPassword, confirmNewPassword: tempPassword });
    setTemporalPassword(tempPassword);
    setCopySuccess(false);
    try {
      await dispatch(
        updateUserTemporalPassword({
          id: userId,
          temporalPassword: tempPassword,
        }),
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
        updateUserPassword({ id: userId, password: fields.newPassword }),
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextfieldComponent
            type={showNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            placeholder={MANAGEMENT.DIALOG_PASSWORD_NEW_PLACEHOLDER}
            label="Nueva contraseña"
            autoComplete="new-password"
            onChange={(e) => handleFieldChange("newPassword", e.target.value)}
            endAdornment={
              <IconButton
                onClick={() => setShowNewPassword((v) => !v)}
                edge="end"
                size="small"
              >
                {showNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </IconButton>
            }
            sx={formControl(theme)}
            error={!!validatePassword(fields.newPassword)}
            helperText={validatePassword(fields.newPassword) || ""}
          />
        </Grid>
        <Grid item xs={12}>
          <TextfieldComponent
            type={showConfirmNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            placeholder={MANAGEMENT.DIALOG_PASSWORD_CONFIRM_PLACEHOLDER}
            label="Confirmar contraseña"
            autoComplete="new-password"
            onChange={(e) =>
              handleFieldChange("confirmNewPassword", e.target.value)
            }
            endAdornment={
              <IconButton
                onClick={() => setShowConfirmNewPassword((v) => !v)}
                edge="end"
                size="small"
              >
                {showConfirmNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </IconButton>
            }
            sx={formControl(theme)}
            error={!!validatePasswordMatch(fields.newPassword, fields.confirmNewPassword)}
            helperText={validatePasswordMatch(fields.newPassword, fields.confirmNewPassword) || ""}
          />
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={handleGenerateTemporalPassword}
            fullWidth
            sx={{
              minHeight: 40,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "-0.01em",
              borderRadius: "10px",
            }}
          >
            Generar contraseña temporal
          </Button>
        </Grid>
        <Grid item xs={12}>
          {temporalPassword && (
            <Box sx={temporalPasswordBox}>
              <TextfieldComponent
                placeholder="Contraseña temporal generada"
                label="Contraseña temporal"
                value={temporalPassword}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <PremiumTooltip
                      title={copySuccess ? "¡Copiado!" : "Copiar"}
                      placement="top"
                    >
                      <IconButton
                        onClick={handleCopyTemporalPassword}
                        edge="end"
                        size="small"
                      >
                        <IconCopy
                          color={copySuccess ? "success" : "inherit"}
                          fontSize="small"
                        />
                      </IconButton>
                    </PremiumTooltip>
                  ),
                }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <IconInfoCircle style={iconStyle} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>{PASSWORD_INFO_TITLE}</Typography>
              <Typography sx={infoDesc(theme)}>{PASSWORD_INFO_DESC}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={actionsBox}>
            <Button
              onClick={onClose}
              variant="text"
              sx={{
                px: 1.5,
                minWidth: "auto",
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "0.875rem",
                textTransform: "none",
                letterSpacing: "-0.01em",
                transition: "color 0.15s ease",
                '&:hover': {
                  color: "text.primary",
                },
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Box sx={actionsInnerBox}>
              <Button
                type="submit"
                variant="text"
                sx={{
                  px: 1.5,
                  minHeight: 36,
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  '&:hover': {
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    textDecorationThickness: "1px",
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
                disabled={
                  loading ||
                  !!validatePassword(fields.newPassword) ||
                  !!validatePasswordMatch(fields.newPassword, fields.confirmNewPassword)
                }
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordChangeForm;
