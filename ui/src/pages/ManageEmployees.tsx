import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditableTable from "../components/Table/EditableTable/EditableTable";
import SearchBar from "../components/SearchBar/SearchBar";
import SplitButton from "../components/SplitButton/SplitButton";
import { Employee } from "../models/Employee";
import { useEmployees } from "../hooks/useEmployee";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../utils/exportUtils";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const ManageEmployees: React.FC = () => {
  const {
    employees,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
  } = useEmployees();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({ firstName: "", lastName: "" });
  const [editFields, setEditFields] = useState({ firstName: "", lastName: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const filtered = employees.filter((employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(filter.toLowerCase())
    );

    setFilteredEmployees(filtered);
    setTotalCount(filtered.length);
  }, [employees, filter]);

  const validateFields = useCallback(() => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const isFirstNameValid =
      nameRegex.test(addFields.firstName) && addFields.firstName !== "";
    const isLastNameValid =
      nameRegex.test(addFields.lastName) && addFields.lastName !== "";
    setIsValid(isFirstNameValid && isLastNameValid);
  }, [addFields]);

  useEffect(() => {
    validateFields();
  }, [validateFields]);

  const handleAdd = () => {
    const newEmployee: Employee = {
      id: Math.max(...employees.map((employee) => employee.id)) + 1,
      firstName: addFields.firstName,
      lastName: addFields.lastName,
    };
    handleAddEmployee(newEmployee);
    setAddFields({ firstName: "", lastName: "" });
  };

  const handleEditClick = (employee: Employee) => {
    setEditRowId(employee.id);
    setEditFields({
      firstName: employee.firstName,
      lastName: employee.lastName,
    });
  };

  const handleSaveClick = (args: { id?: number; licensePlate?: string }) => {
    if (args.id) {
      const updatedEmployee = {
        ...editFields,
      };
      handleUpdateEmployee(args.id, updatedEmployee);
      setEditRowId(null);
      setEditFields({ firstName: "", lastName: "" });
    }
  };

  const handleOpenDialog = (args: { id?: number; licensePlate?: string }) => {
    if (args.id) {
      setDialogOpen(true);
      setEmployeeToDelete(args.id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDelete = () => {
    if (employeeToDelete !== null) {
      handleDeleteEmployee(employeeToDelete);
      handleCloseDialog();
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} sx={{ flexGrow: 1 }}>
          Gestionar Empleados
        </Typography>
        {filteredEmployees.length > 0 && (
          <SplitButton
            options={createExportOptions(
              <FontAwesomeIcon icon={faFileExcel} size="lg" />,
              <FontAwesomeIcon icon={faFilePdf} size="lg" />,
              exportToExcel,
              exportToPDF,
              filteredEmployees,
              `empleados-${exportFileFormattedDate(new Date())}`
            )}
            defaultIndex={0}
            buttonIcon={<DownloadRoundedIcon />}
          />
        )}
      </Box>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <SearchBar
            placeholder="Buscar Empleado"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Box display="flex" alignItems="center">
            <TextField
              label="Nombre"
              variant="outlined"
              sx={{ mr: 2 }}
              value={addFields.firstName}
              onChange={(e) =>
                setAddFields({ ...addFields, firstName: e.target.value })
              }
            />
            <TextField
              label="Apellido"
              variant="outlined"
              sx={{ mr: 2 }}
              value={addFields.lastName}
              onChange={(e) =>
                setAddFields({ ...addFields, lastName: e.target.value })
              }
            />
            <Tooltip title="Agregar Empleado" arrow>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ height: "56px" }}
                  onClick={handleAdd}
                  disabled={!isValid}
                >
                  <PersonAddAlt1RoundedIcon />
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      <br />
      {filteredEmployees.length > 0 ? (
        <EditableTable<Employee>
          data={filteredEmployees}
          columns={["firstName", "lastName"]}
          editRowId={editRowId}
          editFields={editFields}
          setEditField={(field, value) =>
            setEditFields({ ...editFields, [field]: value })
          }
          handleEditClick={handleEditClick}
          handleSaveClick={handleSaveClick}
          handleOpenDialog={handleOpenDialog}
          getRowId={(row) => row.id}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      ) : (
        <Typography variant="h6" color="textSecondary">
          No se encontraron empleados para mostrar.
        </Typography>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este empleado?
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

export default ManageEmployees;
