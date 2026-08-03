import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuthContext } from "../../../context/AuthContext";
import { User } from "../../../models/User";
import { Role } from "../../../models/Role";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
} from "../../../store/slices/userSlice";
import { fetchRoles } from "../../../store/slices/rolesSlice";
import { fetchUserRoles } from "../../../store/slices/userRolesSlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { createUserNotification } from "../../../services/notificationService";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import AddUserForm from "../../Forms/AddUserForm";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import {
  CheckCircle,
  FileEdit,
  PlusCircle,
  Plus,
  Users,
  X,
} from "lucide-react";
import {
  editButtonStyles,
  saveButtonStyles,
  neutralButtonStyles,
} from "../../../components/Table/EditableTable/helpers/actionButtons";
import { premiumMenuProps } from "../../../components/Table/EditableTable/EditableTable.styles";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { DASHBOARD_USERS } from "../../../constants/constants";
import { NOTIFICATIONS } from "../../../constants/constants";
import { TABLE } from "../../../constants/constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import PasswordChangeForm from "../../Forms/PasswordChangeForm";
import {
  errorBoxStyles,
  errorAlertStyles,
  retryButtonStyles,
  loadingBoxStyles,
  noUsersBoxStyles,
  addDialogPaperSx,
  passwordDialogPaperSx,
  backdropStyles,
} from "./styles";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";
import { useLocation } from "react-router-dom";
import { API_URL } from "../../../services/api";
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { validateName, validateEmail, validateUsername, validatePassword } from '../../../utils/userValidation';

// ManageUsers page component for user management in the dashboard
const ManageUsers: React.FC<{ isExpanded?: boolean; hideHeader?: boolean }> = ({
  isExpanded = true,
  hideHeader = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const canCreateUser = userPermissions.includes(PERMISSIONS.CREATE_USERS);
  const canEditUser = userPermissions.includes(PERMISSIONS.EDIT_USER);
  const {
    users,
    isLoadingUsers,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const { roles } = useSelector((state: RootState) => state.roles);
  const { showNotification } = useAppNotifications();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [userToChange, setUserToChange] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUserStatus, setIsUpdatingUserStatus] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const inputSx = {
    '& .MuiInputBase-root': {
      fontWeight: 600,
      fontSize: '0.85rem',
      '&:before, &:after': { border: 'none' },
      '&:hover:not(.Mui-disabled):before': { border: 'none' },
    },
    '& .MuiInputBase-input': {
      padding: '4px 0',
      minWidth: 0,
      '&::placeholder': { opacity: 0.4, fontWeight: 400 },
      '&:focus': { outline: 'none' },
    },
  } as const;
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const location = useLocation();

  const getInitialRowsPerPage = () => {
    if (typeof window !== 'undefined') {
      const maxHeight = window.innerHeight * 0.6;
      const headHeight = 56;
      const paginationHeight = 64;
      const extra = 24;
      const availableHeight = maxHeight - headHeight - paginationHeight - extra;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      return Math.max(3, Math.min(100, rows));
    }
    return 25;
  };

  const { search, setSearch, rowsPerPage, setRowsPerPage } = useTablePreferences('users', getInitialRowsPerPage);

  const debouncedSearch = useDebounce(search, 400);

  // Loads users (with optional search), roles, and user roles data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError(null);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Timeout: La carga tardó demasiado")),
            30000,
          );
        });

        const loadPromise = Promise.all([
          dispatch(fetchUsers({ search: debouncedSearch || undefined })),
          dispatch(fetchRoles()),
          dispatch(fetchUserRoles()),
        ]);

        await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : DASHBOARD_USERS.LOAD_ERROR_TITLE,
        );
        showNotification(DASHBOARD_USERS.LOAD_ERROR_TITLE, { severity: 'error', duration: 5000 });
      }
    };

    loadData();
  }, [dispatch, showNotification, debouncedSearch, location.pathname]);

  // Handles errors when loading users
  useEffect(() => {
    if (usersError) {
      setLoadError(`Error al cargar usuarios: ${usersError}`);
      showNotification(DASHBOARD_USERS.LOAD_ERROR_TITLE, { severity: 'error', duration: 5000 });
    }
  }, [usersError, showNotification]);

  // Counts per status, based on the raw users list (before search/status filters)
  const statusCounts = useMemo(() => {
    const list = users || [];
    const active = list.filter((u) => u.isActive).length;
    return {
      all: list.length,
      active,
      inactive: list.length - active,
    };
  }, [users]);

  // Filters users based on search input and active status
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }

    const normalizeString = (str: string) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const processedUsers = users
      .map((user) => {
        try {
          return {
            ...user,
            roleName:
              user.roles?.map((role: Role) => role.name).join(", ") || "",
          };
        } catch (error) {
          return {
            ...user,
            roleName: "",
          };
        }
      })
      .filter((user) => {
        if (statusFilter === "active" && !user.isActive) return false;
        if (statusFilter === "inactive" && user.isActive) return false;

        if (!search.trim()) return true;

        try {
          const searchText = normalizeString(
            `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${user.username || ""} ${user.roleName || ""}`,
          ).toLowerCase();

          return searchText.includes(normalizeString(search).toLowerCase());
        } catch (error) {
          return true; // Include user if filtering fails
        }
      });

    return processedUsers;
  }, [search, users, statusFilter]);

  const totalCount = useMemo(() => filteredUsers.length, [filteredUsers]);

  // Validates user fields for add/edit forms
  const validateFields = useCallback(
    (fields: typeof editFields, isAddForm: boolean) => {
      const isValid =
        validateName(fields.firstName) === '' &&
        validateName(fields.lastName) === '' &&
        validateEmail(fields.email) === '' &&
        validateUsername(fields.username) === '';
      return isAddForm
        ? isValid && validatePassword(fields.password) === '' && fields.roleName.trim() !== ''
        : isValid;
    },
    [],
  );

  const isEditFormValid = useMemo(() => {
    if (editRowId === null) return false;
    return validateFields(editFields, false);
  }, [editFields, editRowId, validateFields]);

  const handleEdit = useCallback((user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      roleName: user.roles?.map((role: Role) => role.name).join(", ") || "",
    });
  }, []);

  const handleCancel = useCallback(() => {
    setEditRowId(null);
    setEditFields({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleName: "",
    });
  }, []);

  const handleUpdate = async (id: number) => {
    try {
      const updatedUser = {
        firstName: editFields.firstName,
        lastName: editFields.lastName,
        email: editFields.email,
        username: editFields.username,
      };
      const role = roles.find((r) => r.name === editFields.roleName);
      if (!role) {
        showNotification(NOTIFICATIONS.USER_ROLE_NOT_FOUND, { severity: 'error', duration: 5000 });
        return;
      }
      dispatch(
        updateUser({
          id,
          updatedUser,
          newRoleId: role.id,
        }),
      );
      setEditRowId(null);
      setEditFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleName: "",
      });
      showNotification(NOTIFICATIONS.USER_UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
      
      // Add notification to menu
      createUserNotification('updated', `${editFields.firstName} ${editFields.lastName}`);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.USER_UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  const handleOpenStatusDialog = useCallback(async (row: unknown) => {
    setUserToChange(row as User);
    setOpenStatusDialog(true);
  }, []);

  const handleCloseStatusDialog = useCallback(() => {
    setOpenStatusDialog(false);
    setUserToChange(null);
  }, []);

  const handleStatusChange = async () => {
    if (!userToChange) return;

    setIsUpdatingUserStatus(true);
    try {
      await dispatch(
        updateUserStatus({
          id: userToChange.id,
          status: !userToChange.isActive,
        }),
      );
      setOpenStatusDialog(false);
      setUserToChange(null);
      showNotification(
        "Estado del usuario actualizado exitosamente",
        { severity: 'success', duration: 3000 },
      );
      
      // Add notification to menu
      createUserNotification('updated', `${userToChange.firstName} ${userToChange.lastName}`);
    } catch (error) {
      showNotification(
        "Error al actualizar el estado del usuario",
        { severity: 'error', duration: 5000 },
      );
    } finally {
      setIsUpdatingUserStatus(false);
    }
  };

  const handleOpenAddUserModal = useCallback(() => {
    setOpenAddUserModal(true);
  }, []);

  const handleCloseAddUserModal = useCallback(() => {
    setOpenAddUserModal(false);
  }, []);

  const handleCreateUser = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roleName: string;
  }) => {
    setIsCreatingUser(true);
    try {
      const role = roles.find((r) => r.name === userData.roleName);
      if (!role) {
        throw new Error(`Rol "${userData.roleName}" no encontrado`);
      }

      const newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        isActive: true,
      };

      await dispatch(
        createUser({
          newUser,
          newRoleId: role.id,
        }),
      );
      setOpenAddUserModal(false);
      showNotification(NOTIFICATIONS.USER_CREATED, { severity: 'success', duration: 3000 });
      
      // Add notification to menu
      createUserNotification('created', `${userData.firstName} ${userData.lastName}`);
    } catch (error) {
      showNotification(NOTIFICATIONS.USER_CREATE_ERROR, { severity: 'error', duration: 5000 });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const validateField = useCallback(
    (field: string, value: string | string[] | boolean) => {
      switch (field) {
        case 'firstName':
        case 'lastName':
          return validateName(String(value)) === '';
        case 'email':
          return validateEmail(String(value)) === '';
        case 'username':
          return validateUsername(String(value)) === '';
        case 'password':
          return validatePassword(String(value)) === '';
        case 'roleName':
          return String(value).trim() !== '';
        default:
          return true;
      }
    },
    [],
  );

  const handleRetry = useCallback(() => {
    setLoadError(null);
    dispatch(fetchUsers({ search: debouncedSearch || undefined }));
    dispatch(fetchRoles());
    dispatch(fetchUserRoles());
  }, [dispatch, debouncedSearch]);

  const setEditField = useCallback(
    (field: string, value: string | boolean | number | string[] | Date) => {
      setEditFields({ ...editFields, [field]: value });
    },
    [editFields],
  );

  // Handler to open password dialog
  const handleOpenPasswordModal = useCallback((userId: number) => {
    setPasswordUserId(userId);
    setPasswordModalOpen(true);
  }, []);

  // Handler to close password dialog
  const handleClosePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setPasswordUserId(null);
  }, []);

  return (
    <Box sx={{ height: "100%", minHeight: { xs: "calc(100dvh - 240px)", md: 0 }, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {loadError ? (
        <Box sx={errorBoxStyles}>
          <Alert severity="error" sx={errorAlertStyles}>
            <Typography variant="h6" gutterBottom>
              Error de Carga
            </Typography>
            <Typography variant="body1" gutterBottom>
              {loadError}
            </Typography>
            <Button
              variant="contained"
              onClick={handleRetry}
              sx={retryButtonStyles}
            >
              Reintentar
            </Button>
          </Alert>
        </Box>
      ) : isLoadingUsers ? (
        <Box sx={loadingBoxStyles}>
          <Backdrop sx={backdropStyles(theme)} open={isLoadingUsers}>
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <>
          {/* Premium Header with Paper */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
              overflow: "hidden",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
          {!hideHeader && (
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.5, sm: 2 },
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                flexShrink: 0,
                borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Users size={20} strokeWidth={1.5} />
                  </Box>
                  <Box>
                    <Typography
                      variant={isSmallScreen ? "h6" : "h5"}
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                        color: theme.palette.text.primary,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {isSmallScreen ? 'Usuarios' : 'Gestión de Usuarios'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.7rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {filteredUsers.length} {statusFilter === "all" ? "usuarios" : statusFilter === "inactive" ? "usuarios inactivos" : "usuarios activos"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Controls Row */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              gap={2}
            >
              {/* Search */}
              <Box flex={1} maxWidth={{ sm: "320px" }}>
                {filteredUsers && (
                  <SearchBarComponent
                    placeholder={DASHBOARD_USERS.SEARCH_PLACEHOLDER}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    isSearching={isLoadingUsers && search !== ""}
                  />
                )}
              </Box>

              {/* Show Inactive Toggle & Add Button */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1}
              >
                {/* Segmented status filter — modern pattern with counts */}
                <SegmentedToggle
                  size="medium"
                  fullWidth={isSmallScreen}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v)}
                  options={[
                    { value: "all", label: DASHBOARD_USERS.FILTER_ALL, count: statusCounts.all },
                    { value: "active", label: DASHBOARD_USERS.FILTER_ACTIVE, count: statusCounts.active },
                    { value: "inactive", label: DASHBOARD_USERS.FILTER_INACTIVE, count: statusCounts.inactive },
                  ]}
                />

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>
                  {canCreateUser && (
                    <Button
                      variant="contained"
                      startIcon={<Plus size={18} />}
                      onClick={handleOpenAddUserModal}
                      sx={{
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        letterSpacing: "-0.01em",
                        borderRadius: '10px',
                      }}
                    >
                      {DASHBOARD_USERS.ADD}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Mobile Add Button */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
            {canCreateUser && (
              <Button
                variant="contained"
                fullWidth
                startIcon={<Plus size={18} />}
                onClick={handleOpenAddUserModal}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: '10px',
                }}
              >
                {DASHBOARD_USERS.ADD}
              </Button>
            )}
          </Box>

            {/* Content Section */}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {hideHeader ? (
              /* Compact preview list for Profile mode */
              <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 0 }}>
                {filteredUsers.slice(0, 5).map((user, i) => {
                  const isEditing = editRowId === user.id;
                  return (
                    <Box
                      key={user.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: { xs: 2, sm: 2.5 },
                        py: isEditing ? 1.25 : 1.5,
                        borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                        backgroundColor: isEditing
                          ? (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                          : (i % 2 === 0 ? "transparent" : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)")),
                        transition: "background-color 0.15s",
                        "&:hover": {
                          backgroundColor: isEditing
                            ? (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                            : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"),
                        },
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Avatar
                            src={user.avatar ? `${API_URL}${user.avatar}` : undefined}
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              flexShrink: 0,
                              alignSelf: "flex-start",
                              mt: 1,
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                            }}
                          >
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </Avatar>
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.75,
                              py: 0.5,
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                              <TextField
                                size="small"
                                value={editFields.firstName}
                                onChange={(e) => setEditFields({ ...editFields, firstName: e.target.value })}
                                placeholder="Nombre"
                                variant="standard"
                                sx={{ flex: 1, minWidth: 0, ...inputSx }}
                              />
                              <TextField
                                size="small"
                                value={editFields.lastName}
                                onChange={(e) => setEditFields({ ...editFields, lastName: e.target.value })}
                                placeholder="Apellido"
                                variant="standard"
                                sx={{ flex: 1, minWidth: 0, ...inputSx }}
                              />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                              <TextField
                                size="small"
                                value={editFields.email}
                                onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
                                placeholder="Correo"
                                variant="standard"
                                sx={{ flex: 1, minWidth: 0, ...inputSx }}
                              />
                              <TextField
                                size="small"
                                value={editFields.username}
                                onChange={(e) => setEditFields({ ...editFields, username: e.target.value })}
                                placeholder="Usuario"
                                variant="standard"
                                sx={{ flex: 1, minWidth: 0, ...inputSx }}
                              />
                            </Box>
                            <FormControl variant="standard" size="small" fullWidth sx={{ minWidth: 0 }}>
                              <Select
                                value={editFields.roleName}
                                onChange={(e) => setEditFields({ ...editFields, roleName: e.target.value })}
                                displayEmpty
                                renderValue={(selected) => {
                                  if (!selected) return <Typography sx={{ color: "text.disabled", fontSize: "0.8rem" }}>Seleccionar rol</Typography>;
                                  return (
                                    <Typography sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{selected}</Typography>
                                  );
                                }}
                                sx={{
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  '&:before, &:after': { border: 'none' },
                                  '&:hover:not(.Mui-disabled):before': { border: 'none' },
                                  '& .MuiSelect-select': { py: 0.25 },
                                }}
                                MenuProps={premiumMenuProps}
                              >
                                {roles.map((role) => (
                                  <MenuItem key={role.id} value={role.name} sx={{ fontSize: '0.8rem' }}>
                                    {role.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, alignSelf: "flex-start", mt: 2 }}>
                            <PremiumTooltip title={TABLE.SAVE}>
                              <span>
                                <IconButton
                                  onClick={() => handleUpdate(user.id)}
                                  disabled={!isEditFormValid}
                                  sx={saveButtonStyles(theme)}
                                >
                                  <CheckCircle size={17} />
                                </IconButton>
                              </span>
                            </PremiumTooltip>
                            <PremiumTooltip title={TABLE.CANCEL}>
                              <span>
                                <IconButton onClick={handleCancel} sx={neutralButtonStyles(theme)}>
                                  <X size={17} />
                                </IconButton>
                              </span>
                            </PremiumTooltip>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box sx={{ position: "relative", flexShrink: 0 }}>
                            <Avatar
                              src={user.avatar ? `${API_URL}${user.avatar}` : undefined}
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                              }}
                            >
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </Avatar>
                            <Box
                              sx={{
                                position: "absolute",
                                right: -1,
                                bottom: -1,
                                width: 11,
                                height: 11,
                                borderRadius: "50%",
                                backgroundColor: user.isActive ? "#4CAF50" : "#BDBDBD",
                                border: `2px solid ${theme.palette.background.paper}`,
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.72rem", color: "primary.main", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mt: 0.15 }}>
                              {user.roleName || "Sin rol"}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", flexShrink: 0, maxWidth: { xs: 120, sm: 200 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.email}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                            {canEditUser && (
                              <PremiumTooltip title={TABLE.EDIT}>
                                <span>
                                  <IconButton onClick={() => handleEdit(user)} sx={editButtonStyles(theme)}>
                                    <FileEdit size={16} />
                                  </IconButton>
                                </span>
                              </PremiumTooltip>
                            )}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })}
                {filteredUsers.length > 5 && (
                  <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 500, fontSize: "0.7rem" }}>
                      +{filteredUsers.length - 5} usuarios más
                    </Typography>
                  </Box>
                )}
                {filteredUsers.length === 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 100 }}>
                    <Typography variant="body2" color="textSecondary">
                      {DASHBOARD_USERS.NO_USERS}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <>
                {filteredUsers.length > 0 ? (
                  <EditableTableComponent<User>
                    key="users-table"
                    data={filteredUsers}
                    columns={[
                      "firstName",
                      "lastName",
                      "username",
                      "email",
                      "roleName",
                    ]}
                    editRowId={editRowId}
                    editFields={editFields}
                    setEditField={setEditField}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleUpdate={handleUpdate}
                    handleOpenStatusDialog={handleOpenStatusDialog}
                    getRowId={(row) => row.id}
                    totalCount={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    setPage={setPage}
                    setRowsPerPage={setRowsPerPage}
                    isSaveDisabled={!isEditFormValid}
                    userPermissions={userPermissions}
                    permissionMap={{
                      edit: PERMISSIONS.EDIT_USER,
                      delete: PERMISSIONS.ENABLE_DISABLE_USER,
                    }}
                    isExpanded={isExpanded}
                    validateField={validateField}
                    passwordModalOpen={passwordModalOpen}
                    passwordUserId={passwordUserId}
                    onOpenPasswordModal={handleOpenPasswordModal}
                    onClosePasswordModal={handleClosePasswordModal}
                    showStatusColumn={true}
                  />
                ) : (
                  <Box sx={noUsersBoxStyles}>
                    <Typography variant="h6" color="textSecondary">
                      {DASHBOARD_USERS.NO_USERS}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          </Paper>
      </>
    )}

      <DialogComponent
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        onConfirm={handleStatusChange}
        title={DASHBOARD_USERS.DIALOG_STATUS_TITLE}
        message={DASHBOARD_USERS.DIALOG_STATUS_MESSAGE}
        type="warning"
        confirmText={DASHBOARD_USERS.DIALOG_STATUS_CONFIRM}
        cancelText={DASHBOARD_USERS.DIALOG_STATUS_CANCEL}
        loading={isUpdatingUserStatus}
      />

      <DialogComponent
        open={openAddUserModal}
        onClose={handleCloseAddUserModal}
        title={DASHBOARD_USERS.ADD}
        subtitle={DASHBOARD_USERS.ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<PlusCircle color="var(--mui-palette-info-main)" />}
      >
        <AddUserForm
          onSubmit={handleCreateUser}
          onCancel={handleCloseAddUserModal}
          isLoading={isCreatingUser}
          roles={roles}
        />
      </DialogComponent>

      <DialogComponent
        open={passwordModalOpen}
        onClose={handleClosePasswordModal}
        title="Cambiar Contraseña"
        subtitle={(() => {
          if (typeof passwordUserId === "number") {
            const user = users.find((u) => u.id === passwordUserId);
            if (user) {
              return `${user.firstName || ""} ${user.lastName || ""}`.trim();
            }
          }
          return "";
        })()}
        hideActions
        paperSx={passwordDialogPaperSx ?? {}}
      >
        <PasswordChangeForm
          userId={passwordUserId}
          onClose={handleClosePasswordModal}
          onSuccess={() => {
            handleClosePasswordModal();
            showNotification("La contraseña fue actualizada exitosamente", {
              severity: "success",
              duration: 3000,
            });
          }}
          onError={(msg) =>
            showNotification(msg, { severity: "error", duration: 5000 })
          }
        />
      </DialogComponent>
    </Box>
  );
};

export default ManageUsers;
