import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { useRoles } from "../../hooks/useRole";
import { usePermissions } from "../../hooks/usePermission";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddModeratorIcon from "@mui/icons-material/AddModerator";

const ManageRoles = () => {
  const { userPermissions } = useAuth();
  const {
    roles,
    isLoadingRoles,
    createRole,
    getRoles,
    updateRole,
    deleteRole,
  } = useRoles();
  const { permissions, getPermissionsByNames } = usePermissions();
  const { showNotification } = useAppNotifications();
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState<{
    name: string;
    permissionNames: string[];
  }>({
    name: "",
    permissionNames: [],
  });
  const [editFields, setEditFields] = useState<{
    name: string;
    permissionNames: string[];
  }>({
    name: "",
    permissionNames: [],
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
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

    return regex.text.test(fields.name) && fields.permissionNames.length > 0;
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
      const newRole: Omit<Role, "id" | "permissions"> = {
        name: addFields.name,
      };
      await createRole(newRole);
      setAddFields({
        name: "",
        permissionNames: [],
      });
      showNotification(
        "El registro del rol fue exitoso",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al registrar el rol",
        "error",
        5000,
        false
      );
    }
  };

  const handleEditClick = (role: Role) => {
    setEditRowId(role.id);
    setEditFields({
      name: role.name,
      permissionNames: role?.permissionNames || [],
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (id: number) => {
    try {
      const permissions = await getPermissionsByNames(
        editFields.permissionNames
      );
      const updatedRole: Partial<Role> = {
        ...editFields,
      };
      await updateRole(
        id,
        updatedRole,
        permissions.map((permission: Permission) => permission.id)
      );
      await getRoles();
      setEditRowId(null);
      setEditFields({ name: "", permissionNames: [] });
      showNotification(
        "La actualización del rol fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancelClick();
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

  const handleDelete = async () => {
    try {
      if (roleToDelete !== null) {
        await deleteRole(roleToDelete);
        handleCloseDialog();
      }
      showNotification(
        "La eliminación del rol fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancelClick();
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
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={3} lg={6}>
              {filteredRoles && (
                <SearchBar
                  placeholder="Buscar rol"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={9} lg={6}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4} lg={3}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.name}
                      onChange={(e) =>
                        setAddFields({
                          ...addFields,
                          name: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={8} lg={9}>
                    <Autocomplete
                      multiple
                      limitTags={2}
                      value={permissions.filter((permission) =>
                        addFields.permissionNames.includes(permission.name)
                      )}
                      onChange={(event, newValue) => {
                        setAddFields({
                          ...addFields,
                          permissionNames: newValue.map(
                            (permission) => permission.name
                          ),
                        });
                      }}
                      options={permissions}
                      getOptionLabel={(option) => option.name}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip key={key} label={option.name} {...tagProps} />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Permisos"
                          variant="outlined"
                          fullWidth
                          placeholder="Buscar Permisos"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Tooltip title="Agregar Rol" arrow>
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
                      <AddModeratorIcon />
                    </Button>
                  </Box>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredRoles.length > 0 ? (
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
