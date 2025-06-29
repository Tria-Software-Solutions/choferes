import React, { useState, useEffect, useCallback } from "react";
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
  Stack,
  TextField,
  Typography,
  useTheme,
  Tooltip,
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

const ManageUsers: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { users, isLoadingUsers } = useSelector(
    (state: RootState) => state.users
  );
  const { roles } = useSelector((state: RootState) => state.roles);
  const { showNotification } = useAppNotifications();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
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
  const [, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [isPasswordFormValid, setIsPasswordFormValid] = useState(false);
  
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchUserRoles());
  }, [dispatch]);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let filtered = users
      .map((user) => ({
        ...user,
        roleName: user.roles?.map((role: Role) => role.name).join(", "),
      }))
      .filter((user) =>
        normalizeString(
          `${user.firstName} ${user.lastName} ${user.email} ${user.username} ${user.roleName}`
        )
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      );

    if (!showInactive) {
      filtered = filtered.filter((user) => user.isActive);
    }

    setFilteredUsers(filtered);
    setTotalCount(filtered.length);
  }, [filter, users, showInactive]);

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

  useEffect(() => {
    setIsAddFormValid(validateFields(addFields, true));
  }, [addFields, validateFields]);

  useEffect(() => {
    if (editRowId !== null) {
      setIsEditFormValid(validateFields(editFields, false));
    }
  }, [editFields, editRowId, validateFields]);

  useEffect(() => {
    const validatePassword = async () => {
      const isValid = await validateNewPasswordFields(passwordFields);
      setIsPasswordFormValid(isValid);
    };
    validatePassword();
  }, [passwordFields, validateNewPasswordFields]);

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
    if (userToChange) {
      try {
        await dispatch(
          updateUserStatus({
            id: userToChange.id,
            status: !userToChange.isActive,
          })
        );
        setOpenStatusDialog(false);
        showNotification(
          "El estado del usuario fue actualizado exitosamente",
          "success",
          3000,
          false
        );
      } catch (error) {
        console.error(error);
        showNotification(
          "Ha ocurrido un error al actualizar el estado del usuario",
          "error",
          5000,
          false
        );
      }
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

  const modalContentChangeUserPassword = (
    id: number,
    handleClose: () => void
  ) => (
    <Box component="form" onSubmit={(e) => handleChangePassword(e, id, handleClose)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Cambiar Contraseña
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Nueva Contraseña"
            type={showNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={passwordFields.newPassword}
            onChange={handleNewPassword}
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
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Confirmar Nueva Contraseña"
            type={showConfirmNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={passwordFields.confirmNewPassword}
            onChange={handleConfirmNewPassword}
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
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
              {error}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isPasswordFormValid}
            >
              Cambiar Contraseña
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

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
                <Tooltip 
                  title={showInactive 
                    ? "Mostrando usuarios activos e inactivos" 
                    : "Solo mostrando usuarios activos"
                  }
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 2,
                      border: `2px solid ${showInactive ? theme.palette.primary.main : theme.palette.secondary.main}`,
                      backgroundColor: showInactive 
                        ? `${theme.palette.primary.main}10` 
                        : `${theme.palette.secondary.main}10`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: showInactive 
                          ? `0 4px 12px ${theme.palette.primary.main}30`
                          : `0 4px 12px ${theme.palette.secondary.main}30`,
                        borderColor: showInactive 
                          ? theme.palette.primary.dark 
                          : theme.palette.secondary.dark,
                        backgroundColor: showInactive 
                          ? `${theme.palette.primary.main}20` 
                          : `${theme.palette.secondary.main}20`,
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                    onClick={() => setShowInactive(!showInactive)}
                  >
                    {showInactive ? (
                      <>
                        <VisibilityIcon 
                          sx={{ 
                            color: theme.palette.primary.main,
                            fontSize: 20 
                          }} 
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Mostrando Inactivos
                        </Typography>
                      </>
                    ) : (
                      <>
                        <VisibilityOffIcon 
                          sx={{ 
                            color: theme.palette.secondary.main,
                            fontSize: 20 
                          }} 
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.secondary.main,
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Ocultar Inactivos
                        </Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>
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
              handlePasswordModal={modalContentChangeUserPassword}
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              userPermissions={userPermissions}
              isExpanded={isExpanded}
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
          <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
            <DialogTitle>Confirmar</DialogTitle>
            <DialogContent>
              <Typography>
                ¿Estás seguro de que deseas cambiar el estado de este usuario?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button color="primary" sx={{ flex: 1 }} onClick={handleStatusChange}>
                Aceptar
              </Button>
              <Button
                color="secondary"
                sx={{ flex: 1 }}
                onClick={handleCloseStatusDialog}
              >
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>
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
