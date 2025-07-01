import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
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
import { PAGE_TITLE, FORMS } from "../../constants/constants";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import logo from "../../assets/images/logo.png";

const Login: React.FC = () => {
  const { authenticateUser, authError } = useAuth();
  const [fields, setFields] = useState({
    identifier: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
    } catch (error: unknown) {
      // Eliminar la línea con console.error en la línea 67
    }

    setIsSubmitting(false);
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFields({ ...fields, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
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
            width: { xs: "100%", sm: 450, md: 500 },
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
                {PAGE_TITLE.LOGIN}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: "#666666",
                  maxWidth: 300,
                }}
              >
                {FORMS.LOGIN_DESCRIPTION}
              </Typography>
            </Box>

            {/* Form Section */}
            <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
              <TextField
                fullWidth
                label="Correo Electrónico o Usuario"
                variant="outlined"
                value={fields.identifier}
                autoComplete="username"
                onChange={(e) =>
                  handleFieldChange("identifier", e.target.value)
                }
                error={!!errors.identifier}
                helperText={errors.identifier}
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
                value={fields.password}
                autoComplete="current-password"
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
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
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </Box>

            {/* Error Alert */}
            {authError && (
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
                  {authError}
                </Alert>
              </Fade>
            )}

            {/* Divider */}
            <Divider sx={{ my: 3, opacity: 0.6 }} />

            {/* Register Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  mb: 1,
                }}
              >
                ¿Aún no tienes una cuenta?
              </Typography>
              <Link
                to="/register"
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
                Regístrate aquí
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login;
