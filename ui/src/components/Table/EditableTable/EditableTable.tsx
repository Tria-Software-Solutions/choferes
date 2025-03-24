import React, { useState } from "react";
import { useRoles } from "../../../hooks/useRole";
import { usePermissions } from "../../../hooks/usePermission";
import { useAuth } from "../../../context/AuthContext";
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
  Stack,
  Chip,
  useTheme,
  Link,
  Checkbox,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import {
  translateColumnHeaderToSpanish,
  translateDayOptionsToSpanish,
} from "../../../utils/string";
import { formatDateWithDay } from "../../../utils/dates";
import { maskLicensePlate, maskParkingLot } from "../../../utils/mask";
import {
  BRANDS_LIST,
  COLORS_LIST,
  DAYS_LIST,
  PERMISSIONS,
  TABLE,
} from "../../../constants/constants";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PaginationActions from "../Pagination/PaginationActions";
import PasswordIcon from "@mui/icons-material/Password";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import ModalComponent from "../../Modal/ModalComponent";

type EditableTableProps<T> = {
  data: T[];
  columns: (keyof T)[];
  groupByDate?: Date | null;
  editRowId: number | null;
  editFields: Record<string, string | boolean | number | string[]>;
  setEditField?: (
    field: string,
    value: string | boolean | number | string[]
  ) => void;
  handleEditClick?: (row: T) => void;
  handleCancelClick?: () => void;
  handleSaveClick?: (id: number) => void;
  handleOpenDeleteDialog?: (id: number) => void;
  handleOpenStatusDialog?: (row: any) => void;
  handlePasswordModal?: (handleClose: () => void) => void;
  getRowId: (row: T) => number;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  renderColumnValue?: (column: keyof T, value: any) => React.ReactNode;
  validateField?: (
    field: string,
    value: string | string[] | boolean
  ) => boolean;
  isSaveDisabled?: boolean;
  noActions?: boolean;
  userPermissions?: string[];
};

const EditableTable = <T extends object>({
  data,
  columns,
  groupByDate,
  editRowId,
  editFields,
  setEditField,
  handleEditClick,
  handleCancelClick,
  handleSaveClick,
  handleOpenDeleteDialog,
  handleOpenStatusDialog,
  handlePasswordModal,
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
  userPermissions,
}: EditableTableProps<T>) => {
  const { currentUser } = useAuth();
  const { roles } = useRoles();
  const { permissions } = usePermissions();
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const hasEditPermissions =
    userPermissions?.includes(PERMISSIONS.EDIT_EMPLOYEES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_SCHEDULES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_VEHICLES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_USER) ||
    userPermissions?.includes(PERMISSIONS.EDIT_ROLE);

  const hasDeletePermissions =
    userPermissions?.includes(PERMISSIONS.DELETE_EMPLOYEES) ||
    userPermissions?.includes(PERMISSIONS.DELETE_SCHEDULES) ||
    userPermissions?.includes(PERMISSIONS.DELETE_VEHICLES) ||
    userPermissions?.includes(PERMISSIONS.DELETE_USER) ||
    userPermissions?.includes(PERMISSIONS.DELETE_ROLE);

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

    if (config.type === "select" && config.options) {
      const selectedValue = config.options.some(
        (opt) => opt.value === editFields[String(column)]
      )
        ? editFields[String(column)]
        : "";

      return (
        <FormControl variant="outlined" fullWidth>
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
          </Select>
        </FormControl>
      );
    }

    if (config.type === "select multiple" && config.options) {
      const selectedValues = Array.isArray(editFields[String(column)])
        ? editFields[String(column)]
        : [];

      return (
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            value={selectedValues}
            onChange={(e) =>
              setEditField && setEditField(String(column), e.target.value)
            }
            renderValue={(selected) =>
              Array.isArray(selected)
                ? selected
                    .map((item) => translateDayOptionsToSpanish(item))
                    .join(", ")
                : ""
            }
          >
            {config.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  checked={
                    Array.isArray(selectedValues) &&
                    selectedValues.includes(option.value)
                  }
                />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
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

    if (config.type === "autocomplete multiple" && config.options) {
      const selectedValues: string[] = Array.isArray(editFields[String(column)])
        ? (editFields[String(column)] as string[])
        : [];
      const selectedOptions = config.options.filter((opt) =>
        selectedValues.some((val) => val === opt.value)
      );

      return (
        <Autocomplete
          multiple
          limitTags={5}
          value={selectedOptions}
          onChange={(event, newValue) => {
            setEditField &&
              setEditField(
                String(column),
                newValue.map((option) => option.value)
              );
          }}
          options={config.options}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip key={key} label={option.label} {...tagProps} />;
            })
          }
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
      type:
        | "text"
        | "masked"
        | "select"
        | "select multiple"
        | "autocomplete"
        | "autocomplete multiple";
      options?: { value: string; label: string }[];
    }
  > = {
    licensePlate: { type: "masked" },
    parkingLot: { type: "masked" },
    roleName: {
      type: "select",
      options: roles.map((role) => ({ value: role.name, label: role.name })),
    },
    days: { type: "select multiple", options: DAYS_LIST },
    permissionNames: {
      type: "autocomplete multiple",
      options: permissions.map((permission) => ({
        value: permission.name,
        label: permission.name,
      })),
    },
    brand: { type: "autocomplete", options: BRANDS_LIST },
    color: { type: "autocomplete", options: COLORS_LIST },
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
            {paginatedData.map((row) => {
              const rowId = getRowId(row);
              const isCurrentUser = rowId === currentUser?.id;
              const isUser = "username" in row;
              return (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => {
                    return (
                      <TableCell key={String(column)}>
                        {editRowId === getRowId(row) ? (
                          <>
                            {renderEditField(
                              column,
                              (editFields[String(column)] || "").toString()
                            )}
                          </>
                        ) : Array.isArray(row[column]) ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            sx={{ rowGap: 2 }}
                          >
                            {(row[column] as string[]).map(
                              (item, index, array) =>
                                column === "permissionNames" ? (
                                  <Chip
                                    key={index}
                                    label={translateDayOptionsToSpanish(item)}
                                    variant="outlined"
                                  />
                                ) : (
                                  <Typography key={index} component="span">
                                    {translateDayOptionsToSpanish(item)}
                                    {index < array.length - 1 ? ", " : ""}
                                  </Typography>
                                )
                            )}
                          </Stack>
                        ) : column === "email" ? (
                          <Link
                            href={`mailto:${row[column]}`}
                            sx={{
                              textDecoration: "none",
                              color: theme.palette.primary.main,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {String(row[column])}
                          </Link>
                        ) : column === "day" ? (
                          <>
                            {translateDayOptionsToSpanish(
                              row[column] as string
                            )}
                          </>
                        ) : (
                          <>{renderColumnValue(column, row[column])}</>
                        )}
                      </TableCell>
                    );
                  })}
                  {!noActions && (
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                              <>
                                {isUser && (
                                  <ModalComponent
                                    buttonType="icon"
                                    buttonIcon={<PasswordIcon />}
                                    variant="text"
                                    modalStyle={{
                                      width: isSmallScreen ? "80%" : "40%",
                                    }}
                                    modalTooltip="Cambiar Contraseña"
                                    modalTitle="Cambiar Contraseña"
                                    modalDescription={
                                      "Puedes cambiar la contraseña manualmente"
                                    }
                                  >
                                    {({ handleClose }) => (
                                      <>
                                        {handlePasswordModal &&
                                          handlePasswordModal(handleClose)}
                                      </>
                                    )}
                                  </ModalComponent>
                                )}
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
                              </>
                            )}
                            {hasDeletePermissions && (
                              <>
                                {isUser ? (
                                  !isCurrentUser &&
                                  ("isActive" in row ? (
                                    <Tooltip
                                      title={
                                        row.isActive ? "Desactivar" : "Activar"
                                      }
                                      arrow
                                    >
                                      <Box>
                                        <IconButton
                                          color="secondary"
                                          onClick={() =>
                                            handleOpenStatusDialog &&
                                            handleOpenStatusDialog(row)
                                          }
                                        >
                                          {row.isActive ? (
                                            <BlockIcon color="error" />
                                          ) : (
                                            <CheckCircleOutlineIcon color="success" />
                                          )}
                                        </IconButton>
                                      </Box>
                                    </Tooltip>
                                  ) : null)
                                ) : (
                                  <Tooltip title="Eliminar" arrow>
                                    <Box>
                                      <IconButton
                                        color="secondary"
                                        onClick={() =>
                                          handleOpenDeleteDialog &&
                                          handleOpenDeleteDialog(getRowId(row))
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
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
