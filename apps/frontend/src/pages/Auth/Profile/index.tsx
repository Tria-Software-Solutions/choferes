import React, { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchUsers,
  updateUser,
  updateUserPassword,
} from "../../../store/slices/userSlice";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import MANAGEMENT from "../../../constants/management.constants";
import ManageUsers from "../../Dashboard/ManageUsers";
import ManageRoles from "../../Dashboard/ManageRoles";
import ManagePermissions from "../../Dashboard/ManagePermissions";
import {
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  UserCircle,
  Info,
  User as UserIcon2,
  Lock,
  Palette,
  Shield,
  Users,
  Key,
} from "lucide-react";
import { User } from "../../../models/User";
import {
  validateName,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from "../../../utils/userValidation";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import { useThemeMode } from "../../../index";

type ThemeMode = "default" | "light" | "dark" | "high-contrast";
type TabId = "personal" | "password" | "theme" | "users" | "roles" | "permissions";

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, setUser } = useAuthContext();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, setMode } = useThemeMode() as {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
  };

  const [activeTab, setActiveTab] = useState<TabId>("personal");
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

  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);

  // Validates individual profile fields
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

  const validateFieldBoolean = useCallback((name: string, value: string | boolean | string[]) => {
    if (typeof value !== 'string') return false;
    return validateField(name, value) === "";
  }, [validateField]);

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

    const isValid = Object.entries(editFields).every(
      ([key, value]) => validateField(key, value) === "",
    );
    setIsEditFormValid(isValid && hasChanges);
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
      setInfoError(MANAGEMENT.EMAIL_EXISTS);
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
      setInfoError(MANAGEMENT.USERNAME_EXISTS);
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
      showNotification(MANAGEMENT.UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      showNotification(MANAGEMENT.UPDATE_ERROR, { severity: 'error', duration: 5000 });
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
      showNotification(MANAGEMENT.PASSWORD_UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      showNotification(MANAGEMENT.PASSWORD_UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  const getInitials = () => {
    if (!currentUser) return "?";
    const first = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : "";
    const last = currentUser.lastName ? currentUser.lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || currentUser.username.charAt(0).toUpperCase() || "?";
  };

  const sidebarItems = [
    { id: "personal", label: "Información Personal", icon: UserIcon2, group: "Ajustes" },
    { id: "password", label: "Contraseña y Seguridad", icon: Lock, group: "Ajustes" },
    { id: "theme", label: "Apariencia", icon: Palette, group: "Ajustes" },
    { id: "users", label: "Usuarios", icon: Users, group: "Administración" },
    { id: "roles", label: "Roles", icon: Shield, group: "Administración" },
    { id: "permissions", label: "Permisos", icon: Key, group: "Administración" },
  ];

  const groupItems = (groupName: string) =>
    sidebarItems.filter((item) => item.group === groupName);

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pb: { xs: 2, md: 3 },
        pt: 1,
        px: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          flex: 1,
          minHeight: 0,
          height: "100%",
        }}
      >
        {/* Navigation Sidebar (Desktop) / Horizontal Pills (Mobile) */}
        {!isMediumScreen ? (
          <Paper
            elevation={0}
            sx={{
              width: 280,
              flexShrink: 0,
              borderRadius: "16px",
              border: `1px solid ${
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
              }`,
              backgroundColor: theme.palette.background.paper,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              height: "100%",
              overflowY: "auto",
              mb: 0,
            }}
          >
            {/* User Profile Info Card */}
            <Box display="flex" alignItems="center" gap={2} sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Typography
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {getInitials()}
                </Typography>
              </Box>
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: theme.palette.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Usuario"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  @{currentUser?.username || "username"}
                </Typography>
              </Box>
            </Box>

            {/* Sidebar Sections */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {/* Group: Ajustes */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: theme.palette.text.secondary,
                    px: 1.5,
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  Ajustes de cuenta
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {groupItems("Ajustes").map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const bg = isActive
                      ? theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)"
                      : "transparent";
                    const textColor = isActive ? theme.palette.text.primary : theme.palette.text.secondary;
                    const iconColor = isActive ? theme.palette.text.primary : theme.palette.text.secondary;
                    return (
                      <Button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabId)}
                        startIcon={<Icon size={18} color={iconColor} />}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          borderRadius: "12px",
                          py: 1.25,
                          px: 2,
                          fontWeight: isActive ? 700 : 500,
                          fontSize: "0.9rem",
                          backgroundColor: bg,
                          color: textColor,
                          position: "relative",
                          border: "none !important",
                          borderLeft: "none !important",
                          boxShadow: "none !important",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            backgroundColor: isActive
                              ? bg
                              : theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.02)",
                            transform: "translateX(2px)",
                            boxShadow: "none !important",
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              {/* Group: Administración */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: theme.palette.text.secondary,
                    px: 1.5,
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  Administración
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {groupItems("Administración").map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const bg = isActive
                      ? theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)"
                      : "transparent";
                    const textColor = isActive ? theme.palette.text.primary : theme.palette.text.secondary;
                    const iconColor = isActive ? theme.palette.text.primary : theme.palette.text.secondary;
                    return (
                      <Button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabId)}
                        startIcon={<Icon size={18} color={iconColor} />}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          borderRadius: "12px",
                          py: 1.25,
                          px: 2,
                          fontWeight: isActive ? 700 : 500,
                          fontSize: "0.9rem",
                          backgroundColor: bg,
                          color: textColor,
                          position: "relative",
                          border: "none !important",
                          borderLeft: "none !important",
                          boxShadow: "none !important",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            backgroundColor: isActive
                              ? bg
                              : theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.02)",
                            transform: "translateX(2px)",
                            boxShadow: "none !important",
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          /* Scrollable pills for Mobile / Tablet */
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 1.25,
              pb: 1.5,
              pt: 0.5,
              px: 0.5,
              mb: 1,
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                borderRadius: "2px",
              },
            }}
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "contained" : "outlined"}
                  onClick={() => setActiveTab(item.id as TabId)}
                  startIcon={<Icon size={16} />}
                  sx={{
                    borderRadius: "20px",
                    px: 2.5,
                    py: 1,
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    scrollSnapAlign: "start",
                    boxShadow: "none !important",
                    border: isActive ? "none" : undefined,
                    borderColor: isActive ? "transparent" : theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    "&:hover": {
                      boxShadow: "none !important",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Content Container */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, height: { xs: "auto", md: "100%" } }}>
          {activeTab === "personal" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                }`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                mb: 0,
              }}
            >
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.text.primary,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserIcon2 size={18} color={theme.palette.background.paper} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: theme.palette.text.primary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {MANAGEMENT.PERSONAL_INFO_TITLE}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}
                >
                  {MANAGEMENT.PERSONAL_INFO_DESC}
                </Typography>
              </Box>

              <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, my: 3 }} />

              {/* Form Fields */}
              <Grid container spacing={{ xs: 2.5, sm: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.85rem",
                        mb: 1.25,
                        color: theme.palette.text.primary,
                        display: "block",
                      }}
                    >
                      Nombre
                    </Typography>
                    <TextfieldComponent
                      name="firstName"
                      placeholder="Ingrese su nombre"
                      value={editFields.firstName}
                      onChange={(e) =>
                        setEditFields({ ...editFields, firstName: e.target.value })
                      }
                      error={!!validateName(editFields.firstName)}
                      helperText={validateName(editFields.firstName)}
                      validateField={validateFieldBoolean}
                      icon={<UserIcon size={20} color={theme.palette.text.secondary} />}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.85rem",
                        mb: 1.25,
                        color: theme.palette.text.primary,
                        display: "block",
                      }}
                    >
                      Apellido
                    </Typography>
                    <TextfieldComponent
                      name="lastName"
                      placeholder="Ingrese su apellido"
                      value={editFields.lastName}
                      onChange={(e) =>
                        setEditFields({ ...editFields, lastName: e.target.value })
                      }
                      error={!!validateName(editFields.lastName)}
                      helperText={validateName(editFields.lastName)}
                      validateField={validateFieldBoolean}
                      icon={<UserIcon size={20} color={theme.palette.text.secondary} />}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.85rem",
                        mb: 1.25,
                        color: theme.palette.text.primary,
                        display: "block",
                      }}
                    >
                      Correo Electrónico
                    </Typography>
                    <TextfieldComponent
                      name="email"
                      placeholder="ejemplo@correo.com"
                      value={editFields.email}
                      onChange={(e) => {
                        setEditFields({ ...editFields, email: e.target.value });
                        handleEmailChange(e);
                      }}
                      error={!!validateEmail(editFields.email) || !!infoError}
                      helperText={infoError || validateEmail(editFields.email)}
                      validateField={validateFieldBoolean}
                      icon={<Mail size={20} color={theme.palette.text.secondary} />}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.85rem",
                        mb: 1.25,
                        color: theme.palette.text.primary,
                        display: "block",
                      }}
                    >
                      Nombre de Usuario
                    </Typography>
                    <TextfieldComponent
                      name="username"
                      placeholder="Ingrese su usuario"
                      value={editFields.username}
                      onChange={(e) => {
                        setEditFields({ ...editFields, username: e.target.value });
                        handleUsernameChange(e);
                      }}
                      error={!!validateUsername(editFields.username) || !!infoError}
                      helperText={infoError || validateUsername(editFields.username)}
                      validateField={validateFieldBoolean}
                      icon={<UserCircle size={20} color={theme.palette.text.secondary} />}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Action Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  pt: 4,
                  mt: 3,
                  borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: 48,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    minWidth: { xs: "100%", sm: 160 },
                    borderRadius: "12px",
                    letterSpacing: "-0.01em",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  onClick={handleSaveChanges}
                  disabled={!isEditFormValid || !!infoError}
                >
                  {MANAGEMENT.SAVE_CHANGES}
                </Button>
              </Box>
            </Paper>
          )}

          {activeTab === "password" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                }`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                mb: 0,
              }}
            >
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.text.primary,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Lock size={18} color={theme.palette.background.paper} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: theme.palette.text.primary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Seguridad
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}
                >
                  Cambia tu contraseña para mantener tu cuenta segura.
                </Typography>
              </Box>

              <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, my: 3 }} />

              <Grid container spacing={{ xs: 2.5, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 650,
                          fontSize: "0.85rem",
                          mb: 1.25,
                          color: theme.palette.text.primary,
                          display: "block",
                        }}
                      >
                        Nueva Contraseña
                      </Typography>
                      <TextfieldComponent
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordFields.newPassword}
                        onChange={handleNewPassword}
                        error={!!passwordError}
                        helperText={passwordError}
                        placeholder="Ingrese nueva contraseña"
                        icon={<Lock size={20} color={theme.palette.text.secondary} />}
                        endAdornment={
                          <IconButton
                            onClick={handleToggleNewPassword}
                            edge="end"
                            sx={{
                              color: theme.palette.text.secondary,
                              width: "36px",
                              height: "36px",
                              padding: "8px",
                              "&:hover": {
                                color: theme.palette.text.primary,
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        }
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 650,
                          fontSize: "0.85rem",
                          mb: 1.25,
                          color: theme.palette.text.primary,
                          display: "block",
                        }}
                      >
                        Confirmar Nueva Contraseña
                      </Typography>
                      <TextfieldComponent
                        name="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={passwordFields.confirmNewPassword}
                        onChange={handleConfirmNewPassword}
                        error={!!passwordError}
                        helperText={passwordError}
                        placeholder="Confirme nueva contraseña"
                        icon={<Lock size={20} color={theme.palette.text.secondary} />}
                        endAdornment={
                          <IconButton
                            onClick={handleToggleConfirmNewPassword}
                            edge="end"
                            sx={{
                              color: theme.palette.text.secondary,
                              width: "36px",
                              height: "36px",
                              padding: "8px",
                              "&:hover": {
                                color: theme.palette.text.primary,
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        }
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Password guidelines info box */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 3,
                      borderRadius: "12px",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.015)",
                      border: `1px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.06)"
                      }`,
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.04)",
                        borderRadius: "10px",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Info size={20} color={theme.palette.text.primary} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: theme.palette.text.primary,
                          mb: 0.75,
                        }}
                      >
                        {MANAGEMENT.PASSWORD_INFO_TITLE}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.85rem",
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {MANAGEMENT.PASSWORD_INFO_DESC}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Password Action Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  pt: 4,
                  mt: 3,
                  borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: 48,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    minWidth: { xs: "100%", sm: 160 },
                    borderRadius: "12px",
                    letterSpacing: "-0.01em",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  onClick={handleChangePassword}
                  disabled={!isPasswordFormValid}
                >
                  {MANAGEMENT.CHANGE_PASSWORD}
                </Button>
              </Box>
            </Paper>
          )}

          {activeTab === "theme" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                }`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                mb: 0,
              }}
            >
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.text.primary,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Palette size={18} color={theme.palette.background.paper} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: theme.palette.text.primary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Tema de la aplicación
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}
                >
                  Seleccione el tema que prefiera para la aplicación.
                </Typography>
              </Box>

              <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, my: 3 }} />

              {/* Theme Grid Choice */}
              <Grid container spacing={3}>
                {/* Option: Default / System */}
                <Grid item xs={12} sm={4}>
                  <Box
                    onClick={() => setMode("default")}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      border: `2.5px solid ${
                        mode === "default"
                          ? theme.palette.text.primary
                          : theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.08)"
                      }`,
                      borderRadius: "16px",
                      p: 2.5,
                      backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        mode === "default"
                          ? "0 8px 30px rgba(0, 0, 0, 0.12)"
                          : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": {
                        borderColor: mode === "default" ? theme.palette.text.primary : "rgba(0,0,0,0.3)",
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    {/* Visual Checkmark Badge */}
                    {mode === "default" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: theme.palette.text.primary,
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={theme.palette.background.paper}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </Box>
                    )}

                    {/* Dual visual mockup UI */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 80,
                        borderRadius: "10px",
                        display: "flex",
                        overflow: "hidden",
                        border: `1.5px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      {/* Left: Light Mockup */}
                      <Box
                        sx={{
                          width: "50%",
                          height: "100%",
                          backgroundColor: "#f3f4f6",
                          display: "flex",
                          flexDirection: "column",
                          p: 0.75,
                          gap: 0.5,
                          borderRight: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <Box sx={{ backgroundColor: "#ffffff", height: 8, borderRadius: "2px", width: "100%", border: "1px solid #e5e7eb" }} />
                        <Box sx={{ display: "flex", gap: "3px", flex: 1 }}>
                          <Box sx={{ backgroundColor: "#ffffff", width: 12, height: "100%", borderRadius: "2px", border: "1px solid #e5e7eb" }} />
                          <Box sx={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "2px", border: "1px solid #e5e7eb", p: "3px", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Box sx={{ backgroundColor: "#9ca3af", width: "50%", height: 3, borderRadius: "0.5px" }} />
                            <Box sx={{ backgroundColor: "#d1d5db", width: "80%", height: 2, borderRadius: "0.5px" }} />
                          </Box>
                        </Box>
                      </Box>
                      {/* Right: Dark Mockup */}
                      <Box
                        sx={{
                          width: "50%",
                          height: "100%",
                          backgroundColor: "#0f172a",
                          display: "flex",
                          flexDirection: "column",
                          p: 0.75,
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{ backgroundColor: "#1e293b", height: 8, borderRadius: "2px", width: "100%" }} />
                        <Box sx={{ display: "flex", gap: "3px", flex: 1 }}>
                          <Box sx={{ backgroundColor: "#1e293b", width: 12, height: "100%", borderRadius: "2px" }} />
                          <Box sx={{ flex: 1, backgroundColor: "#1e293b", borderRadius: "2px", p: "3px", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Box sx={{ backgroundColor: "#64748b", width: "50%", height: 3, borderRadius: "0.5px" }} />
                            <Box sx={{ backgroundColor: "#475569", width: "80%", height: 2, borderRadius: "0.5px" }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 650, fontSize: "0.95rem", color: theme.palette.text.primary }}>Sistema</Typography>
                  </Box>
                </Grid>

                {/* Option: Light */}
                <Grid item xs={12} sm={4}>
                  <Box
                    onClick={() => setMode("light")}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      border: `2.5px solid ${
                        mode === "light"
                          ? theme.palette.text.primary
                          : theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.08)"
                      }`,
                      borderRadius: "16px",
                      p: 2.5,
                      backgroundColor: "rgba(0,0,0,0.01)",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        mode === "light"
                          ? "0 8px 30px rgba(0, 0, 0, 0.12)"
                          : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": {
                        borderColor: mode === "light" ? theme.palette.text.primary : "rgba(0,0,0,0.3)",
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    {/* Visual Checkmark Badge */}
                    {mode === "light" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: theme.palette.text.primary,
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={theme.palette.background.paper}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </Box>
                    )}

                    {/* Light Preview Mockup */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 80,
                        borderRadius: "10px",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        flexDirection: "column",
                        p: 0.75,
                        gap: 0.5,
                        border: `1.5px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      <Box sx={{ backgroundColor: "#ffffff", height: 8, borderRadius: "2px", width: "100%", border: "1px solid #e5e7eb" }} />
                      <Box sx={{ display: "flex", gap: "3px", flex: 1 }}>
                        <Box sx={{ backgroundColor: "#ffffff", width: 14, height: "100%", borderRadius: "2px", border: "1px solid #e5e7eb" }} />
                        <Box sx={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "2px", border: "1px solid #e5e7eb", p: "4px", display: "flex", flexDirection: "column", gap: "3px" }}>
                          <Box sx={{ backgroundColor: "#9ca3af", width: "50%", height: 4, borderRadius: "0.5px" }} />
                          <Box sx={{ backgroundColor: "#d1d5db", width: "85%", height: 3, borderRadius: "0.5px" }} />
                        </Box>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 650, fontSize: "0.95rem", color: theme.palette.text.primary }}>Claro</Typography>
                  </Box>
                </Grid>

                {/* Option: Dark */}
                <Grid item xs={12} sm={4}>
                  <Box
                    onClick={() => setMode("dark")}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      border: `2.5px solid ${
                        mode === "dark"
                          ? theme.palette.text.primary
                          : theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.08)"
                      }`,
                      borderRadius: "16px",
                      p: 2.5,
                      backgroundColor: "rgba(255,255,255,0.01)",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        mode === "dark"
                          ? "0 8px 30px rgba(0, 0, 0, 0.12)"
                          : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": {
                        borderColor: mode === "dark" ? theme.palette.text.primary : "rgba(255,255,255,0.3)",
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    {/* Visual Checkmark Badge */}
                    {mode === "dark" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: theme.palette.text.primary,
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={theme.palette.background.paper}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </Box>
                    )}

                    {/* Dark Preview Mockup */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 80,
                        borderRadius: "10px",
                        backgroundColor: "#0f172a",
                        display: "flex",
                        flexDirection: "column",
                        p: 0.75,
                        gap: 0.5,
                        border: `1.5px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      <Box sx={{ backgroundColor: "#1e293b", height: 8, borderRadius: "2px", width: "100%" }} />
                      <Box sx={{ display: "flex", gap: "3px", flex: 1 }}>
                        <Box sx={{ backgroundColor: "#1e293b", width: 14, height: "100%", borderRadius: "2px" }} />
                        <Box sx={{ flex: 1, backgroundColor: "#1e293b", borderRadius: "2px", p: "4px", display: "flex", flexDirection: "column", gap: "3px" }}>
                          <Box sx={{ backgroundColor: "#64748b", width: "50%", height: 4, borderRadius: "0.5px" }} />
                          <Box sx={{ backgroundColor: "#475569", width: "85%", height: 3, borderRadius: "0.5px" }} />
                        </Box>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 650, fontSize: "0.95rem", color: theme.palette.text.primary }}>Oscuro</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Admin cards stretch to fill full height of the container to match the sidebar */}
          {["users", "roles", "permissions"].includes(activeTab) && (
            <Box sx={{ flex: 1, minHeight: 0, height: { xs: "auto", md: "100%" }, "& .MuiPaper-root": { mb: 0 } }}>
              {activeTab === "users" && <ManageUsers isExpanded />}
              {activeTab === "roles" && <ManageRoles isExpanded />}
              {activeTab === "permissions" && <ManagePermissions />}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
