import React, { useRef } from "react";
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
} from "@mui/material";
import {
  translateColumnHeaderToSpanish,
} from "../../../utils/string";
import { formatDateWithDay } from "../../../utils/dates";
import {
  TABLE,
  TABLE_UI,
} from "../../../constants/constants";
import PaginationComponent from "../Pagination/Pagination.component";
import DialogComponent from "../../Dialog/Dialog.component";
import { User } from "../../../models/User";
import {
  tableCellStyles,
  permissionChipStyles,
  viewMoreLessStyles,
} from "./EditableTable.styles";
import { createColumnConfig, sortData, paginateData, checkEditPermissions, checkDeletePermissions, renderEditField, renderCellValue, renderActionButtons, renderStatusButton } from "./helpers";
import { useTableSorting } from "../../../hooks/useTableSorting";
import { useExpandedRows } from "../../../hooks/useExpandedRows";

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
    value: string | boolean | number | string[] | Date
  ) => void;
  handleEdit?: (row: T) => void;
  handleCancel?: () => void;
  handleUpdate?: (id: number) => void;
  handleOpenDeleteDialog?: (id: number) => void;
  handleOpenStatusDialog?: (row: unknown) => void;
  handlePasswordModal?: (
    id: number,
    handleClose: () => void
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
    value: string | string[] | boolean
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
  const { order, orderBy, handleSort } = useTableSorting<T>(columns[0]);
  const { expandedRows, expandRow, collapseRow } = useExpandedRows();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const hasEditPermissions = checkEditPermissions(userPermissions);
  const hasDeletePermissions = checkDeletePermissions(userPermissions);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleSortRequest = (column: keyof T) => {
    handleSort(column);
  };

  const columnConfig = createColumnConfig(roles, permissions);
  const columnsConfigArray = Object.keys(columnConfig).map((key) => ({ field: key as keyof T, sortable: true }));
  const sortedData = sortData(data, orderBy, order, columnsConfigArray);
  const paginatedData = paginateData(sortedData, page, rowsPerPage);

  // Compute rowsPerPageOptions to always include the current value
  const defaultRowsPerPageOptions = [5, 10, 25, 50, 100];
  const rowsPerPageOptions = Array.from(
    new Set([...defaultRowsPerPageOptions, rowsPerPage])
  ).sort((a, b) => a - b);

  return (
    <Paper
      sx={{
        width: "100%",
        borderRadius: 1,
        boxShadow: "0 4px 24px -4px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
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
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          overflowX: "auto",
          borderRadius: 0,
        }}
        ref={tableContainerRef}
      >
        <Table
          stickyHeader
          aria-label="sticky table"
          sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: 0 }}
        >
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
                      position: "sticky",
                      top: 0,
                      zIndex: 4,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: (theme) => theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
                      padding: "12px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      direction={orderBy === column ? order : "asc"}
                      onClick={() => handleSortRequest(column)}
                      sx={{
                        color: "inherit",
                        "& .MuiTableSortLabel-icon": {
                          color: "inherit !important",
                        },
                      }}
                    >
                      {translateColumnHeaderToSpanish(column)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              {showStatusColumn && (
                <TableCell
                  className="tableCell"
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 4,
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText,
                    fontWeight: 700,
                    fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
                    padding: "12px 16px",
                    whiteSpace: "nowrap",
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
                      position: "sticky",
                      top: 0,
                      zIndex: 4,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: (theme) => theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
                      padding: "12px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      direction={orderBy === column ? order : "asc"}
                      onClick={() => handleSortRequest(column)}
                      sx={{
                        color: "inherit",
                        "& .MuiTableSortLabel-icon": {
                          color: "inherit !important",
                        },
                      }}
                    >
                      {translateColumnHeaderToSpanish(column)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              {editRowId !== null &&
                data.length > 0 &&
                "licensePlate" in data[0] && (
                  <TableCell
                    className="tableCell"
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 4,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: (theme) => theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
                      padding: "12px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Fecha de Parqueo
                  </TableCell>
                )}
              {!noActions && (hasEditPermissions || hasDeletePermissions) ? (
                <TableCell
                  className="tableCell"
                  style={{ width: "100px", whiteSpace: "nowrap" }}
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 4,
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText,
                    fontWeight: 700,
                    fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
                    padding: "12px 16px",
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
                  key={
                    getRowId(row) +
                    "-" +
                    String((row as T & { isActive?: boolean }).isActive)
                  }
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f6f8fa",
                    transition: "background 0.2s",
                    "&:hover": {
                      backgroundColor: "#e3eafc",
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
                                  onClick={() => expandRow(rowId)}
                                >
                                  {TABLE_UI.VIEW_MORE}
                                </Typography>
                              )}
                              {showAll && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() => collapseRow(rowId)}
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
                            renderEditField({
                              column,
                              value: (editFields[String(column)] || "").toString(),
                              editFields,
                              setEditField,
                              validateField,
                              columnConfig,
                            })
                          ) : (
                            renderCellValue({
                              column,
                              value,
                              row,
                              theme,
                              expandedRows,
                              expandRow,
                              collapseRow,
                              rowId,
                              TABLE_UI,
                              tableCellStyles,
                            })
                          )}
                        </TableCell>
                      );
                    })}
                  {showStatusColumn && (
                    <TableCell className="tableCell" sx={tableCellStyles}>
                      {renderStatusButton({
                        row,
                        isUser,
                        isCurrentUser,
                        hasDeletePermissions: hasDeletePermissions || false,
                        handleOpenStatusDialog,
                      })}
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
                                  onClick={() => expandRow(rowId)}
                                >
                                  {TABLE_UI.VIEW_MORE}
                                </Typography>
                              )}
                              {showAll && (
                                <Typography
                                  sx={viewMoreLessStyles(theme)}
                                  onClick={() => collapseRow(rowId)}
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
                            renderEditField({
                              column,
                              value: (editFields[String(column)] || "").toString(),
                              editFields,
                              setEditField,
                              validateField,
                              columnConfig,
                            })
                          ) : (
                            renderCellValue({
                              column,
                              value,
                              row,
                              theme,
                              expandedRows,
                              expandRow,
                              collapseRow,
                              rowId,
                              TABLE_UI,
                              tableCellStyles,
                            })
                          )}
                        </TableCell>
                      );
                    })}
                  {editRowId !== null &&
                    data.length > 0 &&
                    "licensePlate" in data[0] && (
                      <TableCell
                        className="tableCell"
                        sx={tableCellStyles}
                        key="parkingDate-edit"
                      >
                        {editRowId === getRowId(row) ? (
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
                              ? formatDateWithDay(
                                  new Date(
                                    (
                                      row as { parkingDate?: string }
                                    ).parkingDate!
                                  ),
                                  false
                                )
                              : ""}
                            </Typography>
                          )}
                        </TableCell>
                    )}
                  {!noActions &&
                    (hasEditPermissions || hasDeletePermissions) && (
                      <TableCell
                        className="tableCell"
                        style={{ width: "100px", whiteSpace: "nowrap" }}
                        sx={tableCellStyles}
                      >
                        {renderActionButtons({
                          row,
                          editRowId,
                          getRowId,
                          currentUser: currentUser || undefined,
                          hasEditPermissions: hasEditPermissions || false,
                          hasDeletePermissions: hasDeletePermissions || false,
                          isExpanded: isExpanded || false,
                          onOpenPasswordModal,
                          handleEditClick,
                          handleSaveClick,
                          handleCancelClick,
                          handleOpenDeleteDialog,
                          handleOpenStatusDialog,
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
        ActionsComponent={PaginationComponent}
        sx={{ borderRadius: "0 0 12px 12px" }}
      />

      {/* Password change modal: always mounted, only open prop changes */}
      <DialogComponent
        open={!!passwordModalOpen}
        onClose={onClosePasswordModal}
        title="Cambiar Contraseña"
        subtitle={(() => {
          if (typeof passwordUserId === "number") {
            const user = data.find((u) => getRowId(u) === passwordUserId) as
              | User
              | undefined;
            if (user) {
              return `${user.firstName || ""} ${user.lastName || ""}`.trim();
            }
          }
          return "";
        })()}
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
