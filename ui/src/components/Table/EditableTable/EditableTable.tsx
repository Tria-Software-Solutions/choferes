import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useAuthContext } from "../../../context/AuthContext";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
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
  editFields: Record<string, string | boolean | number | string[] | Date>;
  setEditField?: (
    field: string,
    value: string | boolean | number | string[] | Date
  ) => void;
  handleEdit?: (row: T) => void;
  handleCancel?: () => void;
  handleUpdate?: (id: number) => void;
  handleOpenDeleteDialog?: (id: number) => void;
  handleOpenStatusDialog?: (row: any) => void;
  handlePasswordModal?: (id: number, handleClose: () => void) => void;
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
  handleEdit: handleEditClick,
  handleCancel: handleCancelClick,
  handleUpdate: handleSaveClick,
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
  const { currentUser } = useAuthContext();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { permissions } = useSelector((state: RootState) => state.permissions);
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
    userPermissions?.includes(PERMISSIONS.ENABLE_DISABLE_USER) ||
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
          value={
            editFields[String(column)] instanceof Date
              ? (editFields[String(column)] as Date)
              : null
          }
          onChange={handleChange}
        />
      );
    }

    if (config.type === "date") {
      const handleDateChange = (date: Date | null) => {
        if (date) {
          setEditField && setEditField(String(column), date);
        }
      };

      return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Seleccionar fecha"
            value={
              editFields[String(column)] instanceof Date
                ? (editFields[String(column)] as Date)
                : editFields[String(column)]
                ? new Date(editFields[String(column)] as string)
                : null
            }
            sx={{
              width: { xs: "150px", sm: "150px", md: "150px" },
            }}
            maxDate={new Date()}
            views={["year", "month", "day"]}
            slots={{
              toolbar: () => null,
            }}
            slotProps={{
              textField: {
                inputProps: { readOnly: true },
                onMouseDown: (e) => e.preventDefault(),
              },
              actionBar: {
                actions: [],
              },
            }}
            closeOnSelect
            onChange={(date) => handleDateChange(date)}
          />
        </LocalizationProvider>
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
          freeSolo
          value={selectedOption}
          onChange={(event, newValue) => {
            setEditField &&
              setEditField(
                String(column),
                newValue && typeof newValue !== "string" ? newValue.value : ""
              );
          }}
          inputValue={undefined}
          onInputChange={(event, newInputValue) => {
            if (!event) return;
          }}
          options={config.options || []}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
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
        | "date"
        | "select"
        | "select multiple"
        | "autocomplete"
        | "autocomplete multiple";
      options?: { value: string; label: string }[];
      hidden?: boolean;
    }
  > = {
    licensePlate: { type: "masked" },
    parkingLot: { type: "masked" },
    createdAt: { type: "date", hidden: false },
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
      {groupByDate && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            backgroundColor: "#f0f2f5",
            padding: isSmallScreen ? "8px" : "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {formatDateWithDay(groupByDate, false)}
            </Typography>
          </Box>
        </Box>
      )}
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
            <TableRow>
              {columns
                .filter((column) => !columnConfig[String(column)]?.hidden)
                .map((column) => (
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
                  {columns
                    .filter((column) => !columnConfig[String(column)]?.hidden)
                    .map((column) => {
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
                          ) : column === "createdAt" && row[column] ? (
                            <>
                              {/* {format(
                                new Date(row[column] as unknown as Date),
                                "dd/MM/yyyy",
                                {
                                  locale: es,
                                }
                              )} */}
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
                                  >
                                    {({ handleClose }) => (
                                      <>
                                        {handlePasswordModal &&
                                          handlePasswordModal(
                                            getRowId(row),
                                            handleClose
                                          )}
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
