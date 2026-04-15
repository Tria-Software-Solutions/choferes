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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { DASHBOARD } from "../../../constants/dashboard.constants";
import ManageUsers from "../../Dashboard/ManageUsers";
import ManageRoles from "../../Dashboard/ManageRoles";
import ManagePermissions from "../../Dashboard/ManagePermissions";
import { Eye, EyeOff, User as UserIcon, Mail, UserCircle, Info, User as UserIcon2, Lock, Palette, Shield } from "lucide-react";
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

// Settings page component for user profile and password management
const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, setUser } = useAuthContext();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode, setMode } = useThemeMode() as {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
  };

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
  const [activeSection, setActiveSection] = useState<'personal' | 'password' | 'theme' | 'system'>('personal');
  const [activeSystemSubSection, setActiveSystemSubSection] = useState<'users' | 'roles' | 'permissions'>('users');

  useEffect(() => {
    dispatch(fetchUsers());
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

  // Wrapper function to convert string validation to boolean for TextfieldComponent
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

  // Handles email field change and checks for duplicates
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

  // Handles username field change and checks for duplicates
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

  // Handles saving profile changes
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

  // Handles new password field change
  const handleNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: e.target.value,
    });
  };

  // Handles confirm new password field change
  const handleConfirmNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      confirmNewPassword: e.target.value,
    });
  };

  // Handles toggling new password visibility
  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  // Handles toggling confirm new password visibility
  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword((prev) => !prev);
  };

  // Handles password change form submission
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

  return (
    <Box sx={{ height: "calc(100vh - 64px - 40px)", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          p: 0,
        }}
      >
        {/* Premium Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 0.5, sm: 1 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          {/* Title Row */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "10px",
                  p: 0.75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon2 size={20} color={theme.palette.primary.contrastText} />
              </Box>
              <Box>
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    color: theme.palette.text.primary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {isSmallScreen
                    ? PAGE_TITLE.PROFILE_SIMPLIFIED
                    : PAGE_TITLE.PROFILE}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Configuración de tu cuenta
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Toggle Buttons Row */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="flex-start"
            gap={1}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant={activeSection === 'personal' ? 'contained' : 'outlined'}
                onClick={() => setActiveSection('personal')}
                startIcon={<UserIcon2 size={16} />}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  backgroundColor: activeSection === 'personal' ? theme.palette.primary.main : 'transparent',
                  color: activeSection === 'personal' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  border: activeSection === 'personal' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  '&:hover': {
                    backgroundColor: activeSection === 'personal' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  },
                }}
              >
                Información personal
              </Button>
              <Button
                variant={activeSection === 'theme' ? 'contained' : 'outlined'}
                onClick={() => setActiveSection('theme')}
                startIcon={<Palette size={16} />}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  backgroundColor: activeSection === 'theme' ? theme.palette.primary.main : 'transparent',
                  color: activeSection === 'theme' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  border: activeSection === 'theme' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  '&:hover': {
                    backgroundColor: activeSection === 'theme' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  },
                }}
              >
                Tema de la aplicación
              </Button>
              <Button
                variant={activeSection === 'system' ? 'contained' : 'outlined'}
                onClick={() => setActiveSection('system')}
                startIcon={<Shield size={16} />}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  backgroundColor: activeSection === 'system' ? theme.palette.primary.main : 'transparent',
                  color: activeSection === 'system' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  border: activeSection === 'system' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  '&:hover': {
                    backgroundColor: activeSection === 'system' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  },
                }}
              >
                Gestión del Sistema
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", p: { xs: 2, sm: 3 } }}>
          {activeSection === 'personal' && (
            <Box sx={{ width: "100%", display: "block" }}>
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserIcon2 size={18} color={theme.palette.primary.contrastText} />
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
                  sx={{
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {MANAGEMENT.PERSONAL_INFO_DESC}
                </Typography>
              </Box>

              {/* Two Column Layout */}
              <Grid container spacing={3}>
                {/* Left Column - Personal Info */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: "16px",
                      border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      backgroundColor: theme.palette.background.paper,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Personal Data Section Header */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: "10px",
                            p: 0.75,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <UserCircle size={18} color={theme.palette.primary.contrastText} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            color: theme.palette.text.primary,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Datos Personales
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        Modifica tu información
                      </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="firstName"
                          value={editFields.firstName}
                          onChange={(e) =>
                            setEditFields({ ...editFields, firstName: e.target.value })
                          }
                          error={!!validateName(editFields.firstName)}
                          helperText={validateName(editFields.firstName)}
                          validateField={validateFieldBoolean}
                          icon={
                            <UserIcon
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="lastName"
                          value={editFields.lastName}
                          onChange={(e) =>
                            setEditFields({ ...editFields, lastName: e.target.value })
                          }
                          error={!!validateName(editFields.lastName)}
                          helperText={validateName(editFields.lastName)}
                          validateField={validateFieldBoolean}
                          icon={
                            <UserIcon
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="email"
                          value={editFields.email}
                          onChange={(e) => {
                            setEditFields({ ...editFields, email: e.target.value });
                            handleEmailChange(e);
                          }}
                          error={!!validateEmail(editFields.email) || !!infoError}
                          helperText={infoError || validateEmail(editFields.email)}
                          validateField={validateFieldBoolean}
                          icon={
                            <Mail
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="username"
                          value={editFields.username}
                          onChange={(e) => {
                            setEditFields({ ...editFields, username: e.target.value });
                            handleUsernameChange(e);
                          }}
                          error={!!validateUsername(editFields.username) || !!infoError}
                          helperText={infoError || validateUsername(editFields.username)}
                          validateField={validateFieldBoolean}
                          icon={
                            <UserCircle
                              size={20}
                              color={theme.palette.text.secondary}
                            />
                          }
                        />
                      </Grid>
                    </Grid>

                    {/* Action Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "center", sm: "flex-end" },
                        gap: 2,
                        mt: "auto",
                        pt: 3,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth={isSmallScreen}
                        sx={{
                          minHeight: { xs: 44, sm: 48 },
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          px: { xs: 3, sm: 4 },
                          py: { xs: 1.25, sm: 1.5 },
                          minWidth: { xs: "100%", sm: 160 },
                          borderRadius: "10px",
                          letterSpacing: "-0.01em",
                        }}
                        onClick={handleSaveChanges}
                        disabled={!isEditFormValid || !!infoError}
                      >
                        {MANAGEMENT.SAVE_CHANGES}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Password Change */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: "16px",
                      border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      backgroundColor: theme.palette.background.paper,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Password Section Header */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: "10px",
                            p: 0.75,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Shield size={18} color={theme.palette.primary.contrastText} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.1rem",
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
                        sx={{
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        Cambia tu contraseña
                      </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordFields.newPassword}
                          onChange={handleNewPassword}
                          error={!!passwordError}
                          helperText={passwordError}
                          placeholder="Nueva contraseña"
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
                                overflow: "hidden",
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
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldComponent
                          name="confirmNewPassword"
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={passwordFields.confirmNewPassword}
                          onChange={handleConfirmNewPassword}
                          error={!!passwordError}
                          helperText={passwordError}
                          placeholder="Confirmar contraseña"
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
                                overflow: "hidden",
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
                      </Grid>
                    </Grid>

                    {/* Password Info Box */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: "12px",
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.1)" : "rgba(33, 150, 243, 0.08)",
                        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.2)" : "rgba(33, 150, 243, 0.15)"}`,
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.2)" : "rgba(33, 150, 243, 0.15)",
                          borderRadius: "10px",
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Info
                          size={20}
                          color={theme.palette.info.main}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {MANAGEMENT.PASSWORD_INFO_TITLE}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.secondary,
                            lineHeight: 1.5,
                          }}
                        >
                          {MANAGEMENT.PASSWORD_INFO_DESC}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Password Action Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "center", sm: "flex-end" },
                        gap: 2,
                        mt: "auto",
                        pt: 3,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth={isSmallScreen}
                        sx={{
                          minHeight: { xs: 44, sm: 48 },
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          px: { xs: 3, sm: 4 },
                          py: { xs: 1.25, sm: 1.5 },
                          minWidth: { xs: "100%", sm: 160 },
                          borderRadius: "10px",
                          letterSpacing: "-0.01em",
                        }}
                        onClick={handleChangePassword}
                        disabled={!isPasswordFormValid}
                      >
                        {MANAGEMENT.CHANGE_PASSWORD}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          {activeSection === 'theme' && (
            <Box sx={{ width: "100%", display: "block" }}>
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Palette size={18} color={theme.palette.primary.contrastText} />
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
                  sx={{
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  Seleccione el tema que prefiera para la aplicación.
                </Typography>
              </Box>

              {/* Theme Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <RadioGroup
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ThemeMode)}
                  aria-label="theme-mode"
                  name="theme-mode"
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel 
                    value="default" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>Predeterminado</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="light" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>Claro</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="dark" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>Oscuro</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Paper>
            </Box>
          )}
          {activeSection === 'system' && (
            <Box
              sx={{
                width: "100%",
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Section Header */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "10px",
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield size={18} color={theme.palette.primary.contrastText} />
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
                    Gestión del Sistema
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  Administración de usuarios, roles, permisos y respaldos del sistema.
                </Typography>
              </Box>

              {/* Sub-section Toggles */}
              <Box
                sx={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexWrap: "wrap",
                  mb: 3,
                }}
              >
                <Button
                  variant={activeSystemSubSection === 'users' ? 'contained' : 'outlined'}
                  onClick={() => setActiveSystemSubSection('users')}
                  startIcon={<UserIcon2 size={16} />}
                  sx={{
                    borderRadius: '10px',
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    letterSpacing: '-0.01em',
                    backgroundColor: activeSystemSubSection === 'users' ? theme.palette.primary.main : 'transparent',
                    color: activeSystemSubSection === 'users' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    border: activeSystemSubSection === 'users' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      backgroundColor: activeSystemSubSection === 'users' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    },
                  }}
                >
                  {DASHBOARD.USERS}
                </Button>
                <Button
                  variant={activeSystemSubSection === 'roles' ? 'contained' : 'outlined'}
                  onClick={() => setActiveSystemSubSection('roles')}
                  startIcon={<Shield size={16} />}
                  sx={{
                    borderRadius: '10px',
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    letterSpacing: '-0.01em',
                    backgroundColor: activeSystemSubSection === 'roles' ? theme.palette.primary.main : 'transparent',
                    color: activeSystemSubSection === 'roles' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    border: activeSystemSubSection === 'roles' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      backgroundColor: activeSystemSubSection === 'roles' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    },
                  }}
                >
                  {DASHBOARD.ROLES}
                </Button>
                <Button
                  variant={activeSystemSubSection === 'permissions' ? 'contained' : 'outlined'}
                  onClick={() => setActiveSystemSubSection('permissions')}
                  startIcon={<Lock size={16} />}
                  sx={{
                    borderRadius: '10px',
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    letterSpacing: '-0.01em',
                    backgroundColor: activeSystemSubSection === 'permissions' ? theme.palette.primary.main : 'transparent',
                    color: activeSystemSubSection === 'permissions' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    border: activeSystemSubSection === 'permissions' ? 'none' : `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      backgroundColor: activeSystemSubSection === 'permissions' ? theme.palette.primary.dark : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    },
                  }}
                >
                  {DASHBOARD.PERMISSIONS}
                </Button>
              </Box>

              {/* Sub-section Content */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {activeSystemSubSection === 'users' && <ManageUsers isExpanded />}
                {activeSystemSubSection === 'roles' && <ManageRoles isExpanded />}
                {activeSystemSubSection === 'permissions' && <ManagePermissions />}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
