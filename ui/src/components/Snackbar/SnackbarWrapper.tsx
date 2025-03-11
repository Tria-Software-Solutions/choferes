import React, { createContext, useContext, useState } from "react";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Snackbar, SnackbarContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationContextType {
  showNotification: (
    message: string,
    severity?: "success" | "error" | "warning" | "info",
    duration?: number,
    closeable?: boolean,
    buttonText?: string,
    onButtonClick?: () => void
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useAppNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useAppNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

const NotificationIcon: React.FC<{ severity: "success" | "error" | "warning" | "info" }> = ({ severity }) => {
  switch (severity) {
    case "success":
      return <CheckCircleOutlinedIcon style={{ color: "green", marginRight: 8 }} />;
    case "error":
      return <ReportOutlinedIcon style={{ color: "red", marginRight: 8 }} />;
    case "warning":
      return <WarningAmberOutlinedIcon style={{ color: "orange", marginRight: 8 }} />;
    case "info":
      return <InfoOutlinedIcon style={{ color: "blue", marginRight: 8 }} />;
    default:
      return null;
  }
};

export const AppNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "warning" | "info">("success");
  const [duration, setDuration] = useState<number>(3000);
  const [closeable, setCloseable] = useState<boolean>(true);
  const [buttonText, setButtonText] = useState<string>("");
  const [onButtonClick, setOnButtonClick] = useState<() => void>(() => () => {});

  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success",
    duration: number = 3000,
    closeable: boolean = true,
    buttonText: string = "Cerrar",
    onButtonClick: () => void = () => {}
  ) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
    setCloseable(closeable);
    setButtonText(buttonText);
    setOnButtonClick(() => onButtonClick);
    setOpen(true);

    if (closeable) {
      setTimeout(() => {
        setOpen(false);
      }, duration);
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={duration} onClose={() => setOpen(false)}>
        <SnackbarContent
          message={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <NotificationIcon severity={severity} />
              {message}
            </span>
          }
          action={
            closeable ? (
              <>
                <IconButton size="small" aria-label="close" color="inherit" onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
                {buttonText && (
                  <button onClick={() => { onButtonClick(); setOpen(false); }}>
                    {buttonText}
                  </button>
                )}
              </>
            ) : null
          }
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        />
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default function SnackbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppNotificationProvider>{children}</AppNotificationProvider>
  );
}