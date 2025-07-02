import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { DIALOG } from "../../constants/constants";

export type DialogType = "delete" | "warning" | "info" | "success";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: React.ReactNode;
  message?: React.ReactNode;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  hideActions?: boolean;
  icon?: React.ReactNode;
  paperSx?: object;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  header?: React.ReactNode;
}

// DialogComponent provides a customizable dialog for confirmations, warnings, info, and success messages.
// Props:
// - open: whether the dialog is open
// - onClose: function to close the dialog
// - onConfirm: function to confirm the action
// - title: dialog title
// - message: dialog message
// - type: dialog type (delete, warning, info, success)
// - confirmText: custom confirm button text
// - cancelText: custom cancel button text
// - loading: whether the confirm button is loading
// - children: custom content
// - hideActions: whether to hide action buttons
// - icon: icon to display
// - paperSx: custom Paper styles
// - subtitle: subtitle text
// - actions: custom actions
// - header: custom header
const DialogComponent: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText,
  cancelText,
  loading = false,
  children,
  hideActions = false,
  icon,
  paperSx = {},
  subtitle,
  actions,
  header,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Returns the color of the confirm button based on dialog type
  const getConfirmButtonColor = () => {
    switch (type) {
      case "delete":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  // Returns the default confirm button text based on dialog type
  const getDefaultConfirmText = () => {
    switch (type) {
      case "delete":
        return DIALOG.DELETE;
      case "warning":
        return DIALOG.CONTINUE;
      case "success":
        return DIALOG.ACCEPT;
      default:
        return DIALOG.CONFIRM;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: "2px solid #fff",
          borderRadius: 3,
          minWidth: 400,
          maxWidth: 500,
          boxShadow: 3,
          bgcolor: "background.paper",
          ...paperSx,
        },
      }}
    >
      {header ? (
        header
      ) : (
        <Box
          sx={{
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          {icon && (
            <Box
              sx={{
                background: theme.palette.primary.contrastText,
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700} color="inherit">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="inherit">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box flexGrow={1} />
          <IconButton onClick={onClose} sx={{ color: "inherit" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <DialogContent sx={{ pt: 4, pb: 2, marginTop: "10px" }}>
        {children ? (
          children
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {message}
          </Typography>
        )}
      </DialogContent>

      {/* Custom actions if provided */}
      {actions ? (
        <Box sx={{ px: 3, pb: 3 }}>{actions}</Box>
      ) : (
        !hideActions && (
          <DialogActions
            sx={{
              gap: 2,
              flexDirection: isSmallScreen ? "column" : "row",
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth={isSmallScreen}
              sx={{
                minWidth: isSmallScreen ? "100%" : 120,
                py: 1.5,
                fontWeight: 600,
              }}
              disabled={loading}
            >
              {cancelText || DIALOG.CANCEL}
            </Button>
            {onConfirm && (
              <Button
                onClick={onConfirm}
                variant="contained"
                color={getConfirmButtonColor()}
                fullWidth={isSmallScreen}
                sx={{
                  minWidth: isSmallScreen ? "100%" : 120,
                  py: 1.5,
                  fontWeight: 600,
                }}
                disabled={loading}
              >
                {confirmText || getDefaultConfirmText()}
              </Button>
            )}
          </DialogActions>
        )
      )}
    </Dialog>
  );
};

export default DialogComponent;
