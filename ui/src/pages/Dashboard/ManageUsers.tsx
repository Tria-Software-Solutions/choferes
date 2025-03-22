import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { useUsers } from "../../hooks/useUser";
import { useRoles } from "../../hooks/useRole";
import { useUserRoles } from "../../hooks/useUserRole";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
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
  Tooltip,
  Typography,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ManageUsers = () => {
  const { userPermissions } = useAuth();
  const {
    users,
    isLoadingUsers,
    createUser,
    getUsers,
    updateUser,
    deleteUser,
  } = useUsers();
  const { getRoleByName } = useRoles();
  const { getUserRoleByUserId } = useUserRoles();
  const { showNotification } = useAppNotifications();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = users
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

    setFilteredUsers(filtered);
    setTotalCount(filtered.length);
  }, [filter, users]);

  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      username: /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    return (
      regex.text.test(fields.firstName) &&
      regex.text.test(fields.lastName) &&
      regex.email.test(fields.email) &&
      regex.username.test(fields.username) &&
      regex.password.test(fields.password)
    );
  }, []);

  useEffect(
    () => setIsAddFormValid(validateFields(addFields)),
    [addFields, validateFields]
  );

  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleAdd = async () => {
    try {
      const newUser: Omit<User, "id" | "role"> = {
        firstName: addFields.firstName,
        lastName: addFields.lastName,
        email: addFields.email,
        username: addFields.username,
        password: addFields.password,
      };
      await createUser(newUser);
      setAddFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleName: "",
      });
      showNotification(
        "El registro del usuario fue exitoso",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al registrar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleEditClick = (user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: user.password,
      roleName: user?.roleName || "",
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (id: number) => {
    try {
      const role = await getRoleByName(editFields.roleName);
      const updatedUser: Partial<User> = {
        ...editFields,
      };
      await updateUser(id, updatedUser, role.id);
      await getUsers();
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
      handleCancelClick();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setUserToDelete(id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    try {
      if (userToDelete !== null) {
        const userRoleToDelete = await getUserRoleByUserId(userToDelete);
        await deleteUser(userToDelete, userRoleToDelete.id);
        handleCloseDialog();
      }
      showNotification(
        "La eliminación del usuario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancelClick();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
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
            <Grid item xs={12} md={2} lg={4}>
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
            <Grid item xs={12} md={10} lg={8}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} md={2} lg={2}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.firstName}
                      onChange={(e) =>
                        setAddFields({
                          ...addFields,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2} lg={2}>
                    <TextField
                      label="Apellido"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.lastName}
                      onChange={(e) =>
                        setAddFields({ ...addFields, lastName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3} lg={3}>
                    <TextField
                      label="Correo Eléctronico"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.email}
                      onChange={(e) =>
                        setAddFields({ ...addFields, email: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2} lg={2}>
                    <TextField
                      label="Usuario"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.username}
                      onChange={(e) =>
                        setAddFields({ ...addFields, username: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={3} lg={3}>
                    <TextField
                      label="Contraseña"
                      variant="outlined"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.password}
                      onChange={(e) =>
                        setAddFields({ ...addFields, password: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Tooltip title="Agregar Usuario" arrow>
                  <Box
                    sx={{
                      width: { xs: "100%", md: "auto" },
                      display: "flex",
                      justifyContent: { xs: "stretch", md: "flex-end" },
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        minHeight: 56,
                        display: "flex",
                        justifyContent: "center",
                        lineHeight: "normal",
                        width: { xs: "100%", md: "auto" },
                      }}
                      onClick={handleAdd}
                      disabled={!isAddFormValid}
                    >
                      <PersonAddAlt1RoundedIcon />
                    </Button>
                  </Box>
                </Tooltip>
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
              handleEditClick={handleEditClick}
              handleCancelClick={handleCancelClick}
              handleSaveClick={handleSaveClick}
              handleOpenDialog={handleOpenDialog}
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              userPermissions={userPermissions}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este usuario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button color="secondary" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
