import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

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

  const getIcon = () => {
    switch (type) {
      case "delete":
        return <DeleteIcon color="error" sx={{ fontSize: 32 }} />;
      case "warning":
        return <WarningIcon color="warning" sx={{ fontSize: 32 }} />;
      case "success":
        return <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />;
      default:
        return <InfoIcon color="info" sx={{ fontSize: 32 }} />;
    }
  };

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

  const getDefaultConfirmText = () => {
    switch (type) {
      case "delete":
        return "Eliminar";
      case "warning":
        return "Continuar";
      case "success":
        return "Aceptar";
      default:
        return "Confirmar";
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
          border: "1px solid #cccccc",
          borderRadius: 2,
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
              {cancelText || "Cancelar"}
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
