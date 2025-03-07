import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../models/Role";
import { useRoles } from "../../hooks/useRole";
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

const ManageRoles = () => {
  const { userPermissions } = useAuth();
  const { roles, isLoadingRoles, updateRole, deleteRole } = useRoles();
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
    name: string;
    permissionName: string[];
  }>({
    name: "",
    permissionName: [],
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = roles
      .filter((role) =>
        normalizeString(`${role.name}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
      .map((role) => ({
        ...role,
        rolePermissions:
          role.Permissions?.map((permission) => permission.name).join(", ") ||
          "Sin permisos",
      }));
    setFilteredRoles(filtered);
    setTotalCount(filtered.length);
  }, [filter, roles]);

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

  const handleEditClick = (role: Role) => {
    setEditRowId(role.id);
    setEditFields({
      name: role.name,
      permissionName: role.Permissions.map((permission) => permission.name),
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    const updatedRole = {
      id,
      name: editFields.name,
      Permissions: editFields.permissionName.map((permissionName) => {
        const existingPermission = roles
          .find((role) => role.id === id)
          ?.Permissions.find(
            (permission) => permission.name === permissionName.trim()
          );
        return existingPermission
          ? { id: existingPermission.id, name: permissionName.trim() }
          : { id: 0, name: permissionName.trim() };
      }),
    };
    updateRole(id, updatedRole);
    setEditRowId(null);
    setEditFields({ name: "", permissionName: [] });
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setRoleToDelete(id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleDelete = () => {
    if (roleToDelete !== null) {
      deleteRole(roleToDelete);
      handleCloseDialog();
    }
  };

  return (
    <Box>
      {isLoadingRoles ? (
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
            open={isLoadingRoles}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <>
          {filteredRoles.length > 0 ? (
            <Stack spacing={2}>
              <Box>
                <SearchBar
                  placeholder="Buscar rol"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              </Box>
              <EditableTable<Role>
                data={filteredRoles}
                columns={["name", "permissionName"]}
                editRowId={editRowId}
                editFields={{
                  ...editFields,
                  permissionName: editFields.permissionName.join(", "),
                }}
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
                No se encontraron roles para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este rol?
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

export default ManageRoles;
