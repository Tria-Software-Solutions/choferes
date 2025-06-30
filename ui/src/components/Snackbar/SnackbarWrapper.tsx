import React, { createContext, useContext, useState } from "react";
import { Snackbar, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface NotificationContextType {
  showNotification: (
    message: string,
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

export const AppNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState<number>(3000);
  const [closeable, setCloseable] = useState<boolean>(true);
  const [buttonText, setButtonText] = useState<string>("");
  const [onButtonClick, setOnButtonClick] = useState<() => void>(
    () => () => {}
  );

  const showNotification = (
    message: string,
    duration: number = 3000,
    closeable: boolean = true,
    buttonText: string = "Cerrar",
    onButtonClick: () => void = () => {}
  ) => {
    setMessage(message);
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
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={() => setOpen(false)}
        message={
          <span style={{ display: "flex", alignItems: "center" }}>
            {message}
          </span>
        }
        action={
          closeable && (
            <>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setOpen(false)}
                sx={{
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
              {buttonText && (
                <button
                  onClick={() => {
                    onButtonClick();
                    setOpen(false);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: theme.palette.primary.contrastText,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {buttonText}
                </button>
              )}
            </>
          )
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[8],
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

export default function SnackbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppNotificationProvider>{children}</AppNotificationProvider>;
}
