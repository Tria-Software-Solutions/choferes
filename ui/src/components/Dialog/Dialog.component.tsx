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
import { X } from "lucide-react";
import DIALOG from "../../constants/dialog.constants";
import {
  dialogPaperStyles,
  headerBoxStyles,
  closeButtonStyles,
  dialogContentStyles,
  messageTypographyStyles,
  customActionsBoxStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  confirmButtonStyles,
} from "./Dialog.styles";

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
        sx: dialogPaperStyles(paperSx),
      }}
      TransitionComponent={require("@mui/material/Slide").default}
      transitionDuration={300}
    >
      {header ? (
        header
      ) : (
        <Box sx={headerBoxStyles(theme)}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="inherit" sx={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="inherit" sx={{ fontSize: "0.875rem", opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box flexGrow={1} />
          <IconButton 
            onClick={onClose} 
            sx={{
              ...closeButtonStyles,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
                transform: "scale(1.1)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      )}

      <DialogContent sx={dialogContentStyles}>
        {children ? (
          children
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={messageTypographyStyles(theme)}
          >
            {message}
          </Typography>
        )}
      </DialogContent>

      {/* Custom actions if provided */}
      {actions ? (
        <Box sx={customActionsBoxStyles}>{actions}</Box>
      ) : (
        !hideActions && (
          <DialogActions sx={dialogActionsStyles(isSmallScreen)}>
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth={isSmallScreen}
              sx={cancelButtonStyles(isSmallScreen)}
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
                sx={confirmButtonStyles(isSmallScreen)}
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

export default React.memo(DialogComponent);
