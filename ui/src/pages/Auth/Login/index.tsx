import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  TextField, Button, Typography, Box, Alert, CircularProgress, IconButton,
  InputAdornment, Checkbox, FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, MailOutline, Lock, ArrowBack } from '@mui/icons-material';
import FORMS from '../../../constants/forms.constants';
import LOGIN from '../../../constants/login.constants';
import bg from '../../../assets/images/background.jpeg';
import logo from '../../../assets/images/logo.png';

import {
  wrapper,
  split,
  left,
  right,
  formContainer,
  header,
  form,
  inputIconStyles,
  optionsRow,
  checkboxStyles,
  forgotLinkStyles,
  animateStagger,
  slideDown,
  shake,
  forgotHeader,
  forgotDescription,
  backLinkStyles,
  poweredByStyles,
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
  const [view, setView] = useState<'login' | 'forgotPassword'>('login');
  const [fields, setFields] = useState({
    identifier: location.state?.username || '',
    password: location.state?.password || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const saved = localStorage.getItem('rememberedUser');
    if (saved) {
      setFields(prev => ({ ...prev, identifier: saved }));
      setRememberMe(true);
    }
  }, []);

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
      if (rememberMe) {
        localStorage.setItem('rememberedUser', fields.identifier);
      } else {
        localStorage.removeItem('rememberedUser');
      }
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
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                pointerEvents: 'none',
              },
            }}
          />
          <Box sx={{ width: '100%', zIndex: 2, pb: { xs: 5, md: 8 }, px: { xs: 4, md: 8 }, mt: 'auto' }}>
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.15rem' },
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'inherit',
                opacity: 0.7,
                mb: 0.25,
              }}
            >
              Gestión de
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ width: { xs: 40, md: 48 }, height: 'auto', flexShrink: 0 }}
              />
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.25rem', md: '3.25rem' },
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                  color: 'inherit',
                }}
              >
                Choferes
              </Typography>
            </Box>
            <Box
              sx={{ width: 48, height: 3, borderRadius: 2, bgcolor: 'primary.main', mb: 3 }}
            />
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 400,
                opacity: 0.65,
                lineHeight: 1.7,
                maxWidth: 440,
                color: 'inherit',
              }}
            >
              {LOGIN.FLEET_MANAGEMENT} {LOGIN.ACCESS_RESTRICTED}
            </Typography>
          </Box>
        </Box>

        <Box sx={right}>
          <Box sx={formContainer}>
            {view === 'login' ? (
              <Box sx={{ ...(mounted ? animateStagger(0) : {}) }}>
                <Box sx={header}>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.2, mb: 0.5 }}>
                    {LOGIN.LOGIN}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Accede a tu panel de control
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleLogin} sx={form}>
                  <Box sx={mounted ? animateStagger(100) : {}}>
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
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline sx={inputIconStyles} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={mounted ? animateStagger(200) : {}}>
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
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={inputIconStyles} />
                            </InputAdornment>
                          ),
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
                        },
                      }}
                    />
                  </Box>

                  <Box sx={mounted ? animateStagger(300) : {}}>
                    <Box sx={optionsRow}>
                      <FormControlLabel
                        control={<Checkbox size="small" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                        label="Recordarme"
                        sx={checkboxStyles}
                      />
                      <Typography
                        sx={forgotLinkStyles}
                        onClick={() => setView('forgotPassword')}
                      >
                        ¿Olvidaste tu contraseña?
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={mounted ? animateStagger(400) : {}}>
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
                  </Box>
                </Box>

                {authError && (
                  <Box
                    sx={{
                      animation: `${slideDown} 0.4s ease-out, ${shake} 0.5s ease-out 0.4s`,
                    }}
                  >
                    <Alert severity="error" sx={alertStyles}>
                      {authError}
                    </Alert>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ ...(mounted ? animateStagger(0) : {}) }}>
                <Box sx={forgotHeader}>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.2, mb: 0.5 }}>
                    {LOGIN.FORGOT_PASSWORD_TITLE}
                  </Typography>
                  <Typography variant="body2" sx={forgotDescription}>
                    {LOGIN.FORGOT_PASSWORD_DESC}
                  </Typography>
                </Box>

                <Box component="form" onSubmit={(e) => e.preventDefault()} sx={form}>
                  <Box sx={mounted ? animateStagger(100) : {}}>
                    <TextField
                      fullWidth
                      placeholder={LOGIN.EMAIL_OR_USERNAME}
                      variant="outlined"
                      autoComplete="email"
                      sx={textFieldStyles}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline sx={inputIconStyles} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={mounted ? animateStagger(200) : {}}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={submitButtonStyles}
                    >
                      {LOGIN.SEND_RESET_LINK}
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={backLinkStyles}
                  onClick={() => setView('login')}
                >
                  <ArrowBack sx={{ fontSize: '0.9rem' }} />
                  {LOGIN.BACK_TO_LOGIN}
                </Box>
              </Box>
            )}

            <Typography
              variant="caption"
              sx={poweredByStyles}
            >
              Powered by{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.85 },
                }}
                onClick={() => window.open('https://triacr.com', '_blank', 'noopener noreferrer')}
              >
                Tria
              </Box>
              <Box component="span" sx={{ opacity: 0.4, px: 0.5 }}>·</Box>
              &copy; {new Date().getFullYear()} Choferes de Alquiler
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
