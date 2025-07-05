import React, { useState } from "react";
import MenuComponent from "../Menu/Menu.component";
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
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { APPBAR_MENU } from "../../constants/constants";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import logo from "../../assets/images/logo.png";
import { MenuItemProps } from "../Menu/Menu.component";
import "@fontsource/urbanist";
import { Roles } from "../../enums/roles";
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
  menuPaperStyles,
  notificationsMenuPaperStyles,
  dashboardNoLinksBoxStyles,
  logoutMenuItemStyles,
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

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [dashboardMenuAnchor, setDashboardMenuAnchor] =
    useState<null | HTMLElement>(null);

  const mapLinksToMenuItems = (linkList: Link[]): MenuItemProps[] =>
    linkList.map(({ label, path, icon, subLinks, onClick }) => ({
      text: label,
      onClick: onClick || (path ? () => navigate(path) : undefined),
      icon,
      subMenuItems: subLinks ? mapLinksToMenuItems(subLinks) : undefined,
    }));

  const menuItems = mapLinksToMenuItems(links);

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

  const getUserInitials = () => {
    // Returns the initials of the current user for the avatar
    if (!currentUser) return "U";
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
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
    <AppBar position="static" elevation={0} sx={appBarStyles}>
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
              sx={dashboardIconButtonStyles(false)}
            >
              <DashboardRoundedIcon sx={dashboardIconStyles(false)} />
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
                },
              }}
              TransitionComponent={undefined}
              transitionDuration={300}
              keepMounted
            >
              <Box sx={dashboardPopoverBoxStyles}>
                {links.length === 0 ? (
                  <Box sx={dashboardNoLinksBoxStyles}>
                    {APPBAR_MENU.NO_LINKS}
                  </Box>
                ) : (
                  links.map((link, index) => (
                    <Tooltip
                      title={link.label}
                      arrow
                      key={link.label}
                      placement="bottom"
                    >
                      <IconButton
                        onClick={() => {
                          handleDashboardMenuClose();
                          link.path && navigate(link.path);
                        }}
                        sx={dashboardIconButtonStyles(
                          isActivePage(link.path || ""),
                        )}
                      >
                        {React.cloneElement(link.icon as React.ReactElement, {
                          sx: dashboardIconStyles(
                            isActivePage(link.path || ""),
                          ),
                        })}
                      </IconButton>
                    </Tooltip>
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
                <Tooltip title={APPBAR_MENU.NOTIFICATIONS} arrow>
                  <IconButton
                    onClick={handleNotificationsOpen}
                    sx={notificationsIconButtonStyles}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsRoundedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={dividerStyles} />
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

              <Tooltip title={APPBAR_MENU.USER_MENU} arrow>
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={userMenuIconButtonStyles}
                >
                  <Avatar sx={userAvatarStyles}>{getUserInitials()}</Avatar>
                </IconButton>
              </Tooltip>

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
                    icon={<MenuRoundedIcon />}
                    menuItems={menuItems}
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Menús */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: menuPaperStyles,
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {userLinks.map((link) => (
            <MenuItem
              key={link.label}
              onClick={() => {
                handleUserMenuClose();
                if (link.onClick) {
                  link.onClick();
                } else if (link.path) {
                  navigate(link.path);
                }
              }}
              sx={
                link.label === APPBAR_MENU.LOGOUT
                  ? logoutMenuItemStyles(theme)
                  : {}
              }
            >
              <ListItemIcon>
                {React.cloneElement(link.icon as React.ReactElement, {
                  fontSize: "small",
                  color:
                    link.label === APPBAR_MENU.LOGOUT ? "error" : "inherit",
                })}
              </ListItemIcon>
              <ListItemText primary={link.label} />
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: notificationsMenuPaperStyles,
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem>
            <ListItemText
              primary="Nuevo empleado registrado"
              secondary="Hace 5 minutos"
            />
          </MenuItem>
          <MenuItem>
            <ListItemText
              primary="Horario actualizado"
              secondary="Hace 1 hora"
            />
          </MenuItem>
          <MenuItem>
            <ListItemText
              primary="Reporte semanal disponible"
              secondary="Hace 2 horas"
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
