import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Role } from "../../../models/Role";
import { Permission } from "../../../models/Permission";
import { useReduxData, useAppDispatch } from "../../../hooks/useReduxData";
import { useModal } from "../../../hooks/useModal";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../../store/slices/rolesSlice";
import { fetchPermissions } from "../../../store/slices/permissionsSlice";
import { fetchRolePermissions } from "../../../store/slices/rolePermissionsSlice";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { createRoleNotification } from "../../../services/notificationService";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import AddRoleForm from "../../Forms/AddRoleForm";
import AppModal from "../../../components/AppModal/AppModal.component";
import { Plus, Trash2, PlusCircle, Shield } from "lucide-react";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import { DASHBOARD_ROLES } from "../../../constants/constants";
import { NOTIFICATIONS } from "../../../constants/constants";
import {
  permissionNamesBoxStyles,
  permissionChipStyles,
  loadingBoxStyles,
  backdropStyles,
  noRolesBoxStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useTablePreferences } from '../../../hooks/useTablePreferences';

// ManageRoles page component for role management in the dashboard
const ManageRoles: React.FC<{ isExpanded?: boolean }> = ({
  isExpanded = true,
}) => {
  const dispatch = useAppDispatch();
  const { userPermissions } = useAuthContext();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { roles, isLoadingRoles } = useReduxData(
    (state) => state.roles,
    (prev, next) => prev.roles === next.roles && prev.isLoadingRoles === next.isLoadingRoles
  );
  const { permissions } = useReduxData(
    (state) => state.permissions,
    (prev, next) => prev.permissions === next.permissions
  );
  const { showNotification } = useAppNotifications();

  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
    name: string;
    permissionNames: string[];
  }>({
    name: "",
    permissionNames: [],
  });
  const deleteDialog = useModal();
  const addRoleModal = useModal();
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  const paperSx = useMemo(() => ({
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    overflow: "visible",
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  }), []);

  const getInitialRowsPerPage = () => {
    if (typeof window !== 'undefined') {
      const maxHeight = window.innerHeight * 0.48;
      const headHeight = 56;
      const paginationHeight = 64;
      const extra = 24;
      const availableHeight = maxHeight - headHeight - paginationHeight - extra;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      return Math.max(3, Math.min(100, rows));
    }
    return 25;
  };

  const { search, setSearch, rowsPerPage, setRowsPerPage } = useTablePreferences('roles', getInitialRowsPerPage);

  // Loads roles, permissions, and role permissions data on mount (only if not already loaded)
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(fetchRoles());
    }
    if (permissions.length === 0) {
      dispatch(fetchPermissions());
    }
    dispatch(fetchRolePermissions());
  }, [dispatch, roles.length, permissions.length]);

  // Filters roles based on search input
  const filteredRoles = useMemo(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return roles
      .map((role) => ({
        ...role,
        permissionNames: (role.permissions ?? []).map(
          (permission: Permission) => permission.name,
        ),
      }))
      .filter((role) =>
        normalizeString(`${role.name} ${role.permissionNames}`)
          .toLowerCase()
          .includes(normalizeString(search).toLowerCase()),
      );
  }, [search, roles]);

  const totalCount = useMemo(() => filteredRoles.length, [filteredRoles]);

  // Validates role fields for add/edit forms
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

  const handleEdit = useCallback((role: Role) => {
    setEditRowId(role.id);
    setEditFields({
      name: role.name,
      permissionNames: role?.permissionNames || [],
    });
  }, []);

  const handleCancel = useCallback(() => {
    setEditRowId(null);
  }, []);

  // Handles updating a role
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
            .filter(
              (permission) =>
                Array.isArray(editFields.permissionNames) &&
                editFields.permissionNames.includes(permission.name),
            )
            .map((permission) => permission.id),
        }),
      );
      setEditRowId(null);
      setEditFields({ name: "", permissionNames: [] });
      showNotification(NOTIFICATIONS.ROLE_UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
      
      // Add notification to menu
      createRoleNotification('updated', editFields.name);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.ROLE_UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  // Handles opening/closing delete dialog
  const handleOpenDeleteDialog = useCallback((id: number) => {
    deleteDialog.open();
    setRoleToDelete(id);
  }, [deleteDialog]);

  const handleCloseDeleteDialog = useCallback(() => {
    deleteDialog.close();
    setRoleToDelete(null);
  }, [deleteDialog]);

  // Handles deleting a role
  const handleDelete = async () => {
    if (!roleToDelete) return;

    setIsDeletingRole(true);
    try {
      await dispatch(deleteRole(roleToDelete));
      deleteDialog.close();
      setRoleToDelete(null);
      showNotification(NOTIFICATIONS.ROLE_DELETE_SUCCESS, { severity: 'success', duration: 3000 });
      
      // Add notification to menu
      const role = roles.find(r => r.id === roleToDelete);
      if (role) {
        createRoleNotification('deleted', role.name);
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.ROLE_DELETE_ERROR, { severity: 'error', duration: 5000 });
    } finally {
      setIsDeletingRole(false);
    }
  };

  // Handles opening/closing add role modal
  const handleOpenAddRoleModal = useCallback(() => {
    addRoleModal.open();
  }, [addRoleModal]);

  const handleCloseAddRoleModal = useCallback(() => {
    addRoleModal.close();
  }, [addRoleModal]);

  // Handles creating a new role
  const handleCreateRole = async (roleData: {
    name: string;
    permissions: string[];
  }) => {
    setIsCreatingRole(true);
    try {
      const newRole = {
        name: roleData.name,
        permissionNames: permissions
          .filter(
            (permission) =>
              Array.isArray(roleData.permissions) &&
              roleData.permissions.includes(permission.id.toString()),
          )
          .map((permission) => permission.name),
      };

      await dispatch(
        createRole({
          newRole,
          newPermissionIds: roleData.permissions.map((id) => parseInt(id)),
        }),
      );
      addRoleModal.close();
      showNotification(NOTIFICATIONS.ROLE_CREATE_SUCCESS, { severity: 'success', duration: 3000 });
      
      // Add notification to menu
      createRoleNotification('created', roleData.name);
    } catch (error) {
      showNotification(NOTIFICATIONS.ROLE_CREATE_ERROR, { severity: 'error', duration: 5000 });
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Renders column values for the table
  const renderColumnValue = useCallback((column: string, value: unknown) => {
    if (column === "permissionNames" && Array.isArray(value)) {
      return (
        <Box sx={permissionNamesBoxStyles}>
          {value.map((permission: string, index: number) => (
            <Box key={index} sx={permissionChipStyles(theme)}>
              {permission}
            </Box>
          ))}
        </Box>
      );
    }
    return value as React.ReactNode;
  }, [theme]);

  return (
    <Box sx={{ height: "calc(100vh - 64px - 32px)", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      {/* Premium Card with Header and Grid */}
      <Paper
        elevation={0}
        sx={paperSx}
      >
        {/* Header Section */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "10px",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={22} color={theme.palette.primary.contrastText} />
              </Box>
              <Box>
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    color: theme.palette.text.primary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {isSmallScreen ? PAGE_TITLE.ROLES_SIMPLIFIED : PAGE_TITLE.ROLES}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredRoles.length} roles configurados
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Controls Row */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            {/* Search */}
            <Box flex={1} maxWidth={{ sm: "380px" }}>
              {filteredRoles && (
                <SearchBarComponent
                  placeholder={DASHBOARD_ROLES.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              )}
            </Box>

            {/* Add Button */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleOpenAddRoleModal}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "-0.01em",
                  borderRadius: '10px',
                }}
              >
                {DASHBOARD_ROLES.ADD}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Mobile Add Button */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 1.5, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Plus size={18} />}
            onClick={handleOpenAddRoleModal}
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            {DASHBOARD_ROLES.ADD}
          </Button>
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
          {isLoadingRoles ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingRoles}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : (
            <>
              {filteredRoles.length > 0 ? (
                <EditableTableComponent<Role>
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
                  page={0}
                  rowsPerPage={rowsPerPage}
                  setPage={(newPage) => setSearch(search)}
                  setRowsPerPage={setRowsPerPage}
                  isSaveDisabled={!isEditFormValid}
                  userPermissions={userPermissions}
                  renderColumnValue={renderColumnValue}
                  isExpanded={isExpanded}
                />
              ) : (
                <Box sx={noRolesBoxStyles}>
                  <Typography variant="h6" color="textSecondary">
                    {DASHBOARD_ROLES.NO_ROLES}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Dialogs - Outside the main Paper */}
      {isExpanded && (
        <>
          <AppModal
            open={deleteDialog.isOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDelete}
            title={DASHBOARD_ROLES.DIALOG_DELETE_TITLE}
            message={DASHBOARD_ROLES.DIALOG_DELETE_MESSAGE}
            type="delete"
            confirmText={DASHBOARD_ROLES.DIALOG_DELETE_CONFIRM}
            cancelText={DASHBOARD_ROLES.DIALOG_DELETE_CANCEL}
            loading={isDeletingRole}
            paperSx={deleteDialogPaperSx ?? {}}
            icon={<Trash2 color="var(--mui-palette-error-main)" />}
          />
          <AppModal
            open={addRoleModal.isOpen}
            onClose={handleCloseAddRoleModal}
            title={DASHBOARD_ROLES.DIALOG_ADD_TITLE}
            subtitle={DASHBOARD_ROLES.DIALOG_ADD_SUBTITLE}
            hideActions
            paperSx={addDialogPaperSx ?? {}}
            icon={<PlusCircle color="var(--mui-palette-info-main)" />}
          >
            <AddRoleForm
              onSubmit={handleCreateRole}
              onCancel={handleCloseAddRoleModal}
              isLoading={isCreatingRole}
              permissions={permissions}
            />
          </AppModal>
        </>
      )}
    </Box>
  );
};

export default ManageRoles;
