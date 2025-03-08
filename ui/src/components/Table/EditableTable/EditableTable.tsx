import React, { useState } from "react";
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
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
  Box,
  Autocomplete,
  Typography,
} from "@mui/material";
import {
  translateColumnHeaderToSpanish,
  mapDayValues,
  getDayOptionsSpanish,
} from "../../../utils/string";
import { formatDateWithDay } from "../../../utils/dates";
import { maskLicensePlate, maskParkingLot } from "../../../utils/mask";
import {
  BRANDS_LIST,
  COLORS_LIST,
  PERMISSIONS,
  PERMISSIONS_LIST,
  ROLES_LIST,
  TABLE,
} from "../../../constants/constants";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PaginationActions from "../Pagination/PaginationActions";

type EditableTableProps<T> = {
  data: T[];
  columns: (keyof T)[];
  groupByDate?: Date | null;
  editRowId: number | null;
  editFields: Record<string, string>;
  setEditField?: (field: string, value: string) => void;
  handleEditClick?: (row: T) => void;
  handleCancelClick?: () => void;
  handleSaveClick?: (id: number) => void;
  handleOpenDialog?: (id: number) => void;
  getRowId: (row: T) => number;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  renderColumnValue?: (column: keyof T, value: any) => React.ReactNode;
  validateField?: (field: string, value: string) => boolean;
  isSaveDisabled?: boolean;
  noActions?: boolean;
  permissions?: string[];
};

const EditableTable = <T,>({
  data,
  columns,
  groupByDate,
  editRowId,
  editFields,
  setEditField,
  handleEditClick,
  handleCancelClick,
  handleSaveClick,
  handleOpenDialog,
  getRowId,
  totalCount,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  renderColumnValue = (_, value) => value,
  validateField = () => true,
  isSaveDisabled,
  noActions,
  permissions,
}: EditableTableProps<T>) => {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]);

  const hasEditPermissions =
    permissions?.includes(PERMISSIONS.EDIT_EMPLOYEES) ||
    permissions?.includes(PERMISSIONS.EDIT_SCHEDULES) ||
    permissions?.includes(PERMISSIONS.EDIT_VEHICLES) ||
    permissions?.includes(PERMISSIONS.EDIT_USER) ||
    permissions?.includes(PERMISSIONS.EDIT_ROLE);

  const hasDeletePermissions =
    permissions?.includes(PERMISSIONS.DELETE_EMPLOYEES) ||
    permissions?.includes(PERMISSIONS.DELETE_SCHEDULES) ||
    permissions?.includes(PERMISSIONS.DELETE_VEHICLES) ||
    permissions?.includes(PERMISSIONS.DELETE_USER) ||
    permissions?.includes(PERMISSIONS.DELETE_ROLE);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const renderEditField = (column: keyof T, value: string) => {
    const config = columnConfig[String(column)];

    if (!config) {
      return (
        <TextField
          fullWidth
          value={editFields[String(column)] || ""}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          error={!validateField(String(column), value)}
        />
      );
    }

    if (config.type === "select" && config.options) {
      const selectedValue = editFields[String(column)] || "";
      const hasOtroOption = config.options.some(
        (option) => option.value === "Otro"
      );

      return (
        <FormControl variant="outlined" fullWidth>
          {selectedValue === "Otro" ? (
            <TextField
              label={translateColumnHeaderToSpanish(column)}
              variant="outlined"
              fullWidth
              value={editFields[String(column)] || ""}
              onChange={(e) =>
                setEditField && setEditField(String(column), e.target.value)
              }
            />
          ) : (
            <Select
              value={selectedValue}
              onChange={(e) =>
                setEditField &&
                setEditField(String(column), String(e.target.value))
              }
            >
              {config.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              {hasOtroOption && <MenuItem value="Otro">Otro</MenuItem>}
            </Select>
          )}
        </FormControl>
      );
    }

    if (config.type === "autocomplete" && config.options) {
      const selectedValue = editFields[String(column)] || "";
      const selectedOption =
        config.options?.find((opt) => opt.value === selectedValue) || null;

      return (
        <Autocomplete
          value={selectedOption}
          onChange={(event, newValue) => {
            setEditField &&
              setEditField(String(column), newValue ? newValue.value : "");
          }}
          inputValue={undefined}
          onInputChange={(event, newInputValue) => {
            if (!event) return;
          }}
          options={config.options || []}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label={translateColumnHeaderToSpanish(column)}
              variant="outlined"
              fullWidth
              placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
            />
          )}
        />
      );
    }

    if (config.type === "masked") {
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const maskedValue =
          column === "licensePlate"
            ? maskLicensePlate(rawValue)
            : maskParkingLot(rawValue);
        setEditField && setEditField(String(column), maskedValue);
      };

      return (
        <TextField
          label={translateColumnHeaderToSpanish(column)}
          variant="outlined"
          fullWidth
          value={editFields[String(column)] || ""}
          onChange={handleChange}
        />
      );
    }

    return (
      <TextField
        fullWidth
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
      />
    );
  };

  const handleSortRequest = (column: keyof T) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === "asc" ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columnConfig: Record<
    string,
    {
      type: "text" | "select" | "autocomplete" | "masked";
      options?: { value: string; label: string }[];
    }
  > = {
    licensePlate: { type: "masked" },
    parkingLot: { type: "masked" },
    brand: { type: "autocomplete", options: BRANDS_LIST },
    color: { type: "autocomplete", options: COLORS_LIST },
    roleName: { type: "select", options: ROLES_LIST },
    permissionName: { type: "select", options: PERMISSIONS_LIST },
    day: { type: "select", options: getDayOptionsSpanish() },
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer
        className="table-container"
        sx={{ maxHeight: "58vh", overflowX: "auto" }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 4,
            }}
          >
            {groupByDate && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 4,
                    fontWeight: "bold",
                  }}
                >
                  {formatDateWithDay(groupByDate, false)}
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
              {!noActions || hasEditPermissions || hasDeletePermissions ? (
                <TableCell style={{ width: "100px" }} />
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => {
                  return (
                    <TableCell key={String(column)}>
                      {editRowId === getRowId(row) ? (
                        renderEditField(
                          column,
                          editFields[String(column)] || ""
                        )
                      ) : Array.isArray(row[column]) ? (
                        <ul>
                          {(row[column] as string[]).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : column === "day" ? (
                        mapDayValues(row[column] as string)
                      ) : (
                        renderColumnValue(column, row[column])
                      )}
                    </TableCell>
                  );
                })}
                {!noActions && (
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {editRowId === getRowId(row) ? (
                        <>
                          <Tooltip title="Guardar" arrow>
                            <Box>
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleSaveClick &&
                                  handleSaveClick(getRowId(row))
                                }
                                disabled={isSaveDisabled}
                              >
                                <SaveIcon />
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Cancelar" arrow>
                            <Box>
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleCancelClick && handleCancelClick()
                                }
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {hasEditPermissions && (
                            <Tooltip title="Editar" arrow>
                              <Box>
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleEditClick && handleEditClick(row)
                                  }
                                >
                                  <EditIcon />
                                </IconButton>
                              </Box>
                            </Tooltip>
                          )}
                          {hasDeletePermissions && (
                            <Tooltip title="Eliminar" arrow>
                              <Box>
                                <IconButton
                                  color="secondary"
                                  onClick={() =>
                                    handleOpenDialog &&
                                    handleOpenDialog(getRowId(row))
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        className="pagination"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(+event.target.value);
          setPage(0);
        }}
        labelRowsPerPage={
          <Typography variant="body2" component="span">
            {TABLE.ROWS_PER_PAGE}
          </Typography>
        }
        labelDisplayedRows={() => ""}
        ActionsComponent={PaginationActions}
      />
    </Paper>
  );
};

export default EditableTable;
