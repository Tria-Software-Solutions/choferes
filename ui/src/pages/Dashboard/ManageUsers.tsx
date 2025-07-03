import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
} from "../../store/slices/userSlice";
import { fetchRoles } from "../../store/slices/rolesSlice";
import { fetchUserRoles } from "../../store/slices/userRolesSlice";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
  Stack,
  Tooltip,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddUserForm from "../Forms/AddUserForm";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DialogComponent from "../../components/Dialog/DialogComponent";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DASHBOARD_USERS } from "../../constants/constants";
import { NOTIFICATIONS } from "../../constants/constants";
import CustomTextField from '../../components/Textfield/CustomTextField';
import generateSecret from '../../utils/generateSecret';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUserStatus, setIsUpdatingUserStatus] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const theme = useTheme();
  const [temporalPassword, setTemporalPassword] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

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
        showNotification(DASHBOARD_USERS.LOAD_ERROR_TITLE, 5000, false);
      }
    };

    loadData();
  }, [dispatch, showNotification]);

  // Handles errors when loading users
  useEffect(() => {
    if (usersError) {
      setLoadError(`Error al cargar usuarios: ${usersError}`);
      showNotification(DASHBOARD_USERS.LOAD_ERROR_TITLE, 5000, false);
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

        if (!filter.trim()) return true;

        try {
          const searchText = normalizeString(
            `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${user.username || ""} ${user.roleName || ""}`,
          ).toLowerCase();

          return searchText.includes(normalizeString(filter).toLowerCase());
        } catch (error) {
          return true; // Include user if filtering fails
        }
      });

    return processedUsers;
  }, [filter, users, showInactive]);

  const totalCount = useMemo(() => filteredUsers.length, [filteredUsers]);

  // Validates user fields for add/edit forms
  const validateFields = useCallback(
    (fields: typeof editFields, isAddForm: boolean) => {
      const regex = {
        text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        username: /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/,
        password:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      };

      const isValid =
        regex.text.test(fields.firstName) &&
        regex.text.test(fields.lastName) &&
        regex.email.test(fields.email) &&
        regex.username.test(fields.username);

      return isAddForm
        ? isValid &&
            regex.password.test(fields.password) &&
            regex.text.test(fields.roleName)
        : isValid;
    },
    [],
  );

  // Validates new password fields
  const validateNewPasswordFields = useCallback(
    async (fields: typeof passwordFields) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (fields.newPassword === "" || fields.confirmNewPassword === "") {
        setError("Los espacios son requeridos.");
        return false;
      }
      if (fields.newPassword !== fields.confirmNewPassword) {
        setError("Las contraseñas no coinciden.");
        return false;
      }
      if (
        !passwordRegex.test(fields.newPassword) ||
        !passwordRegex.test(fields.confirmNewPassword)
      ) {
        setError(
          "El valor es inválido.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial",
        );
        return false;
      }

      setError(null);
      return true;
    },
    [],
  );

  const isPasswordFormValid = useMemo(() => {
    const { newPassword, confirmNewPassword } = passwordFields;

    if (!newPassword.trim() && !confirmNewPassword.trim()) {
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return (
      passwordRegex.test(newPassword) && passwordRegex.test(confirmNewPassword)
    );
  }, [passwordFields]);

  const isEditFormValid = useMemo(() => {
    if (editRowId === null) return false;
    return validateFields(editFields, false);
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
      setPage(0);
    },
    [setPage],
  );

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
        showNotification(NOTIFICATIONS.USER_ROLE_NOT_FOUND, 5000, false);
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
      showNotification(NOTIFICATIONS.USER_UPDATE_SUCCESS, 3000, false);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.USER_UPDATE_ERROR, 5000, false);
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
        3000,
        false,
      );
    } catch (error) {
      showNotification(
        "Error al actualizar el estado del usuario",
        5000,
        false,
      );
    } finally {
      setIsUpdatingUserStatus(false);
    }
  };

  const handleNewPassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPasswordFields({
        ...passwordFields,
        newPassword: event.target.value,
      });
    },
    [passwordFields],
  );

  const handleConfirmNewPassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPasswordFields({
        ...passwordFields,
        confirmNewPassword: event.target.value,
      });
    },
    [passwordFields],
  );

  const handleToggleNewPassword = useCallback(() => {
    setShowNewPassword(!showNewPassword);
  }, [showNewPassword]);

  const handleToggleConfirmNewPassword = useCallback(() => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  }, [showConfirmNewPassword]);

  const handleChangePassword = useCallback(
    async (e: React.FormEvent, id: number, handleClose: () => void) => {
      e.preventDefault();
      const isValid = await validateNewPasswordFields(passwordFields);
      if (isValid) {
        try {
          await dispatch(
            updateUserPassword({
              id,
              password: passwordFields.newPassword,
            }),
          );
          setPasswordFields({
            newPassword: "",
            confirmNewPassword: "",
          });
          setShowNewPassword(false);
          setShowConfirmNewPassword(false);
          handleClose();
          showNotification(
            "La contraseña fue actualizada exitosamente",
            3000,
            false,
          );
        } catch (error) {
          showNotification(
            "Ha ocurrido un error al actualizar la contraseña",
            5000,
            false,
          );
        }
      }
    },
    [validateNewPasswordFields, passwordFields, dispatch, showNotification],
  );

  const handlePasswordModal = useCallback(
    (id: number, handleClose: () => void) => {
      const handleGenerateTemporalPassword = () => {
        const tempPassword = generateSecret();
        setPasswordFields({
          newPassword: tempPassword,
          confirmNewPassword: tempPassword,
        });
        setTemporalPassword(tempPassword);
        setCopySuccess(false);
      };

      const handleCopyTemporalPassword = async () => {
        if (temporalPassword) {
          await navigator.clipboard.writeText(temporalPassword);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 1500);
        }
      };

      return (
        <Box sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom>
            {DASHBOARD_USERS.DIALOG_PASSWORD_TITLE} {id}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {DASHBOARD_USERS.DIALOG_PASSWORD_SUBTITLE}
          </Typography>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <CustomTextField
              label={DASHBOARD_USERS.DIALOG_PASSWORD_NEW}
              type={showNewPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={passwordFields.newPassword}
              onChange={handleNewPassword}
              placeholder={DASHBOARD_USERS.DIALOG_PASSWORD_NEW_PLACEHOLDER}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleNewPassword} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <CustomTextField
              label={DASHBOARD_USERS.DIALOG_PASSWORD_CONFIRM}
              type={showConfirmNewPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={passwordFields.confirmNewPassword}
              onChange={handleConfirmNewPassword}
              placeholder={DASHBOARD_USERS.DIALOG_PASSWORD_CONFIRM_PLACEHOLDER}
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
            />
            <Button
              variant="outlined"
              onClick={handleGenerateTemporalPassword}
              fullWidth
            >
              Generar contraseña temporal
            </Button>
            {temporalPassword && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, width: '100%' }}>
                <CustomTextField
                  label="Contraseña temporal generada"
                  value={temporalPassword}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title={copySuccess ? '¡Copiado!' : 'Copiar'} placement="top">
                        <IconButton onClick={handleCopyTemporalPassword} edge="end" size="small">
                          <ContentCopyIcon color={copySuccess ? 'success' : 'inherit'} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2, width: '100%' }}>
              <Button variant="outlined" onClick={handleClose} fullWidth>
                {DASHBOARD_USERS.DIALOG_PASSWORD_CANCEL}
              </Button>
              <Button
                variant="contained"
                onClick={(e) => handleChangePassword(e, id, handleClose)}
                disabled={!isPasswordFormValid}
                fullWidth
              >
                {DASHBOARD_USERS.DIALOG_PASSWORD_CHANGE}
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    },
    [
      showNewPassword,
      showConfirmNewPassword,
      passwordFields,
      handleNewPassword,
      handleConfirmNewPassword,
      handleToggleNewPassword,
      handleToggleConfirmNewPassword,
      error,
      isPasswordFormValid,
      handleChangePassword,
      temporalPassword,
      copySuccess,
      setPasswordFields,
      setTemporalPassword,
      setCopySuccess
    ],
  );

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
      showNotification(NOTIFICATIONS.USER_CREATED, 3000, false);
    } catch (error) {
      showNotification(NOTIFICATIONS.USER_CREATE_ERROR, 5000, false);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const validateField = useCallback(
    (field: string, value: string | string[] | boolean) => {
      const regex = {
        text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        username: /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/,
      };

      switch (field) {
        case "firstName":
        case "lastName":
          return regex.text.test(String(value));
        case "email":
          return regex.email.test(String(value));
        case "username":
          return regex.username.test(String(value));
        case "roleName":
          return regex.text.test(String(value));
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

  return (
    <Box>
      {loadError ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
            gap: 2,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Error de Carga
            </Typography>
            <Typography variant="body1" gutterBottom>
              {loadError}
            </Typography>
            <Button variant="contained" onClick={handleRetry} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Alert>
        </Box>
      ) : isLoadingUsers ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
          }}
        >
          <Backdrop
            sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
            open={isLoadingUsers}
          >
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {filteredUsers && (
                  <SearchBar
                    placeholder={DASHBOARD_USERS.SEARCH_PLACEHOLDER}
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAddUserModal}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    minWidth: "auto",
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    p: 0,
                  }}
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
                sx={{
                  display: { xs: "none", md: "flex" },
                }}
              >
                <Box
                  onClick={() => setShowInactive(!showInactive)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    userSelect: "none",
                    color: theme.palette.text.primary,
                    transition: "color 0.2s",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    },
                    px: 1,
                  }}
                >
                  {showInactive ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {showInactive ? DASHBOARD_USERS.HIDE_INACTIVE : DASHBOARD_USERS.SHOW_INACTIVE}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleOpenAddUserModal}
                  sx={{ px: 3, py: 1.5, fontSize: "1rem", minHeight: 56 }}
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    userSelect: "none",
                    color: theme.palette.text.primary,
                    transition: "color 0.2s",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    },
                    px: 1,
                  }}
                >
                  {showInactive ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {showInactive ? DASHBOARD_USERS.HIDE_INACTIVE : DASHBOARD_USERS.SHOW_INACTIVE}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredUsers.length > 0 ? (
            <EditableTable<User>
              key={filteredUsers.map(u => u.id + '-' + u.isActive).join(',')}
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
              handlePasswordModal={handlePasswordModal}
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
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
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
        subtitle="Nuevo usuario"
        hideActions
        paperSx={{
          minWidth: { xs: "90vw", sm: 500, md: 700 },
          maxWidth: { xs: "98vw", sm: 700 },
        }}
      >
        <AddUserForm
          onSubmit={handleCreateUser}
          onCancel={handleCloseAddUserModal}
          isLoading={isCreatingUser}
          roles={roles}
        />
      </DialogComponent>
    </Box>
  );
};

export default ManageUsers;
