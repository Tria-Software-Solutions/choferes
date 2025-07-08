import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers, createUser } from "../../../store/slices/userSlice";
import { User } from "../../../models/User";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
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
  IconButton,
  InputAdornment,
  Fade,
  Divider,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import AUTH from "../../../constants/auth.constants";
import FORMS from "../../../constants/forms.constants";
import REGISTER_VALIDATION from "../../../constants/registerValidation.constants";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
  nameFieldsBoxStyles,
  textFieldStyles,
  emailTextFieldStyles,
  usernameTextFieldStyles,
  passwordTextFieldStyles,
  passwordIconButtonStyles,
  submitButtonStyles,
  submitProgressStyles,
  alertStyles,
  dividerSectionStyles,
  loginBoxStyles,
  loginTextStyles,
  loginLinkStyles,
} from "./styles";
import { validateName, validateEmail, validateUsername, validatePassword } from '../../../utils/userValidation';

// Register page component for user sign up
const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const [addFields, setAddFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Validates the registration form fields
  const validateFields = useCallback(async () => {
    const newErrors: { [key: string]: string } = {};
    newErrors.firstName = validateName(addFields.firstName);
    newErrors.lastName = validateName(addFields.lastName);
    newErrors.email = validateEmail(addFields.email);
    newErrors.username = validateUsername(addFields.username);
    newErrors.password = validatePassword(addFields.password);
    setFieldErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  }, [addFields]);

  // Handles the registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateFields();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const newUser: Omit<User, "id" | "temporalPassword" | "role"> = {
        firstName: addFields.firstName,
        lastName: addFields.lastName,
        email: addFields.email,
        username: addFields.username,
        password: addFields.password,
        isActive: true,
      };
      await dispatch(createUser({ newUser })).unwrap();
      showNotification(AUTH.REGISTER_SUCCESS, { severity: 'success', duration: 3000 });
      // Redirigir a login con usuario y contraseña
      navigate("/", { state: { username: addFields.username, password: addFields.password } });
      // Clear form after successful registration
      setAddFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
      });
    } catch (error) {
      setError(REGISTER_VALIDATION.REGISTER_ERROR);
      showNotification(AUTH.REGISTER_ERROR, { severity: 'error', duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checks if the email already exists
  const checkEmailExistence = useCallback(
    (email: string): User | undefined => {
      return users.find((user) => user.email === email);
    },
    [users],
  );

  // Handles email field blur event
  const handleEmailChange = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (!value) return;

    const emailExists = checkEmailExistence(value);
    if (emailExists) {
      setFieldErrors((prev) => ({
        ...prev,
        email: FORMS.EMAIL_EXISTS,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // Checks if the username already exists
  const checkUsernameExistence = useCallback(
    (username: string): User | undefined => {
      return users.find((user) => user.username === username);
    },
    [users],
  );

  // Handles username field blur event
  const handleUsernameChange = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (!value) return;

    const usernameExists = checkUsernameExistence(value);
    if (usernameExists) {
      setFieldErrors((prev) => ({
        ...prev,
        username: FORMS.USERNAME_EXISTS,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, username: "" }));
    }
  };

  // Toggles the password visibility
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handles changes in form fields and clears errors
  const handleFieldChange = (field: string, value: string) => {
    setAddFields({ ...addFields, [field]: value });
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
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
                {PAGE_TITLE.REGISTER}
              </Typography>
              <Divider sx={dividerStyles(theme)} />
              <Typography variant="body2" align="center" sx={descriptionStyles}>
                Completa el formulario para crear tu cuenta en el sistema
              </Typography>
            </Box>

            {/* Form Section */}
            <Box component="form" onSubmit={handleRegister} sx={formBoxStyles}>
              <Box sx={nameFieldsBoxStyles}>
                <TextField
                  fullWidth
                  label="Nombre"
                  variant="outlined"
                  value={addFields.firstName}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
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
                  label="Apellido"
                  variant="outlined"
                  value={addFields.lastName}
                  onChange={(e) =>
                    handleFieldChange("lastName", e.target.value)
                  }
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
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
              </Box>

              <TextField
                fullWidth
                label="Correo Electrónico"
                variant="outlined"
                value={addFields.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={handleEmailChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                disabled={isSubmitting}
                sx={emailTextFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "#666666" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Usuario"
                variant="outlined"
                value={addFields.username}
                autoComplete="username"
                onChange={(e) => handleFieldChange("username", e.target.value)}
                onBlur={handleUsernameChange}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
                disabled={isSubmitting}
                sx={usernameTextFieldStyles}
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
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={addFields.password}
                autoComplete="new-password"
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
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
                disabled={isSubmitting}
                sx={submitButtonStyles}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      size={24}
                      sx={submitProgressStyles}
                    />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in timeout={300}>
                <Alert severity="error" sx={alertStyles}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Divider */}
            <Divider sx={dividerSectionStyles} />

            {/* Login Link */}
            <Box sx={loginBoxStyles}>
              <Typography variant="body2" sx={loginTextStyles}>
                ¿Ya tienes una cuenta?
              </Typography>
              <Link
                to="/"
                style={loginLinkStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#333333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#000000";
                }}
              >
                Inicia sesión aquí
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Register;
