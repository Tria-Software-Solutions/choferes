import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeAvatar,
  removeEmployeeAvatar,
} from "../../../store/slices/employeeSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import StickyDataGridComponent from "../../../components/Table/StickyDataGrid/StickyDataGrid.component";
import { GridColDef } from "@mui/x-data-grid";
import { renderActionButtons } from "../../../components/Table/EditableTable/helpers";
import AddEmployeeForm from "../../Forms/AddEmployeeForm";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { createEmployeeNotification } from "../../../services/notificationService";
import {
  Button,
  Box,
  Typography,
  TextField,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { UsersRound, Download, X, Search, Plus, Trash2, PlusCircle, Mail, Pencil, Loader2, Camera } from "lucide-react";
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  noEmployeesBoxStyles,
  noEmployeesIconStyles,
  deleteDialogPaperSx,
  addDialogPaperSx,
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import { useDebounce } from "../../../hooks/useDebounce";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeFirstLetter } from "../../../utils/string";
import { getAvatarSrc, resizeAvatarFile } from "../../../utils/avatar";
import EmployeeAvatar from "../../../components/EmployeeAvatar/EmployeeAvatar.component";

const getInitialRowsPerPage = () => {
  // Example: calculate based on window size or available height
  // You can refine this logic as needed
  if (typeof window !== "undefined") {
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

// Employees management page component
const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions, currentUser } = useAuthContext();
  const { employees, isLoadingEmployees } = useSelector(
    (state: RootState) => state.employees
  );
  const { showNotification } = useAppNotifications();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFields, setEditFields] = useState({ firstName: "", lastName: "", email: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
  // Avatar picker modal state (same UX as the user avatar modal)
  const [avatarDialogEmployee, setAvatarDialogEmployee] = useState<Employee | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const inputSx = {
    '& .MuiInputBase-root': {
      fontWeight: 600,
      fontSize: '0.85rem',
      '&:before, &:after': { border: 'none' },
      '&:hover:not(.Mui-disabled):before': { border: 'none' },
    },
    '& .MuiInputBase-input': {
      padding: '4px 0',
      minWidth: 0,
      '&::placeholder': { opacity: 0.4, fontWeight: 400 },
      '&:focus': { outline: 'none' },
    },
  } as const;

  const { search, setSearch } =
    useTablePreferences("employees", getInitialRowsPerPage);

  const debouncedSearch = useDebounce(search, 400);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const hasEditPermissions = userPermissions.includes(PERMISSIONS.EDIT_EMPLOYEES);
  const hasDeletePermissions = userPermissions.includes(PERMISSIONS.DELETE_EMPLOYEES);

  // Fetch employees on mount, when debounced search changes, or when navigating back
  useEffect(() => {
    dispatch(
      fetchEmployees({ search: debouncedSearch || undefined }),
    );
  }, [dispatch, debouncedSearch, location.pathname]);

  // Filter employees by search input (client-side as instant feedback)
  useEffect(() => {
    if (!search) {
      setFilteredEmployees(employees);
      return;
    }

    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const normalizedSearch = normalizeString(search).toLowerCase();

    setFilteredEmployees(
      employees.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName} ${employee.email || ""}`)
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [search, employees]);

  // Validate edit fields for employee
  const validateFields = useCallback((fields: typeof editFields) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    return (
      regex.text.test(fields.firstName) &&
      regex.text.test(fields.lastName) &&
      (!fields.email || emailRegex.test(fields.email))
    );
  }, []);

  // Update edit form validity when fields change
  useEffect(() => {
    if (editRowId !== null) setIsEditFormValid(validateFields(editFields));
  }, [editFields, editRowId, validateFields]);

  // Handle search bar input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle creation of a new employee
  const handleCreate = async (newEmployee: {
    firstName: string;
    lastName: string;
    email?: string;
  }) => {
    try {
      setIsSubmitting(true);
      dispatch(createEmployee(newEmployee));
      setOpenAddModal(false);
      showNotification(NOTIFICATIONS.EMPLOYEE_CREATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      createEmployeeNotification('created', `${newEmployee.firstName} ${newEmployee.lastName}`);
    } catch (error) {
      showNotification(NOTIFICATIONS.EMPLOYEE_CREATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open/close add employee modal
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Handle editing of an employee
  const handleEdit = (employee: Employee) => {
    setEditRowId(employee.id);
    setEditFields({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || "",
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditRowId(null);
  };

  // Handle update of an employee
  const handleUpdate = async (id: number) => {
    try {
      const updatedEmployee = {
        ...editFields,
      };
      dispatch(updateEmployee({ id, updatedEmployee }));
      setEditRowId(null);
      setEditFields({ firstName: "", lastName: "", email: "" });
      showNotification(NOTIFICATIONS.EMPLOYEE_UPDATE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      createEmployeeNotification('updated', `${editFields.firstName} ${editFields.lastName}`);
    } catch (error) {
      handleCancel();
      showNotification(NOTIFICATIONS.EMPLOYEE_UPDATE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    }
  };

  // Get the avatar URL for the employee in the picker dialog
  const getDialogAvatarUrl = () => {
    if (!avatarDialogEmployee?.avatar) return null;
    return getAvatarSrc(avatarDialogEmployee.avatar) ?? null;
  };

  // Reset the broken-image fallback whenever the dialog target changes
  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarDialogEmployee?.avatar]);

  const handleOpenAvatarDialog = (employee: Employee) => {
    setAvatarDialogEmployee(employee);
    setSelectedFile(null);
    setAvatarPreview(null);
    setAvatarLoadFailed(false);
  };

  // Resets the dialog state (no guard) — used by the guarded close handler
  // and by the success paths, which must close even while uploading.
  const resetAvatarDialog = () => {
    setAvatarDialogEmployee(null);
    setSelectedFile(null);
    setAvatarPreview(null);
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = "";
    }
  };

  const handleCloseAvatarDialog = () => {
    if (isUploadingAvatar) return;
    resetAvatarDialog();
  };

  // Validate + downscale the selected image and show a preview
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      showNotification("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)", { severity: "error" });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("La imagen no debe superar los 5MB", { severity: "error" });
      return;
    }

    try {
      const resized = await resizeAvatarFile(file);
      setSelectedFile(resized);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(resized);
    } catch (error) {
      showNotification("No se pudo procesar la imagen", { severity: "error" });
    }
  };

  // Upload the selected avatar for the employee in the dialog
  const handleUploadAvatar = async () => {
    if (!selectedFile || !avatarDialogEmployee) return;

    setIsUploadingAvatar(true);
    try {
      await dispatch(
        updateEmployeeAvatar({ id: avatarDialogEmployee.id, file: selectedFile }),
      ).unwrap();
      showNotification("Avatar actualizado exitosamente", { severity: "success", duration: 3000 });
      // Close directly (bypasses the isUploadingAvatar guard) so the dialog
      // doesn't stay stuck open after a successful upload.
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification("Error al actualizar el avatar", { severity: "error", duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Delete the avatar of the employee in the dialog
  const handleAvatarDelete = async () => {
    if (!avatarDialogEmployee) return;

    setIsUploadingAvatar(true);
    try {
      await dispatch(removeEmployeeAvatar(avatarDialogEmployee.id)).unwrap();
      showNotification("Avatar eliminado exitosamente", { severity: "success", duration: 3000 });
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification("Error al eliminar el avatar", { severity: "error", duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Open/close delete confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setOpenDeleteDialog(true);
    setEmployeeToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setEmployeeToDelete(null);
  };

  // Handle deletion of an employee
  const handleDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeletingEmployee(true);
    try {
      await dispatch(deleteEmployee(employeeToDelete));
      setOpenDeleteDialog(false);
      setEmployeeToDelete(null);
      showNotification(NOTIFICATIONS.EMPLOYEE_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });

      // Add notification to menu
      const employee = employees.find(emp => emp.id === employeeToDelete);
      if (employee) {
        createEmployeeNotification('deleted', `${employee.firstName} ${employee.lastName}`);
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.EMPLOYEE_DELETE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsDeletingEmployee(false);
    }
  };

  // Memoize export data so the DataGrid columns stay stable and exportOptions
  // only recomputes when the filtered list actually changes
  const exportData = useMemo(
    () =>
      filteredEmployees.map(e => ({
        Nombre: e.firstName,
        Apellido: e.lastName,
        Email: e.email || "",
        Agregado: e.createdAt
          ? capitalizeFirstLetter(
              format(new Date(e.createdAt), "EEEE dd 'de' MMMM 'de' yyyy", {
                locale: es,
              })
            )
          : "",
        Actualizado: e.updatedAt
          ? capitalizeFirstLetter(
              format(new Date(e.updatedAt), "EEEE dd 'de' MMMM 'de' yyyy", {
                locale: es,
              })
            )
          : "",
      })),
    [filteredEmployees]
  );

  // Memoize export options based on permissions.
  // Excel y PDF comparten las mismas columnas; "Actualizado" se omite.
  const exportOptions = useMemo(() => {
    const exportHeaders = ["Nombre", "Apellido", "Email", "Agregado"];
    const exportRows = exportData.map((e) => {
      const { Actualizado: _omit, ...rest } = e;
      return rest;
    });
    return createExportOptions({
      excelIcon: <ExcelIcon size={20} />,
      pdfIcon: <PdfIcon size={20} />,
      data: exportRows,
      fileName: `empleados-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
      title: "Reporte de Empleados",
    });
  }, [exportData]);

  // Stable getRowId so the memoized StickyDataGrid doesn't re-render on every
  // parent render (inline arrows create a new reference each time)
  const getRowId = useCallback((row: Employee) => row.id, []);

  // Columnas del DataGrid (header sticky garantizado por arquitectura de MUI X Data Grid)
  const columns = useMemo<GridColDef<Employee>[]>(
    () => [
      {
        field: "firstName",
        headerName: "Nombre",
        flex: 1.6,
        minWidth: isSmallScreen ? 150 : 260,
        sortable: true,
        renderCell: (params) => {
          const rowId = Number(params.id);
          const isEditing = editRowId === rowId;
          const rowData = params.row as Employee;
          const firstName = isEditing
            ? String(editFields.firstName || "")
            : String(rowData.firstName || "");
          const lastName = isEditing
            ? String(editFields.lastName || "")
            : String(rowData.lastName || "");
          const fullName = `${firstName} ${lastName}`.trim() || 'Nombre Completo';
          const canPickAvatar = hasEditPermissions || isEditing;

          if (isEditing) {
            return (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, width: '100%', minWidth: 0 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Avatar with edit-on-hover (only while editing) — opens the picker modal */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAvatarDialog(rowData);
                  }}
                  sx={{
                    position: 'relative',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    cursor: 'pointer',
                    '&:hover .avatar-edit-overlay': { opacity: 1 },
                  }}
                >
                  <EmployeeAvatar
                    employee={{ id: rowId, firstName, lastName, avatar: rowData.avatar }}
                    size={32}
                  />
                  <Box
                    className="avatar-edit-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Pencil size={12} color="#fff" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flex: 1, minWidth: 0 }}>
                  <TextField
                    value={String(editFields.firstName || '')}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Nombre"
                    variant="standard"
                    size="small"
                    sx={inputSx}
                  />
                  <TextField
                    value={String(editFields.lastName || '')}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Apellido"
                    variant="standard"
                    size="small"
                    sx={inputSx}
                  />
                </Box>
              </Box>
            );
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              <Box
                onClick={(e) => {
                  if (!canPickAvatar) return;
                  e.stopPropagation();
                  handleOpenAvatarDialog(rowData);
                }}
                title={canPickAvatar ? "Cambiar foto" : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%',
                  flexShrink: 0,
                  cursor: canPickAvatar ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                  '&:hover': canPickAvatar ? { transform: 'scale(1.06)' } : undefined,
                }}
              >
                <EmployeeAvatar
                  employee={{ id: rowId, firstName, lastName, avatar: rowData.avatar }}
                  size={32}
                />
              </Box>
              <Typography
                component="span"
                sx={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {fullName}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.4,
        minWidth: isSmallScreen ? 140 : 220,
        sortable: true,
        renderCell: (params) => {
          const rowId = Number(params.id);
          const isEditing = editRowId === rowId;
          const rowData = params.row as Employee;
          const email = isEditing
            ? String(editFields.email || '')
            : String(rowData.email || '');

          if (isEditing) {
            return (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Mail size={14} strokeWidth={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
                <TextField
                  value={String(editFields.email || '')}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, email: e.target.value }))}
                  variant="standard"
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '0.85rem',
                      '&:before, &:after': { border: 'none' },
                      '&:hover:not(.Mui-disabled):before': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0',
                      color: 'text.secondary',
                      '&:focus': { outline: 'none' },
                    },
                  }}
                />
              </Box>
            );
          }

          if (email) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={14} strokeWidth={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
                <Typography
                  component="a"
                  href={`mailto:${email}`}
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {email}
                </Typography>
              </Box>
            );
          }

          return (
            <Typography
              component="span"
              sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
            >
              Sin email
            </Typography>
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        width: isSmallScreen ? 64 : 150,
        minWidth: isSmallScreen ? 64 : 150,
        align: "right",
        headerAlign: "right",
        renderCell: (params) =>
          renderActionButtons({
            row: params.row as Employee,
            editRowId,
            getRowId: (row) => row.id,
            currentUser: currentUser || undefined,
            hasEditPermissions,
            hasDeletePermissions,
            isExpanded: false,
            handleEditClick: handleEdit,
            handleSaveClick: handleUpdate,
            handleCancelClick: handleCancel,
            handleOpenDeleteDialog,
            isSaveDisabled: !isEditFormValid,
            isSmallScreen,
            theme,
          }),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      editRowId,
      editFields,
      isEditFormValid,
      isSmallScreen,
      theme,
      currentUser,
      hasEditPermissions,
      hasDeletePermissions,
      handleEdit,
      handleUpdate,
      handleCancel,
      handleOpenDeleteDialog,
      handleOpenAvatarDialog,
    ]
  );

  return (
    <Box className="scrollable-content" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      {/* Premium Card with Header and Grid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          mx: { xs: 1, sm: 1.5, md: 2 },
          mb: 3,
          mt: 0,
        }}
      >
        {/* Header Section */}
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
                <UsersRound size={20} strokeWidth={1.5} />
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
                  {isSmallScreen ? PAGE_TITLE.EMPLOYEES_SIMPLIFIED : PAGE_TITLE.EMPLOYEES}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.7rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredEmployees.length} empleados registrados
                </Typography>
              </Box>
            </Box>

            {/* Export Speed Dial */}
            {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_EMPLOYEES) &&
              userPermissions.includes(PERMISSIONS.EXPORT_PDF_EMPLOYEES) && (
                <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
                  {filteredEmployees.length > 0 && (
                    <SpeedDialComponent
                      actions={exportOptions}
                      mainIcon={<Download size={18} strokeWidth={1.5} />}
                      openIcon={<X size={18} strokeWidth={1.5} />}
                      direction="left"
                    />
                  )}
                </Box>
              )}
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
            <Box flex={1} maxWidth={{ sm: "320px" }}>
              {filteredEmployees && (
                <SearchBarComponent
                  placeholder={MANAGEMENT.EMPLOYEES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={handleFilterChange}
                  fullWidth
                  isSearching={isLoadingEmployees && search !== ""}
                />
              )}
            </Box>

            {/* Add Button */}
            {userPermissions.includes(PERMISSIONS.CREATE_EMPLOYEES) && (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={handleOpenAddModal}
                  sx={{
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    letterSpacing: "-0.01em",
                    borderRadius: '10px',
                  }}
                >
                  {MANAGEMENT.ADD}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Add Button */}
        {userPermissions.includes(PERMISSIONS.CREATE_EMPLOYEES) && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, p: 2, borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddModal}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              {MANAGEMENT.ADD}
            </Button>
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {isLoadingEmployees ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingEmployees}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : (
            <>
              {filteredEmployees.length > 0 ? (
                <StickyDataGridComponent<Employee>
                  rows={filteredEmployees}
                  columns={columns}
                  getRowId={getRowId}
                  disableRowVirtualization={editRowId !== null}
                />
              ) : (
                <Box sx={noEmployeesBoxStyles}>
                  <Search size={48} style={{ color: theme.palette.text.disabled, ...noEmployeesIconStyles }} />
                  <Typography variant="h6" color="textSecondary">
                    {MANAGEMENT.EMPLOYEES_PAGE.NO_EMPLOYEES}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_DELETE_TITLE}
        message={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_DELETE_MESSAGE}
        type="delete"
        confirmText={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_DELETE_CONFIRM}
        cancelText={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_DELETE_CANCEL}
        loading={isDeletingEmployee}
        paperSx={deleteDialogPaperSx ?? {}}
        icon={<Trash2 size={24} color="red" />}
      />

      <DialogComponent
        open={openAddModal}
        onClose={handleCloseAddModal}
        title={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<PlusCircle size={24} color="blue" />}
      >
        <AddEmployeeForm
          onSubmit={handleCreate}
          onCancel={handleCloseAddModal}
          isLoading={isSubmitting}
        />
      </DialogComponent>

      {/* Avatar Picker Modal — same UX as the user avatar modal */}
      <Dialog
        open={avatarDialogEmployee !== null}
        onClose={handleCloseAvatarDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 0,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)",
          },
        }}
      >
        {/* Header with icon box */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 2.5, sm: 3.5 }, pb: 0 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Camera size={18} color={theme.palette.primary.contrastText} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.15rem",
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Foto del empleado
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: "0.85rem", lineHeight: 1.5, pl: 6 }}
          >
            Sube una foto para personalizar el perfil de{" "}
            {avatarDialogEmployee
              ? `${avatarDialogEmployee.firstName} ${avatarDialogEmployee.lastName}`
              : "el empleado"}
            .
          </Typography>
        </Box>

        <DialogContent sx={{ pb: 1, pt: 3, px: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {/* Avatar Preview Circle */}
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `3px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                transition: "all 0.3s ease",
                boxShadow: avatarPreview || getDialogAvatarUrl()
                  ? "0 8px 32px rgba(0,0,0,0.15)"
                  : "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : getDialogAvatarUrl() && !avatarLoadFailed ? (
                <img
                  src={getDialogAvatarUrl()!}
                  alt="Avatar del empleado"
                  onError={() => setAvatarLoadFailed(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : avatarDialogEmployee ? (
                <EmployeeAvatar
                  employee={avatarDialogEmployee}
                  size={180}
                  sx={{ fontSize: "3.5rem" }}
                />
              ) : (
                <Box />
              )}
              {isUploadingAvatar && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <CircularProgress size={44} sx={{ color: "#fff" }} />
                </Box>
              )}
            </Box>

            {/* Drop zone / Select area */}
            <Box
              onClick={() => avatarFileInputRef.current?.click()}
              sx={{
                width: "100%",
                border: `2px dashed ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                borderRadius: "14px",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: selectedFile
                  ? (theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)")
                  : "transparent",
                borderColor: selectedFile
                  ? theme.palette.primary.main
                  : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"),
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.02)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                  borderRadius: "10px",
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <Camera size={22} color={theme.palette.text.secondary} />
              </Box>
              {selectedFile ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.875rem",
                    textAlign: "center",
                    wordBreak: "break-all",
                    maxWidth: "100%",
                  }}
                >
                  {selectedFile.name}
                </Typography>
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    Haz clic para seleccionar una imagen
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      mt: 0.25,
                      display: "block",
                    }}
                  >
                    JPEG, PNG, GIF o WebP · Máx 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* File Input */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarFileSelect}
              style={{ display: "none" }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, pb: { xs: 2.5, sm: 3.5 }, pt: 1.5, gap: 1, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between" }}>
          {getDialogAvatarUrl() && !selectedFile ? (
            <Button
              variant="text"
              color="error"
              onClick={handleAvatarDelete}
              disabled={isUploadingAvatar}
              startIcon={isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              sx={{
                order: { xs: 2, sm: 1 },
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(244,67,54,0.1)"
                    : "rgba(244,67,54,0.06)",
                },
              }}
            >
              Eliminar
            </Button>
          ) : (
            <Box /> /* Spacer */
          )}
          <Box sx={{ display: "flex", gap: 1, order: { xs: 1, sm: 2 } }}>
            <Button
              variant="outlined"
              onClick={handleCloseAvatarDialog}
              disabled={isUploadingAvatar}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={selectedFile ? handleUploadAvatar : () => avatarFileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              sx={{ minWidth: 120 }}
              startIcon={
                isUploadingAvatar ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : selectedFile ? (
                  <Camera size={16} />
                ) : undefined
              }
            >
              {isUploadingAvatar
                ? "Subiendo..."
                : selectedFile
                ? "Subir foto"
                : "Seleccionar"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;
