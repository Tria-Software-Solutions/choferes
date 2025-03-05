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
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../../assets/images/logo.png";
import { PAGE_TITLE } from "../../constants/constants";

const Register = () => {
  const { createUser, getUserByUsername } = useUsers();
  const [addFields, setAddFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFields = useCallback(async () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ.\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (addFields.firstName === "") {
      setError("El nombre es requerido.");
      return false;
    }
    if (!nameRegex.test(addFields.firstName)) {
      setError("El nombre es inválido.");
      return false;
    }
    if (addFields.lastName === "") {
      setError("El apellido es requerido.");
      return false;
    }
    if (!nameRegex.test(addFields.lastName)) {
      setError("El apellido es inválido.");
      return false;
    }
    if (addFields.email === "") {
      setError("El correo electrónico es requerido.");
      return false;
    }
    if (!emailRegex.test(addFields.email)) {
      setError("El correo electrónico es inválido.");
      return false;
    }
    if (addFields.username === "") {
      setError("El usuario es requerido.");
      return false;
    }
    if (!usernameRegex.test(addFields.username)) {
      setError(
        "El usuario es inválido.\n\n- Solo letras, números, guiones y puntos.\n- Debe comenzar con una letra.\n- Longitud de 3 a 20 caracteres."
      );
      return false;
    }
    if (addFields.password === "") {
      setError("La contraseña es requerida.");
      return false;
    }
    if (!passwordRegex.test(addFields.password)) {
      setError(
        "La contraseña es inválida.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial"
      );
      return false;
    }

    setError(null);
    return true;
  }, [addFields]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateFields();
    if (!isValid) return;

    try {
      const newUser: Omit<User, "id" | "Roles" | "roleName"> = {
        firstName: addFields.firstName,
        lastName: addFields.lastName,
        email: addFields.email,
        username: addFields.username,
        password: addFields.password,
      };
      createUser(newUser);
    } catch (err) {
      setError("Error al registrar usuario");
    }
  };

  const checkUsernameExistence = async (
    username: string
  ): Promise<User | undefined> => {
    return await getUserByUsername(username);
  };

  const handleUsernameChange = async (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.trim();
    if (!value) return;

    const usernameExists = await checkUsernameExistence(value);
    if (usernameExists) {
      setError("El nombre de usuario ya existe.");
    } else {
      setError(null);
    }
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
              onBlur={handleUsernameChange}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={addFields.password}
              onChange={(e) =>
                setAddFields({ ...addFields, password: e.target.value })
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
              Registrarse
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ whiteSpace: "pre-line", mt: 2 }}>
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
