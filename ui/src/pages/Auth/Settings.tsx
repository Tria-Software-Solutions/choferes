import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../hooks/useUser";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import { PAGE_TITLE } from "../../constants/constants";
import SettingsIcon from "@mui/icons-material/Settings";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { User } from "../../models/User";

const Settings = () => {
  const { currentUser } = useAuth();
  const { getUsers, updateUser, updateUserPassword } = useUsers();
  const { showNotification } = useAppNotifications();
  const [editFields, setEditFields] = useState({
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    email: currentUser?.email,
    username: currentUser?.username,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      username: /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    const isValid =
      fields.firstName !== undefined &&
      regex.text.test(fields.firstName) &&
      fields.lastName !== undefined &&
      regex.text.test(fields.lastName) &&
      fields.email !== undefined &&
      regex.email.test(fields.email) &&
      fields.username !== undefined &&
      regex.username.test(fields.username);

    return isValid;
  }, []);

  const validateNewPasswordFields = useCallback(async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (newPassword === "" || confirmNewPassword === "") {
      setPasswordError("Los espacios son requeridos.");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return false;
    }
    if (
      !passwordRegex.test(newPassword) ||
      !passwordRegex.test(confirmNewPassword)
    ) {
      setPasswordError(
        "El valor es inválido.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial"
      );
      return false;
    }

    setPasswordError(null);
    return true;
  }, [newPassword, confirmNewPassword]);

  useEffect(() => {
    setIsEditFormValid(validateFields(editFields));
  }, [editFields, validateFields]);

  const handleSaveChanges = async () => {
    try {
      const updatedUser: Partial<User> = {
        ...editFields,
      };
      if (currentUser) {
        await updateUser(currentUser.id, updatedUser);
      } else {
        throw new Error("Current User is null");
      }
      await getUsers();
      showNotification(
        "La actualización de lo datos fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar los datos",
        "error",
        5000,
        false
      );
    }
  };

  const handleNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setConfirmNewPassword(event.target.value);
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword((prev) => !prev);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateNewPasswordFields();
    if (!isValid) return;

    try {
      if (currentUser) {
        await updateUserPassword(currentUser.id, newPassword);
      } else {
        throw new Error("Current User is null");
      }
      setNewPassword("");
      setConfirmNewPassword("");
      showNotification(
        "La actualización de la contraseña fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar la contraseña",
        "error",
        5000,
        false
      );
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 5 }}
      >
        <Box display="flex" alignItems="center">
          <SettingsIcon fontSize={isSmallScreen ? "small" : "large"} />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h2"}
              sx={{ flexGrow: 1 }}
            >
              {PAGE_TITLE.SETTINGS}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Información Personal
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Modifica tu información personal y correo electrónico.
          </Typography>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Nombre"
              value={editFields.firstName}
              onChange={(e) =>
                setEditFields({
                  ...editFields,
                  firstName: e.target.value,
                })
              }
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Apellido"
              value={editFields.lastName}
              onChange={(e) =>
                setEditFields({
                  ...editFields,
                  lastName: e.target.value,
                })
              }
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Correo Electrónico"
              type="email"
              value={editFields.email}
              onChange={(e) =>
                setEditFields({
                  ...editFields,
                  email: e.target.value,
                })
              }
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Usuario"
              value={editFields.username}
              onChange={(e) =>
                setEditFields({
                  ...editFields,
                  username: e.target.value,
                })
              }
              fullWidth
              margin="dense"
            />
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Box>
              <Button
                variant="contained"
                color="error"
                sx={{ flex: 2, height: "56px" }}
                onClick={handleSaveChanges}
                disabled={!isEditFormValid}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={1}
          display="flex"
          justifyContent="center"
          alignItems="stretch"
        >
          <Divider orientation="vertical" flexItem />
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Cambiar Contraseña
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Ingresa una nueva contraseña para tu cuenta.
          </Typography>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Nueva Contraseña"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => handleNewPassword(e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleNewPassword} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Confirmar Contraseña"
              type={showConfirmNewPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => handleConfirmNewPassword(e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmNewPassword}
                      edge="end"
                    >
                      {showConfirmNewPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
              margin="dense"
            />
          </Grid>
          {passwordError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {passwordError}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Box>
              <Button
                variant="contained"
                color="error"
                sx={{ flex: 2, height: "56px" }}
                onClick={(e) => handleChangePassword(e)}
              >
                Cambiar Contraseña
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
