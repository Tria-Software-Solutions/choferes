import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, Slide, SlideProps, useTheme } from "@mui/material";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

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
  const showNotification = (
    message: string,
    options: {
      severity?: Severity;
      duration?: number;
      closeable?: boolean;
      buttonText?: string;
      onButtonClick?: () => void;
    } = {}
  ) => {
    setMessage(message);
    setSeverity(options.severity || "info");
    setDuration(options.duration || 3000);
    setCloseable(options.closeable !== undefined ? options.closeable : true);
    setOpen(true);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Custom icon with color only for the icon
  const getSeverityIcon = (severity: Severity) => {
    const iconSize = 20;
    switch (severity) {
      case 'success':
        return <CheckCircle size={iconSize} color="#4caf50" />;
      case 'error':
        return <XCircle size={iconSize} color="#f44336" />;
      case 'info':
        return <Info size={iconSize} color="#2196f3" />;
      case 'warning':
        return <AlertTriangle size={iconSize} color="#ff9800" />;
      default:
        return undefined;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={closeable ? handleClose : undefined}
          severity={severity}
          icon={getSeverityIcon(severity)}
          variant="filled"
          sx={{
            minWidth: 320,
            alignItems: 'center',
            fontSize: '1rem',
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
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
