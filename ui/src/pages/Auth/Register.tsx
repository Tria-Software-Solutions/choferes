import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchUsers, createUser } from "../../store/slices/userSlice";
import { User } from "../../models/User";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
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
import { PAGE_TITLE, AUTH, FORMS, REGISTER_VALIDATION } from "../../constants/constants";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logo from "../../assets/images/logo.png";

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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const validateFields = useCallback(async () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ.\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const newErrors: { [key: string]: string } = {};

    if (addFields.firstName === "") {
      newErrors.firstName = FORMS.FIRST_NAME_REQUIRED;
    } else if (!nameRegex.test(addFields.firstName)) {
      newErrors.firstName = REGISTER_VALIDATION.FIRST_NAME_INVALID;
    }

    if (addFields.lastName === "") {
      newErrors.lastName = FORMS.LAST_NAME_REQUIRED;
    } else if (!nameRegex.test(addFields.lastName)) {
      newErrors.lastName = REGISTER_VALIDATION.LAST_NAME_INVALID;
    }

    if (addFields.email === "") {
      newErrors.email = FORMS.EMAIL_REQUIRED;
    } else if (!emailRegex.test(addFields.email)) {
      newErrors.email = FORMS.EMAIL_INVALID;
    }

    if (addFields.username === "") {
      newErrors.username = FORMS.USERNAME_REQUIRED;
    } else if (!usernameRegex.test(addFields.username)) {
      newErrors.username = REGISTER_VALIDATION.USERNAME_INVALID;
    }

    if (addFields.password === "") {
      newErrors.password = FORMS.PASSWORD_REQUIRED;
    } else if (!passwordRegex.test(addFields.password)) {
      newErrors.password = REGISTER_VALIDATION.PASSWORD_INVALID;
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [addFields]);

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
      showNotification(AUTH.REGISTER_SUCCESS, 3000, false);
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
      showNotification(
        AUTH.REGISTER_ERROR,
        5000,
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkEmailExistence = useCallback(
    (email: string): User | undefined => {
      return users.find((user) => user.email === email);
    },
    [users],
  );

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

  const checkUsernameExistence = useCallback(
    (username: string): User | undefined => {
      return users.find((user) => user.username === username);
    },
    [users],
  );

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

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFieldChange = (field: string, value: string) => {
    setAddFields({ ...addFields, [field]: value });
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Box
      className="auth-page"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, sm: 4 },
        minHeight: "100vh",
      }}
    >
      <Fade in timeout={800}>
        <Card
          className="auth-card"
          sx={{
            width: { xs: "100%", sm: 500, md: 600 },
            maxWidth: "100%",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo and Title Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #000000 0%, #333333 100%)",
                  mb: 2,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: 50,
                    height: "auto",
                  }}
                />
              </Box>
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  mb: 1,
                  fontFamily: "'Protest Guerrilla', sans-serif",
                }}
              >
                {PAGE_TITLE.REGISTER}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: "#666666",
                  maxWidth: 400,
                }}
              >
                Completa el formulario para crear tu cuenta en el sistema
              </Typography>
            </Box>

            {/* Form Section */}
            <Box
              component="form"
              onSubmit={handleRegister}
              sx={{ width: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mb: 2,
                }}
              >
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                        borderWidth: 2,
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                      },
                    },
                  }}
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                        borderWidth: 2,
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                      },
                    },
                  }}
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
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                      borderWidth: 2,
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#ffffff",
                    },
                  },
                }}
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
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                      borderWidth: 2,
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#ffffff",
                    },
                  },
                }}
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
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                      borderWidth: 2,
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#ffffff",
                    },
                  },
                }}
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
                        sx={{
                          color: "#666666",
                          "&:hover": {
                            color: "#000000",
                          },
                        }}
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
                sx={{
                  minHeight: 56,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #000000 0%, #333333 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #333333 0%, #000000 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  },
                  "&:disabled": {
                    background: "#bdbdbd",
                    transform: "none",
                    boxShadow: "none",
                  },
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      size={24}
                      sx={{ mr: 1 }}
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
                <Alert
                  severity="error"
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    "& .MuiAlert-icon": {
                      alignItems: "center",
                    },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Divider */}
            <Divider sx={{ my: 3, opacity: 0.6 }} />

            {/* Login Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  mb: 1,
                }}
              >
                ¿Ya tienes una cuenta?
              </Typography>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "#000000",
                  fontWeight: 600,
                  transition: "color 0.3s ease",
                }}
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
