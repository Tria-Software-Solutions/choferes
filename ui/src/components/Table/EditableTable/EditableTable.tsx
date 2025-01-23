import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  translateColumnHeaderToSpanish,
  mapDayValues,
} from "../../../utils/stringUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { TABLE } from "../../../constants/constants";

type EditableTableProps<T extends { licensePlate?: string; id?: number }> = {
  data: T[];
  columns: (keyof T)[];
  groupByField?: keyof T;
  editRowId: number | string | null;
  editFields: Record<string, string | number | Date>;
  setEditField: (field: string, value: string) => void;
  handleEditClick: (row: T) => void;
  handleSaveClick: (args: { id?: number; licensePlate?: string }) => void;
  handleOpenDialog: (args: { id?: number; licensePlate?: string }) => void;
  getRowId: (row: T) => number | string;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  renderColumnValue?: (column: keyof T, value: any) => React.ReactNode;
  getOptionsForColumn?: (column: keyof T) => { value: string; label: string }[];
  validateField?: (field: string, value: string | number | Date) => boolean;
  customPagination?: (data: T[], page: number, rowsPerPage: number) => T[];
};

const EditableTable = <T extends { licensePlate?: string; id?: number }>({
  data,
  columns,
  groupByField,
  editRowId,
  editFields,
  setEditField,
  handleEditClick,
  handleSaveClick,
  handleOpenDialog,
  getRowId,
  totalCount,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  renderColumnValue = (_, value) => value,
  getOptionsForColumn = () => [],
  validateField = () => true,
  customPagination,
}: EditableTableProps<T>) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]);

  const checkFormValidity = useCallback(() => {
    const isValid = Object.keys(editFields).every((field) =>
      validateField(field, editFields[field])
    );
    setIsFormValid(isValid);
  }, [editFields, validateField]);

  useEffect(() => {
    checkFormValidity();
  }, [checkFormValidity]);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleSortRequest = (column: keyof T) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const groupedData = groupByField
    ? data.reduce((acc, item) => {
        const key = item[groupByField] as string;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, T[]>)
    : { default: data };

  const groupKeys = groupByField
    ? Object.keys(groupedData).sort((a, b) =>
        order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      )
    : ["default"];

  const sortedData = groupByField
    ? groupKeys.flatMap((key) => groupedData[key])
    : [...data].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) {
          return order === "asc" ? -1 : 1;
        }
        if (a[orderBy] > b[orderBy]) {
          return order === "asc" ? 1 : -1;
        }
        return 0;
      });

  const paginatedData = customPagination
    ? customPagination(data, page, rowsPerPage)
    : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer className="table-container">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            {customPagination && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  style={{ backgroundColor: "#f4f4f4", fontWeight: "bold" }}
                >
                  Created At
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              {columns.map((column) => (
                <TableCell key={String(column)} className="tableCell">
                  <TableSortLabel
                    direction={orderBy === column ? order : "asc"}
                    onClick={() => handleSortRequest(column)}
                  >
                    {translateColumnHeaderToSpanish(column)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell style={{ width: "100px" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={String(column)}>
                    {editRowId === getRowId(row) ? (
                      getOptionsForColumn(column).length > 0 ? (
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>{String(column)}</InputLabel>
                          <Select
                            label={String(column)}
                            value={editFields[String(column)] || ""}
                            onChange={(e) =>
                              setEditField(
                                String(column),
                                String(e.target.value)
                              )
                            }
                          >
                            {getOptionsForColumn(column).map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          value={editFields[String(column)] || ""}
                          onChange={(e) =>
                            setEditField(String(column), e.target.value)
                          }
                          error={
                            !validateField(
                              String(column),
                              editFields[String(column)]
                            )
                          }
                        />
                      )
                    ) : column === "day" ? (
                      mapDayValues(row[column] as string)
                    ) : (
                      renderColumnValue(column, row[column])
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {editRowId === getRowId(row) ? (
                    <Tooltip title="Guardar" arrow>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          if (row.licensePlate) {
                            handleSaveClick({
                              licensePlate: row.licensePlate,
                            });
                          } else {
                            const id = getRowId(row);
                            if (typeof id === "number") {
                              handleSaveClick({ id });
                            }
                          }
                        }}
                        disabled={!isFormValid}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Editar" arrow>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Eliminar" arrow>
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        if (row.licensePlate) {
                          handleOpenDialog({
                            licensePlate: row.licensePlate,
                          });
                        } else {
                          const id = getRowId(row);
                          if (typeof id === "number") {
                            handleOpenDialog({ id });
                          }
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        className="pagination"
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(+event.target.value);
          setPage(0);
        }}
        labelRowsPerPage={TABLE.ROWS_PER_PAGE}
      />
    </Paper>
  );
};

export default EditableTable;
