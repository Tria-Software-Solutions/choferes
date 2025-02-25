import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/userService";
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
} from "@mui/material";
import logo from "../assets/images/logo.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await registerUser(firstName, lastName, email, username, password, 0);
      navigate("/");
    } catch (err) {
      setError("Error al registrar usuario");
      console.error("Error en registro", err);
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "linear-gradient(135deg, #1f1f1f 0%, #333333 100%)" }}
    >
      <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: 95, height: "auto" }}
            />
          </Box>
          <Typography
            variant={isSmallScreen ? "h4" : "h2"}
            align="center"
            sx={{ flexGrow: 1 }}
            gutterBottom
          >
            Registro
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Nombre"
              variant="outlined"
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Apellido"
              variant="outlined"
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Registrarse
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 2 }}>
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#1976d2",
                fontWeight: "bold",
              }}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
