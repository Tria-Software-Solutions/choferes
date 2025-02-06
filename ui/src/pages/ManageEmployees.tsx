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
import { PAGE_TITLE } from "../constants/constants";

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
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  useEffect(() => {
    const filtered = employees.filter((employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(filter.toLowerCase())
    );

    setFilteredEmployees(filtered);
    setTotalCount(filtered.length);
  }, [employees, filter]);

  const validateAddFields = useCallback(() => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const isFirstNameValid =
      nameRegex.test(addFields.firstName) && addFields.firstName !== "";
    const isLastNameValid =
      nameRegex.test(addFields.lastName) && addFields.lastName !== "";
    setIsAddFormValid(isFirstNameValid && isLastNameValid);
  }, [addFields]);

  const validateEditFields = useCallback(() => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const isFirstNameValid =
      nameRegex.test(editFields.firstName) && editFields.firstName !== "";
    const isLastNameValid =
      nameRegex.test(editFields.lastName) && editFields.lastName !== "";
    setIsEditFormValid(isFirstNameValid && isLastNameValid);
  }, [editFields]);

  useEffect(() => {
    validateAddFields();
  }, [validateAddFields]);

  useEffect(() => {
    if (editRowId !== null) {
      validateEditFields();
    }
  }, [editFields, editRowId, validateEditFields]);

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

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = (id: number) => {
    const updatedEmployee = {
      ...editFields,
    };
    handleUpdateEmployee(id, updatedEmployee);
    setEditRowId(null);
    setEditFields({ firstName: "", lastName: "" });
  };

  const handleOpenDialog = (id: number) => {
    setDialogOpen(true);
    setEmployeeToDelete(id);
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
      {filteredEmployees.length > 0 ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant={isSmallScreen ? "h4" : "h2"}
              sx={{ flexGrow: 1 }}
            >
              {PAGE_TITLE.MANAGE_EMPLOYEES}
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
            {filteredEmployees.length > 0 && (
              <Grid item xs={12} md={6}>
                <SearchBar
                  placeholder="Buscar empleado"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} md={6}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.firstName}
                      onChange={(e) =>
                        setAddFields({
                          ...addFields,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <TextField
                      label="Apellido"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.lastName}
                      onChange={(e) =>
                        setAddFields({ ...addFields, lastName: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
                <Tooltip title="Agregar Empleado" arrow>
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
                      <PersonAddAlt1RoundedIcon />
                    </Button>
                  </Box>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          <br />
          <EditableTable<Employee>
            data={filteredEmployees}
            columns={["firstName", "lastName"]}
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
          />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
          }}
        >
          <Typography variant="h6" color="textSecondary">
            No se encontraron empleados para mostrar.
          </Typography>
        </Box>
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
