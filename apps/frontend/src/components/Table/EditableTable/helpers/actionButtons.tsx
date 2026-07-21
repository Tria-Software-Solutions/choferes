import React, { useCallback, useState } from "react";
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Theme } from "@mui/material";
import PremiumTooltip from "../../../../components/PremiumTooltip/PremiumTooltip.component";
import { FileEdit, Trash2, CheckCircle, X, Lock, ToggleLeft, ToggleRight, MoreVertical } from "lucide-react";
import { TABLE } from "../../../../constants/constants";

interface ActionButtonsProps<T extends object> {
  row: T;
  editRowId: number | null;
  getRowId: (row: T) => number;
  currentUser?: { id: number };
  hasEditPermissions: boolean;
  hasDeletePermissions: boolean;
  isExpanded: boolean;
  onOpenPasswordModal?: (userId: number) => void;
  handleEditClick?: (row: T) => void;
  handleSaveClick?: (id: number) => void;
  handleCancelClick?: () => void;
  handleOpenDeleteDialog?: (id: number) => void;
  isSaveDisabled?: boolean;
  isSmallScreen: boolean;
  theme: Theme;
}

function EditingActions({
  rowId,
  isSaveDisabled,
  onSave,
  onCancel,
}: {
  rowId: number;
  isSaveDisabled?: boolean;
  onSave: (id: number) => void;
  onCancel: () => void;
}): React.ReactElement {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <PremiumTooltip title={TABLE.SAVE}>
        <span>
          <Box>
            <IconButton color="primary" onClick={() => onSave(rowId)} disabled={isSaveDisabled}>
              <CheckCircle size={20} />
            </IconButton>
          </Box>
        </span>
      </PremiumTooltip>
      <PremiumTooltip title={TABLE.CANCEL}>
        <span>
          <Box>
            <IconButton color="primary" onClick={onCancel}>
              <X size={20} />
            </IconButton>
          </Box>
        </span>
      </PremiumTooltip>
    </Box>
  );
}

function ViewingActionsMobile<T extends object>({
  row,
  rowId,
  currentUser,
  hasEditPermissions,
  hasDeletePermissions,
  isExpanded,
  onOpenPasswordModal,
  handleEditClick,
  handleOpenDeleteDialog,
  theme,
}: Required<Pick<ActionButtonsProps<T>, "row" | "currentUser" | "hasEditPermissions" | "hasDeletePermissions" | "isExpanded">> &
  Pick<ActionButtonsProps<T>, "onOpenPasswordModal" | "handleEditClick" | "handleOpenDeleteDialog"> & { rowId: number; theme: Theme }): React.ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isUser = "username" in row;
  const isCurrentUser = rowId === currentUser?.id;
  const showPasswordButton = isUser && isExpanded && onOpenPasswordModal;
  const showEditButton = hasEditPermissions;
  const showDeleteButton = hasDeletePermissions && (!isUser || (!isCurrentUser && !("isActive" in row)));

  const handleEdit = useCallback(() => { setAnchorEl(null); handleEditClick?.(row); }, [handleEditClick, row]);
  const handleDelete = useCallback(() => { setAnchorEl(null); handleOpenDeleteDialog?.(rowId); }, [handleOpenDeleteDialog, rowId]);
  const handlePassword = useCallback(() => { setAnchorEl(null); onOpenPasswordModal?.(rowId); }, [onOpenPasswordModal, rowId]);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{ p: 0.5 }}
      >
        <MoreVertical size={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            minWidth: 160,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          },
        }}
      >
        {showPasswordButton && (
          <MenuItem onClick={handlePassword} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><Lock size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>{TABLE.CHANGE_PASSWORD}</ListItemText>
          </MenuItem>
        )}
        {showEditButton && (
          <MenuItem onClick={handleEdit} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><FileEdit size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>{TABLE.EDIT}</ListItemText>
          </MenuItem>
        )}
        {showDeleteButton && (
          <MenuItem onClick={handleDelete} sx={{ gap: 1.5, py: 1, color: theme.palette.error.main }}>
            <ListItemIcon sx={{ minWidth: 28, color: theme.palette.error.main }}><Trash2 size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>{TABLE.DELETE}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function ViewingActions<T extends object>({
  row,
  rowId,
  currentUser,
  hasEditPermissions,
  hasDeletePermissions,
  isExpanded,
  onOpenPasswordModal,
  handleEditClick,
  handleOpenDeleteDialog,
}: Required<Pick<ActionButtonsProps<T>, "row" | "currentUser" | "hasEditPermissions" | "hasDeletePermissions" | "isExpanded">> &
  Pick<ActionButtonsProps<T>, "onOpenPasswordModal" | "handleEditClick" | "handleOpenDeleteDialog"> & { rowId: number }): React.ReactElement {
  const isUser = "username" in row;
  const isCurrentUser = rowId === currentUser?.id;
  const showPasswordButton = isUser && isExpanded && onOpenPasswordModal;
  const showEditButton = hasEditPermissions;
  const showDeleteButton = hasDeletePermissions && (!isUser || (!isCurrentUser && !("isActive" in row)));

  const handleEdit = useCallback(() => handleEditClick?.(row), [handleEditClick, row]);
  const handleDelete = useCallback(() => handleOpenDeleteDialog?.(rowId), [handleOpenDeleteDialog, rowId]);
  const handlePassword = useCallback(() => onOpenPasswordModal?.(rowId), [onOpenPasswordModal, rowId]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {showPasswordButton && (
        <PremiumTooltip title={TABLE.CHANGE_PASSWORD}>
          <span>
            <Box>
              <IconButton color="primary" onClick={handlePassword}>
                <Lock size={20} />
              </IconButton>
            </Box>
          </span>
        </PremiumTooltip>
      )}
      {showEditButton && (
        <PremiumTooltip title={TABLE.EDIT}>
          <span>
            <Box>
              <IconButton color="primary" onClick={handleEdit}>
                <FileEdit size={20} />
              </IconButton>
            </Box>
          </span>
        </PremiumTooltip>
      )}
      {showDeleteButton && (
        <PremiumTooltip title={TABLE.DELETE}>
          <span>
            <Box>
              <IconButton color="error" onClick={handleDelete}>
                <Trash2 size={20} />
              </IconButton>
            </Box>
          </span>
        </PremiumTooltip>
      )}
    </Box>
  );
}

export function renderActionButtons<T extends object>(props: ActionButtonsProps<T>): React.ReactNode {
  const { row, editRowId, getRowId, currentUser, hasEditPermissions, hasDeletePermissions, isExpanded, isSmallScreen, theme } = props;

  const rowId = getRowId(row);
  const isEditing = editRowId === rowId;

  if (isEditing) {
    return (
      <EditingActions
        rowId={rowId}
        isSaveDisabled={props.isSaveDisabled}
        onSave={props.handleSaveClick ?? (() => {})}
        onCancel={props.handleCancelClick ?? (() => {})}
      />
    );
  }

  if (!hasEditPermissions && !hasDeletePermissions) return null;

  if (isSmallScreen) {
    return (
      <ViewingActionsMobile
        row={row}
        rowId={rowId}
        currentUser={currentUser ?? { id: 0 }}
        hasEditPermissions={hasEditPermissions}
        hasDeletePermissions={hasDeletePermissions}
        isExpanded={isExpanded}
        onOpenPasswordModal={props.onOpenPasswordModal}
        handleEditClick={props.handleEditClick}
        handleOpenDeleteDialog={props.handleOpenDeleteDialog}
          theme={theme}
        />
    );
  }

  return (
    <ViewingActions
      row={row}
      rowId={rowId}
      currentUser={currentUser ?? { id: 0 }}
      hasEditPermissions={hasEditPermissions}
      hasDeletePermissions={hasDeletePermissions}
      isExpanded={isExpanded}
      onOpenPasswordModal={props.onOpenPasswordModal}
      handleEditClick={props.handleEditClick}
      handleOpenDeleteDialog={props.handleOpenDeleteDialog}
    />
  );
}

export function renderStatusButton<T extends object>({
  row,
  isUser,
  isCurrentUser,
  hasDeletePermissions,
  handleOpenStatusDialog,
}: {
  row: T;
  isUser: boolean;
  isCurrentUser: boolean;
  hasDeletePermissions: boolean;
  handleOpenStatusDialog?: (row: unknown) => void;
}): React.ReactNode {
  if (!isUser || isCurrentUser || !("isActive" in row) || !hasDeletePermissions) {
    return null;
  }

  return (
    <PremiumTooltip title={row.isActive ? TABLE.DISABLE : TABLE.ENABLE}>
      <span>
        <Box>
          <IconButton
            color="secondary"
            onClick={() => handleOpenStatusDialog && handleOpenStatusDialog(row)}
          >
            {row.isActive ? (
              <ToggleLeft size={24} color="green" />
            ) : (
              <ToggleRight size={24} color="gray" />
            )}
          </IconButton>
        </Box>
      </span>
    </PremiumTooltip>
  );
} 
