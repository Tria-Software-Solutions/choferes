import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchUsers,
  updateUser,
  updateUserPassword,
} from "../../store/slices/userSlice";
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

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, setUser } = useAuthContext();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const [editFields, setEditFields] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    username: currentUser?.username || "",
  });
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [isPasswordFormValid, setIsPasswordFormValid] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const validateFields = useCallback(async (fields: typeof editFields) => {
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

  const validatePasswordFields = useCallback(
    async (fields: typeof passwordFields) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (fields.newPassword === "" || fields.confirmNewPassword === "") {
        setPasswordError("Los espacios son requeridos.");
        return false;
      }
      if (fields.newPassword !== fields.confirmNewPassword) {
        setPasswordError("Las contraseñas no coinciden.");
        return false;
      }
      if (
        !passwordRegex.test(fields.newPassword) ||
        !passwordRegex.test(fields.confirmNewPassword)
      ) {
        setPasswordError(
          "El valor es inválido.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial"
        );
        return false;
      }

      setPasswordError(null);
      return true;
    },
    []
  );

  useEffect(() => {
    const hasChanges =
      editFields.firstName !== currentUser?.firstName ||
      editFields.lastName !== currentUser?.lastName ||
      editFields.email !== currentUser?.email ||
      editFields.username !== currentUser?.username;

    (async () => {
      const isValid = await validateFields(editFields);
      setIsEditFormValid(isValid && hasChanges);
    })();
  }, [editFields, currentUser, validateFields]);

  useEffect(() => {
    const hasPasswordChange =
      passwordFields.newPassword.trim() !== "" ||
      passwordFields.confirmNewPassword.trim() !== "";
    setIsPasswordFormValid(hasPasswordChange);
  }, [passwordFields]);

  const getUserByEmail = async (email: string): Promise<User | undefined> => {
    return users.find((user) => user.email === email);
  };

  const handleEmailChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value.trim();
    if (!value) return;

    const user = await getUserByEmail(value);
    if (user && user.username !== editFields.username) {
      setInfoError("El correo electrónico ya existe.");
    } else {
      setInfoError(null);
    }
  };

  const getUserByUsername = async (
    username: string
  ): Promise<User | undefined> => {
    return users.find((user) => user.username === username);
  };

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value.trim();
    if (!value) return;

    const user = await getUserByUsername(value);
    if (user && user.email !== editFields.email) {
      setInfoError("El nombre de usuario ya existe.");
    } else {
      setInfoError(null);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedUser: Partial<User> = {
        ...editFields,
      };
      if (currentUser) {
        dispatch(updateUser({ id: currentUser.id, updatedUser }));
        setUser({
          id: currentUser.id,
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          email: updatedUser.email || "",
          username: updatedUser.username || "",
          password: updatedUser.password || "",
          isActive: updatedUser.isActive || false,
        });
      } else {
        throw new Error("Current User is null");
      }
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: e.target.value,
    });
  };

  const handleConfirmNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      confirmNewPassword: e.target.value,
    });
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword((prev) => !prev);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validatePasswordFields(passwordFields);
    if (!isValid) return;

    try {
      if (currentUser) {
        dispatch(
          updateUserPassword({
            id: currentUser.id,
            password: passwordFields.newPassword,
          })
        );
      } else {
        throw new Error("Current User is null");
      }
      setPasswordFields({
        newPassword: "",
        confirmNewPassword: "",
      });
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
              onChange={(e) => {
                setEditFields({
                  ...editFields,
                  email: e.target.value,
                });
                handleEmailChange(e);
              }}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{ mb: 3 }}>
            <TextField
              label="Usuario"
              value={editFields.username}
              onChange={(e) => {
                setEditFields({
                  ...editFields,
                  username: e.target.value,
                });
                handleUsernameChange(e);
              }}
              fullWidth
              margin="dense"
            />
          </Grid>
          {infoError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {infoError}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Box>
              <Button
                variant="contained"
                color="error"
                sx={{ flex: 2, height: "56px" }}
                onClick={handleSaveChanges}
                disabled={!isEditFormValid || !!infoError}
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
              value={passwordFields.newPassword}
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
              value={passwordFields.confirmNewPassword}
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
                disabled={!isPasswordFormValid}
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
