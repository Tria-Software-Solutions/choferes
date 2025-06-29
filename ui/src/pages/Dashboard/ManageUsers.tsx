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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import ModalComponent from "../../components/Modal/ModalComponent";
import AddUserForm from "../../components/Forms/AddUserForm";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ConfirmationDialog from "../../components/Dialog/ConfirmationDialog";

const ManageUsers: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { users, isLoadingUsers } = useSelector(
    (state: RootState) => state.users
  );
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

  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchUserRoles());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const processUsers = (userList: typeof users) => {
      return userList
        .map((user) => ({
          ...user,
          roleName: user.roles?.map((role: Role) => role.name).join(", ") || "",
        }))
        .filter((user) => {
          if (!showInactive && !user.isActive) return false;
          
          if (!filter.trim()) return true;
          
          const searchText = normalizeString(
            `${user.firstName} ${user.lastName} ${user.email} ${user.username} ${user.roleName}`
          ).toLowerCase();
          
          return searchText.includes(normalizeString(filter).toLowerCase());
        });
    };

    if (users.length > 100) {
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < users.length; i += batchSize) {
        batches.push(users.slice(i, i + batchSize));
      }
      
      return batches.flatMap(processUsers);
    }

    return processUsers(users);
  }, [filter, users, showInactive]);

  const totalCount = useMemo(() => filteredUsers.length, [filteredUsers]);

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
    []
  );

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
          "El valor es inválido.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial"
        );
        return false;
      }

      setError(null);
      return true;
    },
    []
  );

  const isPasswordFormValid = useMemo(() => {
    const { newPassword, confirmNewPassword } = passwordFields;
    
    if (!newPassword.trim() && !confirmNewPassword.trim()) {
      return false;
    }
    
    if (newPassword !== confirmNewPassword) {
      return false;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    return passwordRegex.test(newPassword) && passwordRegex.test(confirmNewPassword);
  }, [passwordFields]);

  const isEditFormValid = useMemo(() => {
    if (editRowId === null) return false;
    return validateFields(editFields, false);
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleEdit = (user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: "",
      roleName: user.roles?.map((role: Role) => role.name).join(", ") || "",
    });
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

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
        showNotification(
          "El rol seleccionado no existe",
          "error",
          5000,
          false
        );
        return;
      }
      dispatch(
        updateUser({
          id,
          updatedUser,
          newRoleId: role.id,
        })
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
      showNotification(
        "La actualización del usuario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancel();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleOpenStatusDialog = async (row: any) => {
    setUserToChange(row);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };

  const handleStatusChange = async () => {
    if (!userToChange) return;
    
    setIsUpdatingUserStatus(true);
    try {
      await dispatch(
        updateUserStatus({
          id: userToChange.id,
          status: !userToChange.isActive,
        })
      );
      setOpenStatusDialog(false);
      setUserToChange(null);
      showNotification(
        "Estado del usuario actualizado exitosamente",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      showNotification(
        "Error al actualizar el estado del usuario",
        "error",
        5000,
        false
      );
    } finally {
      setIsUpdatingUserStatus(false);
    }
  };

  const handleNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: event.target.value,
    });
  };

  const handleConfirmNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      confirmNewPassword: event.target.value,
    });
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleChangePassword = async (
    e: React.FormEvent,
    id: number,
    handleClose: () => void
  ) => {
    e.preventDefault();
    const isValid = await validateNewPasswordFields(passwordFields);
    if (isValid) {
      try {
        await dispatch(
          updateUserPassword({
            id,
            password: passwordFields.newPassword,
          })
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
    }
  };

  const handlePasswordModal = (id: number, handleClose: () => void) => {
    setPasswordFields({ newPassword: "", confirmNewPassword: "" });
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setError(null);
    return modalContentChangeUserPassword(id, handleClose);
  };

  const modalContentChangeUserPassword = (
    id: number,
    handleClose: () => void
  ) => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cambiar Contraseña para Usuario ID: {id}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Ingresa una nueva contraseña para este usuario.
        </Typography>
        <TextField
          label="Nueva Contraseña"
          type={showNewPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={passwordFields.newPassword}
          onChange={handleNewPassword}
          sx={{ mb: 2 }}
          placeholder="Mínimo 8 caracteres"
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
        <TextField
          label="Confirmar Nueva Contraseña"
          type={showConfirmNewPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={passwordFields.confirmNewPassword}
          onChange={handleConfirmNewPassword}
          sx={{ mb: 2 }}
          placeholder="Repite la nueva contraseña"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleToggleConfirmNewPassword}
                  edge="end"
                >
                  {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={(e) => handleChangePassword(e, id, handleClose)}
            disabled={!isPasswordFormValid}
          >
            Cambiar Contraseña
          </Button>
        </Box>
      </Box>
    );
  };

  const handleOpenAddUserModal = () => {
    setOpenAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setOpenAddUserModal(false);
  };

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
      const role = roles.find(r => r.name === userData.roleName);
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
      
      await dispatch(createUser({
        newUser,
        newRoleId: role.id,
      }));
      setOpenAddUserModal(false);
      showNotification(
        "Usuario creado exitosamente",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification(
        "Error al crear el usuario",
        "error",
        5000,
        false
      );
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
    []
  );

  return (
    <Box>
      {isLoadingUsers ? (
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
            <Grid item xs={12} md={6}>
              {filteredUsers && (
                <SearchBar
                  placeholder="Buscar usuario"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{
                    maxWidth: "100%",
                  }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Box
                  onClick={() => setShowInactive(!showInactive)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: theme.palette.text.primary,
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline',
                    },
                    px: 1,
                  }}
                >
                  {showInactive ? (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {showInactive ? 'Mostrando Inactivos' : 'Ocultar Inactivos'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAlt1RoundedIcon />}
                  onClick={handleOpenAddUserModal}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    minHeight: 56,
                  }}
                >
                  Agregar Usuario
                </Button>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredUsers.length > 0 ? (
            <EditableTable<User>
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
              setEditField={(field, value) =>
                setEditFields({ ...editFields, [field]: value })
              }
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
                No se encontraron usuarios para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      {isExpanded && (
        <>
          <ConfirmationDialog
            open={openStatusDialog}
            onClose={handleCloseStatusDialog}
            onConfirm={handleStatusChange}
            title="Cambiar Estado de Usuario"
            message="¿Estás seguro de que deseas cambiar el estado de este usuario?"
            type="warning"
            confirmText="Cambiar Estado"
            cancelText="Cancelar"
            loading={isUpdatingUserStatus}
          />
          <ModalComponent
            buttonType="none"
            open={openAddUserModal}
            onCloseModal={handleCloseAddUserModal}
            modalTitle="Agregar Usuario"
          >
            <AddUserForm
              onSubmit={handleCreateUser}
              onCancel={handleCloseAddUserModal}
              isLoading={isCreatingUser}
              roles={roles}
            />
          </ModalComponent>
        </>
      )}
    </Box>
  );
};

export default ManageUsers;
