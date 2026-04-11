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
  Grid,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Divider,
} from "@mui/material";
import {
  createExportOptions,
  exportFileFormattedDate,
} from "../../../utils/export";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { Users, Download, X, Search, Plus, Trash2, FileText, FileType, PlusCircle } from "lucide-react";
import {
  employeesHeaderBoxStyles,
  employeesTitleBoxStyles,
  employeesTitleStyles,
  employeesIconStyles,
  employeesDividerStyles,
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  searchBarBoxStyles,
  addButtonMobileStyles,
  addButtonDesktopBoxStyles,
  addButtonDesktopStyles,
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
  const [editFields, setEditFields] = useState({ firstName: "", lastName: "" });
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
        normalizeString(`${employee.firstName} ${employee.lastName}`)
          .toLowerCase()
          .includes(normalizeString(search).toLowerCase())
      )
    );
    setTotalCount(filteredEmployees.length);
  }, [search, employees, filteredEmployees.length]);

  // Validate edit fields for employee
  const validateFields = useCallback((fields: typeof editFields) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    return (
      regex.text.test(fields.firstName) && regex.text.test(fields.lastName)
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
      setEditFields({ firstName: "", lastName: "" });
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
    const exportHeaders = ["Nombre", "Apellido", "Agregado", "Actualizado"];
    return createExportOptions({
      excelIcon: <FileText size={20} />,
      pdfIcon: <FileType size={20} />,
      data: exportData,
      fileName: `empleados-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
    });
  }, [exportData]);
  // Use exportTable({ data: exportData, ... }) for export

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={employeesHeaderBoxStyles}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          sx={employeesTitleBoxStyles}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={employeesTitleStyles}
          >
            <Users
              size={isSmallScreen ? 20 : 32}
              style={employeesIconStyles(theme)}
            />
            {isSmallScreen
              ? PAGE_TITLE.EMPLOYEES_SIMPLIFIED
              : PAGE_TITLE.EMPLOYEES}
          </Typography>
          <Divider sx={employeesDividerStyles(theme)} />
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_EMPLOYEES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_EMPLOYEES) && (
            <Box sx={exportSpeedDialBoxStyles}>
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
      {isLoadingEmployees ? (
        <Box sx={loadingBoxStyles}>
          <Backdrop sx={backdropStyles(theme)} open={isLoadingEmployees}>
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
              <Box sx={searchBarBoxStyles}>
                {filteredEmployees && (
                  <SearchBarComponent
                    placeholder={MANAGEMENT.EMPLOYEES_PAGE.SEARCH_PLACEHOLDER}
                    value={search}
                    onChange={handleFilterChange}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                )}
                {userPermissions.includes(PERMISSIONS.CREATE_EMPLOYEES) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAddModal}
                    sx={addButtonMobileStyles}
                  >
                    <Plus size={24} />
                  </Button>
                )}
              </Box>
            </Grid>
            {userPermissions.includes(PERMISSIONS.CREATE_EMPLOYEES) && (
              <Grid item xs={12} md={8}>
                <Box sx={addButtonDesktopBoxStyles}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleOpenAddModal}
                    sx={addButtonDesktopStyles}
                  >
                    {MANAGEMENT.ADD}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          <br />
          {filteredEmployees.length > 0 ? (
            <EditableTableComponent<Employee>
              data={filteredEmployees}
              columns={["firstName", "lastName"]}
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
