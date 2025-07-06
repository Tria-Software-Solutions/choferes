import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LockResetIcon from "@mui/icons-material/LockReset";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { TABLE } from "../constants/constants";

export function renderActionButtons<T extends object>({
  row,
  editRowId,
  getRowId,
  currentUser,
  hasEditPermissions,
  hasDeletePermissions,
  isExpanded,
  onOpenPasswordModal,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleOpenDeleteDialog,
  handleOpenStatusDialog,
  isSaveDisabled,
}: {
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
  handleOpenStatusDialog?: (row: unknown) => void;
  isSaveDisabled?: boolean;
}): React.ReactNode {
  const rowId = getRowId(row);
  const isCurrentUser = rowId === currentUser?.id;
  const isUser = "username" in row;
  const isEditing = editRowId === rowId;

  if (isEditing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={TABLE.SAVE} arrow>
          <span>
            <Box>
              <IconButton
                color="primary"
                onClick={() => handleSaveClick && handleSaveClick(rowId)}
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
                onClick={() => handleCancelClick && handleCancelClick()}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </span>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {hasEditPermissions && (
        <>
          {isUser && isExpanded && onOpenPasswordModal && (
            <Tooltip title={TABLE.CHANGE_PASSWORD} arrow>
              <span>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => onOpenPasswordModal(rowId)}
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
                  onClick={() => handleEditClick && handleEditClick(row)}
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
            !isCurrentUser && !("isActive" in row) ? (
              <Tooltip title={TABLE.DELETE} arrow>
                <span>
                  <Box>
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleOpenDeleteDialog && handleOpenDeleteDialog(rowId)
                      }
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                </span>
              </Tooltip>
            ) : null
          ) : (
            <Tooltip title={TABLE.DELETE} arrow>
              <span>
                <Box>
                  <IconButton
                    color="error"
                    onClick={() =>
                      handleOpenDeleteDialog && handleOpenDeleteDialog(rowId)
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
    </Box>
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
    <Tooltip title={row.isActive ? TABLE.DISABLE : TABLE.ENABLE} arrow>
      <span>
        <Box>
          <IconButton
            color="secondary"
            onClick={() => handleOpenStatusDialog && handleOpenStatusDialog(row)}
          >
            {row.isActive ? (
              <ToggleOnIcon sx={{ color: "success.main" }} />
            ) : (
              <ToggleOffIcon sx={{ color: "grey.500" }} />
            )}
          </IconButton>
        </Box>
      </span>
    </Tooltip>
  );
} 