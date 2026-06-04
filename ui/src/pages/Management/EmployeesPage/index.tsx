import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../store/slices/employeeSlice";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import EditableTableComponent from "../../../components/Table/EditableTable/EditableTable.component";
import AddEmployeeForm from "../../Forms/AddEmployeeForm";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { createEmployeeNotification } from "../../../services/notificationService";
import {
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Paper,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { Users, Download, X, Search, Plus, Trash2, PlusCircle } from "lucide-react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeFirstLetter } from "../../../utils/string";

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
  const { userPermissions } = useAuthContext();
  const { employees, isLoadingEmployees } = useSelector(
    (state: RootState) => state.employees
  );
  const { showNotification } = useAppNotifications();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFields, setEditFields] = useState({ firstName: "", lastName: "", email: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("employees", getInitialRowsPerPage);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  // Fetch employees on mountexportOptions
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch, location.pathname]);

  // Filter employees by search input
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredEmployees(
      employees.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName} ${employee.email || ""}`)
          .toLowerCase()
          .includes(normalizeString(search).toLowerCase())
      )
    );
    setTotalCount(filteredEmployees.length);
  }, [search, employees, filteredEmployees.length]);

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

  // When preparing data for export, only include the desired fields:
  const exportData = filteredEmployees.map(e => ({
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
  }));

  // Memoize export options based on permissions
  const exportOptions = useMemo(() => {
    const exportHeaders = ["Nombre", "Apellido", "Email", "Agregado", "Actualizado"];
    return createExportOptions({
      excelIcon: <ExcelIcon size={20} />,
      pdfIcon: <PdfIcon size={20} />,
      data: exportData,
      fileName: `empleados-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
    });
  }, [exportData]);
  // Use exportTable({ data: exportData, ... }) for export

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
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
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
                <Users size={22} color={theme.palette.primary.contrastText} />
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
                  {isSmallScreen ? PAGE_TITLE.EMPLOYEES_SIMPLIFIED : PAGE_TITLE.EMPLOYEES}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
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
                      mainIcon={<Download size={20} />}
                      openIcon={<X size={20} />}
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
                <EditableTableComponent<Employee>
                  data={filteredEmployees}
                  columns={["firstName", "lastName", "email"]}
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
                  setPage={setPage}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  isSaveDisabled={!isEditFormValid}
                  userPermissions={userPermissions}
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
    </Box>
  );
};

export default EmployeesPage;
