import React, { useMemo, useCallback, memo } from "react";
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
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import { translateColumnHeaderToSpanish } from "../../../utils/string";
import { formatDateWithDay } from "../../../utils/dates";
import { TABLE } from "../../../constants/constants";
import PaginationComponent from "../Pagination/Pagination.component";
import DialogComponent from "../../Dialog/Dialog.component";
import { User } from "../../../models/User";
import { tableCellStyles, tableHeadCellStyles } from "./EditableTable.styles";
import {
  createColumnConfig,
  sortData,
  paginateData,
  checkEditPermissions,
  checkDeletePermissions,
  renderEditField,
  renderCellValue,
  renderActionButtons,
  renderStatusButton,
} from "./helpers";
import { useTableSorting } from "../../../hooks/useTableSorting";
import { useExpandedRows } from "../../../hooks/useExpandedRows";

/** EditableTable - Componente genérico y configurable para mostrar y editar datos tabulares.
 * Soporta edición inline, validación, paginación, ordenamiento, renderers personalizados y acciones basadas en permisos. */

type EditFieldValue = string | boolean | number | string[] | Date;

interface EditableTableProps<T extends object> {
  data: T[];
  columns: (keyof T)[];
  groupByDate?: Date | null;
  editRowId: number | null;
  editFields: Record<string, EditFieldValue>;
  setEditField?: (field: string, value: EditFieldValue) => void;
  handleEdit?: (row: T) => void;
  handleCancel?: () => void;
  handleUpdate?: (id: number) => void;
  handleOpenDeleteDialog?: (id: number) => void;
  handleOpenStatusDialog?: (row: unknown) => void;
  handlePasswordModal?: (id: number, handleClose: () => void) => React.ReactNode;
  getRowId: (row: T) => number;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  /** @deprecated Use custom cell rendering in parent component instead */
  renderColumnValue?: (column: string, value: unknown) => React.ReactNode;
  validateField?: (field: string, value: string | string[] | boolean) => boolean;
  isSaveDisabled?: boolean;
  noActions?: boolean;
  userPermissions?: string[];
  isExpanded?: boolean;
  passwordModalOpen?: boolean;
  passwordUserId?: number | null;
  onOpenPasswordModal?: (userId: number) => void;
  onClosePasswordModal?: () => void;
  showStatusColumn?: boolean;
  maxTableHeight?: number;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

/** Componente memoizado para renderizar una celda de encabezado */
const HeaderCell = memo<{
  column: string;
  orderBy: string;
  order: "asc" | "desc";
  onSort: () => void;
  theme: Theme;
}>(({ column, orderBy, order, onSort, theme }) => (
  <TableCell className="tableCell" sx={tableHeadCellStyles(theme)}>
    <TableSortLabel
      direction={orderBy === column ? order : "asc"}
      onClick={onSort}
      sx={{
        color: "inherit",
        "& .MuiTableSortLabel-icon": { color: "inherit !important" },
      }}
    >
      {translateColumnHeaderToSpanish(column)}
    </TableSortLabel>
  </TableCell>
));
HeaderCell.displayName = "HeaderCell";

/** Componente memoizado para renderizar una celda de tabla */
const DataCell = memo<{
  column: string;
  value: unknown;
  isEditing: boolean;
  editValue: string;
  editFields: Record<string, EditFieldValue>;
  setEditField?: (field: string, value: EditFieldValue) => void;
  validateField: (field: string, value: string | string[] | boolean) => boolean;
  columnConfig: ReturnType<typeof createColumnConfig>;
  theme: Theme;
  expanded: boolean;
  onToggleExpand: () => void;
  renderColumnValue?: (column: string, value: unknown) => React.ReactNode;
}>(({ column, value, isEditing, editValue, editFields, setEditField, validateField, columnConfig, theme, expanded, onToggleExpand, renderColumnValue }) => {
  if (isEditing) {
    return (
      <>{renderEditField({ column: column as keyof object, value: editValue, editFields, setEditField, validateField, columnConfig })}</>
    );
  }
  // Usar renderColumnValue si se proporciona, sino usar renderCellValue por defecto
  if (renderColumnValue) {
    return <>{renderColumnValue(column, value)}</>;
  }
  return <>{renderCellValue({ column, value, theme, expanded, onToggleExpand })}</>;
});
DataCell.displayName = "DataCell";



const EditableTableComponent = <T extends object>({
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
  renderColumnValue,
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
  maxTableHeight,
}: EditableTableProps<T>) => {
  const { currentUser } = useAuthContext();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const { order, orderBy, handleSort } = useTableSorting<T>(columns[0]);
  const { expandedRows, expandRow, collapseRow } = useExpandedRows();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoizar permisos para evitar recálculos
  const hasEditPermissions = useMemo(() => checkEditPermissions(userPermissions), [userPermissions]);
  const hasDeletePermissions = useMemo(() => checkDeletePermissions(userPermissions), [userPermissions]);

  // Memoizar configuración de columnas
  const columnConfig = useMemo(() => createColumnConfig(roles, permissions), [roles, permissions]);

  // Memoizar columnas visibles para evitar recálculos en cada render
  const visibleColumns = useMemo(
    () => columns.filter((column) => !columnConfig[String(column)]?.hidden),
    [columns, columnConfig]
  );

  // Memoizar array de configuración de columnas para sorting
  const columnsConfigArray = useMemo(
    () => visibleColumns.map((key) => ({ field: key, sortable: true })),
    [visibleColumns]
  );

  // Memoizar datos ordenados - solo recalcular cuando cambian dependencias relevantes
  const sortedData = useMemo(
    () => sortData(data, orderBy, order, columnsConfigArray),
    [data, orderBy, order, columnsConfigArray]
  );

  // Memoizar datos paginados
  const paginatedData = useMemo(() => paginateData(sortedData, page, rowsPerPage), [sortedData, page, rowsPerPage]);

  // Memoizar opciones de rows per page
  const rowsPerPageOptions = useMemo(
    () => Array.from(new Set([...ROWS_PER_PAGE_OPTIONS, rowsPerPage])).sort((a, b) => a - b),
    [rowsPerPage]
  );

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleSortRequest = useCallback(
    (column: keyof T) => {
      handleSort(column);
    },
    [handleSort]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    },
    [setRowsPerPage, setPage]
  );

  // Crear callbacks para expand/collapse específicos por row
  const createToggleExpand = useCallback(
    (rowId: number) => () => {
      if (expandedRows[rowId]) {
        collapseRow(rowId);
      } else {
        expandRow(rowId);
      }
    },
    [expandedRows, expandRow, collapseRow]
  );

  // Memoizar el diálogo de contraseña para evitar recálculos
  const passwordModalSubtitle = useMemo(() => {
    if (typeof passwordUserId !== "number") return "";
    const user = data.find((u) => getRowId(u) === passwordUserId) as User | undefined;
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  }, [passwordUserId, data, getRowId]);

  const isParkingTable = useMemo(() => data.length > 0 && "licensePlate" in data[0], [data]);

  // Split columns en posición del status column (2 para mantener diseño actual)
  const firstColumns = useMemo(() => visibleColumns.slice(0, 2), [visibleColumns]);
  const remainingColumns = useMemo(() => visibleColumns.slice(2), [visibleColumns]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        boxShadow: "none",
        overflow: "visible",
        backgroundColor: "transparent",
      }}
    >
      {groupByDate && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            backgroundColor: theme.palette.background.paper,
            padding: isSmallScreen ? "8px" : "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                color: theme.palette.mode === "dark" ? "#fff" : theme.palette.text.secondary,
              }}
            >
              {formatDateWithDay(groupByDate, false)}
            </Typography>
          </Box>
        </Box>
      )}
      <TableContainer
        className="table-container"
        sx={{
          flex: 1,
          minHeight: 0,
          height: maxTableHeight ? `${maxTableHeight}px` : undefined,
          maxHeight: maxTableHeight ? `${maxTableHeight}px` : undefined,
          overflowY: "auto",
          overflowX: "auto",
          borderRadius: 0,
        }}
      >
        <Table
          stickyHeader
          aria-label="sticky table"
          sx={{ width: "100%", minWidth: 650, borderCollapse: "collapse" }}
        >
          <TableHead>
            <TableRow>
              {firstColumns.map((column) => (
                <HeaderCell
                  key={String(column)}
                  column={String(column)}
                  orderBy={String(orderBy)}
                  order={order}
                  onSort={() => handleSortRequest(column)}
                  theme={theme}
                />
              ))}
              {showStatusColumn && (
                <TableCell className="tableCell" sx={tableHeadCellStyles(theme)}>
                  Estado
                </TableCell>
              )}
              {remainingColumns.map((column) => (
                <HeaderCell
                  key={String(column)}
                  column={String(column)}
                  orderBy={String(orderBy)}
                  order={order}
                  onSort={() => handleSortRequest(column)}
                  theme={theme}
                />
              ))}
              {editRowId !== null && isParkingTable && (
                <TableCell className="tableCell" sx={tableHeadCellStyles(theme)}>
                  Fecha de Parqueo
                </TableCell>
              )}
              {!noActions && (hasEditPermissions || hasDeletePermissions) && (
                <TableCell className="tableCell" sx={{ ...tableHeadCellStyles(theme), width: 0, whiteSpace: "nowrap", borderRight: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }} />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isCurrentUser = rowId === currentUser?.id;
              const isUser = "username" in row;
              const isEditing = editRowId === rowId;
              const rowKey = `${rowId}-${(row as T & { isActive?: boolean }).isActive}`;

              return (
                <TableRow
                  tabIndex={-1}
                  key={rowKey}
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f6f8fa",
                    transition: "background 0.2s",
                    '&:hover': {
                      backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f6f8fa",
                    },
                  }}
                >
                  {firstColumns.map((column) => (
                    <TableCell key={`${rowKey}-${String(column)}`} className="tableCell" sx={tableCellStyles}>
                      <DataCell
                        column={String(column)}
                        value={row[column]}
                        isEditing={isEditing}
                        editValue={(editFields[String(column)] || "").toString()}
                        editFields={editFields}
                        setEditField={setEditField}
                        validateField={validateField}
                        columnConfig={columnConfig}
                        theme={theme}
                        expanded={!!expandedRows[rowId]}
                        onToggleExpand={createToggleExpand(rowId)}
                        renderColumnValue={renderColumnValue}
                      />
                    </TableCell>
                  ))}
                  {showStatusColumn && (
                    <TableCell className="tableCell" sx={tableCellStyles}>
                      {renderStatusButton({
                        row,
                        isUser,
                        isCurrentUser,
                        hasDeletePermissions,
                        handleOpenStatusDialog,
                      })}
                    </TableCell>
                  )}
                  {remainingColumns.map((column) => (
                    <TableCell key={`${rowKey}-${String(column)}`} className="tableCell" sx={tableCellStyles}>
                      <DataCell
                        column={String(column)}
                        value={row[column]}
                        isEditing={isEditing}
                        editValue={(editFields[String(column)] || "").toString()}
                        editFields={editFields}
                        setEditField={setEditField}
                        validateField={validateField}
                        columnConfig={columnConfig}
                        theme={theme}
                        expanded={!!expandedRows[rowId]}
                        onToggleExpand={createToggleExpand(rowId)}
                        renderColumnValue={renderColumnValue}
                      />
                    </TableCell>
                  ))}
                  {editRowId !== null && isParkingTable && (
                    <TableCell className="tableCell" sx={tableCellStyles} key={`${rowKey}-parkingDate`}>
                      {isEditing ? (
                        renderEditField({
                          column: "parkingDate" as keyof T,
                          value: (editFields["parkingDate"] || "").toString(),
                          editFields,
                          setEditField,
                          validateField,
                          columnConfig,
                        })
                      ) : (
                        <Typography component="span">
                          {(row as { parkingDate?: string }).parkingDate
                            ? formatDateWithDay(new Date((row as { parkingDate?: string }).parkingDate!), false)
                            : ""}
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  {!noActions && (hasEditPermissions || hasDeletePermissions) && (
                    <TableCell className="tableCell" sx={{ 
                      ...tableCellStyles, 
                      width: 0, 
                      whiteSpace: "nowrap", 
                      borderLeft: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
                    }}>
                      {renderActionButtons({
                        row,
                        editRowId,
                        getRowId,
                        currentUser: currentUser || undefined,
                        hasEditPermissions,
                        hasDeletePermissions,
                        isExpanded: isExpanded || false,
                        onOpenPasswordModal,
                        handleEditClick,
                        handleSaveClick,
                        handleCancelClick,
                        handleOpenDeleteDialog,
                        isSaveDisabled: isSaveDisabled || false,
                      })}
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
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage={
          <Typography variant="caption" component="span" sx={{ fontSize: "0.75rem" }}>
            {TABLE.ROWS_PER_PAGE}
          </Typography>
        }
        labelDisplayedRows={() => ""}
        ActionsComponent={PaginationComponent}
        sx={{
          flexShrink: 0,
          borderRadius: 0,
          '.MuiTablePagination-toolbar': {
            minHeight: '36px',
            paddingTop: '4px',
            paddingBottom: '4px',
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-input, .MuiTablePagination-displayedRows': {
            fontSize: '0.75rem',
          },
          '.MuiTablePagination-select': {
            fontSize: '0.75rem',
          },
          '.MuiInputBase-root': {
            fontSize: '0.75rem',
          },
          '.MuiIconButton-root': {
            padding: '2px',
          },
        }}
      />

      <DialogComponent
        open={!!passwordModalOpen}
        onClose={onClosePasswordModal}
        title="Cambiar Contraseña"
        subtitle={passwordModalSubtitle}
        hideActions
        paperSx={{
          minWidth: { xs: "90vw", sm: 500, md: 700 },
          maxWidth: { xs: "98vw", sm: 700 },
        }}
      >
        {typeof passwordUserId === "number" && handlePasswordModal
          ? handlePasswordModal(passwordUserId, onClosePasswordModal)
          : null}
      </DialogComponent>
    </Paper>
  );
};

export default EditableTableComponent;
