import React, { useState, useCallback, useMemo } from "react";
import MenuComponent from "../Menu/Menu.component";
import NotificationMenu from "../NotificationMenu/NotificationMenu.component";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Grow,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { APPBAR_MENU } from "../../constants/constants";
import { useNotificationMenu } from "../../context/NotificationContext";
import { Menu as MenuIcon, Bell, LayoutDashboard, User } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { MenuItemProps } from "../Menu/Menu.component";
import { Roles } from "../../constants/roles";
import {
  appBarStyles,
  toolbarStyles,
  logoBoxStyles,
  logoImgStyles,
  titleStyles,
  clickableBoxStyles,
  dashboardPopoverBoxStyles,
  dashboardIconButtonStyles,
  dashboardIconStyles,
  notificationsIconButtonStyles,
  dividerStyles,
  userBoxStyles,
  userNameStyles,
  userEmailStyles,
  userMenuIconButtonStyles,
  userAvatarStyles,
  mobileDividerStyles,
  dashboardNoLinksBoxStyles,
} from "./AppBar.styles";

interface Link {
  label: string;
  path?: string;
  icon?: React.ReactElement;
  subLinks?: Link[];
  onClick?: () => void;
}

interface AppBarComponentProps {
  icon?: React.ReactNode;
  title: string;
  userLinks?: Link[];
  links: Link[];
}

// AppBarComponent renders the main application bar with navigation, user menu, notifications, and branding.
// Props:
// - icon: optional icon to display
// - title: app title
// - userLinks: links for the user menu
// - links: main navigation links
const AppBarComponent: React.FC<AppBarComponentProps> = ({
  icon,
  title,
  userLinks = [],
  links,
}) => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { unreadCount } = useNotificationMenu();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [dashboardMenuAnchor, setDashboardMenuAnchor] =
    useState<null | HTMLElement>(null);

  const mapLinksToMenuItems = useCallback((linkList: Link[]): MenuItemProps[] =>
    linkList.map(({ label, path, icon, subLinks, onClick }) => ({
      text: label,
      onClick: onClick || (path ? () => navigate(path) : undefined),
      icon,
      subMenuItems: subLinks ? mapLinksToMenuItems(subLinks) : undefined,
    })), [navigate]);

  const menuItems = useMemo(() => mapLinksToMenuItems(links), [links, mapLinksToMenuItems]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleDashboardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDashboardMenuAnchor(event.currentTarget);
  };

  const handleDashboardMenuClose = () => {
    setDashboardMenuAnchor(null);
  };

  const isActivePage = (path: string) => {
    // Checks if the given path matches the current location
    return location.pathname === path;
  };

  const hasNotificationsAccess = () => {
    // Check if user has "Gerencia" or "Administrativo" role
    if (!currentUser?.roles || currentUser.roles.length === 0) return false;
    const firstRole = currentUser.roles[0];
    const userRole =
      firstRole && "UserRole" in firstRole
        ? (firstRole as { UserRole: { roleId: number } }).UserRole
        : null;
    if (!userRole?.roleId) return false;
    return (
      userRole.roleId === Roles.MANAGER ||
      userRole.roleId === Roles.ADMINISTRATIVE
    );
  };

  return (
    <AppBar position="sticky" elevation={0} sx={appBarStyles}>
      <Toolbar sx={toolbarStyles}>
        {/* Logo and Title */}
        <Box sx={clickableBoxStyles} onClick={() => navigate("/")}>
          <Box sx={logoBoxStyles}>
            <img src={logo} alt="Logo" style={logoImgStyles} />
          </Box>
          <Typography variant="h5" sx={titleStyles}>
            {title}
          </Typography>
        </Box>

        {/* Center - Main Navigation (desktop only) */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <IconButton
              onClick={handleDashboardMenuOpen}
              sx={{
                color: "#ffffff",
                cursor: "pointer",
                p: 1,
                borderRadius: "12px",
                minWidth: "48px",
                height: "48px",
                backgroundColor: Boolean(dashboardMenuAnchor) 
                  ? "rgba(255,255,255,0.2)" 
                  : "transparent",
                border: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
                "&:active": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <LayoutDashboard 
                size={22} 
                strokeWidth={1.5}
                style={{
                  color: "#ffffff",
                  opacity: Boolean(dashboardMenuAnchor) ? 1 : 0.8,
                  transition: "all 0.2s ease",
                }} 
              />
            </IconButton>
            <Popover
              open={Boolean(dashboardMenuAnchor)}
              anchorEl={dashboardMenuAnchor}
              onClose={handleDashboardMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              PaperProps={{
                sx: {
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                  p: 0,
                  minWidth: 0,
                  overflow: "visible",
                },
              }}
              TransitionComponent={Grow}
              TransitionProps={{ timeout: 200 }}
              keepMounted
            >
              <Box sx={dashboardPopoverBoxStyles}>
                {links.length === 0 ? (
                  <Box sx={dashboardNoLinksBoxStyles}>
                    {APPBAR_MENU.NO_LINKS}
                  </Box>
                ) : (
                  links.map((link) => (
                    <IconButton
                      key={link.label}
                      onClick={() => {
                        handleDashboardMenuClose();
                        link.path && navigate(link.path);
                      }}
                      sx={dashboardIconButtonStyles(
                        isActivePage(link.path || ""),
                      )}
                    >
                      {React.cloneElement(link.icon as React.ReactElement, {
                        sx: {
                          ...dashboardIconStyles(
                            isActivePage(link.path || ""),
                          ),
                          color: isActivePage(link.path || "")
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                          opacity: isActivePage(link.path || "") ? 1 : 0.7,
                        },
                      })}
                    </IconButton>
                  ))
                )}
              </Box>
            </Popover>
          </Box>
        )}

        {/* Derecha - Acciones del Usuario */}
        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notificaciones - Solo visible para Gerencia y Administrativo */}
            {hasNotificationsAccess() && (
              <>
                <IconButton
                  onClick={handleNotificationsOpen}
                  sx={notificationsIconButtonStyles}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <Bell size={20} />
                  </Badge>
                </IconButton>

                <Divider 
                  orientation="vertical" 
                  flexItem 
                  sx={{ 
                    ...dividerStyles,
                    display: { xs: "none", md: "block" },
                    mx: 2
                  }} 
                />
              </>
            )}

            {/* Perfil del Usuario */}
            <Box sx={userBoxStyles}>
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", md: "block" },
                }}
              >
                <Typography variant="body2" sx={userNameStyles}>
                  {currentUser.firstName} {currentUser.lastName}
                </Typography>
                <Typography variant="caption" sx={userEmailStyles}>
                  {currentUser.email}
                </Typography>
              </Box>

              {/* Avatar Menu - Solo visible en pantallas medianas y grandes */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={userMenuIconButtonStyles}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-dot': {
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        boxShadow: '0 0 0 3px rgba(255,255,255,0.1), 0 0 12px rgba(74, 222, 128, 0.6)',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            opacity: 1,
                            transform: 'scale(1)',
                          },
                          '50%': {
                            opacity: 0.8,
                            transform: 'scale(1.1)',
                          },
                        },
                      },
                    }}
                  >
                    <Avatar sx={userAvatarStyles}>
                      <User size={22} strokeWidth={1.5} />
                    </Avatar>
                  </Badge>
                </IconButton>
              </Box>

              {/* Menú Principal (solo mobile) */}
              {isMobile && (
                <>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={mobileDividerStyles}
                  />
                  <MenuComponent
                    buttonType="icon"
                    icon={<MenuIcon size={24} />}
                    menuItems={[...menuItems, ...userLinks.map(link => ({
                      text: link.label,
                      onClick: link.onClick || (link.path ? () => navigate(link.path!) : undefined),
                      icon: link.icon,
                    }))]}
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Menú de Usuario */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 0.5,
              minWidth: 200,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 35, 0.95)'
                : '#ffffff',
              backdropFilter: "blur(20px)",
              border: theme.palette.mode === 'dark'
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(0,0,0,0.15)",
              borderRadius: 2,
              boxShadow: theme.palette.mode === 'dark'
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.25)",
              overflow: 'hidden',
              padding: 0,
            },
          }}
        >
          {userLinks.map((link, index) => (
            <React.Fragment key={link.label}>
              {index > 0 && link.label === APPBAR_MENU.LOGOUT && (
                <Divider
                  sx={{
                    my: 0,
                    borderColor: theme.palette.mode === 'dark'
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                  }}
                />
              )}
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  if (link.onClick) {
                    link.onClick();
                  } else if (link.path) {
                    navigate(link.path);
                  }
                }}
                sx={{
                  py: 1,
                  px: 2,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: link.label === APPBAR_MENU.LOGOUT
                    ? theme.palette.error.main
                    : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: link.label === APPBAR_MENU.LOGOUT
                      ? `${theme.palette.error.light}15`
                      : theme.palette.mode === 'dark'
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.04)",
                    transform: "translateX(2px)",
                  },
                  '& .MuiListItemIcon-root': {
                    minWidth: 32,
                    color: link.label === APPBAR_MENU.LOGOUT
                      ? theme.palette.error.main
                      : theme.palette.primary.main,
                  },
                }}
              >
                <ListItemIcon>
                  {link.icon && React.cloneElement(link.icon as React.ReactElement, {
                    size: 18,
                    strokeWidth: 2,
                    color: link.label === APPBAR_MENU.LOGOUT
                      ? theme.palette.error.main
                      : theme.palette.primary.main,
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            </React.Fragment>
          ))}
        </Menu>

        <NotificationMenu
          anchorEl={notificationsAnchor}
          onClose={handleNotificationsClose}
          onNotificationClick={(notification) => {
            if (notification.actionUrl) {
              navigate(notification.actionUrl);
            }
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(AppBarComponent);
