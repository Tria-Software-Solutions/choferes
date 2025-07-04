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
import { maskLicensePlate, maskParkingLotWithPrefix } from "../../../utils/mask";
import {
  BRANDS_LIST,
  COLORS_LIST,
  DAYS_LIST,
  TABLE,
  TABLE_UI,
  PERMISSIONS,
} from "../../../constants/constants";
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaginationActions from "../Pagination/PaginationActions";
import LockResetIcon from '@mui/icons-material/LockReset';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CustomTextField from "../../Textfield/CustomTextField";
import DialogComponent from "../../Dialog/DialogComponent";
import { User } from '../../../models/User';
import {
  formControlStyles,
  selectStyles,
  datePickerTextFieldStyles,
  tableCellStyles,
  permissionChipStyles,
  viewMoreLessStyles,
  emailLinkStyles
} from "./EditableTable.styles";

// EditableTable is a generic, highly-configurable table component for displaying and editing tabular data.
// Supports inline editing, validation, pagination, sorting, custom renderers, and permission-based actions.
// Props:
// - data: array of row objects
// - columns: array of column keys to display
// - groupByDate: optional date to group rows
// - editRowId: id of the row currently being edited
// - editFields: current values for the editable fields
// - setEditField: function to update a field value
// - handleEdit, handleCancel, handleUpdate: handlers for edit actions
// - handleOpenDeleteDialog, handleOpenStatusDialog: handlers for row actions
// - handlePasswordModal: function to render a password modal
// - getRowId: function to get a row's unique id
// - totalCount, page, rowsPerPage, setPage, setRowsPerPage: pagination controls
// - renderColumnValue: custom renderer for cell values
// - validateField: function to validate a field
// - isSaveDisabled: disables save button if true
// - noActions: disables action buttons if true
// - userPermissions: array of user permissions
// - isExpanded: whether rows are expanded by default
//
// The table supports responsive design, Redux integration, and custom logic for different data types.

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
  passwordModalOpen?: boolean;
  passwordUserId?: number | null;
  onOpenPasswordModal?: (userId: number) => void;
  onClosePasswordModal?: () => void;
  showStatusColumn?: boolean;
};

const PARKING_PREFIX_OPTIONS = [
  { value: 'ATP', label: 'ATP' },
  { value: 'CE', label: 'CE' },
];

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
  renderColumnValue = (_, value) => value as React.ReactNode,
  validateField = () => true,
  isSaveDisabled,
  noActions,
  userPermissions,
  isExpanded = true,
  passwordModalOpen,
  passwordUserId,
  onOpenPasswordModal,
  onClosePasswordModal = () => {},
  showStatusColumn = false,
}: EditableTableProps<T>) => {
  const { currentUser } = useAuthContext();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]);
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
        <FormControl variant="outlined" fullWidth sx={formControlStyles}>
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
                ? `${TABLE.PERMISSIONS_LABEL}: ${visible.join(", ")} +${hidden} más`
                : `${TABLE.PERMISSIONS_LABEL}: ${visible.join(", ")}`;
            }}
            sx={selectStyles}
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

    if (String(column) === 'licensePlate') {
      const licensePlateValue = (editFields['licensePlate'] as string) || '';
      const handleLicensePlateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const maskedValue = maskLicensePlate(rawValue);
        setEditField && setEditField('licensePlate', maskedValue);
      };
      return wrapWithGrid(
        <CustomTextField
          label={translateColumnHeaderToSpanish(column)}
          fullWidth
          value={licensePlateValue}
          onChange={handleLicensePlateChange}
          error={!validateField('licensePlate', licensePlateValue)}
        />, column
      );
    }

    if (!config) {
      return wrapWithGrid(
        <CustomTextField
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

    if (String(column) === 'parkingLot') {
      // Get prefix from editFields or default to ATP
      const parkingPrefix = (editFields['parkingPrefix'] as string) || 'ATP';
      const parkingLotValue = (editFields['parkingLot'] as string) || '';
      const prefixOptions = PARKING_PREFIX_OPTIONS.concat(
        parkingPrefix && !PARKING_PREFIX_OPTIONS.some(opt => opt.value === parkingPrefix)
          ? [{ value: parkingPrefix, label: parkingPrefix }]
          : []
      );

      const handlePrefixChange = (
        event: React.SyntheticEvent,
        newValue: { value: string; label: string } | string | null
      ) => {
        let prefixValue = '';
        if (newValue === null || newValue === '') {
          setEditField && setEditField('parkingPrefix', '');
          setEditField && setEditField('parkingLot', '');
          return;
        }
        if (typeof newValue === 'object' && newValue !== null) {
          prefixValue = newValue.value.toUpperCase();
        } else if (typeof newValue === 'string') {
          prefixValue = newValue.toUpperCase();
        }
        if (prefixValue) {
          setEditField && setEditField('parkingPrefix', prefixValue);
          if (prefixValue === 'CE') {
            setEditField && setEditField('parkingLot', 'CE');
          } else {
            setEditField && setEditField('parkingLot', '');
          }
        }
      };

      const handleParkingLotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const maskedValue = maskParkingLotWithPrefix(parkingPrefix, rawValue);
        setEditField && setEditField('parkingLot', maskedValue);
      };

      const isReadOnly = parkingPrefix === 'CE';

      return wrapWithGrid(
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl variant="outlined" sx={{ minWidth: 90, flex: '0 0 90px' }}>
            <Autocomplete
              freeSolo
              value={{ value: parkingPrefix, label: parkingPrefix }}
              onChange={handlePrefixChange}
              inputValue={parkingPrefix}
              onInputChange={(e, v) => setEditField && setEditField('parkingPrefix', v.toUpperCase())}
              options={prefixOptions.map(opt => ({ value: opt.value.toUpperCase(), label: opt.label.toUpperCase() }))}
              getOptionLabel={option => typeof option === 'string' ? option : option.label}
              noOptionsText="Sin coincidencias"
              renderInput={params => (
                <CustomTextField {...params} label="Prefijo" variant="outlined" fullWidth sx={{ minWidth: 90 }} />
              )}
            />
          </FormControl>
          <CustomTextField
            label={translateColumnHeaderToSpanish(column)}
            variant="outlined"
            fullWidth
            value={parkingLotValue}
            onChange={handleParkingLotChange}
            InputProps={{ readOnly: isReadOnly }}
            error={!validateField('parkingLot', parkingLotValue)}
          />
        </Box>,
        column
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
            sx={{ width: "100%" }}
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
                sx: datePickerTextFieldStyles,
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
        <FormControl variant="outlined" fullWidth sx={formControlStyles}>
          <Select
            value={selectedValue}
            onChange={(e) =>
              setEditField &&
              setEditField(String(column), String(e.target.value))
            }
            sx={selectStyles}
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
        <FormControl variant="outlined" fullWidth sx={formControlStyles}>
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
            sx={selectStyles}
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
            <CustomTextField
              {...params}
              label={translateColumnHeaderToSpanish(column)}
              fullWidth
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
            <CustomTextField
              {...params}
              label={translateColumnHeaderToSpanish(column)}
              fullWidth
              placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
            />
          )}
        />,
        column,
      );
    }

    return wrapWithGrid(
      <CustomTextField
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
    <Paper sx={{ width: "100%", borderRadius: 1, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
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
        sx={{ maxHeight: "58vh", overflowY: "auto", overflowX: "auto", borderRadius: 0 }}
      >
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650, borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              {columns
                .filter((column) => !columnConfig[String(column)]?.hidden)
                .slice(0, 2)
                .map((column) => (
                  <TableCell
                    key={String(column)}
                    className="tableCell"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 4,
                      backgroundColor: theme => theme.palette.primary.main,
                      color: theme => theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: 'clamp(0.95rem, 1vw, 1.05rem)',
                      padding: '12px 16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <TableSortLabel
                      direction={orderBy === column ? order : "asc"}
                      onClick={() => handleSortRequest(column)}
                      sx={{ color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } }}
                    >
                      {translateColumnHeaderToSpanish(column)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              {showStatusColumn && (
                <TableCell
                  className="tableCell"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 4,
                    backgroundColor: theme => theme.palette.primary.main,
                    color: theme => theme.palette.primary.contrastText,
                    fontWeight: 700,
                    fontSize: 'clamp(0.95rem, 1vw, 1.05rem)',
                    padding: '12px 16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Estado
                </TableCell>
              )}
              {columns
                .filter((column) => !columnConfig[String(column)]?.hidden)
                .slice(2)
                .map((column) => (
                  <TableCell
                    key={String(column)}
                    className="tableCell"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 4,
                      backgroundColor: theme => theme.palette.primary.main,
                      color: theme => theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: 'clamp(0.95rem, 1vw, 1.05rem)',
                      padding: '12px 16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <TableSortLabel
                      direction={orderBy === column ? order : "asc"}
                      onClick={() => handleSortRequest(column)}
                      sx={{ color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } }}
                    >
                      {translateColumnHeaderToSpanish(column)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              {(!noActions && (hasEditPermissions || hasDeletePermissions)) ? (
                <TableCell
                  className="tableCell"
                  style={{ width: "100px", whiteSpace: 'nowrap' }}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 4,
                    backgroundColor: theme => theme.palette.primary.main,
                    color: theme => theme.palette.primary.contrastText,
                    fontWeight: 700,
                    fontSize: 'clamp(0.95rem, 1vw, 1.05rem)',
                    padding: '12px 16px',
                  }}
                />
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isCurrentUser = rowId === currentUser?.id;
              const isUser = "username" in row;

              return (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={getRowId(row) + '-' + String((row as T & { isActive?: boolean }).isActive)}
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f6f8fa',
                    transition: 'background 0.2s',
                    '&:hover': {
                      backgroundColor: '#e3eafc',
                    },
                  }}
                >
                  {columns
                    .filter((column) => !columnConfig[String(column)]?.hidden)
                    .slice(0, 2)
                    .map((column) => {
                      const value = row[column];
                      const isPermissionNames = column === "permissionNames";
                      if (
                        isPermissionNames &&
                        Array.isArray(value) &&
                        editRowId !== getRowId(row)
                      ) {
                        const expanded = !!expandedRows[rowId];
                        const maxVisible = 6;
                        const showAll = expanded && value.length > maxVisible;
                        const visible = showAll
                          ? value
                          : value.slice(0, maxVisible);
                        const hiddenCount = value.length - maxVisible;
                        return (
                          <TableCell
                            key={String(column)}
                            className="tableCell"
                            sx={tableCellStyles}
                          >
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
                                <Box
                                  key={perm}
                                  sx={permissionChipStyles(theme)}
                                >
                                  {perm}
                                </Box>
                              ))}
                              {hiddenCount > 0 && !expanded && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: true,
                                    }))
                                  }
                                >
                                  {TABLE_UI.VIEW_MORE}
                                </Typography>
                              )}
                              {showAll && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: false,
                                    }))
                                  }
                                >
                                  {TABLE_UI.VIEW_LESS}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={String(column)}
                          className="tableCell"
                          sx={tableCellStyles}
                        >
                          {editRowId === getRowId(row) ? (
                            renderEditField(
                              column,
                              (editFields[String(column)] || "").toString(),
                            )
                          ) : editRowId === getRowId(row) &&
                            column === "permissionNames" ? (
                            Array.isArray(row[column]) ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(row[column] as string[]).map(
                                  (item: string, index: number) => (
                                    <Box
                                      key={index}
                                      sx={permissionChipStyles(theme)}
                                    >
                                      {item}
                                    </Box>
                                  ),
                                )}
                              </Box>
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
                            column === "permissionNames" ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(row[column] as string[]).map(
                                  (item: string, index: number) => (
                                    <Box
                                      key={index}
                                      sx={permissionChipStyles(theme)}
                                    >
                                      {item}
                                    </Box>
                                  ),
                                )}
                              </Box>
                            ) : (
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  rowGap: 2,
                                  flexWrap: "nowrap",
                                }}
                              >
                                {(row[column] as string[]).map(
                                  (
                                    item: string,
                                    index: number,
                                    array: string[],
                                  ) => (
                                    <Typography key={index} component="span">
                                      {item}
                                      {index < array.length - 1 ? ", " : ""}
                                    </Typography>
                                  ),
                                )}
                              </Stack>
                            )
                          ) : column === "email" ? (
                            <Typography
                              component="a"
                              href={`mailto:${String(row[column] ?? "")}`}
                              sx={emailLinkStyles(theme)}
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
                  {showStatusColumn && (
                    <TableCell className="tableCell" sx={tableCellStyles}>
                      {isUser && !isCurrentUser && ('isActive' in row) && hasDeletePermissions && (
                        <Tooltip title={row.isActive ? TABLE.DISABLE : TABLE.ENABLE} arrow>
                          <span>
                            <Box>
                              <IconButton
                                color="secondary"
                                onClick={() => handleOpenStatusDialog && handleOpenStatusDialog(row)}
                              >
                                {row.isActive ? (
                                  <ToggleOnIcon sx={{ color: 'success.main' }} />
                                ) : (
                                  <ToggleOffIcon sx={{ color: 'grey.500' }} />
                                )}
                              </IconButton>
                            </Box>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  {columns
                    .filter((column) => !columnConfig[String(column)]?.hidden)
                    .slice(2)
                    .map((column) => {
                      const value = row[column];
                      const isPermissionNames = column === "permissionNames";
                      if (
                        isPermissionNames &&
                        Array.isArray(value) &&
                        editRowId !== getRowId(row)
                      ) {
                        const expanded = !!expandedRows[rowId];
                        const maxVisible = 6;
                        const showAll = expanded && value.length > maxVisible;
                        const visible = showAll
                          ? value
                          : value.slice(0, maxVisible);
                        const hiddenCount = value.length - maxVisible;
                        return (
                          <TableCell
                            key={String(column)}
                            className="tableCell"
                            sx={tableCellStyles}
                          >
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
                                <Box
                                  key={perm}
                                  sx={permissionChipStyles(theme)}
                                >
                                  {perm}
                                </Box>
                              ))}
                              {hiddenCount > 0 && !expanded && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: true,
                                    }))
                                  }
                                >
                                  {TABLE_UI.VIEW_MORE}
                                </Typography>
                              )}
                              {showAll && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [rowId]: false,
                                    }))
                                  }
                                >
                                  {TABLE_UI.VIEW_LESS}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={String(column)}
                          className="tableCell"
                          sx={tableCellStyles}
                        >
                          {editRowId === getRowId(row) ? (
                            renderEditField(
                              column,
                              (editFields[String(column)] || "").toString(),
                            )
                          ) : editRowId === getRowId(row) &&
                            column === "permissionNames" ? (
                            Array.isArray(row[column]) ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(row[column] as string[]).map(
                                  (item: string, index: number) => (
                                    <Box
                                      key={index}
                                      sx={permissionChipStyles(theme)}
                                    >
                                      {item}
                                    </Box>
                                  ),
                                )}
                              </Box>
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
                            column === "permissionNames" ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(row[column] as string[]).map(
                                  (item: string, index: number) => (
                                    <Box
                                      key={index}
                                      sx={permissionChipStyles(theme)}
                                    >
                                      {item}
                                    </Box>
                                  ),
                                )}
                              </Box>
                            ) : (
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  rowGap: 2,
                                  flexWrap: "nowrap",
                                }}
                              >
                                {(row[column] as string[]).map(
                                  (
                                    item: string,
                                    index: number,
                                    array: string[],
                                  ) => (
                                    <Typography key={index} component="span">
                                      {item}
                                      {index < array.length - 1 ? ", " : ""}
                                    </Typography>
                                  ),
                                )}
                              </Stack>
                            )
                          ) : column === "email" ? (
                            <Typography
                              component="a"
                              href={`mailto:${String(row[column] ?? "")}`}
                              sx={emailLinkStyles(theme)}
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
                  {!noActions && (hasEditPermissions || hasDeletePermissions) && (
                    <TableCell
                      className="tableCell"
                      style={{ width: "100px", whiteSpace: 'nowrap' }}
                      sx={tableCellStyles}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {editRowId === getRowId(row) ? (
                          <>
                            <Tooltip title={TABLE.SAVE} arrow>
                              <span>
                                <Box>
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleSaveClick &&
                                      handleSaveClick(getRowId(row))
                                    }
                                    disabled={isSaveDisabled}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Box>
                              </span>
                            </Tooltip>
                            <Tooltip title={TABLE.CANCEL} arrow>
                              <span>
                                <Box>
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleCancelClick && handleCancelClick()
                                    }
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Box>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {hasEditPermissions && (
                              <>
                                {isUser && isExpanded && onOpenPasswordModal && (
                                  <Tooltip title={TABLE.CHANGE_PASSWORD} arrow>
                                    <span>
                                      <Box>
                                        <IconButton
                                          color="primary"
                                          onClick={() => onOpenPasswordModal && onOpenPasswordModal(getRowId(row))}
                                        >
                                          <LockResetIcon />
                                        </IconButton>
                                      </Box>
                                    </span>
                                  </Tooltip>
                                )}
                                <Tooltip title={TABLE.EDIT} arrow>
                                  <span>
                                    <Box>
                                      <IconButton
                                        color="primary"
                                        onClick={() =>
                                          handleEditClick && handleEditClick(row)
                                        }
                                      >
                                        <EditNoteIcon />
                                      </IconButton>
                                    </Box>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                            {hasDeletePermissions && (
                              <>
                                {isUser ? (
                                  !isCurrentUser &&
                                  (!('isActive' in row)
                                    ? (
                                        <Tooltip title={TABLE.DELETE} arrow>
                                          <span>
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
                                                <DeleteForeverIcon />
                                              </IconButton>
                                            </Box>
                                          </span>
                                        </Tooltip>
                                      )
                                    : null)
                                ) : (
                                  <Tooltip title={TABLE.DELETE} arrow>
                                    <span>
                                      <Box>
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            handleOpenDeleteDialog &&
                                            handleOpenDeleteDialog(getRowId(row))
                                          }
                                        >
                                          <DeleteForeverIcon />
                                        </IconButton>
                                      </Box>
                                    </span>
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
        sx={{ borderRadius: '0 0 12px 12px' }}
      />

      {/* Password change modal: always mounted, only open prop changes */}
      <DialogComponent
        open={!!passwordModalOpen}
        onClose={onClosePasswordModal}
        title="Cambiar Contraseña"
        subtitle={(() => {
          if (typeof passwordUserId === 'number') {
            const user = data.find((u) => getRowId(u) === passwordUserId) as User | undefined;
            if (user) {
              return `${user.firstName || ''} ${user.lastName || ''}`.trim();
            }
          }
          return '';
        })()}
        hideActions
        paperSx={{ minWidth: { xs: '90vw', sm: 500, md: 700 }, maxWidth: { xs: '98vw', sm: 700 } }}
      >
        {typeof passwordUserId === 'number' && handlePasswordModal
          ? handlePasswordModal(passwordUserId, onClosePasswordModal)
          : null}
      </DialogComponent>
    </Paper>
  );
};

export default EditableTable;
