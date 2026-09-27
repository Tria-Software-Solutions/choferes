import React, { useCallback, useState } from "react";
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Theme } from "@mui/material";
import PremiumTooltip from "../../../../components/PremiumTooltip/PremiumTooltip.component";
import { IconCheck, IconDotsVertical, IconLock, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { StatusBadge } from "../../../Layout";
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

// ─── Row action button styles (shared by every table in the app) ───
// Quiet "ghost" icon buttons: they only take color on hover, so a column of
// actions never competes with the data. Destructive actions tint red on hover.
export const pillButtonBase = {
  width: 32,
  height: 32,
  borderRadius: "8px",
  transition: "background-color 0.15s ease, color 0.15s ease",
};

// Edit: ghost, neutral
export const editButtonStyles = (theme: Theme) => ({
  ...pillButtonBase,
  color: theme.tokens.colors.textMuted,
  "&:hover": {
    backgroundColor: theme.tokens.colors.hover,
    color: theme.tokens.colors.text,
  },
});

// Delete: ghost, red on hover
export const deleteButtonStyles = (theme: Theme) => ({
  ...pillButtonBase,
  color: theme.tokens.colors.textMuted,
  "&:hover": {
    backgroundColor: theme.tokens.colors.errorSoft,
    color: theme.tokens.colors.error,
  },
});

// Neutral: password/other secondary actions
export const neutralButtonStyles = (theme: Theme) => ({
  ...pillButtonBase,
  color: theme.tokens.colors.textMuted,
  "&:hover": {
    backgroundColor: theme.tokens.colors.hover,
    color: theme.tokens.colors.text,
  },
});

// Save: solid primary (the only filled action in a row)
export const saveButtonStyles = (theme: Theme) => ({
  ...pillButtonBase,
  backgroundColor: theme.tokens.colors.primary,
  color: theme.tokens.colors.onPrimary,
  "&:hover": {
    backgroundColor: theme.tokens.colors.primaryHover,
    color: theme.tokens.colors.onPrimary,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.tokens.colors.disabled,
    color: theme.tokens.colors.disabledText,
  },
});

function EditingActions({
  rowId,
  isSaveDisabled,
  onSave,
  onCancel,
  theme,
}: {
  rowId: number;
  isSaveDisabled?: boolean;
  onSave: (id: number) => void;
  onCancel: () => void;
  theme: Theme;
}): React.ReactElement {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
      <PremiumTooltip title={TABLE.SAVE}>
        <span>
          <Box>
            <IconButton
              onClick={() => onSave(rowId)}
              disabled={isSaveDisabled}
              sx={saveButtonStyles(theme)}
            >
              <IconCheck size={16} stroke={2.25} />
            </IconButton>
          </Box>
        </span>
      </PremiumTooltip>
      <PremiumTooltip title={TABLE.CANCEL}>
        <span>
          <Box>
            <IconButton onClick={onCancel} sx={neutralButtonStyles(theme)}>
              <IconX size={16} stroke={1.75} />
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
        sx={{ ...neutralButtonStyles(theme), width: 30, height: 30, p: 0.5 }}
      >
        <IconDotsVertical size={17} />
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
            border: theme.tokens.borders.paper,
          },
        }}
      >
        {showPasswordButton && (
          <MenuItem onClick={handlePassword} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><IconLock size={15} stroke={1.75} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>{TABLE.CHANGE_PASSWORD}</ListItemText>
          </MenuItem>
        )}
        {showEditButton && (
          <MenuItem onClick={handleEdit} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><IconPencil size={15} stroke={1.75} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>{TABLE.EDIT}</ListItemText>
          </MenuItem>
        )}
        {showDeleteButton && (
          <MenuItem onClick={handleDelete} sx={{ gap: 1.5, py: 1, color: theme.palette.error.main }}>
            <ListItemIcon sx={{ minWidth: 28, color: theme.palette.error.main }}><IconTrash size={15} stroke={1.75} /></ListItemIcon>
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
  theme,
}: Required<Pick<ActionButtonsProps<T>, "row" | "currentUser" | "hasEditPermissions" | "hasDeletePermissions" | "isExpanded">> &
  Pick<ActionButtonsProps<T>, "onOpenPasswordModal" | "handleEditClick" | "handleOpenDeleteDialog"> & { rowId: number; theme: Theme }): React.ReactElement {
  const isUser = "username" in row;
  const isCurrentUser = rowId === currentUser?.id;
  const showPasswordButton = isUser && isExpanded && onOpenPasswordModal;
  const showEditButton = hasEditPermissions;
  const showDeleteButton = hasDeletePermissions && (!isUser || (!isCurrentUser && !("isActive" in row)));

  const handleEdit = useCallback(() => handleEditClick?.(row), [handleEditClick, row]);
  const handleDelete = useCallback(() => handleOpenDeleteDialog?.(rowId), [handleOpenDeleteDialog, rowId]);
  const handlePassword = useCallback(() => onOpenPasswordModal?.(rowId), [onOpenPasswordModal, rowId]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
      {showPasswordButton && (
        <PremiumTooltip title={TABLE.CHANGE_PASSWORD}>
          <span>
            <Box>
              <IconButton onClick={handlePassword} sx={neutralButtonStyles(theme)}>
                <IconLock size={15} stroke={1.75} />
              </IconButton>
            </Box>
          </span>
        </PremiumTooltip>
      )}
      {showEditButton && (
        <PremiumTooltip title={TABLE.EDIT}>
          <span>
            <Box>
              <IconButton onClick={handleEdit} sx={editButtonStyles(theme)}>
                <IconPencil size={15} stroke={1.75} />
              </IconButton>
            </Box>
          </span>
        </PremiumTooltip>
      )}
      {showDeleteButton && (
        <PremiumTooltip title={TABLE.DELETE}>
          <span>
            <Box>
              <IconButton onClick={handleDelete} sx={deleteButtonStyles(theme)}>
                <IconTrash size={15} stroke={1.75} />
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
        theme={theme}
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
      theme={theme}
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
      <Box
        component="button"
        type="button"
        onClick={() => handleOpenStatusDialog && handleOpenStatusDialog(row)}
        sx={{ all: "unset", cursor: "pointer", borderRadius: "999px", display: "inline-flex" }}
      >
        <StatusBadge
          label={row.isActive ? "Activo" : "Inactivo"}
          tone={row.isActive ? "success" : "default"}
        />
      </Box>
    </PremiumTooltip>
  );
} 
