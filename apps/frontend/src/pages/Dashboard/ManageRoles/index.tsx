import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Role } from "../../../models/Role";
import { Permission } from "../../../models/Permission";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
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
  Checkbox,
  CircularProgress,
  FormControl,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import AddRoleForm from "../../Forms/AddRoleForm";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { Check, Plus, PlusCircle, Shield, Trash2, X } from "lucide-react";
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
import { useLocation } from "react-router-dom";
import { useTablePreferences } from '../../../hooks/useTablePreferences';

// ManageRoles page component for role management in the dashboard
const ManageRoles: React.FC<{ isExpanded?: boolean; hideHeader?: boolean }> = ({
  isExpanded = true,
  hideHeader = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { roles, isLoadingRoles } = useSelector(
    (state: RootState) => state.roles,
  );
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const { showNotification } = useAppNotifications();
  const location = useLocation();

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
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  const getInitialRowsPerPage = () => {
    if (typeof window !== 'undefined') {
      const maxHeight = window.innerHeight * 0.6;
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

  // Loads roles, permissions, and role permissions data on mount
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
    dispatch(fetchRolePermissions());
  }, [dispatch, location.pathname]);

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
  const handleOpenDeleteDialog = (id: number) => {
    setOpenDeleteDialog(true);
    setRoleToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRoleToDelete(null);
  };

  // Handles deleting a role
  const handleDelete = async () => {
    if (!roleToDelete) return;

    setIsDeletingRole(true);
    try {
      await dispatch(deleteRole(roleToDelete));
      setOpenDeleteDialog(false);
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
  const handleOpenAddRoleModal = () => {
    setOpenAddRoleModal(true);
  };

  const handleCloseAddRoleModal = () => {
    setOpenAddRoleModal(false);
  };

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
      setOpenAddRoleModal(false);
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
  const renderColumnValue = (column: string, value: unknown) => {
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
  };

  return (
    <Box sx={{ height: "100%", minHeight: "500px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Premium Card with Header and Grid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!hideHeader && (
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Shield size={20} strokeWidth={1.5} />
                </Box>
                <Box>
                  <Typography
                    variant={isSmallScreen ? "h6" : "h5"}
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.15rem" },
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
                      fontSize: "0.7rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {filteredRoles.length} roles configurados
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Controls Row */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            {/* Search */}
            <Box flex={1} maxWidth={{ sm: "320px" }}>
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
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
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
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {isLoadingRoles ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingRoles}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : hideHeader ? (
            /* Compact preview list for Profile mode */
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 0 }}>
              {filteredRoles.slice(0, 5).map((role, i) => {
                const isEditing = editRowId === role.id;
                return (
                  <Box
                    key={role.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: { xs: 2, sm: 2.5 },
                      py: isEditing ? 1.25 : 1.5,
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                      backgroundColor: isEditing
                        ? (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                        : (i % 2 === 0 ? "transparent" : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)")),
                      transition: "background-color 0.15s",
                      "&:hover": {
                        backgroundColor: isEditing
                          ? (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                          : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"),
                      },
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                            flexShrink: 0,
                            alignSelf: "flex-start",
                            mt: 1.25,
                          }}
                        >
                          <Shield size={14} strokeWidth={1.5} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.25 } }}>
                          {/* Section: Información del rol */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: theme.palette.text.disabled,
                              mb: 0.25,
                            }}
                          >
                            Información del rol
                          </Typography>
                          <TextField
                            size="small"
                            value={editFields.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditFields((prev) => ({ ...prev, name: value }));
                            }}
                            placeholder="Nombre del rol"
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.015)',
                              },
                              '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.75, px: 1 },
                            }}
                          />
                          {/* Section: Permisos */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: theme.palette.text.disabled,
                              mt: 0.25,
                              mb: 0.25,
                            }}
                          >
                            Permisos del rol
                          </Typography>
                          <FormControl size="small" fullWidth>
                            <Select
                              multiple
                              value={editFields.permissionNames}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEditFields((prev) => ({
                                  ...prev,
                                  permissionNames: typeof value === 'string' ? value.split(',') : value,
                                }));
                              }}
                              renderValue={(selected) => {
                                if (selected.length === 0) {
                                  return <Typography sx={{ color: "text.disabled", fontSize: "0.8rem" }}>Seleccionar permisos</Typography>;
                                }
                                return (
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}>
                                      {selected.length} permiso{selected.length !== 1 ? 's' : ''} seleccionados
                                    </Typography>
                                  </Box>
                                );
                              }}
                              sx={{
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.06)",
                                border: `1.5px solid ${theme.palette.mode === "dark" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.25)"}`,
                                borderRadius: "10px",
                                fontSize: "0.8rem",
                                '& .MuiSelect-select': { py: 0.75, px: 1 },
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                },
                              }}
                            >
                              {permissions.map((perm) => (
                                <MenuItem key={perm.id} value={perm.name} sx={{ fontSize: '0.8rem' }}>
                                  <Checkbox
                                    checked={editFields.permissionNames.includes(perm.name)}
                                    size="small"
                                    sx={{ py: 0.25 }}
                                  />
                                  <ListItemText primary={perm.name} sx={{ '& .MuiListItemText-primary': { fontSize: '0.8rem' } }} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, alignSelf: "flex-start", mt: 1.25 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleUpdate(role.id)}
                            disabled={!isEditFormValid}
                            startIcon={<Check size={14} />}
                            sx={{
                              minWidth: "auto",
                              px: 1.5,
                              py: 0.5,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "none",
                              borderRadius: "8px",
                              boxShadow: "none",
                              '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                            }}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancel}
                            startIcon={<X size={14} />}
                            sx={{
                              minWidth: "auto",
                              px: 1.5,
                              py: 0.5,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: "text.secondary",
                              textTransform: "none",
                              borderRadius: "8px",
                              borderColor: 'divider',
                            }}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                            flexShrink: 0,
                          }}
                        >
                          <Shield size={14} strokeWidth={1.5} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {role.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", display: "block" }}>
                            {role.permissionNames?.length || 0} permisos
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleEdit(role)}
                            sx={{ minWidth: "auto", px: 1, fontSize: "0.7rem", fontWeight: 600, color: "primary.main", textTransform: "none" }}
                          >
                            Editar
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
              {filteredRoles.length > 5 && (
                <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 500, fontSize: "0.7rem" }}>
                    +{filteredRoles.length - 5} roles más
                  </Typography>
                </Box>
              )}
              {filteredRoles.length === 0 && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 100 }}>
                  <Typography variant="body2" color="textSecondary">
                    {DASHBOARD_ROLES.NO_ROLES}
                  </Typography>
                </Box>
              )}
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
          <DialogComponent
            open={openDeleteDialog}
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
          <DialogComponent
            open={openAddRoleModal}
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
          </DialogComponent>
        </>
      )}
    </Box>
  );
};

export default ManageRoles;
