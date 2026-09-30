import React, { useState, useEffect } from 'react';
import {
  Menu,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  IconAlarm,
  IconAlertCircle,
  IconAlertTriangle,
  IconBell,
  IconCalendarTime,
  IconCar,
  IconChecks,
  IconCircleCheck,
  IconFilter,
  IconGavel,
  IconId,
  IconInfoCircle,
  IconKey,
  IconPlane,
  IconReport,
  IconShieldCheck,
  IconTrash,
  IconUserCog,
  IconUserPlus,
  IconUsers,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
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

// Icon per notification domain. When a source (backend-generated) is recognized
// it wins; otherwise fall back to category and finally to the status type.
const getSourceIcon = (source?: string) => {
  if (!source) return null;
  if (source.startsWith('vacation-')) return IconPlane;
  if (source.startsWith('boleta-') || source.startsWith('boletas-') || source.startsWith('payment-')) return IconWallet;
  if (source.startsWith('schedule-')) return IconCalendarTime;
  if (source.startsWith('license-')) return IconId;
  if (source.startsWith('disciplinary-')) return IconGavel;
  if (source.startsWith('account-')) return IconUserPlus;
  if (source.startsWith('user-')) return IconUserCog;
  if (source.startsWith('password-') || source.startsWith('temp-password')) return IconKey;
  if (source.startsWith('role-')) return IconShieldCheck;
  if (source.startsWith('employee-') || source.startsWith('terminations-')) return IconUsers;
  if (source.startsWith('task-reminder:')) return IconAlarm;
  if (source.startsWith('data-deletion')) return IconTrash;
  return null;
};

const CATEGORY_ICONS: Record<Notification['category'], typeof IconInfoCircle> = {
  task: IconAlarm,
  schedule: IconCalendarTime,
  vehicle: IconCar,
  report: IconReport,
  system: IconInfoCircle,
  employee: IconUsers,
};

const TYPE_ICONS: Record<Notification['type'], typeof IconInfoCircle> = {
  success: IconCircleCheck,
  error: IconAlertCircle,
  warning: IconAlertTriangle,
  info: IconInfoCircle,
};

const TONE_BY_TYPE: Record<Notification['type'], { fg: string; bg: string }> = {
  success: { fg: 'success', bg: 'successSoft' },
  error: { fg: 'error', bg: 'errorSoft' },
  warning: { fg: 'warning', bg: 'warningSoft' },
  info: { fg: 'accent', bg: 'accentSoft' },
};

const getNotificationVisuals = (notification: Notification) => {
  const Icon =
    getSourceIcon(notification.source) ??
    CATEGORY_ICONS[notification.category] ??
    TYPE_ICONS[notification.type];
  const tone = TONE_BY_TYPE[notification.type] ?? TONE_BY_TYPE.info;
  const IconTile = (
    <Box sx={(theme) => ({
      width: 38,
      height: 38,
      borderRadius: '12px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.tokens.colors[tone.bg as keyof typeof theme.tokens.colors],
      color: theme.tokens.colors[tone.fg as keyof typeof theme.tokens.colors],
      '& svg': {
        width: 20,
        height: 20,
      },
    })}>
      <Icon stroke={1.75} />
    </Box>
  );
  return { IconTile };
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
          width: 392,
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
                    py: 1.25,
                    px: 1.25,
                    borderLeft: notification.read
                      ? '3px solid transparent'
                      : `3px solid ${theme.palette.primary.main}`,
                    backgroundColor: notification.read
                      ? 'transparent'
                      : theme.tokens.colors.hoverSoft,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : theme.palette.action.hover,
                    },
                    '&:hover .notif-delete': {
                      opacity: 1,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 46 }}>
                    {getNotificationVisuals(notification).IconTile}
                  </ListItemIcon>

                  <ListItemText
                    sx={{ m: 0 }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? 500 : 650,
                            color: theme.palette.text.primary,
                            fontSize: '0.875rem',
                            lineHeight: 1.3,
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            color: theme.palette.text.secondary,
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          fontSize: '0.8rem',
                          lineHeight: 1.45,
                          color: theme.palette.text.secondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 26, ml: 0.5 }}>
                    <PremiumTooltip title="Eliminar">
                      <IconButton
                        className="notif-delete"
                        size="small"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        sx={{
                          opacity: 0,
                          transition: 'opacity 0.15s ease',
                          '&:hover': {
                            opacity: 1,
                            color: theme.palette.error.main,
                            backgroundColor: theme.tokens.colors.errorSoft,
                          },
                          padding: 0.4,
                          minWidth: 28,
                          minHeight: 28,
                          color: theme.palette.text.primary,
                        }}
                      >
                        <IconTrash size={15} />
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