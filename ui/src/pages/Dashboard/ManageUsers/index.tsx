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
import { useAppNotifications } from "../../../hooks/useNotifications";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import AddUserForm from "../../Forms/AddUserForm";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DASHBOARD_USERS } from "../../../constants/constants";
import { NOTIFICATIONS } from "../../../constants/constants";
import PasswordChangeForm from "../../Forms/PasswordChangeForm";
import {
  errorBoxStyles,
  errorAlertStyles,
  retryButtonStyles,
  loadingBoxStyles,
  searchBarBoxStyles,
  addButtonMobileStyles,
  addButtonDesktopBoxStyles,
  addButtonDesktopStyles,
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
    <Box>
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
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={4}>
              <Box sx={searchBarBoxStyles}>
                {filteredUsers && (
                  <SearchBarComponent
                    placeholder={DASHBOARD_USERS.SEARCH_PLACEHOLDER}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAddUserModal}
                  sx={addButtonMobileStyles}
                >
                  <AddRoundedIcon />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
                sx={addButtonDesktopBoxStyles}
              >
                <Box
                  onClick={() => setShowInactive(!showInactive)}
                  sx={showInactiveBoxStyles(theme)}
                >
                  {showInactive ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
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
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleOpenAddUserModal}
                  sx={addButtonDesktopStyles}
                >
                  {DASHBOARD_USERS.ADD}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ display: { xs: "block", md: "none" } }}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Box
                  onClick={() => setShowInactive(!showInactive)}
                  sx={showInactiveBoxStyles(theme)}
                >
                  {showInactive ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
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
              </Box>
            </Grid>
          </Grid>
          <br />
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
        icon={<AddCircleOutlineIcon color="info" />}
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
