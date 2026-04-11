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
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Trash2, CheckCheck, ListFilter, X, Trash } from "lucide-react";
import { useNotificationMenu } from '../../context/NotificationContext';
import { Notification } from '../../models/Notification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { translatePriorityToSpanish } from '../../utils/string';
import PremiumTooltip from '../../components/PremiumTooltip/PremiumTooltip.component';

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} color="green" />;
    case 'error':
      return <AlertCircle size={20} color="red" />;
    case 'warning':
      return <AlertTriangle size={20} color="orange" />;
    case 'info':
    default:
      return <Info size={20} color="blue" />;
  }
};



const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
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

  const handleFilterChange = (filterType: 'read' | 'type' | 'category' | 'priority', value: boolean | string) => {
    updateFilters({ [filterType]: value });
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
        sx: {
          width: 400,
          maxHeight: 600,
          mt: 1,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <PremiumTooltip title="Filtros">
              <IconButton
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
                sx={{ padding: 0.5 }}
              >
                <ListFilter size={18} />
              </IconButton>
            </PremiumTooltip>
            {unreadCount > 0 && (
              <PremiumTooltip title="Marcar todas como leídas">
                <IconButton 
                  size="small" 
                  onClick={handleMarkAllAsRead}
                  sx={{ padding: 0.5 }}
                >
                  <CheckCheck size={18} />
                </IconButton>
              </PremiumTooltip>
            )}

          </Box>
        </Box>
        
        {unreadCount > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {unreadCount} {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
          </Typography>
        )}
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>Filtros</Typography>
            <Button 
              size="small" 
              onClick={clearFilters} 
              startIcon={<X size={16} />}
              sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Limpiar
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label="No leídas"
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('read', false)}
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.text.primary 
                    : theme.palette.text.primary,
                  fontWeight: 500,
                },
                '& .MuiChip-outlined': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.divider 
                    : theme.palette.text.secondary,
                },
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }}
            />
            <Chip
              label="Leídas"
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('read', true)}
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.text.primary 
                    : theme.palette.text.primary,
                  fontWeight: 500,
                },
                '& .MuiChip-outlined': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.divider 
                    : theme.palette.text.secondary,
                },
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }}
            />
            <Chip
              label={`${translatePriorityToSpanish('high')} prioridad`}
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('priority', 'high')}
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.text.primary 
                    : theme.palette.text.primary,
                  fontWeight: 500,
                },
                '& .MuiChip-outlined': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? theme.palette.divider 
                    : theme.palette.text.secondary,
                },
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }}
            />
          </Box>
        </Box>
      )}

      {/* Main Content Container */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: notifications.length === 0 ? 'auto' : 400,
        minHeight: notifications.length === 0 ? 'auto' : 200,
      }}>
        {/* Scrollable Notifications List */}
        <Box sx={{ 
          flex: notifications.length === 0 ? 'none' : 1, 
          overflow: 'auto',
          minHeight: notifications.length === 0 ? 'auto' : 0,
        }}>
          {notifications.length === 0 ? (
            <Box sx={{ 
              p: 3, 
              textAlign: 'center',
              minHeight: notifications.length === 0 ? 120 : 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Bell size={48} style={{ color: theme.palette.text.secondary, marginBottom: 8 }} />
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            (showAllNotifications ? notifications : notifications.slice(0, 5)).map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.read ? 'transparent' : theme.palette.action.hover,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Chip
                          label={translatePriorityToSpanish(notification.priority)}
                          size="small"
                          color={getPriorityColor(notification.priority) as 'error' | 'warning' | 'default'}
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 20,
                            '& .MuiChip-label': {
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.text.primary 
                                : theme.palette.text.primary,
                              fontWeight: 500,
                            },
                            '& .MuiChip-outlined': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? theme.palette.divider 
                                : theme.palette.text.secondary,
                            },
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.05)',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 32 }}>
                    <PremiumTooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        sx={{ 
                          opacity: 0.6, 
                          '&:hover': { opacity: 1 },
                          padding: 0.5,
                          minWidth: 24,
                          minHeight: 24,
                        }}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </PremiumTooltip>
                  </Box>
                </ListItemButton>

                {index < (showAllNotifications ? notifications : notifications.slice(0, 5)).length - 1 && (
                  <Divider sx={{ mx: 2 }} />
                )}
              </React.Fragment>
            ))
          )}
          
          {/* Show More/Less Button */}
          {notifications.length > 5 && (
            <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                sx={{ 
                  fontSize: '0.8rem', 
                  padding: '4px 8px',
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
            p: 1, 
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleDeleteAllNotifications}
              startIcon={<Trash size={16} />}
              sx={{ 
                fontSize: '0.8rem', 
                padding: '6px 16px',
                textTransform: 'none',
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  backgroundColor: theme.palette.error.light + '20',
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