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
  Fade,
} from "@mui/material";
import { X } from "lucide-react";
import DIALOG from "../../constants/dialog.constants";

export type DialogType = "delete" | "warning" | "info" | "success";

interface AppModalProps {
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

// AppModal - Modal component with modern design patterns
const AppModal: React.FC<AppModalProps> = ({
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

  // Returns color of confirm button based on dialog type
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

  // Returns default confirm button text based on dialog type
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
          border: theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          borderRadius: "16px",
          minWidth: 400,
          maxWidth: 520,
          boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          bgcolor: "background.paper",
          ...paperSx,
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundColor: theme.palette.mode === "dark"
            ? "rgba(0,0,0,0.6)"
            : "rgba(0,0,0,0.4)",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={{ enter: 300, exit: 200 }}
    >
      {header ? (
        header
      ) : (
        <Box
          sx={{
            background: "transparent",
            color: theme.palette.text.primary,
            display: "flex",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color="inherit"
              sx={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="inherit"
                sx={{ fontSize: "0.875rem", opacity: 0.8 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box flexGrow={1} />
          <IconButton
            onClick={onClose}
            sx={{
              color: "inherit",
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

      <DialogContent
        sx={{
          px: 3,
          py: 2,
        }}
      >
        {children ? (
          children
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              color: theme.palette.text.secondary,
              fontSize: "0.95rem",
              fontWeight: 400,
            }}
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
              px: 3,
              pb: 3,
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
                borderRadius: "10px",
                border: `1px solid ${isSmallScreen ? "transparent" : "rgba(0,0,0,0.12)"}`,
                color: theme.palette.text.secondary,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                '&:hover': {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                },
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
                  borderRadius: "10px",
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  border: "none",
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabled,
                    color: theme.palette.text.disabled,
                  },
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

export default React.memo(AppModal);
