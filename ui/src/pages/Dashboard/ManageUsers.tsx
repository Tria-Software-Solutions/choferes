import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { useUsers } from "../../hooks/useUser";
// import { useRoles } from "../../hooks/useRole";
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
  Stack,
  Typography,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";

const ManageUsers = () => {
  const { userPermissions } = useAuth();
  const { users, isLoadingUsers, updateUser, deleteUser } = useUsers();
  // const { getRoleByName } = useRoles();
  const { getUserRoleByUserId } = useUserRoles();
  const { showNotification } = useAppNotifications();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roleName: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
    };

    return (
      regex.text.test(fields.firstName) &&
      regex.text.test(fields.lastName) &&
      regex.email.test(fields.email) &&
      regex.username.test(fields.username)
    );
  }, []);

  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleEditClick = (user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      roleName: user?.roleName || "",
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (id: number) => {
    try {
      // const newRole = await getRoleByName(editFields.roleName);
      // await updateUserRole(id, newRole.id);
      const updatedUser = { ...editFields };
      await updateUser(id, updatedUser);
      setEditRowId(null);
      setEditFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        roleName: "",
      });
      showNotification(
        "La actualización del usuario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
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
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el usuario",
        "error",
        5000,
        false
      );
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
          {filteredUsers.length > 0 ? (
            <Stack spacing={2}>
              <Box>
                <SearchBar
                  placeholder="Buscar usuario"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              </Box>
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
                permissions={userPermissions}
              />
            </Stack>
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
