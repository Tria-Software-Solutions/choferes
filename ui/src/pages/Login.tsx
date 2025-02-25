import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import logo from "../assets/images/logo.png";
import { PAGE_TITLE } from "../constants/constants";
import { useUsers } from "../hooks/useUser";

const Login = () => {
  const { handleLoginUser } = useUsers();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      handleLoginUser(username, password);
      navigate("/roles");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
      console.error("Error en login", err);
    }
  };

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
            <img src={logo} alt="Logo" style={{ width: 95, height: "auto" }} />
          </Box>
          <Typography
            variant={"h4"}
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
              Ingresar
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 6 }}>
            ¿Aún no tienes una cuenta?{" "}
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
