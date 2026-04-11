import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { wakeUpServer } from "../../../services/serverWakeUpService";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  InputAdornment,
  Fade,
  Divider,
  keyframes,
} from "@mui/material";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import FORMS from "../../../constants/forms.constants";
import LOGIN from "../../../constants/login.constants";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import logo from "../../../assets/images/logo.png";
import "@fontsource/urbanist";
import {
  authPageBoxStyles,
  authCardStyles,
  cardContentStyles,
  logoBoxStyles,
  logoImgStyles,
  titleStyles,
  dividerStyles,
  descriptionStyles,
  formBoxStyles,
  textFieldStyles,
  passwordTextFieldStyles,
  passwordIconButtonStyles,
  submitButtonStyles,
  submitProgressStyles,
  alertStyles,
  dividerSectionStyles,
  registerBoxStyles,
  registerTextStyles,
  registerLinkStyles,
} from "./styles";

// Login page component for user authentication
const Login: React.FC = () => {
  const location = useLocation();
  const { authenticateUser, authError } = useAuth();
  const [fields, setFields] = useState({
    identifier: location.state?.username || "",
    password: location.state?.password || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [, setServerReady] = useState(false);
  const wakeUpAttempted = useRef(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Wake up server on page load (handles Render free tier cold start)
  useEffect(() => {
    if (wakeUpAttempted.current) return;
    wakeUpAttempted.current = true;

    setIsWakingUp(true);
    wakeUpServer().then(() => {
      setServerReady(true);
      setIsWakingUp(false);
    });
  }, []);

  // Validates the login form fields
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

  // Handles the login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) return;

    setIsSubmitting(true);

    try {
      await authenticateUser(fields.identifier, fields.password);
    } catch (error: unknown) {}

    setIsSubmitting(false);
  };

  // Toggles the password visibility
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handles changes in form fields and clears errors
  const handleFieldChange = (field: string, value: string) => {
    setFields({ ...fields, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Floating animation keyframes
  const float1 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  `;
  const float2 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 30px) scale(0.95); }
    66% { transform: translate(30px, -20px) scale(1.05); }
  `;
  const float3 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, 40px) scale(1.1); }
  `;

  return (
    <Box className="auth-page" sx={authPageBoxStyles}>
      {/* Floating decorative orbs */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: theme.palette.mode === "dark"
            ? "radial-gradient(circle, rgba(120,119,198,0.4) 0%, rgba(120,119,198,0) 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)",
          filter: "blur(40px)",
          top: "10%",
          left: "10%",
          animation: `${float1} 15s ease-in-out infinite`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: theme.palette.mode === "dark"
            ? "radial-gradient(circle, rgba(255,119,198,0.25) 0%, rgba(255,119,198,0) 70%)"
            : "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)",
          filter: "blur(50px)",
          bottom: "5%",
          right: "15%",
          animation: `${float2} 18s ease-in-out infinite`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: theme.palette.mode === "dark"
            ? "radial-gradient(circle, rgba(120,219,255,0.3) 0%, rgba(120,219,255,0) 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)",
          filter: "blur(30px)",
          top: "50%",
          right: "5%",
          animation: `${float3} 12s ease-in-out infinite`,
          zIndex: 0,
        }}
      />
      <Fade in timeout={1000}>
        <Card className="auth-card" sx={authCardStyles}>
          <CardContent sx={cardContentStyles}>
            {/* Logo and Title Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box sx={logoBoxStyles}>
                <img src={logo} alt="Logo" style={logoImgStyles} />
              </Box>
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                align="center"
                sx={titleStyles(isSmallScreen)}
              >
                {PAGE_TITLE.LOGIN}
              </Typography>
              <Divider sx={dividerStyles(theme)} />
              <Typography variant="body2" align="center" sx={descriptionStyles}>
                {FORMS.LOGIN_DESCRIPTION}
              </Typography>
            </Box>

            {/* Form Section */}
            <Box component="form" onSubmit={handleLogin} sx={formBoxStyles}>
              <TextField
                fullWidth
                placeholder="Correo o usuario"
                variant="outlined"
                value={fields.identifier}
                autoComplete="username"
                onChange={(e) =>
                  handleFieldChange("identifier", e.target.value)
                }
                error={!!errors.identifier}
                helperText={errors.identifier}
                disabled={isSubmitting}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ position: 'absolute', left: '14px', zIndex: 2 }}>
                      <User size={20} color="#666666" />
                    </InputAdornment>
                  ),
                }}
                              />

              <TextField
                fullWidth
                placeholder="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={fields.password}
                autoComplete="current-password"
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                sx={passwordTextFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ position: 'absolute', left: '14px', zIndex: 2 }}>
                      <Lock size={20} color="#666666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ position: 'absolute', right: '8px', zIndex: 2 }}>
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={isSubmitting}
                        sx={passwordIconButtonStyles}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || isWakingUp}
                sx={submitButtonStyles}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      size={24}
                      sx={submitProgressStyles}
                    />
                    {LOGIN.LOADING}
                  </>
                ) : (
                  LOGIN.SUBMIT
                )}
              </Button>
            </Box>

            {/* Server waking up info */}
            {isWakingUp && (
              <Fade in timeout={300}>
                <Alert severity="info" sx={alertStyles} icon={<CircularProgress size={20} />}>
                  Despertando servidor... (esto puede tomar hasta un minuto en el plan gratuito)
                </Alert>
              </Fade>
            )}

            {/* Error Alert */}
            {authError && (
              <Fade in timeout={300}>
                <Alert severity="error" sx={alertStyles}>
                  {authError}
                </Alert>
              </Fade>
            )}

            {/* Divider */}
            <Divider sx={dividerSectionStyles} />

            {/* Register Link */}
            <Box sx={registerBoxStyles}>
              <Typography variant="body2" sx={registerTextStyles}>
                {LOGIN.NO_ACCOUNT}
              </Typography>
              <Link
                to="/register"
                style={{
                  ...registerLinkStyles,
                  color: theme.palette.text.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {LOGIN.REGISTER_LINK}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login;
