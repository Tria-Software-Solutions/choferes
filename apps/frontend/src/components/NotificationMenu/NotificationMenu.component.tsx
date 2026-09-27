import React, { useState, useEffect } from 'react';
import {
  Menu,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  Button,
  useTheme,
  ListItemButton,
} from '@mui/material';
import { IconAlarm, IconAlertCircle, IconAlertTriangle, IconBell, IconChecks, IconCircleCheck, IconFilter, IconInfoCircle, IconTrash, IconX } from "@tabler/icons-react";
import { useNotificationMenu } from '../../context/NotificationContext';
import { Notification } from '../../models/Notification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { translatePriorityToSpanish } from '../../utils/string';
import PremiumTooltip from '../../components/PremiumTooltip/PremiumTooltip.component';
import SegmentedToggle from '../SegmentedToggle/SegmentedToggle.component';

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NOTIFICATION_TYPE_TONES = {
  success: { fg: 'success', bg: 'successSoft' },
  error: { fg: 'error', bg: 'errorSoft' },
  warning: { fg: 'warning', bg: 'warningSoft' },
  info: { fg: 'accent', bg: 'accentSoft' },
} as const;

const getNotificationIcon = (type: Notification['type'], category?: Notification['category']) => {
  const tone = NOTIFICATION_TYPE_TONES[type] ?? NOTIFICATION_TYPE_TONES.info;
  // Task reminders always read as an alarm (tinted by urgency).
  const Icon =
    category === 'task'
      ? IconAlarm
      : type === 'success'
        ? IconCircleCheck
        : type === 'error'
          ? IconAlertCircle
          : type === 'warning'
            ? IconAlertTriangle
            : IconInfoCircle;
  return (
    <Box sx={(theme) => ({
      width: 34,
      height: 34,
      borderRadius: '10px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.tokens.colors[tone.bg],
      color: theme.tokens.colors[tone.fg],
    })}>
      <Icon size={18} stroke={2} />
    </Box>
  );
};



const NotificationMenu: React.FC<NotificationMenuProps> = ({
  anchorEl,
  onClose,
  onNotificationClick,
}) => {
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updateFilters,
    clearFilters,
    filters,
  } = useNotificationMenu();

  const [showFilters, setShowFilters] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Track if menu was opened and has unread notifications
  const [hasUnreadOnOpen, setHasUnreadOnOpen] = useState(false);

  // Track when menu opens with unread notifications
  useEffect(() => {
    if (anchorEl && unreadCount > 0) {
      setHasUnreadOnOpen(true);
    } else if (!anchorEl && hasUnreadOnOpen) {
      // When menu closes, mark as read if it was opened with unread notifications
      markAllAsRead();
      setHasUnreadOnOpen(false);
    }
  }, [anchorEl, unreadCount, hasUnreadOnOpen, markAllAsRead]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteAllNotifications = () => {
    deleteAllNotifications();
  };

  const handleDeleteNotification = (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  type PopupFilter = 'all' | 'unread' | 'read' | 'high';

  const activeFilter: PopupFilter =
    filters.priority === 'high'
      ? 'high'
      : filters.read === false
        ? 'unread'
        : filters.read === true
          ? 'read'
          : 'all';

  const handlePopupFilterChange = (value: PopupFilter) => {
    switch (value) {
      case 'unread':
        updateFilters({ read: false, priority: undefined });
        break;
      case 'read':
        updateFilters({ read: true, priority: undefined });
        break;
      case 'high':
        updateFilters({ priority: 'high', read: undefined });
        break;
      default:
        clearFilters();
        break;
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 0,
        sx: {
          width: 380,
          maxHeight: 580,
          mt: 0.5,
          backgroundColor: theme.tokens.colors.menuSurface,
          border: theme.tokens.borders.paper,
          borderRadius: '14px',
          boxShadow: theme.tokens.shadows.menu,
          overflow: 'hidden',
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: theme.tokens.borders.hairline }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: theme.palette.text.primary }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <PremiumTooltip title="Filtros">
              <IconButton
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
                sx={{
                  padding: 0.4,
                  color: showFilters ? theme.palette.primary.main : theme.palette.text.primary,
                  backgroundColor: showFilters
                    ? (theme.tokens.colors.selected)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.tokens.colors.selected,
                  },
                }}
              >
                <IconFilter size={16} />
              </IconButton>
            </PremiumTooltip>
            {unreadCount > 0 && (
              <PremiumTooltip title="Marcar todas como leídas">
                <IconButton 
                  size="small" 
                  onClick={handleMarkAllAsRead}
                  sx={{
                    padding: 0.4,
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.tokens.colors.selected,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <IconChecks size={16} />
                </IconButton>
              </PremiumTooltip>
            )}

          </Box>
        </Box>
        
        {unreadCount > 0 && (
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
            {unreadCount} {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
          </Typography>
        )}
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ p: 1.5, borderBottom: theme.tokens.borders.hairline }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>Filtros</Typography>
            <Button 
              size="small" 
              onClick={clearFilters} 
              startIcon={<IconX size={14} />}
              sx={{ fontSize: '0.7rem', padding: '3px 8px', color: theme.palette.text.primary }}
            >
              Limpiar
            </Button>
          </Box>
          <SegmentedToggle
            value={activeFilter}
            onChange={handlePopupFilterChange}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'unread', label: 'No leídas' },
              { value: 'read', label: 'Leídas' },
              { value: 'high', label: `${translatePriorityToSpanish('high')} prioridad` },
            ]}
            size="medium"
          />
        </Box>
      )}

      {/* Main Content Container */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: notifications.length === 0 ? 'auto' : 380,
        minHeight: notifications.length === 0 ? 'auto' : 180,
      }}>
        {/* Scrollable Notifications List */}
        <Box sx={{ 
          flex: notifications.length === 0 ? 'none' : 1, 
          overflow: 'auto',
          minHeight: notifications.length === 0 ? 'auto' : 0,
        }}>
          {notifications.length === 0 ? (
            <Box sx={{ 
              p: 2, 
              textAlign: 'center',
              minHeight: notifications.length === 0 ? 100 : 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <IconBell size={40} style={{ color: theme.palette.text.secondary, marginBottom: 8 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            (showAllNotifications ? notifications : notifications.slice(0, 5)).map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    backgroundColor: notification.read 
                      ? 'transparent' 
                      : theme.tokens.colors.hoverSoft,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    {getNotificationIcon(notification.type, notification.category)}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Chip
                          label={translatePriorityToSpanish(notification.priority)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.65rem', 
                            height: 18,
                            '& .MuiChip-label': {
                              color: theme.palette.text.primary,
                              fontWeight: 500,
                            },
                            '& .MuiChip-outlined': {
                              borderColor: theme.tokens.colors.borderStrong,
                            },
                            backgroundColor: theme.tokens.colors.hover,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: '0.875rem',
                          }}
                        >
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.25, fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary }}>
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 28 }}>
                    <PremiumTooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        sx={{ 
                          opacity: 0.5, 
                          '&:hover': { opacity: 1 },
                          padding: 0.35,
                          minWidth: 20,
                          minHeight: 20,
                          color: theme.palette.text.primary,
                        }}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </PremiumTooltip>
                  </Box>
                </ListItemButton>

                {index < (showAllNotifications ? notifications : notifications.slice(0, 5)).length - 1 && (
                  <Divider sx={{ mx: 1.5, borderColor: theme.tokens.colors.borderHairline }} />
                )}
              </React.Fragment>
            ))
          )}
          
          {/* Show More/Less Button */}
          {notifications.length > 5 && (
            <Box sx={{ p: 0.75, borderTop: theme.tokens.borders.hairline }}>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                sx={{ 
                  fontSize: '0.75rem', 
                  padding: '3px 8px',
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                {showAllNotifications 
                  ? `Mostrar menos (${notifications.length - 5} menos)` 
                  : `Ver todas las notificaciones (${notifications.length - 5} más)`
                }
              </Button>
            </Box>
          )}
        </Box>

        {/* Sticky Footer with Delete All Button */}
        {notifications.length > 0 && (
          <Box sx={{ 
            p: 0.75, 
            borderTop: theme.tokens.borders.hairline,
            backgroundColor: theme.tokens.colors.surfaceSunken,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleDeleteAllNotifications}
              startIcon={<IconTrash size={14} />}
              sx={{ 
                fontSize: '0.75rem', 
                padding: '4px 12px',
                textTransform: 'none',
                color: theme.palette.error.main,
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.5)'
                  : theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : theme.palette.error.light + '20',
                }
              }}
            >
              Eliminar todas las notificaciones
            </Button>
          </Box>
        )}
      </Box>


    </Menu>
  );
};

export default NotificationMenu; 