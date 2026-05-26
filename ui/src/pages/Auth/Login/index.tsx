import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import FORMS from "../../../constants/forms.constants";
import LOGIN from "../../../constants/login.constants";
import logo from "../../../assets/images/logo.png";
import {
  wrapper,
  split,
  left,
  right,
  formContainer,
  formPanel,
  header,
  form,
  footer,
} from "./styles";
import {
  textFieldStyles,
  passwordTextFieldStyles,
  submitButtonStyles,
  submitProgressStyles,
  alertStyles,
} from "../Register/styles";

const Login: React.FC = () => {
  const location = useLocation();
  const { authenticateUser, authError } = useAuth();
  const [fields, setFields] = useState({ identifier: location.state?.username || "", password: location.state?.password || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fields.identifier.trim()) {
      newErrors.identifier = FORMS.EMAIL_REQUIRED;
    }
    if (!fields.password.trim()) {
      newErrors.password = FORMS.PASSWORD_REQUIRED;
    } else if (fields.password.length < 6) {
      newErrors.password = FORMS.PASSWORD_COMPLEXITY;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    setIsSubmitting(true);
    try {
      await authenticateUser(fields.identifier, fields.password);
    } catch (error: unknown) { }
    setIsSubmitting(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFields({ ...fields, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Box sx={wrapper}>
      <Box sx={split}>
        <Box sx={left}>
          <Box sx={{ textAlign: "center", color: "inherit", position: 'relative' }}>
            <img src={logo} alt="Logo" style={{ width: 80, marginBottom: 12, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {PAGE_TITLE.LOGIN}
            </Typography>
            <Typography sx={{ maxWidth: 520, margin: "0 auto", opacity: 0.95 }}>{FORMS.LOGIN_DESCRIPTION}</Typography>

            <svg width="360" height="160" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 24, opacity: 0.08 }}>
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="340" height="140" rx="20" fill="url(#g1)" />
            </svg>
          </Box>
        </Box>

        <Box sx={right}>
          <Box sx={formContainer}>
            <Box sx={formPanel}>
              <Box sx={header}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>{LOGIN.LOGIN}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Accede a tu panel de control
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleLogin} sx={form}>
                <TextField
                  fullWidth
                  placeholder={LOGIN.EMAIL_OR_USERNAME}
                  variant="outlined"
                  value={fields.identifier}
                  autoComplete="username"
                  onChange={(e) => handleFieldChange("identifier", e.target.value)}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  disabled={isSubmitting}
                  sx={textFieldStyles}
                />

                <TextField
                  fullWidth
                  placeholder={LOGIN.PASSWORD}
                  type="password"
                  variant="outlined"
                  value={fields.password}
                  autoComplete="current-password"
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isSubmitting}
                  sx={passwordTextFieldStyles}
                />

                <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={submitButtonStyles}>
                  {isSubmitting ? <CircularProgress size={18} sx={submitProgressStyles} /> : LOGIN.SUBMIT}
                </Button>

                {/* removed register / forgot-password links to match product decision */}
              </Box>
            </Box>

            {authError && <Alert severity="error" sx={alertStyles}>{authError}</Alert>}

            <Box sx={footer}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{LOGIN.ACCESS_RESTRICTED}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>© {new Date().getFullYear()} Choferes de Alquiler</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
