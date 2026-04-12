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
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(255,255,255,0.8)",
          borderRadius: "28px",
          minWidth: 400,
          maxWidth: 520,
          boxShadow: theme.palette.mode === "dark"
            ? "0 40px 80px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 2px 0 rgba(255,255,255,0.1)"
            : "0 40px 80px rgba(0,0,0,0.15), 0 16px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03), inset 0 2px 0 rgba(255,255,255,0.95)",
          overflow: "hidden",
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(28,28,35,0.95) 0%, rgba(38,38,48,0.9) 50%, rgba(32,32,40,0.95) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(252,252,255,0.95) 50%, rgba(248,248,252,0.98) 100%)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: theme.palette.mode === "dark"
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
              : "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200%",
            height: "200%",
            background: theme.palette.mode === "dark"
              ? "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.06) 0%, transparent 50%)"
              : "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.04) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.03) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          },
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
            gap: 2.5,
            px: 4.5,
            py: 3.5,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            position: "relative",
            zIndex: 1,
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: theme.palette.mode === "dark"
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)"
                : "linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)",
            },
          }}
        >
          {icon && (
            <Box
              sx={{
                background: theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: "14px",
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: theme.palette.mode === "dark"
                  ? "0 8px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 8px 24px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
                },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                color="inherit"
                sx={{ 
                  fontSize: "1.35rem", 
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                  background: theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)"
                    : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="inherit"
                  sx={{ 
                    fontSize: "0.9rem", 
                    opacity: 0.7,
                    mt: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <Box flexGrow={1} />
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              width: 40,
              height: 40,
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                transform: "rotate(90deg)",
                color: theme.palette.text.primary,
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      )}

      <DialogContent
        sx={{
          px: 4.5,
          py: 3.5,
          position: "relative",
          zIndex: 1,
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
        <Box sx={{ px: 4, pb: 4 }}>{actions}</Box>
      ) : (
        !hideActions && (
          <DialogActions
            sx={{
              gap: 2.5,
              flexDirection: isSmallScreen ? "column" : "row",
              px: 4.5,
              pb: 4.5,
              pt: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth={isSmallScreen}
              sx={{
                minWidth: isSmallScreen ? "100%" : 130,
                py: 1.75,
                fontWeight: 600,
                borderRadius: "14px",
                border: theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(0,0,0,0.08)",
                color: theme.palette.text.secondary,
                backgroundColor: theme.palette.mode === "dark"
                  ? "rgba(45,45,55,0.7)"
                  : "rgba(255,255,255,0.8)",
                fontSize: "0.95rem",
                letterSpacing: "0.01em",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(55,55,65,0.8)"
                    : "rgba(255,255,255,0.95)",
                  borderColor: theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(0,0,0,0.12)",
                  transform: "translateY(-1px)",
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 4px 12px rgba(0,0,0,0.2)"
                    : "0 4px 12px rgba(0,0,0,0.08)",
                },
                "&:active": {
                  transform: "translateY(0)",
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
                  minWidth: isSmallScreen ? "100%" : 130,
                  py: 1.75,
                  fontWeight: 600,
                  borderRadius: "14px",
                  backgroundColor: theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff",
                  border: "none",
                  fontSize: "0.95rem",
                  letterSpacing: "0.01em",
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 6px 20px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 6px 20px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                  },
                  "&:hover": {
                    background: theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #5558e3 0%, #7c4ae8 100%)"
                      : "linear-gradient(135deg, #5558e3 0%, #7c4ae8 100%)",
                    boxShadow: theme.palette.mode === "dark"
                      ? "0 8px 24px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.25)"
                      : "0 8px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: theme.palette.action.disabled,
                    color: theme.palette.text.disabled,
                    boxShadow: "none",
                    "&::before": {
                      display: "none",
                    },
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
