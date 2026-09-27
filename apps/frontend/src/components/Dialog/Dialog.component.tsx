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
  CircularProgress,
} from "@mui/material";
import { IconTrash, IconX } from "@tabler/icons-react";
import DIALOG from "../../constants/dialog.constants";
import {
  dialogPaperStyles,
  headerBoxStyles,
  headerIconStyles,
  dialogContentStyles,
  messageTypographyStyles,
  customActionsBoxStyles,
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

// DialogComponent: the app's standard dialog.
// - Regular dialogs: surface header (optional tinted icon, title, subtitle,
//   close), content, and a footer with Cancel + primary action.
// - `type="delete"`: compact centered confirmation with a destructive button.
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
  const { colors } = theme.tokens;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const confirmColor = (() => {
    switch (type) {
      case "delete":
        return "error" as const;
      case "warning":
        return "warning" as const;
      case "success":
        return "success" as const;
      default:
        return "primary" as const;
    }
  })();

  const defaultConfirmText = (() => {
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
  })();

  const confirmLabel = loading ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    confirmText || defaultConfirmText
  );

  if (type === "delete") {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        disableEnforceFocus
        PaperProps={{
          sx: {
            minWidth: { xs: "calc(100vw - 32px)", sm: 360 },
            maxWidth: { xs: "calc(100vw - 32px)", sm: 400 },
            ...paperSx,
          },
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2.5, textAlign: "center" }}>
          <Box
            aria-hidden
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              mx: "auto",
              mb: 2,
              display: "grid",
              placeItems: "center",
              color: colors.error,
              backgroundColor: colors.errorSoft,
              "& svg": { width: 22, height: 22, color: colors.error, stroke: "currentColor" },
            }}
          >
            {icon ?? <IconTrash />}
          </Box>
          <Typography sx={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em", mb: 0.75 }}>
            {title}
          </Typography>
          {message && (
            <Typography sx={{ fontSize: "0.875rem", color: colors.textMuted, lineHeight: 1.55 }}>
              {message}
            </Typography>
          )}
          {children}
        </Box>
        <DialogActions sx={{ flexDirection: isSmallScreen ? "column-reverse" : "row" }}>
          <Button variant="outlined" onClick={onClose} disabled={loading} fullWidth>
            {cancelText || DIALOG.CANCEL}
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm} disabled={loading} fullWidth>
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEnforceFocus
      PaperProps={{ sx: dialogPaperStyles(paperSx) }}
    >
      {header ?? (
        <Box sx={headerBoxStyles(theme)}>
          {icon && (
            <Box aria-hidden sx={headerIconStyles(theme)}>
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0, pt: icon ? 0.25 : 0 }}>
            <Typography
              component="h2"
              sx={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.35 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ mt: 0.25, fontSize: "0.8125rem", color: colors.textMuted }}>{subtitle}</Typography>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label={DIALOG.CANCEL} size="small" sx={{ mt: -0.5, mr: -1 }}>
            <IconX size={18} />
          </IconButton>
        </Box>
      )}

      <DialogContent sx={dialogContentStyles}>
        {children ?? <Typography sx={messageTypographyStyles(theme)}>{message}</Typography>}
      </DialogContent>

      {actions ? (
        <Box sx={customActionsBoxStyles}>{actions}</Box>
      ) : (
        !hideActions && (
          <DialogActions sx={{ flexDirection: isSmallScreen ? "column-reverse" : "row" }}>
            <Button variant="text" onClick={onClose} fullWidth={isSmallScreen} disabled={loading}>
              {cancelText || DIALOG.CANCEL}
            </Button>
            {onConfirm && (
              <Button
                variant="contained"
                color={confirmColor}
                onClick={onConfirm}
                fullWidth={isSmallScreen}
                disabled={loading}
              >
                {confirmLabel}
              </Button>
            )}
          </DialogActions>
        )
      )}
    </Dialog>
  );
};

export default React.memo(DialogComponent);
