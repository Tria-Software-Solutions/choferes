import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { useRoles } from "../../hooks/useRole";
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

const ManageRoles = () => {
  const { userPermissions } = useAuth();
  const { roles, isLoadingRoles, updateRole, deleteRole } = useRoles();
  const { showNotification } = useAppNotifications();
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    name: "",
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
      .map((role) => ({
        ...role,
        permissionNames: (role.permissions ?? []).map(
          (permission: Permission) => permission.name
        ),
      }))
      .filter((role) =>
        normalizeString(`${role.name} ${role.permissionNames}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      );

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
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    try {
      const updatedRole = {
        ...editFields,
      };
      updateRole(id, updatedRole);
      setEditRowId(null);
      setEditFields({ name: "" });
      showNotification(
        "La actualización del rol fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el rol",
        "error",
        5000,
        false
      );
    }
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
    try {
      if (roleToDelete !== null) {
        deleteRole(roleToDelete);
        handleCloseDialog();
      }
      showNotification(
        "La eliminación del rol fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al eliminar el empleado",
        "error",
        5000,
        false
      );
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
                columns={["name", "permissionNames"]}
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
