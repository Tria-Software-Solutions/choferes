import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  TextField, Button, Typography, Box, Alert, CircularProgress, IconButton,
  InputAdornment, Checkbox, FormControlLabel,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  Visibility, VisibilityOff, MailOutline, Lock, ArrowBack, CheckCircleOutline,
} from '@mui/icons-material';
import FORMS from '../../../constants/forms.constants';
import LOGIN from '../../../constants/login.constants';
import bg from '../../../assets/images/background.jpeg';
import logo from '../../../assets/images/logo.png';

import {
  wrapper,
  split,
  right,
  formContainer,
  form,
  loginTextFieldStyles,
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
  inputShakeStyles,
  errorBannerStyles,
  submitGlowStyles,
  forgotSuccessStyles,
  loginSubmitButtonStyles,
  loginPasswordIconButtonStyles,
} from './styles';
import {
  submitProgressStyles,
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
  const [shakeKey, setShakeKey] = useState(0);

  // Recuperación de contraseña
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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
    if (!validateFields()) {
      setShakeKey(k => k + 1); // Re-dispara la animación shake de los inputs inválidos
      return;
    }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotEmail.trim();
    if (!email) {
      setForgotError(LOGIN.FORGOT_EMAIL_REQUIRED);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotError(LOGIN.FORGOT_INVALID_EMAIL);
      return;
    }
    setForgotError('');
    setForgotSubmitting(true);
    try {
      // TODO: conectar con el endpoint de recuperación cuando exista en el backend.
      // Por ahora se simula el envío (mensaje genérico para no revelar usuarios registrados).
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setForgotSent(true);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <Box sx={wrapper}>
      <Box sx={split}>
        {/* Full-bleed background image covering the whole page (incl. mobile) */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: {
              xs: 'center',
              md: '65% center',
              lg: 'center',
            },
            backgroundRepeat: 'no-repeat',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              pointerEvents: 'none',
            },
          }}
        />
        <Box sx={right}>
          <Box sx={formContainer}>
            {view === 'login' ? (
              <Box sx={{ ...(mounted ? animateStagger(0) : {}) }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2.5,
                    }}
                  >
                    <Box
                      component="img"
                      src={logo}
                      alt="Logo"
                      sx={{
                        width: 32,
                        height: 'auto',
                        flexShrink: 0,
                        mr: 2,
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        lineHeight: 1.1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '1.4rem', sm: '1.5rem' },
                          letterSpacing: '0.04em',
                          color: '#ffffff',
                        }}
                      >
                        Choferes
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.68rem', sm: '0.75rem' },
                          color: 'rgba(255,255,255,0.6)',
                          mt: -0.25,
                          letterSpacing: { xs: '0.22em', sm: '0.3em' },
                        }}
                      >
                        DE ALQUILER
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      width: '100%',
                    }}
                  >
                    Toda tu flota de choferes en un solo lugar.
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleLogin} sx={{ ...form, gap: { xs: 1.5, sm: 2 } }}>
                  <Box sx={mounted ? animateStagger(100) : {}}>
                  <Box
                    key={`identifier-${shakeKey}`}
                    sx={errors.identifier ? inputShakeStyles : {}}
                  >
                    <TextField
                      fullWidth
                      placeholder={LOGIN.EMAIL_OR_USERNAME}
                      variant="outlined"
                      value={fields.identifier}
                      autoComplete="username"
                      autoFocus
                      onChange={(e) => handleFieldChange('identifier', e.target.value)}
                      error={!!errors.identifier}
                      helperText={errors.identifier}
                      disabled={isSubmitting}
                      sx={loginTextFieldStyles}
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
                  </Box>

                  <Box sx={mounted ? animateStagger(200) : {}}>
                  <Box
                    key={`password-${shakeKey}`}
                    sx={errors.password ? inputShakeStyles : {}}
                  >
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
                      sx={loginTextFieldStyles}
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
                                sx={loginPasswordIconButtonStyles}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
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
                      sx={isSubmitting
                        ? ([loginSubmitButtonStyles, submitGlowStyles] as SxProps<Theme>)
                        : loginSubmitButtonStyles}
                    >
                      {isSubmitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={18} sx={submitProgressStyles} />
                          {LOGIN.LOADING}
                        </Box>
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
                    <Alert severity="error" sx={errorBannerStyles}>
                      {authError}
                    </Alert>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    Acceso exclusivo para personal autorizado
                  </Typography>
                </Box>
              </Box>
            ) : forgotSent ? (
              <Box sx={{ ...(mounted ? animateStagger(0) : {}) }}>
                <Box sx={forgotSuccessStyles}>
                  <CheckCircleOutline />
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.2, mb: 0.5 }}>
                    {LOGIN.FORGOT_SENT_TITLE}
                  </Typography>
                  <Typography variant="body2">
                    {LOGIN.FORGOT_SENT_DESC}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={loginSubmitButtonStyles}
                    onClick={() => {
                      setForgotSent(false);
                      setForgotEmail('');
                      setView('login');
                    }}
                  >
                    {LOGIN.BACK_TO_LOGIN}
                  </Button>
                </Box>
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

                <Box component="form" onSubmit={handleForgotPassword} sx={form}>
                  <Box sx={mounted ? animateStagger(100) : {}}>
                    <TextField
                      fullWidth
                      placeholder={LOGIN.EMAIL_PLACEHOLDER}
                      variant="outlined"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError('');
                      }}
                      error={!!forgotError}
                      helperText={forgotError}
                      disabled={forgotSubmitting}
                      autoFocus
                      sx={loginTextFieldStyles}
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
                      disabled={forgotSubmitting}
                      sx={forgotSubmitting
                        ? ([loginSubmitButtonStyles, submitGlowStyles] as SxProps<Theme>)
                        : loginSubmitButtonStyles}
                    >
                      {forgotSubmitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={18} sx={submitProgressStyles} />
                          {LOGIN.FORGOT_SENDING}
                        </Box>
                      ) : (
                        LOGIN.SEND_RESET_LINK
                      )}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
