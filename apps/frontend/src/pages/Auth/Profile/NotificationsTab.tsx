import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useNotificationMenu } from "../../../context/NotificationContext";
import { Notification } from "../../../models/Notification";
import { translatePriorityToSpanish } from "../../../utils/string";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";

type Filter = "all" | "unread" | "read" | "high";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle size={20} color="green" />;
    case "error":
      return <AlertCircle size={20} color="red" />;
    case "warning":
      return <AlertTriangle size={20} color="orange" />;
    case "info":
    default:
      return <Info size={20} color="blue" />;
  }
};

const NotificationsTab: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const {
    allNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isLoading,
  } = useNotificationMenu();
  const [filter, setFilter] = useState<Filter>("all");

  const visibleNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return allNotifications.filter((n) => !n.read);
      case "read":
        return allNotifications.filter((n) => n.read);
      case "high":
        return allNotifications.filter((n) => n.priority === "high");
      default:
        return allNotifications;
    }
  }, [allNotifications, filter]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatTime = (date: Date) =>
    formatDistanceToNow(date, { addSuffix: true, locale: es });

  const filterOptions: { value: Filter; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: "Todas" },
    { value: "unread", label: "No leídas" },
    { value: "read", label: "Leídas" },
    { value: "high", label: isSmallScreen ? "Alta" : "Alta prioridad" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        border: `1px solid ${
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
        }`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        height: { xs: "auto", md: "100%" },
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
          <Box sx={{ color: theme.palette.primary.main, display: "flex", alignItems: "center" }}>
            <Bell size={20} strokeWidth={1.5} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.15rem",
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Notificaciones
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", letterSpacing: "0.02em", ml: 5 }}
        >
          {unreadCount === 0
            ? "No tienes notificaciones pendientes"
            : `${unreadCount} ${unreadCount === 1 ? "notificación no leída" : "notificaciones no leídas"}`}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, mb: 1.5 }} />

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          flexShrink: 0,
          width: "100%",
        }}
      >
        <SegmentedToggle
          value={filter}
          onChange={(value) => setFilter(value)}
          options={filterOptions}
          size="small"
          fullWidth={isSmallScreen}
        />
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {isLoading && allNotifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Cargando notificaciones...
            </Typography>
          </Box>
        ) : visibleNotifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Bell size={40} style={{ color: theme.palette.text.secondary, marginBottom: 8 }} />
            <Typography variant="body2" color="textSecondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          visibleNotifications.map((notification) => (
            <Box
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: "12px",
                cursor: notification.actionUrl ? "pointer" : "default",
                backgroundColor: notification.read
                  ? "transparent"
                  : theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.035)",
                transition: "background-color 0.15s",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : theme.palette.action.hover,
                },
                mb: 0.5,
              }}
            >
              <Box sx={{ pt: 0.25, flexShrink: 0 }}>
                {getNotificationIcon(notification.type)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <Chip
                    label={translatePriorityToSpanish(notification.priority)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.62rem", height: 18, "& .MuiChip-label": { px: 0.75 } }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}
                  >
                    {notification.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.25 }}>
                  {notification.message}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                    {formatTime(notification.timestamp)}
                  </Typography>
                  {notification.actionUrl && notification.actionText && (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      sx={{ fontSize: "0.68rem", textTransform: "none", minHeight: 0, p: 0 }}
                    >
                      {notification.actionText}
                    </Button>
                  )}
                </Box>
              </Box>
              <PremiumTooltip title="Eliminar">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    sx={{ flexShrink: 0, opacity: 0.5, "&:hover": { opacity: 1 } }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </span>
              </PremiumTooltip>
            </Box>
          ))
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-end" },
          gap: 1,
          pt: 3,
          mt: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
          }`,
          flexShrink: 0,
        }}
      >
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<CheckCheck size={15} />}
            onClick={markAllAsRead}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              fontSize: "0.78rem",
              px: 2.5,
              py: 1,
            }}
          >
            Marcar todas como leídas
          </Button>
        )}
        {allNotifications.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash size={15} />}
            onClick={deleteAllNotifications}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              fontSize: "0.78rem",
              px: 2.5,
              py: 1,
            }}
          >
            Eliminar todas
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationsTab;
