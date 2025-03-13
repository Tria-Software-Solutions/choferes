import { useState } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../../hooks/useUser";
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
} from "@mui/material";
import { PAGE_TITLE } from "../../constants/constants";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../../assets/images/logo.png";
import { AxiosError } from "axios";

const Login = () => {
  const { authenticateUser } = useUsers();
  const [fields, setFields] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await authenticateUser(fields.username, fields.password);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          setError("Usuario o contraseña incorrectos.");
        } else {
          setError("Ocurrió un error con la autenticación. Intenta más tarde.");
        }
      } else if (error instanceof Error) {
        setError("No se pudo conectar al servidor. Intenta más tarde.");
      } else {
        setError("Ocurrió un error desconocido. Intenta más tarde.");
      }
    }

    setIsSubmitting(false);
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" mb={2}>
            <img src={logo} alt="Logo" style={{ width: 95, height: "auto" }} />
          </Box>
          <Typography
            variant={isSmallScreen ? "h6" : "h2"}
            align="center"
            sx={{ flexGrow: 1 }}
            gutterBottom
          >
            {PAGE_TITLE.LOGIN}
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              margin="normal"
              value={fields.username}
              autoComplete="username"
              onChange={(e) =>
                setFields({ ...fields, username: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={fields.password}
              autoComplete="password"
              onChange={(e) =>
                setFields({ ...fields, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
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
              color="primary"
              sx={{
                mt: 2,
                minHeight: 56,
                display: "flex",
                justifyContent: "center",
                lineHeight: "normal",
              }}
            >
              {isSubmitting ? (
                <CircularProgress
                  color="inherit"
                  size={24}
                  sx={{ marginRight: 2 }}
                />
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 6 }}>
            ¿Aún no tienes una cuenta?
            {isSmallScreen ? <br /> : " "}
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "#1976d2",
                fontWeight: "bold",
              }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
