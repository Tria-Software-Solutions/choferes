import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../store/slices/rolesSlice";
import { fetchPermissions } from "../../store/slices/permissionsSlice";
import { fetchRolePermissions } from "../../store/slices/rolePermissionsSlice";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import ModalComponent from "../../components/Modal/ModalComponent";
import AddRoleForm from "../../components/Forms/AddRoleForm";
import AddModeratorIcon from "@mui/icons-material/AddModerator";
import ConfirmationDialog from "../../components/Dialog/ConfirmationDialog";

const ManageRoles: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { roles, isLoadingRoles } = useSelector(
    (state: RootState) => state.roles
  );
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const { showNotification } = useAppNotifications();
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
    name: string;
    permissionNames: string[];
  }>({
    name: "",
    permissionNames: [],
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
    dispatch(fetchRolePermissions());
  }, [dispatch]);

  const filteredRoles = useMemo(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return roles
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
  }, [filter, roles]);

  const totalCount = useMemo(() => filteredRoles.length, [filteredRoles]);

  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    return regex.text.test(fields.name) && fields.permissionNames.length > 0;
  }, []);

  const isEditFormValid = useMemo(() => {
    if (editRowId === null) return false;
    return validateFields(editFields);
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleEdit = (role: Role) => {
    setEditRowId(role.id);
    setEditFields({
      name: role.name,
      permissionNames: role?.permissionNames || [],
    });
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  const handleUpdate = async (id: number) => {
    try {
      const updatedRole: Partial<Role> = {
        ...editFields,
      };
      dispatch(
        updateRole({
          id,
          updatedRole,
          newPermissionIds: permissions
            .filter((permission) => editFields.permissionNames.includes(permission.name))
            .map((permission) => permission.id),
        })
      );
      setEditRowId(null);
      setEditFields({ name: "", permissionNames: [] });
      showNotification(
        "La actualización del rol fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancel();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el rol",
        "error",
        5000,
        false
      );
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setOpenDeleteDialog(true);
    setRoleToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRoleToDelete(null);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    
    setIsDeletingRole(true);
    try {
      await dispatch(deleteRole(roleToDelete));
      setOpenDeleteDialog(false);
      setRoleToDelete(null);
      showNotification(
        "Rol eliminado exitosamente",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error("Error deleting role:", error);
      showNotification(
        "Error al eliminar el rol",
        "error",
        5000,
        false
      );
    } finally {
      setIsDeletingRole(false);
    }
  };

  const handleOpenAddRoleModal = () => {
    setOpenAddRoleModal(true);
  };

  const handleCloseAddRoleModal = () => {
    setOpenAddRoleModal(false);
  };

  const handleCreateRole = async (roleData: {
    name: string;
    permissions: string[];
  }) => {
    setIsCreatingRole(true);
    try {
      const newRole = {
        name: roleData.name,
        permissionNames: permissions
          .filter((permission) => roleData.permissions.includes(permission.id.toString()))
          .map((permission) => permission.name),
      };
      
      await dispatch(createRole({
        newRole,
        newPermissionIds: roleData.permissions.map(id => parseInt(id)),
      }));
      setOpenAddRoleModal(false);
      showNotification(
        "Rol creado exitosamente",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error("Error creating role:", error);
      showNotification(
        "Error al crear el rol",
        "error",
        5000,
        false
      );
    } finally {
      setIsCreatingRole(false);
    }
  };

  const renderColumnValue = (column: keyof Role, value: any) => {
    if (column === "permissionNames" && Array.isArray(value)) {
      return (
        <Stack direction="row" spacing={0.75} flexWrap={editRowId !== null ? 'nowrap' : 'wrap'} useFlexGap>
          {value.map((permission: string, index: number) => (
            <Chip
              key={index}
              label={permission}
              size="small"
              sx={{
                backgroundColor: 'primary.main',
                color: '#fff',
                border: '1px solid',
                borderColor: 'primary.dark',
                fontWeight: 500,
                fontSize: '0.85rem',
                px: 1.2,
                py: 0.5,
                borderRadius: 2,
                boxShadow: 1,
                letterSpacing: 0.2,
                mb: 0.5,
                '& .MuiChip-label': {
                  color: '#fff',
                  fontWeight: 500,
                  px: 0.5,
                },
              }}
            />
          ))}
        </Stack>
      );
    }
    return value;
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Button
                  variant="contained"
                  startIcon={<AddModeratorIcon />}
                  onClick={handleOpenAddRoleModal}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    minHeight: 56,
                  }}
                >
                  Agregar Rol
                </Button>
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
              handleEdit={handleEdit}
              handleCancel={handleCancel}
              handleUpdate={handleUpdate}
              handleOpenDeleteDialog={handleOpenDeleteDialog}
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              userPermissions={userPermissions}
              renderColumnValue={renderColumnValue}
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
                No se encontraron roles para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      {isExpanded && (
        <>
          <ConfirmationDialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDelete}
            title="Eliminar Rol"
            message="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
            type="delete"
            confirmText="Eliminar"
            cancelText="Cancelar"
            loading={isDeletingRole}
          />
          <ModalComponent
            buttonType="none"
            open={openAddRoleModal}
            onCloseModal={handleCloseAddRoleModal}
            modalTitle="Agregar Rol"
          >
            <AddRoleForm
              onSubmit={handleCreateRole}
              onCancel={handleCloseAddRoleModal}
              isLoading={isCreatingRole}
              permissions={permissions}
            />
          </ModalComponent>
        </>
      )}
    </Box>
  );
};

export default ManageRoles;
