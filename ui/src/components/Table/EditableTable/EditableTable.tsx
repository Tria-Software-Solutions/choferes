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
  Checkbox,
  ListItemText,
  useMediaQuery,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import {
  translateColumnHeaderToSpanish,
  translateDayOptionsToSpanish,
  capitalizeFirstLetter,
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

type EditableTableProps<T> = {
  data: T[];
  columns: (keyof T)[];
  groupByDate?: Date | null;
  editRowId: number | null;
  editFields: Record<string, string | boolean | number | string[] | Date>;
  setEditField?: (
    field: string,
    value: string | boolean | number | string[] | Date,
  ) => void;
  handleEdit?: (row: T) => void;
  handleCancel?: () => void;
  handleUpdate?: (id: number) => void;
  handleOpenDeleteDialog?: (id: number) => void;
  handleOpenStatusDialog?: (row: unknown) => void;
  handlePasswordModal?: (
    id: number,
    handleClose: () => void,
  ) => React.ReactNode;
  getRowId: (row: T) => number;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  renderColumnValue?: (column: keyof T, value: unknown) => React.ReactNode;
  validateField?: (
    field: string,
    value: string | string[] | boolean,
  ) => boolean;
  isSaveDisabled?: boolean;
  noActions?: boolean;
  userPermissions?: string[];
  isExpanded?: boolean;
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
  isExpanded = true,
}: EditableTableProps<T>) => {
  const { currentUser } = useAuthContext();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

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
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const wrapWithGrid = (component: React.ReactNode, column: keyof T) => {
    const config = columnConfig[String(column)];
    if (!config?.size) {
      return component;
    }

    return (
      <Grid
        item
        xs={config.size.xs}
        sm={config.size.sm}
        md={config.size.md}
        lg={config.size.lg}
      >
        {component}
      </Grid>
    );
  };

  const renderEditField = (column: keyof T, value: string) => {
    const config = columnConfig[String(column)];

    if (column === "permissionNames" && config && config.options) {
      const selectedValues: string[] = Array.isArray(editFields[String(column)])
        ? (editFields[String(column)] as string[])
        : [];
      return wrapWithGrid(
        <FormControl variant="outlined" fullWidth sx={{ height: 56 }}>
          <Select
            multiple
            value={selectedValues}
            onChange={(e) =>
              setEditField && setEditField(String(column), e.target.value)
            }
            renderValue={(selected) => {
              if (!Array.isArray(selected)) return "";
              const max = 5;
              const labels = selected.map(
                (v) =>
                  config.options?.find((opt) => opt.value === v)?.label || v,
              );
              const visible = labels.slice(0, max);
              const hidden = labels.length > max ? labels.length - max : 0;
              return hidden > 0
                ? `Permisos: ${visible.join(", ")} +${hidden} más`
                : `Permisos: ${visible.join(", ")}`;
            }}
            sx={{ height: 56 }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 320,
                  overflowY: "auto",
                },
              },
            }}
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
        </FormControl>,
        column,
      );
    }

    if (!config) {
      return wrapWithGrid(
        <TextField
          fullWidth
          value={editFields[String(column)] || ""}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          error={!validateField(String(column), value)}
        />,
        column,
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

      return wrapWithGrid(
        <TextField
          label={translateColumnHeaderToSpanish(column)}
          variant="outlined"
          fullWidth
          value={editFields[String(column)] || ""}
          onChange={handleChange}
        />,
        column,
      );
    }

    if (config.type === "date") {
      const handleDateChange = (date: Date | null) => {
        if (date) {
          setEditField && setEditField(String(column), date);
        }
      };

      return wrapWithGrid(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label={translateColumnHeaderToSpanish(column)}
            value={
              editFields[String(column)]
                ? (() => {
                    const rawValue = editFields[String(column)];
                    const dateStr =
                      typeof rawValue === "string"
                        ? rawValue
                        : rawValue instanceof Date
                          ? rawValue.toISOString()
                          : "";

                    if (!dateStr) return null;

                    const [year, month, day] = dateStr.split("T")[0].split("-");
                    return new Date(
                      Number(year),
                      Number(month) - 1,
                      Number(day),
                    );
                  })()
                : null
            }
            sx={{
              width: "100%",
            }}
            maxDate={new Date()}
            views={["year", "month", "day"]}
            slots={{
              toolbar: () => null,
            }}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
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
        </LocalizationProvider>,
        column,
      );
    }

    if (config.type === "select" && config.options) {
      const selectedValue = config.options.some(
        (opt) => opt.value === editFields[String(column)],
      )
        ? editFields[String(column)]
        : "";

      return wrapWithGrid(
        <FormControl variant="outlined" fullWidth sx={{ height: 56 }}>
          <Select
            value={selectedValue}
            onChange={(e) =>
              setEditField &&
              setEditField(String(column), String(e.target.value))
            }
            sx={{ height: 56 }}
          >
            {config.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>,
        column,
      );
    }

    if (config.type === "select multiple" && config.options) {
      const selectedValues = Array.isArray(editFields[String(column)])
        ? editFields[String(column)]
        : [];

      return wrapWithGrid(
        <FormControl variant="outlined" fullWidth sx={{ height: 56 }}>
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
            sx={{ height: 56 }}
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
        </FormControl>,
        column,
      );
    }

    if (config.type === "autocomplete" && config.options) {
      const selectedValue = editFields[String(column)] || "";
      const selectedOption =
        config.options?.find((opt) => opt.value === selectedValue) || null;

      return wrapWithGrid(
        <Autocomplete
          freeSolo
          value={selectedOption}
          onChange={(event, newValue) => {
            setEditField &&
              setEditField(
                String(column),
                newValue && typeof newValue !== "string" ? newValue.value : "",
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
              sx={{ height: 56 }}
              placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
            />
          )}
        />,
        column,
      );
    }

    if (config.type === "autocomplete multiple" && config.options) {
      const selectedValues: string[] = Array.isArray(editFields[String(column)])
        ? (editFields[String(column)] as string[])
        : [];
      const selectedOptions = config.options.filter((opt) =>
        selectedValues.some((val) => val === opt.value),
      );

      return wrapWithGrid(
        <Autocomplete
          multiple
          limitTags={5}
          value={selectedOptions}
          onChange={(event, newValue) => {
            setEditField &&
              setEditField(
                String(column),
                newValue.map((option) => option.value),
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
              sx={{ height: 56 }}
              placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
            />
          )}
        />,
        column,
      );
    }

    return wrapWithGrid(
      <TextField
        fullWidth
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
      />,
      column,
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
    page * rowsPerPage + rowsPerPage,
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
      size?: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
      };
    }
  > = {
    licensePlate: {
      type: "masked",
      size: { xs: 6, sm: 4, md: 2, lg: 0.5 },
    },
    parkingLot: {
      type: "masked",
      size: { xs: 6, sm: 4, md: 2, lg: 1 },
    },
    ticket: {
      type: "text",
      size: { xs: 6, sm: 4, md: 2, lg: 0.5 },
    },
    brand: {
      type: "autocomplete",
      options: BRANDS_LIST,
      size: { xs: 6, sm: 4, md: 2, lg: 4 },
    },
    color: {
      type: "autocomplete",
      options: COLORS_LIST,
      size: { xs: 6, sm: 4, md: 2, lg: 4 },
    },
    notes: {
      type: "text",
      size: { xs: 6, sm: 4, md: 2, lg: 2 },
    },
    parkingDate: {
      type: "date",
      hidden: true,
      size: { xs: 6, sm: 4, md: 2, lg: 2 },
    },

    firstName: {
      type: "text",
      size: { xs: 6, sm: 6, md: 6, lg: 6 },
    },
    lastName: {
      type: "text",
      size: { xs: 6, sm: 6, md: 6, lg: 6 },
    },

    label: {
      type: "text",
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    days: {
      type: "select multiple",
      options: DAYS_LIST,
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    hours: {
      type: "text",
      size: { xs: 6, sm: 6, md: 3, lg: 2 },
    },
    specialSchedule: {
      type: "text",
      size: { xs: 6, sm: 6, md: 3, lg: 4 },
    },

    email: {
      type: "text",
      size: { xs: 12, sm: 12, md: 2, lg: 2 },
    },
    username: {
      type: "text",
      size: { xs: 6, sm: 6, md: 2, lg: 2 },
    },
    password: {
      type: "text",
      size: { xs: 6, sm: 6, md: 2, lg: 2 },
    },
    roleName: {
      type: "select",
      options: roles.map((role) => ({ value: role.name, label: role.name })),
      size: { xs: 6, sm: 6, md: 2, lg: 2 },
    },

    name: {
      type: "text",
      size: { xs: 12, sm: 12, md: 4, lg: 3 },
    },
    permissionNames: {
      type: "autocomplete multiple",
      options: permissions.map((permission) => ({
        value: permission.name,
        label: permission.name,
      })),
      size: { xs: 12, sm: 12, md: 8, lg: 9 },
    },

    updatedAt: { type: "date", hidden: true },
    route: {
      type: "select",
      options: [
        { value: "GAM", label: "GAM" },
        { value: "GAM Express", label: "GAM Express" },
        { value: "Rural", label: "Rural" },
      ],
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    status: {
      type: "select",
      options: [
        { value: "Despachado", label: "Despachado" },
        { value: "En Tránsito", label: "En Tránsito" },
        { value: "Entregado", label: "Entregado" },
      ],
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    driver: {
      type: "text",
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    distance: {
      type: "text",
      size: { xs: 6, sm: 6, md: 2, lg: 2 },
    },
    trackingNumber: {
      type: "text",
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
    createdAt: {
      type: "date",
      hidden: true,
      size: { xs: 6, sm: 6, md: 3, lg: 3 },
    },
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
              {editRowId !== null &&
                columns
                  .filter((column) => columnConfig[String(column)]?.hidden)
                  .map((column) => (
                    <TableCell
                      key={`header-${String(column)}`}
                      className="tableCell"
                    >
                      {translateColumnHeaderToSpanish(column)}
                    </TableCell>
                  ))}
              {!noActions || hasEditPermissions || hasDeletePermissions ? (
                <TableCell className="tableCell" style={{ width: "100px" }} />
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const rowId = getRowId(row);
              const isCurrentUser = rowId === currentUser?.id;
              const isUser = "username" in row;

              return (
                <TableRow hover tabIndex={-1} key={getRowId(row)}>
                  {columns
                    .filter((column) => !columnConfig[String(column)]?.hidden)
                    .map((column) => {
                      const value = row[column];
                      const isPermissionNames = column === "permissionNames";
                      if (
                        isPermissionNames &&
                        Array.isArray(value) &&
                        editRowId !== getRowId(row)
                      ) {
                        const expanded = !!expandedRows[rowId];
                        const maxVisible = 4;
                        const showAll = expanded && value.length > maxVisible;
                        const visible = showAll
                          ? value
                          : value.slice(0, maxVisible);
                        const hiddenCount = value.length - maxVisible;
                        return (
                          <TableCell key={String(column)} className="tableCell">
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                py: 0.5,
                                minHeight: 36,
                              }}
                            >
                              {visible.map((perm: string) => (
                                <Chip
                                  key={perm}
                                  label={perm}
                                  size="small"
                                  sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: "#fff",
                                    fontWeight: 500,
                                    mb: 0.5,
                                  }}
                                />
                              ))}
                              {hiddenCount > 0 && !expanded && (
                                <Chip
                                  label={`Ver más`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    background: "#fff",
                                    cursor: "pointer",
                                    mb: 0.5,
                                  }}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: true,
                                    }))
                                  }
                                />
                              )}
                              {showAll && (
                                <Chip
                                  label="Ver menos"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    background: "#fff",
                                    cursor: "pointer",
                                    mb: 0.5,
                                  }}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: false,
                                    }))
                                  }
                                />
                              )}
                            </Box>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={String(column)} className="tableCell">
                          {editRowId === getRowId(row) ? (
                            renderEditField(
                              column,
                              (editFields[String(column)] || "").toString(),
                            )
                          ) : editRowId === getRowId(row) &&
                            column === "permissionNames" ? (
                            Array.isArray(row[column]) ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="nowrap"
                              >
                                {(row[column] as string[]).map(
                                  (item: string, index: number) => (
                                    <Chip
                                      key={index}
                                      label={item}
                                      sx={{
                                        backgroundColor:
                                          theme.palette.primary.main,
                                        color: "#fff",
                                        "& .MuiChip-label": { color: "#fff" },
                                      }}
                                    />
                                  ),
                                )}
                              </Stack>
                            ) : (
                              <Typography component="span">
                                {String(row[column] ?? "")}
                              </Typography>
                            )
                          ) : column === "days" ? (
                            Array.isArray(row[column]) ? (
                              <Typography component="span">
                                {(row[column] as string[])
                                  .map((d: string) =>
                                    capitalizeFirstLetter(
                                      translateDayOptionsToSpanish(String(d)),
                                    ),
                                  )
                                  .join(", ")}
                              </Typography>
                            ) : (
                              <Typography component="span">
                                {capitalizeFirstLetter(
                                  translateDayOptionsToSpanish(
                                    String(row[column]),
                                  ),
                                )}
                              </Typography>
                            )
                          ) : Array.isArray(row[column]) ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                rowGap: 2,
                                flexWrap:
                                  column === "permissionNames"
                                    ? "wrap"
                                    : "nowrap",
                              }}
                            >
                              {(row[column] as string[]).map(
                                (
                                  item: string,
                                  index: number,
                                  array: string[],
                                ) =>
                                  column === "permissionNames" ? (
                                    <Chip
                                      key={index}
                                      label={item}
                                      sx={{
                                        backgroundColor:
                                          theme.palette.primary.main,
                                        color: "#fff",
                                        "& .MuiChip-label": { color: "#fff" },
                                      }}
                                    />
                                  ) : (
                                    <Typography key={index} component="span">
                                      {item}
                                      {index < array.length - 1 ? ", " : ""}
                                    </Typography>
                                  ),
                              )}
                            </Stack>
                          ) : column === "email" ? (
                            <Typography
                              component="a"
                              href={`mailto:${String(row[column] ?? "")}`}
                              sx={{
                                color: theme.palette.primary.main,
                                textDecoration: "none",
                                cursor: "pointer",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {String(row[column] ?? "")}
                            </Typography>
                          ) : (
                            <Typography component="span">
                              {String(row[column] ?? "")}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  {editRowId === getRowId(row) &&
                    columns
                      .filter((column) => columnConfig[String(column)]?.hidden)
                      .map((column) => (
                        <TableCell
                          key={`edit-${String(column)}`}
                          className="tableCell"
                        >
                          {renderEditField(
                            column,
                            (editFields[String(column)] || "").toString(),
                          )}
                        </TableCell>
                      ))}
                  {editRowId !== null &&
                    editRowId !== getRowId(row) &&
                    columns
                      .filter((column) => columnConfig[String(column)]?.hidden)
                      .map((column) => (
                        <TableCell
                          key={`empty-${String(column)}`}
                          className="tableCell"
                        ></TableCell>
                      ))}
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
                                {isUser &&
                                  isExpanded &&
                                  handlePasswordModal && (
                                    <Tooltip title="Cambiar Contraseña" arrow>
                                      <Box>
                                        <IconButton
                                          color="primary"
                                          onClick={() => {
                                            setPasswordUserId(getRowId(row));
                                            setPasswordModalOpen(true);
                                          }}
                                        >
                                          <PasswordIcon />
                                        </IconButton>
                                      </Box>
                                    </Tooltip>
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
                                            <CheckCircleOutlineIcon />
                                          ) : (
                                            <BlockIcon />
                                          )}
                                        </IconButton>
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Eliminar" arrow>
                                      <Box>
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            handleOpenDeleteDialog &&
                                            handleOpenDeleteDialog(
                                              getRowId(row),
                                            )
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Box>
                                    </Tooltip>
                                  ))
                                ) : (
                                  <Tooltip title="Eliminar" arrow>
                                    <Box>
                                      <IconButton
                                        color="error"
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

      {/* Modal de cambio de contraseña */}
      {passwordUserId !== null && handlePasswordModal && (
        <Dialog
          open={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setPasswordUserId(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Cambiar Contraseña
            </Typography>
            <IconButton
              onClick={() => {
                setPasswordModalOpen(false);
                setPasswordUserId(null);
              }}
              sx={{
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {handlePasswordModal(passwordUserId, () => {
              setPasswordModalOpen(false);
              setPasswordUserId(null);
            })}
          </DialogContent>
        </Dialog>
      )}
    </Paper>
  );
};

export default EditableTable;
