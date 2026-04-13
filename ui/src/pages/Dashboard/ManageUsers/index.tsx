import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import AddUserForm from "../../Forms/AddUserForm";
import { Eye, EyeOff, PlusCircle, Plus, Users } from "lucide-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { DASHBOARD_USERS } from "../../../constants/constants";
import { NOTIFICATIONS } from "../../../constants/constants";
import PasswordChangeForm from "../../Forms/PasswordChangeForm";
import {
  errorBoxStyles,
  errorAlertStyles,
  retryButtonStyles,
  loadingBoxStyles,
  showInactiveBoxStyles,
  showInactiveTypographyStyles,
  noUsersBoxStyles,
  addDialogPaperSx,
  passwordDialogPaperSx,
  backdropStyles,
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { validateName, validateEmail, validateUsername, validatePassword } from '../../../utils/userValidation';

// ManageUsers page component for user management in the dashboard
const ManageUsers: React.FC<{ isExpanded?: boolean }> = ({
  isExpanded = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const {
    users,
    isLoadingUsers,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const { roles } = useSelector((state: RootState) => state.roles);
  const { showNotification } = useAppNotifications();
  const [showInactive, setShowInactive] = useState(false);
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

  // Loads users, roles, and user roles data on mount
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
          dispatch(fetchUsers()),
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
  }, [dispatch, showNotification, location.pathname]);

  // Handles errors when loading users
  useEffect(() => {
    if (usersError) {
      setLoadError(`Error al cargar usuarios: ${usersError}`);
      showNotification(DASHBOARD_USERS.LOAD_ERROR_TITLE, { severity: 'error', duration: 5000 });
    }
  }, [usersError, showNotification]);

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
        if (!showInactive && !user.isActive) return false;

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
  }, [search, users, showInactive]);

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
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchUserRoles());
  }, [dispatch]);

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
    <Box sx={{ height: "100%", minHeight: "500px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
              overflow: "visible",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 2.5 },
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "10px",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={22} color={theme.palette.primary.contrastText} />
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
                      {isSmallScreen ? 'Usuarios' : 'Gestión de Usuarios'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {filteredUsers.length} usuarios {showInactive ? '(mostrando inactivos)' : 'activos'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Controls Row */}
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
                  <Box
                    onClick={() => setShowInactive(!showInactive)}
                    sx={showInactiveBoxStyles(theme)}
                  >
                    {showInactive ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={showInactiveTypographyStyles}
                    >
                      {showInactive
                        ? DASHBOARD_USERS.HIDE_INACTIVE
                        : DASHBOARD_USERS.SHOW_INACTIVE}
                    </Typography>
                  </Box>

                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
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
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Mobile Add Button */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
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
            </Box>
          </Paper>

          {/* Content Section */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
        </Box>
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
