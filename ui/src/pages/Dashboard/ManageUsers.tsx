import React, { useState, useEffect, useCallback } from "react";
import { User } from "../../models/User";
import { useUsers } from "../../hooks/useUser";
import { fetchUsers } from "../../services/userService";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";

const ManageUsers = () => {
  const { isLoadingUsers, handleUpdateUser } = useUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const users = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };

    users();
  }, []);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredUsers(
      users.filter((user) =>
        normalizeString(
          `${user.firstName} ${user.lastName} ${user.email} ${user.username}`
        )
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
    );
    setTotalCount(filteredUsers.length);
  }, [filter, users, filteredUsers.length]);

  const validateEditFields = useCallback(() => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ.\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
    const isFirstNameValid =
      nameRegex.test(editFields.firstName) && editFields.firstName !== "";
    const isLastNameValid =
      nameRegex.test(editFields.lastName) && editFields.lastName !== "";
    const isEmailValid =
      emailRegex.test(editFields.email) && editFields.email !== "";
    const isUsernameValid =
      usernameRegex.test(editFields.username) && editFields.username !== "";
    setIsEditFormValid(
      isFirstNameValid && isLastNameValid && isEmailValid && isUsernameValid
    );
  }, [editFields]);

  useEffect(() => {
    if (editRowId !== null) {
      validateEditFields();
    }
  }, [editFields, editRowId, validateEditFields]);

  // const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFilter(e.target.value);
  // };

  const handleEditClick = (user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    const updatedUser = {
      ...editFields,
    };
    handleUpdateUser(id, updatedUser);
    setEditRowId(null);
    setEditFields({ firstName: "", lastName: "", email: "", username: "" });
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setUserToDelete(id);
  };

  // const handleCloseDialog = () => {
  //   setDialogOpen(false);
  //   setUserToDelete(null);
  // };

  // const handleDelete = () => {
  //   if (userToDelete !== null) {
  //     handleDeleteUser(userToDelete);
  //     handleCloseDialog();
  //   }
  // };

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
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredUsers.length > 0 ? (
            <EditableTable<User>
              data={filteredUsers}
              columns={["username", "firstName", "lastName", "email"]}
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
    </Box>
  );
};

export default ManageUsers;
