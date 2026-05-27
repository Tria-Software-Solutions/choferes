import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { TextField, Button, Typography, Box, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FORMS from '../../../constants/forms.constants';
import LOGIN from '../../../constants/login.constants';
import logo from '../../../assets/images/logo.png';
import DotField from '../../../components/DotField/DotField';
import {
  wrapper,
  split,
  left,
  right,
  formContainer,
  formPanel,
  header,
  form,
} from './styles';
import {
  textFieldStyles,
  passwordTextFieldStyles,
  submitButtonStyles,
  submitProgressStyles,
  alertStyles,
  passwordIconButtonStyles,
} from '../Register/styles';

const Login: React.FC = () => {
  const location = useLocation();
  const { authenticateUser, authError } = useAuth();
  const [fields, setFields] = useState({
    identifier: location.state?.username || '',
    password: location.state?.password || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (error: unknown) {}
    setIsSubmitting(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFields({ ...fields, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Box sx={wrapper}>
      <Box sx={split}>
        <Box sx={left}>
          <Box
            sx={{ position: 'absolute', width: { xs: '95%', md: '85%' }, maxWidth: 700, zIndex: 0 }}
          >
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: 'auto' }}
            >
              <path
                fill="rgba(255,255,255,0.05)"
                d="M35.5,-58.2C49.8,-53.3,67.8,-51.4,76.9,-42.2C85.9,-33,86.1,-16.5,83.8,-1.3C81.6,13.9,76.9,27.8,70.9,42.2C64.8,56.7,57.4,71.6,45.4,81.2C33.3,90.7,16.7,94.9,3,89.7C-10.6,84.5,-21.2,69.8,-34.2,60.8C-47.1,51.7,-62.3,48.2,-70.9,39.1C-79.6,29.9,-81.5,14.9,-81.6,-0.1C-81.8,-15.1,-80,-30.1,-72,-40.4C-64,-50.7,-49.8,-56.1,-36.8,-61.8C-23.7,-67.4,-11.9,-73.3,-0.6,-72.2C10.6,-71.1,21.3,-63.2,35.5,-58.2Z"
                transform="translate(100 100)"
              />
            </svg>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Box
              component="img"
              src="/car.svg"
              alt="Car illustration"
              sx={{
                width: { xs: '80%', md: '85%' },
                maxWidth: 650,
                height: 'auto',
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.08))',
              }}
            />
          </Box>
          <Box sx={{ width: '100%', zIndex: 2, pb: { xs: 5, md: 8 }, px: { xs: 4, md: 8 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                letterSpacing: -0.5,
                lineHeight: 1.2,
                mb: 1.5,
                color: '#ffffff',
              }}
            >
              Gestión de Choferes
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 400,
                opacity: 0.5,
                lineHeight: 1.7,
                maxWidth: 440,
                color: '#ffffff',
              }}
            >
              {LOGIN.FLEET_MANAGEMENT} {LOGIN.ACCESS_RESTRICTED}
            </Typography>
          </Box>
        </Box>

        <Box sx={right}>
          <DotField />
          <Box sx={formContainer}>
            <Box sx={formPanel}>
              <Box sx={header}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{ width: 72, height: 'auto', marginBottom: 16 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>
                  {LOGIN.LOGIN}
                </Typography>
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
                  onChange={(e) => handleFieldChange('identifier', e.target.value)}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  disabled={isSubmitting}
                  sx={textFieldStyles}
                />

                <TextField
                  fullWidth
                  placeholder={LOGIN.PASSWORD}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={fields.password}
                  autoComplete="current-password"
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isSubmitting}
                  sx={passwordTextFieldStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isSubmitting}
                          sx={passwordIconButtonStyles}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={submitButtonStyles}
                >
                  {isSubmitting ? (
                    <CircularProgress size={18} sx={submitProgressStyles} />
                  ) : (
                    LOGIN.SUBMIT
                  )}
                </Button>

                {/* removed register / forgot-password links to match product decision */}
              </Box>
            </Box>

            {authError && (
              <Alert severity="error" sx={alertStyles}>
                {authError}
              </Alert>
            )}
          </Box>

          <Box sx={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} Choferes de Alquiler
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
