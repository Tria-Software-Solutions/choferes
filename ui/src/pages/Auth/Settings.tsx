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
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import { PAGE_TITLE } from "../../constants/constants";
import SettingsIcon from "@mui/icons-material/Settings";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { User } from "../../models/User";
import {
  validateName,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from "../../utils/userValidation";
import CustomTextField from "../../components/Textfield/CustomTextField";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "username":
        return validateUsername(value);
      default:
        return "";
    }
  }, []);

  const validatePasswordFields = useCallback(
    (fields: typeof passwordFields) => {
      const passError = validatePassword(fields.newPassword);
      const matchError = validatePasswordMatch(
        fields.newPassword,
        fields.confirmNewPassword,
      );
      if (passError) {
        setPasswordError(passError);
        return false;
      }
      if (matchError) {
        setPasswordError(matchError);
        return false;
      }
      setPasswordError(null);
      return true;
    },
    [],
  );

  useEffect(() => {
    const hasChanges =
      editFields.firstName !== currentUser?.firstName ||
      editFields.lastName !== currentUser?.lastName ||
      editFields.email !== currentUser?.email ||
      editFields.username !== currentUser?.username;

    (async () => {
      const isValid = Object.entries(editFields).every(
        ([key, value]) => validateField(key, value) === "",
      );
      setIsEditFormValid(isValid && hasChanges);
    })();
  }, [editFields, currentUser, validateField]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    username: string,
  ): Promise<User | undefined> => {
    return users.find((user) => user.username === username);
  };

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      showNotification("La actualización de lo datos fue exitosa");
    } catch (error) {
      console.error(error);
      showNotification("Ha ocurrido un error al actualizar los datos");
    }
  };

  const handleNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: e.target.value,
    });
  };

  const handleConfirmNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
          }),
        );
      } else {
        throw new Error("Current User is null");
      }
      setPasswordFields({
        newPassword: "",
        confirmNewPassword: "",
      });
      showNotification("La actualización de la contraseña fue exitosa");
    } catch (error) {
      console.error(error);
      showNotification("Ha ocurrido un error al actualizar la contraseña");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, mr: 2 }} />
        <Typography variant="h4" fontWeight={700}>
          {PAGE_TITLE.SETTINGS}
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="space-between">
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Información Personal
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Modifica tu información personal y correo electrónico.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Nombre"
                name="firstName"
                value={editFields.firstName}
                onChange={(e) =>
                  setEditFields({ ...editFields, firstName: e.target.value })
                }
                error={!!validateName(editFields.firstName)}
                helperText={validateName(editFields.firstName)}
                icon={
                  <PersonOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Apellido"
                name="lastName"
                value={editFields.lastName}
                onChange={(e) =>
                  setEditFields({ ...editFields, lastName: e.target.value })
                }
                error={!!validateName(editFields.lastName)}
                helperText={validateName(editFields.lastName)}
                icon={
                  <PersonOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                label="Correo electrónico"
                name="email"
                value={editFields.email}
                onChange={(e) => {
                  setEditFields({ ...editFields, email: e.target.value });
                  handleEmailChange(e);
                }}
                error={!!validateEmail(editFields.email) || !!infoError}
                helperText={infoError || validateEmail(editFields.email)}
                icon={
                  <EmailOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                label="Usuario"
                name="username"
                value={editFields.username}
                onChange={(e) => {
                  setEditFields({ ...editFields, username: e.target.value });
                  handleUsernameChange(e);
                }}
                error={!!validateUsername(editFields.username) || !!infoError}
                helperText={infoError || validateUsername(editFields.username)}
                icon={
                  <AccountCircleOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: "1px solid",
              borderColor: theme.palette.divider,
              mb: 2,
              mt: 2,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon
                sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }}
              />
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                Recomendación
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                Verifica que tus datos sean correctos antes de guardar los
                cambios.
              </Box>
            </Box>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                flex: 2,
                height: "56px",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: 140,
              }}
              onClick={handleSaveChanges}
              disabled={!isEditFormValid || !!infoError}
            >
              Guardar Cambios
            </Button>
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
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" } }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Cambiar Contraseña
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Ingresa una nueva contraseña para tu cuenta.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                label="Nueva contraseña"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordFields.newPassword}
                onChange={handleNewPassword}
                error={!!passwordError}
                helperText={passwordError}
                endAdornment={
                  <IconButton
                    onClick={handleToggleNewPassword}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                label="Confirmar nueva contraseña"
                name="confirmNewPassword"
                type={showConfirmNewPassword ? "text" : "password"}
                value={passwordFields.confirmNewPassword}
                onChange={handleConfirmNewPassword}
                error={!!passwordError}
                helperText={passwordError}
                endAdornment={
                  <IconButton
                    onClick={handleToggleConfirmNewPassword}
                    edge="end"
                    size="small"
                  >
                    {showConfirmNewPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                }
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: "1px solid",
              borderColor: theme.palette.divider,
              mb: 2,
              mt: 2,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon
                sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }}
              />
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                Consejo de seguridad
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                Usa una contraseña única y no la compartas con nadie.
                <br />
                Debe tener mínimo 8 caracteres, una mayúscula y un número.
              </Box>
            </Box>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                flex: 2,
                height: "56px",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: 140,
              }}
              onClick={handleChangePassword}
              disabled={!isPasswordFormValid}
            >
              Cambiar Contraseña
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
