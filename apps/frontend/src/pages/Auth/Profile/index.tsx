import React, { useCallback, useEffect, useRef, useState } from "react";

import { hasAdminSettingsRole } from "@choferes/shared";
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
  Tab,
  Tabs,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import MANAGEMENT from "../../../constants/management.constants";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import ManageUsers from "../../Dashboard/ManageUsers";
import ManageRoles from "../../Dashboard/ManageRoles";
import { IconApps, IconBell, IconCalendarUser, IconCamera, IconCheck, IconClock, IconDeviceDesktop, IconEye, IconEyeOff, IconHelpCircle, IconInfoCircle, IconLoader2, IconLock, IconMail, IconMoon, IconPalette, IconPencil, IconRotate, IconShieldCheck, IconSun, IconUser, IconUserCircle, IconUsers, IconX } from "@tabler/icons-react";
import { User } from "../../../models/User";
import {
  validateName,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from "../../../utils/userValidation";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import { useThemeMode } from "../../../context/ThemeContext";
import { useTimeFormat } from "../../../hooks/useTimeFormat";
import { getAvatarSrc, resizeAvatarFile } from "../../../utils/avatar";
import UserAvatar from "../../../components/UserAvatar/UserAvatar.component";
import { updateUserAvatar, removeUserAvatar } from "../../../store/slices/userSlice";
import {
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import NotificationSettingsTab from "./NotificationSettingsTab";
import SessionsTab from "./SessionsTab";
import HelpCenterTab from "./HelpCenterTab";
import QuickAccessTab from "./QuickAccessTab";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";
import {
  actionsBox,
  actionsInnerBox,
  clearButton,
  submitButton,
} from "../../Forms/sharedStyles";
import { PanelHeader } from "../../../components/Layout";

type ThemeMode = "default" | "light" | "dark";

type TabId =
  | "personal"
  | "password"
  | "theme"
  | "notifications"
  | "sessions"
  | "help"
  | "quickaccess"
  | "users"
  | "roles";

const ThemeMockup: React.FC<{ tone: "light" | "dark" }> = ({ tone }) => {
  const bg = tone === "dark" ? "#0f172a" : "#f3f4f6";
  const panel = tone === "dark" ? "#1e293b" : "#ffffff";
  const line = tone === "dark" ? "#64748b" : "#9ca3af";
  const line2 = tone === "dark" ? "#475569" : "#d1d5db";
  const border = tone === "dark" ? "none" : "1px solid #e5e7eb";
  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        borderRadius: "10px",
        backgroundColor: bg,
        p: 0.75,
        display: "flex",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          width: "30%",
          borderRadius: "8px",
          backgroundColor: panel,
          p: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
          border,
        }}
      >
        <Box sx={{ height: 6, width: "85%", borderRadius: 1, backgroundColor: line }} />
        <Box sx={{ height: 5, width: "95%", borderRadius: 1, backgroundColor: line2 }} />
        <Box sx={{ height: 5, width: "90%", borderRadius: 1, backgroundColor: line2 }} />
      </Box>
      <Box
        sx={{
          flex: 1,
          borderRadius: "8px",
          backgroundColor: panel,
          p: 0.75,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          border,
        }}
      >
        <Box sx={{ height: 8, width: "55%", borderRadius: 1, backgroundColor: line }} />
        <Box
          sx={{
            flex: 1,
            borderRadius: "6px",
            backgroundColor: tone === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          }}
        />
      </Box>
    </Box>
  );
};

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, setUser, userPermissions } = useAuthContext();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, setMode } = useThemeMode() as {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
  };
  const { clockFormat, setClockFormat } = useTimeFormat();

  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [editFields, setEditFields] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    username: currentUser?.username || "",
  });
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  // Server-side rejection of the current password (shown under that field).
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const { currentPassword, newPassword, confirmNewPassword } = passwordFields;
    const allRequirementsMet =
      currentPassword !== "" &&
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword) &&
      confirmNewPassword !== "" &&
      newPassword === confirmNewPassword;
    setIsPasswordFormValid(allRequirementsMet);
  }, [passwordFields]);

  const handleClearEditForm = () => {
    setEditFields({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      username: currentUser?.username || "",
    });
    setInfoError(null);
  };

  const handleClearPasswordForm = () => {
    setPasswordFields({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    setPasswordError(null);
    setCurrentPasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

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
        await dispatch(updateUser({ id: currentUser.id, updatedUser })).unwrap();
        // Preserve settings/avatar/roles — rebuilding the object without them
        // wiped currentUser.settings and broke theme→DB sync (ThemeSync gates
        // on currentUser.id now, but sessionStorage must stay complete).
        setUser({
          ...currentUser,
          ...updatedUser,
        });
      } else {
        throw new Error("Current User is null");
      }
      showNotification(MANAGEMENT.UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      showNotification(MANAGEMENT.UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  const handleCurrentPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      currentPassword: e.target.value,
    });
    setCurrentPasswordError(null);
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
    if (!isValid || !currentUser) return;

    try {
      await dispatch(
        updateUserPassword({
          id: currentUser.id,
          password: passwordFields.newPassword,
          currentPassword: passwordFields.currentPassword,
        }),
      ).unwrap();
      handleClearPasswordForm();
      showNotification(MANAGEMENT.PASSWORD_UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      // e.g. "La contraseña actual no es correcta" from the API
      const message =
        typeof error === "string" && error.trim() ? error : MANAGEMENT.PASSWORD_UPDATE_ERROR;
      setCurrentPasswordError(message);
      showNotification(message, { severity: 'error', duration: 5000 });
    }
  };

  const getAvatarUrl = () => {
    if (!currentUser?.avatar) return null;
    return getAvatarSrc(currentUser.avatar) ?? null;
  };

  // Reset the broken-image fallback whenever the avatar value changes
  useEffect(() => {
  }, [currentUser?.avatar]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      showNotification("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)", { severity: "error" });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("La imagen no debe superar los 5MB", { severity: "error" });
      return;
    }

    try {
      const resized = await resizeAvatarFile(file);
      setSelectedFile(resized);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(resized);
    } catch (error) {
      showNotification("No se pudo procesar la imagen", { severity: "error" });
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !currentUser) return;

    setIsUploadingAvatar(true);
    try {
      const result = await dispatch(
        updateUserAvatar({ id: currentUser.id, file: selectedFile }),
      ).unwrap();

      // Update AuthContext with new avatar
      setUser({
        ...currentUser,
        avatar: result.avatar,
      });

      showNotification("Avatar actualizado exitosamente", { severity: "success", duration: 3000 });
      // Close directly (bypasses the isUploadingAvatar guard) so the dialog
      // doesn't stay stuck open after a successful upload.
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification("Error al actualizar el avatar", { severity: "error", duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!currentUser) return;

    setIsUploadingAvatar(true);
    try {
      await dispatch(removeUserAvatar(currentUser.id)).unwrap();

      setUser({
        ...currentUser,
        avatar: undefined,
      });

      showNotification("Avatar eliminado exitosamente", { severity: "success", duration: 3000 });
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification("Error al eliminar el avatar", { severity: "error", duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleOpenAvatarDialog = () => {
    setAvatarDialogOpen(true);
  };

  // Resets the dialog state (no guard) — used by the guarded close handler
  // and by the success paths, which must close even while uploading.
  const resetAvatarDialog = () => {
    setAvatarDialogOpen(false);
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseAvatarDialog = () => {
    if (isUploadingAvatar) return;
    resetAvatarDialog();
  };

  const adminTabPermissions: Record<string, string> = {
    users: PERMISSION_CODES.VIEW_USERS,
    roles: PERMISSION_CODES.VIEW_ROLES,
  };

  // La sección "Administración" (Usuarios, Roles) es solo para Gerencia,
  // Administrativo y SysAdmin, además del permiso de cada pestaña.
  const hasAdminSection = hasAdminSettingsRole(currentUser);

  const sidebarItems = [
    { id: "personal", label: "Información Personal", icon: IconUser, group: "Cuenta" },
    { id: "password", label: "Contraseña y Seguridad", icon: IconLock, group: "Cuenta" },
    { id: "sessions", label: "Sesiones activas", icon: IconShieldCheck, group: "Cuenta" },
    { id: "theme", label: "Apariencia", icon: IconPalette, group: "Preferencias" },
    { id: "notifications", label: "Notificaciones", icon: IconBell, group: "Preferencias" },
    { id: "quickaccess", label: "Accesos rápidos", icon: IconApps, group: "Preferencias" },
    { id: "help", label: "Centro de ayuda", icon: IconHelpCircle, group: "Soporte" },
    { id: "users", label: "Usuarios", icon: IconUsers, group: "Administración" },
    { id: "roles", label: "Roles", icon: IconCalendarUser, group: "Administración" },
  ].filter((item) => {
    if (item.group !== "Administración") return true;
    // Doble candado: rol habilitado + permiso de la pestaña.
    return hasAdminSection && userPermissions.includes(adminTabPermissions[item.id]);
  });

  const groupItems = (groupName: string) =>
    sidebarItems.filter((item) => item.group === groupName);

  return (
    <Box
      className="scrollable-content"
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: { xs: "auto", md: "hidden" },
        overflowX: "hidden",
        pb: { xs: 2, md: 3 },
        pt: 1,
        px: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          // Fill the viewport on desktop only; on phones the page scrolls as a whole.
          flex: { md: 1 },
          minHeight: { md: 0 },
          height: { xs: "auto", md: "100%" },
        }}
      >
        {/* Navigation Sidebar (Desktop) / Horizontal Pills (Mobile) */}
        {!isMediumScreen ? (
          <Paper
            elevation={0}
            sx={{
              width: { md: 240, lg: 270 },
              flexShrink: 0,
              borderRadius: "16px",
              border: theme.tokens.borders.paper,
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 1px 2px ${theme.tokens.shadows.card}`,
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              height: "100%",
              overflowY: "auto",
              mb: 0,
            }}
          >
            {/* User Profile Info Card */}
            <Box display="flex" alignItems="center" gap={2} sx={{ pb: 2, borderBottom: theme.tokens.borders.paper }}>
              <Box
                sx={{
                  position: "relative",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  flexShrink: 0,
                  cursor: "pointer",
                  "&:hover .avatar-overlay": {
                    opacity: 1,
                  },
                }}
                onClick={handleOpenAvatarDialog}
              >
                <UserAvatar user={currentUser} size={52} />
                {/* Hover overlay with pencil icon */}
                <Box
                  className="avatar-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <IconPencil size={18} color="#fff" />
                </Box>
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
              {["Cuenta", "Preferencias", "Soporte", "Administración"]
                .filter((groupName) => groupItems(groupName).length > 0)
                .map((groupName) => (
                  <Box key={groupName}>
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
                      {groupName}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {groupItems(groupName).map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const { colors } = theme.tokens;
                        const textColor = isActive ? colors.text : colors.textMuted;
                        return (
                          <Button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as TabId)}
                            aria-current={isActive ? "page" : undefined}
                            startIcon={<Icon size={18} color={textColor} />}
                            sx={{
                              justifyContent: "flex-start",
                              textAlign: "left",
                              lineHeight: 1.3,
                              textTransform: "none",
                              borderRadius: "10px",
                              minHeight: 40,
                              py: 1,
                              px: 1.5,
                              fontWeight: isActive ? 700 : 500,
                              fontSize: "0.875rem",
                              backgroundColor: isActive ? colors.selected : "transparent",
                              color: textColor,
                              border: "none !important",
                              boxShadow: "none !important",
                              "&:hover": {
                                backgroundColor: isActive ? colors.selected : colors.hover,
                                color: colors.text,
                              },
                            }}
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                ),
                )}
            </Box>
          </Paper>
        ) : (
          /* Scrollable Tab Bar for Mobile / Tablet */
          <Box
            sx={{
              display: "flex",
              pb: 1.5,
              pt: 0.5,
              mb: 1,
              // Keep tabs accessible while scrolling content on small screens
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: theme.palette.background.default,
              backdropFilter: "blur(10px)",
              borderBottom: theme.tokens.borders.paper,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_event, value) => setActiveTab(value as TabId)}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                width: "100%",
                minHeight: 44,
                "& .MuiTabs-flexContainer": {
                  gap: 0.5,
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  backgroundColor: theme.palette.primary.main,
                },
                "&::-webkit-scrollbar": {
                  height: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.tokens.colors.borderStrong,
                  borderRadius: "2px",
                },
              }}
            >
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Tab
                    key={item.id}
                    value={item.id}
                    label={item.label}
                    icon={<Icon size={17} />}
                    iconPosition="start"
                    disableRipple
                    sx={{
                      textTransform: "none",
                      fontWeight: isActive ? 700 : 600,
                      fontSize: "0.85rem",
                      minHeight: 44,
                      minWidth: "fit-content",
                      px: 1.5,
                      borderRadius: "10px 10px 0 0",
                      color: isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      backgroundColor: isActive
                        ? theme.tokens.colors.hover
                        : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        color: theme.palette.text.primary,
                        backgroundColor: isActive
                          ? theme.tokens.colors.hover
                          : theme.tokens.colors.hoverSoft,
                      },
                    }}
                  />
                );
              })}
            </Tabs>
          </Box>
        )}

        {/* Content Container */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: { md: 0 }, height: { xs: "auto", md: "100%" } }}>
          {activeTab === "personal" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                border: theme.tokens.borders.paper,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 1px 2px ${theme.tokens.shadows.card}`,
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
                mb: 0,
              }}
            >
              {/* Section Header — estilo /roles */}
              <PanelHeader
                icon={<IconUser />}
                title="Información Personal"
                description={MANAGEMENT.PERSONAL_INFO_DESC}
              />

              {/* Form Fields */}
              <Box sx={{ flex: 1, minHeight: { md: 0 }, overflow: { md: "auto" } }}>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="firstName"
                    placeholder="Nombre"
                    label="Nombre"
                    value={editFields.firstName}
                    onChange={(e) =>
                      setEditFields({ ...editFields, firstName: e.target.value })
                    }
                    error={!!validateName(editFields.firstName)}
                    helperText={validateName(editFields.firstName) || undefined}
                    validateField={validateFieldBoolean}
                    icon={<IconUser size={20} color={theme.palette.text.secondary} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="lastName"
                    placeholder="Apellido"
                    label="Apellido"
                    value={editFields.lastName}
                    onChange={(e) =>
                      setEditFields({ ...editFields, lastName: e.target.value })
                    }
                    error={!!validateName(editFields.lastName)}
                    helperText={validateName(editFields.lastName) || undefined}
                    validateField={validateFieldBoolean}
                    icon={<IconUser size={20} color={theme.palette.text.secondary} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="email"
                    placeholder="Correo Electrónico"
                    label="Correo electrónico"
                    value={editFields.email}
                    onChange={(e) => {
                      setEditFields({ ...editFields, email: e.target.value });
                      handleEmailChange(e);
                    }}
                    error={!!validateEmail(editFields.email) || !!infoError}
                    helperText={infoError || validateEmail(editFields.email) || undefined}
                    validateField={validateFieldBoolean}
                    icon={<IconMail size={20} color={theme.palette.text.secondary} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="username"
                    placeholder="Nombre de Usuario"
                    label="Nombre de usuario"
                    value={editFields.username}
                    onChange={(e) => {
                      setEditFields({ ...editFields, username: e.target.value });
                      handleUsernameChange(e);
                    }}
                    error={!!validateUsername(editFields.username) || !!infoError}
                    helperText={infoError || validateUsername(editFields.username) || undefined}
                    validateField={validateFieldBoolean}
                    icon={<IconUserCircle size={20} color={theme.palette.text.secondary} />}
                  />
                </Grid>
              </Grid>
              </Box>

              {/* Action Button */}
              <Box sx={actionsBox(theme)}>
                <Button
                  variant="text"
                  onClick={handleClearEditForm}
                  startIcon={<IconRotate size={18} />}
                  fullWidth={isSmallScreen}
                  sx={clearButton}
                >
                  Limpiar
                </Button>
                <Box sx={actionsInnerBox}>
                  <Button
                    variant="text"
                    onClick={handleSaveChanges}
                    disabled={!isEditFormValid || !!infoError}
                    startIcon={<IconCheck size={18} />}
                    fullWidth={isSmallScreen}
                    sx={submitButton}
                  >
                    {MANAGEMENT.SAVE_CHANGES}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {activeTab === "password" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                border: theme.tokens.borders.paper,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 1px 2px ${theme.tokens.shadows.card}`,
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
                mb: 0,
              }}
            >
              {/* Section Header — estilo /roles */}
              <PanelHeader
                icon={<IconLock />}
                title="Contraseña y Seguridad"
                description="Cambia tu contraseña para mantener tu cuenta segura."
              />

              <Box sx={{ flex: 1, minHeight: { md: 0 }, overflowY: { md: "auto" }, overflowX: "hidden" }}>
              <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ minWidth: 0, "& > .MuiGrid-item": { minWidth: 0 } }}>
                {/* Current password: required by the API to change your own */}
                <Grid item xs={12}>
                  <TextfieldComponent
                    name="currentPassword"
                    placeholder="Contraseña actual"
                    label="Contraseña actual"
                    autoComplete="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordFields.currentPassword}
                    onChange={handleCurrentPassword}
                    error={!!currentPasswordError}
                    helperText={currentPasswordError || undefined}
                    icon={<IconLock size={20} color={theme.palette.text.secondary} />}
                    endAdornment={
                      <IconButton
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        edge="end"
                        aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                        {showCurrentPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    }
                  />
                </Grid>
                {/* Password fields side by side */}
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="Nueva Contraseña"
                    label="Nueva contraseña"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordFields.newPassword}
                    onChange={handleNewPassword}
                    error={!!passwordError}
                    helperText={passwordError}
                    icon={<IconLock size={20} color={theme.palette.text.secondary} />}
                    endAdornment={
                      <IconButton
                        onClick={handleToggleNewPassword}
                        edge="end"
                        aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                        {showNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextfieldComponent
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    placeholder="Confirmar Nueva Contraseña"
                    label="Confirmar nueva contraseña"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={passwordFields.confirmNewPassword}
                    onChange={handleConfirmNewPassword}
                    error={!!passwordError}
                    helperText={passwordError}
                    icon={<IconLock size={20} color={theme.palette.text.secondary} />}
                    endAdornment={
                      <IconButton
                        onClick={handleToggleConfirmNewPassword}
                        edge="end"
                        aria-label={showConfirmNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                        {showConfirmNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    }
                  />
                </Grid>

                {/* Password info — full width below */}
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: theme.palette.text.primary,
                      mb: 1.25,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <IconInfoCircle size={16} stroke={1.5} color={theme.palette.primary.main} />
                    Información de la contraseña
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                    {(() => {
                      const { newPassword, confirmNewPassword } = passwordFields;
                      const requirements = [
                        {
                          label: "Mínimo 8 caracteres",
                          met: newPassword.length >= 8,
                        },
                        {
                          label: "Mayúsculas (A-Z)",
                          met: /[A-Z]/.test(newPassword),
                        },
                        {
                          label: "Minúsculas (a-z)",
                          met: /[a-z]/.test(newPassword),
                        },
                        {
                          label: "Un número (0-9)",
                          met: /\d/.test(newPassword),
                        },
                        {
                          label: "Carácter especial (@, #, $...)",
                          met: /[^A-Za-z0-9]/.test(newPassword),
                        },
                        {
                          label: "Las contraseñas coinciden",
                          met:
                            newPassword !== "" &&
                            confirmNewPassword !== "" &&
                            newPassword === confirmNewPassword,
                        },
                      ];
                      return requirements.map((req) => {
                        const met = req.met;
                        return (
                          <Box
                            key={req.label}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.25,
                              py: 0.6,
                              borderRadius: "20px",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              transition: "all 0.2s ease",
                              ...(met
                                ? {
                                    backgroundColor:
                                      theme.tokens.colors.hoverStrong,
                                    color: theme.palette.primary.main,
                                  }
                                : {
                                    backgroundColor: "transparent",
                                    color: theme.palette.text.secondary,
                                    border: `1px dashed ${
                                      theme.tokens.colors.borderStrong
                                    }`,
                                  }),
                            }}
                          >
                            {met ? (
                              <IconCheck size={13} stroke={2.5} />
                            ) : (
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  backgroundColor: theme.palette.text.disabled,
                                }}
                              />
                            )}
                            {req.label}
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      fontSize: "0.72rem",
                      color: theme.palette.text.disabled,
                      lineHeight: 1.4,
                    }}
                  >
                    <IconShieldCheck size={14} stroke={1.5} />
                    Por seguridad, no compartas tu contraseña con nadie.
                  </Typography>
                </Grid>
              </Grid>
              </Box>

              {/* Password Action Button */}
              <Box sx={actionsBox(theme)}>
                <Button
                  variant="text"
                  onClick={handleClearPasswordForm}
                  startIcon={<IconRotate size={18} />}
                  fullWidth={isSmallScreen}
                  sx={clearButton}
                >
                  Limpiar
                </Button>
                <Box sx={actionsInnerBox}>
                  <Button
                    variant="text"
                    onClick={handleChangePassword}
                    disabled={!isPasswordFormValid}
                    startIcon={<IconCheck size={18} />}
                    fullWidth={isSmallScreen}
                    sx={submitButton}
                  >
                    {MANAGEMENT.CHANGE_PASSWORD}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {activeTab === "theme" && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                border: theme.tokens.borders.paper,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 1px 2px ${theme.tokens.shadows.card}`,
                display: "flex",
                flexDirection: "column",
                height: { xs: "auto", md: "100%" },
                minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
                mb: 0,
              }}
            >
              {/* Section Header — estilo /roles */}
              <PanelHeader
                icon={<IconPalette />}
                title="Apariencia"
                description="Elige el tema y el formato de hora de la aplicación."
              />

              {/* Theme Segmented Toggle */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
                <SegmentedToggle
                  value={mode}
                  onChange={(value) => setMode(value as ThemeMode)}
                  fullWidth={isSmallScreen}
                  options={[
                    { value: "default" as ThemeMode, label: "Sistema", icon: <IconDeviceDesktop size={15} /> },
                    { value: "light" as ThemeMode, label: "Claro", icon: <IconSun size={15} /> },
                    { value: "dark" as ThemeMode, label: "Oscuro", icon: <IconMoon size={15} /> },
                  ]}
                  size="medium"
                />
              </Box>

              {/* Preview Mockup */}
              <Box sx={{ width: "100%", mb: 1.5 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 180, sm: 260 },
                    borderRadius: "14px",
                    border: `1.5px solid ${
                      theme.tokens.colors.border
                    }`,
                    p: 1,
                    display: "flex",
                    gap: 0.75,
                  }}
                >
                  {mode === "default" ? (
                    <>
                      <ThemeMockup tone="light" />
                      <ThemeMockup tone="dark" />
                    </>
                  ) : (
                    <ThemeMockup tone={mode === "dark" ? "dark" : "light"} />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 1,
                    color: theme.palette.text.secondary,
                    fontSize: "0.72rem",
                  }}
                >
                  {mode === "default"
                    ? "Tema Sistema: se adapta a la configuración de tu dispositivo."
                    : mode === "light"
                      ? "Tema Claro: interfaz luminosa."
                      : "Tema Oscuro: interfaz oscura."}
                </Typography>
              </Box>

              {/* Clock format toggle */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2.5, pt: 2.5, borderTop: `1px solid ${theme.tokens.colors.borderDivider}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconClock size={18} style={{ color: theme.tokens.colors.textMuted }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Formato de hora</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {clockFormat === "24h" ? "Formato 24 horas (ej. 14:30)" : "Formato 12 horas (ej. 2:30 p. m.)"}
                    </Typography>
                  </Box>
                </Box>
                <SegmentedToggle
                  value={clockFormat}
                  onChange={(v) => setClockFormat(v as "12h" | "24h")}
                  options={[
                    { value: "12h", label: "12 h" },
                    { value: "24h", label: "24 h" },
                  ]}
                  size="small"
                />
              </Box>
</Paper>
          )}

          {/* Admin tables - same panel height as others, identical to standalone pages */}
          {["users", "roles"].includes(activeTab) && (
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", "& .MuiPaper-root": { mb: 0 } }}>
                {activeTab === "users" && <ManageUsers isExpanded hideHeader />}
                {activeTab === "roles" && <ManageRoles isExpanded hideHeader />}
              </Box>
            </Box>
          )}

          {activeTab === "notifications" && (
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <NotificationSettingsTab />
            </Box>
          )}

          {activeTab === "sessions" && (
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <SessionsTab />
            </Box>
          )}

          {activeTab === "help" && (
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <HelpCenterTab />
            </Box>
          )}

          {activeTab === "quickaccess" && (
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <QuickAccessTab />
            </Box>
          )}
        </Box>
      </Box>

      {/* Avatar Upload Dialog - Modern */}
      <Dialog
        open={avatarDialogOpen}
        onClose={handleCloseAvatarDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 0,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)",
          },
        }}
      >
        {/* Header with icon box */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 2.5, sm: 3.5 }, pb: 0 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <IconCamera size={18} color={theme.palette.primary.contrastText} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.15rem",
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Foto de perfil
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: "0.85rem", lineHeight: 1.5, pl: 6 }}
          >
            Sube una foto para personalizar tu perfil.
          </Typography>
        </Box>

        <DialogContent sx={{ pb: 1, pt: 3, px: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {/* Avatar Preview Circle */}
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.tokens.colors.hoverSoft,
                border: `3px solid ${theme.tokens.colors.border}`,
                transition: "all 0.3s ease",
                boxShadow: avatarPreview || getAvatarUrl()
                  ? "0 8px 32px rgba(0,0,0,0.15)"
                  : "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <UserAvatar
                user={currentUser}
                src={avatarPreview}
                size={180}
                sx={{ fontSize: "3.5rem" }}
              />
              {isUploadingAvatar && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <CircularProgress size={44} sx={{ color: "#fff" }} />
                </Box>
              )}
            </Box>

            {/* Drop zone / Select area */}
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: "100%",
                border: `2px dashed ${theme.tokens.colors.border}`,
                borderRadius: "14px",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: selectedFile
                  ? (theme.tokens.colors.hover)
                  : "transparent",
                borderColor: selectedFile
                  ? theme.palette.primary.main
                  : (theme.tokens.colors.hoverStrong),
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.tokens.colors.hover,
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.tokens.colors.hover,
                  borderRadius: "10px",
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <IconCamera size={22} color={theme.palette.text.secondary} />
              </Box>
              {selectedFile ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.875rem",
                    textAlign: "center",
                    wordBreak: "break-all",
                    maxWidth: "100%",
                  }}
                >
                  {selectedFile.name}
                </Typography>
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    Haz clic para seleccionar una imagen
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      mt: 0.25,
                      display: "block",
                    }}
                  >
                    JPEG, PNG, GIF o WebP · Máx 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, pb: { xs: 2.5, sm: 3.5 }, pt: 1.5, gap: 1, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between" }}>
          {currentUser?.avatar && !selectedFile ? (
            <Button
              variant="text"
              color="error"
              onClick={handleDeleteAvatar}
              disabled={isUploadingAvatar}
              startIcon={isUploadingAvatar ? <IconLoader2 size={16} className="animate-spin" /> : <IconX size={16} />}
              sx={{
                order: { xs: 2, sm: 1 },
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(244,67,54,0.1)"
                    : "rgba(244,67,54,0.06)",
                },
              }}
            >
              Eliminar
            </Button>
          ) : (
            <Box /> /* Spacer */
          )}
          <Box sx={{ display: "flex", gap: 1, order: { xs: 1, sm: 2 } }}>
            <Button
              variant="outlined"
              onClick={handleCloseAvatarDialog}
              disabled={isUploadingAvatar}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={selectedFile ? handleUploadAvatar : () => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              sx={{ minWidth: 120 }}
              startIcon={
                isUploadingAvatar ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : selectedFile ? (
                  <IconCamera size={16} />
                ) : undefined
              }
            >
              {isUploadingAvatar
                ? "Subiendo..."
                : selectedFile
                ? "Subir foto"
                : "Seleccionar"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
