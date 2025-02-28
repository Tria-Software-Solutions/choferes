import React, { useState, useEffect, useCallback } from "react";
import { Permission } from "../../models/Permission";
import { useUsers } from "../../hooks/useUser";
import { fetchPermissions } from "../../services/permissionService";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";

const ManagePermissions = () => {
  const { isLoadingPermissions, handleUpdatePermission } = useUsers();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    name: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<number | null>(
    null
  );
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const getAllPermissions = async () => {
      const fetchedPermissions = await fetchPermissions();
      setPermissions(fetchedPermissions);
    };

    getAllPermissions();
  }, []);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredPermissions(
      permissions.filter((permission) =>
        normalizeString(`${permission.name}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
    );
    setTotalCount(filteredPermissions.length);
  }, [filter, permissions, filteredPermissions.length]);

  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    return regex.text.test(fields.name);
  }, []);

  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleEditClick = (permission: Permission) => {
    setEditRowId(permission.id);
    setEditFields({
      name: permission.name,
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    const updatedPermission = {
      ...editFields,
    };
    handleUpdatePermission(id, updatedPermission);
    setEditRowId(null);
    setEditFields({ name: "" });
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setPermissionToDelete(id);
  };

  // const handleCloseDialog = () => {
  //   setDialogOpen(false);
  //   setPermissionToDelete(null);
  // };

  // const handleDelete = () => {
  //   if (permissionToDelete !== null) {
  //     handleDeletePermission(permissionToDelete);
  //     handleCloseDialog();
  //   }
  // };

  return (
    <Box>
      {isLoadingPermissions ? (
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
          {filteredPermissions.length > 0 ? (
            <Stack spacing={2}>
              <Box>
                <SearchBar
                  placeholder="Buscar permiso"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              </Box>
              <EditableTable<Permission>
                data={filteredPermissions}
                columns={["name"]}
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
                No se encontraron permisos para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ManagePermissions;
