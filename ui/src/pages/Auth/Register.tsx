import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../../hooks/useUser";
import { User } from "../../models/User";
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
import logo from "../../assets/images/logo.png";
import { PAGE_TITLE } from "../../constants/constants";

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

  const validateFields = useCallback(() => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ.\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!nameRegex.test(addFields.firstName) || addFields.firstName === "") {
      setError("El primer nombre es inválido.");
      return false;
    }
    if (!nameRegex.test(addFields.lastName) || addFields.lastName === "") {
      setError("El apellido es inválido.");
      return false;
    }
    if (!emailRegex.test(addFields.email) || addFields.email === "") {
      setError("El email es inválido.");
      return false;
    }
    if (!usernameRegex.test(addFields.username) || addFields.username === "") {
      setError("El nombre de usuario es inválido.");
      return false;
    }
    if (!passwordRegex.test(addFields.password) || addFields.password === "") {
      setError("La contraseña es inválida.");
      return false;
    }

    setError(null);
    return true;
  }, [addFields]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateFields();
    if (!isValid) return;

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
    } catch (err) {
      setError("Error al registrar usuario");
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
            ¿Ya tienes una cuenta? {isSmallScreen ? <br /> : " "}
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
