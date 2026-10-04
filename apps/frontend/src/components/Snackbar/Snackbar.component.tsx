import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Snackbar, Alert, Slide, SlideProps, useTheme } from "@mui/material";
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from "@tabler/icons-react";

// SnackbarWrapper provides a context and provider for showing notifications across the app using Material-UI Snackbar.
// Exposes a showNotification function via context for use in child components.

type Severity = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (
    message: string,
    options?: {
      severity?: Severity;
      duration?: number;
      closeable?: boolean;
      buttonText?: string;
      onButtonClick?: () => void;
    }
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useAppNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useAppNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export const AppNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("info");
  const [duration, setDuration] = useState<number>(3000);
  const [closeable, setCloseable] = useState<boolean>(true);
  const theme = useTheme();

  // Function to show a notification with custom options
  const showNotification = useCallback(
    (
      message: string,
      options: {
        severity?: Severity;
        duration?: number;
        closeable?: boolean;
        buttonText?: string;
        onButtonClick?: () => void;
      } = {},
    ) => {
      setMessage(message);
      setSeverity(options.severity || "info");
      setDuration(options.duration || 3000);
      setCloseable(options.closeable !== undefined ? options.closeable : true);
      setOpen(true);
    },
    [],
  );

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Status is conveyed by the icon color only; the toast itself is a surface.
  const getSeverityIcon = (severity: Severity) => {
    const { colors } = theme.tokens;
    const iconSize = 18;
    switch (severity) {
      case 'success':
        return <IconCircleCheck size={iconSize} color={colors.success} />;
      case 'error':
        return <IconCircleX size={iconSize} color={colors.error} />;
      case 'info':
        return <IconInfoCircle size={iconSize} color={colors.accent} />;
      case 'warning':
        return <IconAlertTriangle size={iconSize} color={colors.warning} />;
      default:
        return undefined;
    }
  };

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
        // En móvil el aviso queda sobre la barra de pestañas, no detrás de ella.
        sx={{ [theme.breakpoints.down('md')]: { bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)', left: 12, right: 12 } }}
      >
        <Alert
          onClose={closeable ? handleClose : undefined}
          severity={severity}
          icon={getSeverityIcon(severity)}
          variant="outlined"
          sx={{
            minWidth: { xs: 'auto', sm: 320 },
            maxWidth: 440,
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: '12px',
            color: theme.tokens.colors.text,
            backgroundColor: theme.tokens.colors.menuSurface,
            border: theme.tokens.borders.dialog,
            boxShadow: theme.tokens.shadows.menu,
            '& .MuiAlert-icon': { mr: 1.25 },
            '& .MuiAlert-action': { color: theme.tokens.colors.textMuted },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

const SnackbarComponent = function SnackbarComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wraps children with the notification provider
  return <AppNotificationProvider>{children}</AppNotificationProvider>;
};

export default SnackbarComponent;
