import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { User } from "../models/User";

const Register = () => {
  const { users, handleRegisterUser } = useUsers();
  const [addFields, setAddFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !addFields.firstName ||
      !addFields.lastName ||
      !addFields.email ||
      !addFields.username ||
      !addFields.password
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const newUser: User = {
        id: Math.max(...users.map((user) => user.id)) + 1,
        firstName: addFields.firstName,
        lastName: addFields.lastName,
        email: addFields.email,
        username: addFields.username,
        password: addFields.password,
      };
      handleRegisterUser(newUser);
      navigate("/");
    } catch (err) {
      setError("Error al registrar usuario");
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
            {PAGE_TITLE.REGISTER}
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Nombre"
              variant="outlined"
              margin="normal"
              value={addFields.firstName}
              onChange={(e) =>
                setAddFields({ ...addFields, firstName: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Apellido"
              variant="outlined"
              margin="normal"
              value={addFields.lastName}
              onChange={(e) =>
                setAddFields({ ...addFields, lastName: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              value={addFields.email}
              onChange={(e) =>
                setAddFields({ ...addFields, email: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              margin="normal"
              value={addFields.username}
              onChange={(e) =>
                setAddFields({ ...addFields, username: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              margin="normal"
              value={addFields.password}
              onChange={(e) =>
                setAddFields({ ...addFields, password: e.target.value })
              }
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
              Registrarse
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 6 }}>
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
