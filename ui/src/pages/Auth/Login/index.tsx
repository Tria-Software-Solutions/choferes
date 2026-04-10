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
} from "@mui/material";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import FORMS from "../../../constants/forms.constants";
import LOGIN from "../../../constants/login.constants";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
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
  const [serverReady, setServerReady] = useState(false);
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

  return (
    <Box className="auth-page" sx={authPageBoxStyles}>
      <Fade in timeout={800}>
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
                label={LOGIN.IDENTIFIER_LABEL}
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
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color: "#666666" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label={LOGIN.PASSWORD_LABEL}
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
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#666666" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
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
                style={registerLinkStyles}
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
