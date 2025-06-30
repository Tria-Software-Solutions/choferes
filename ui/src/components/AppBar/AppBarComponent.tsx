import React, { useState } from "react";
import MenuComponent from "../Menu/MenuComponent";
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

  const mapLinksToMenuItems = (
    linkList: Link[],
  ): {
    text: string;
    onClick?: () => void;
    icon?: React.ReactElement;
    subMenuItems?: unknown;
  }[] =>
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
    if (!currentUser) return "U";
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "64px", md: "72px" },
          px: { xs: 2, md: 3 },
          justifyContent: "space-between",
        }}
      >
        {/* Logo y Título */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
          onClick={() => navigate("/")}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 2,
              p: 1,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "32px",
                height: "auto",
              }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Protest Guerrilla', sans-serif",
              fontWeight: 700,
              background: "linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: "none", sm: "block" },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Centro - Navegación Principal (solo desktop) */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleDashboardMenuOpen}
              sx={{
                color: "#ffffff",
                cursor: "pointer",
                p: 1.5,
                borderRadius: "50%",
                minWidth: "56px",
                height: "56px",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <DashboardRoundedIcon sx={{ fontSize: "1.8rem" }} />
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
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.8)",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                {links.length === 0 ? (
                  <Box sx={{ color: "white", p: 1 }}>
                    No hay links disponibles
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
                        sx={{
                          color: "#ffffff",
                          cursor: "pointer",
                          p: 1.5,
                          borderRadius: "50%",
                          minWidth: "56px",
                          height: "56px",
                          backgroundColor: isActivePage(link.path || "")
                            ? "rgba(255,255,255,0.25)"
                            : "transparent",
                          border: isActivePage(link.path || "")
                            ? "2px solid rgba(255,255,255,0.6)"
                            : "none",
                          "&:hover": {
                            backgroundColor: isActivePage(link.path || "")
                              ? "rgba(255,255,255,0.35)"
                              : "rgba(255,255,255,0.15)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {React.cloneElement(link.icon as React.ReactElement, {
                          sx: {
                            fontSize: "1.6rem",
                            color: isActivePage(link.path || "")
                              ? "#ffffff"
                              : "#ffffff",
                            filter: isActivePage(link.path || "")
                              ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))"
                              : "none",
                          },
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
            {/* Notificaciones */}
            <Tooltip title="Notificaciones" arrow>
              <IconButton
                onClick={handleNotificationsOpen}
                sx={{
                  color: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, borderColor: "rgba(255,255,255,0.2)" }}
            />

            {/* Perfil del Usuario */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", md: "block" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {currentUser.firstName} {currentUser.lastName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.75rem",
                  }}
                >
                  {currentUser.email}
                </Typography>
              </Box>

              <Tooltip title="Menú de Usuario" arrow>
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    p: 0.5,
                    border: "2px solid rgba(255,255,255,0.3)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Menú Principal (solo mobile) */}
              {isMobile && (
                <>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: "rgba(255,255,255,0.2)" }}
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
            sx: {
              mt: 1,
              minWidth: 200,
              backgroundColor: "#ffffff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 2,
            },
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
                  ? { color: theme.palette.error.main }
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
            sx: {
              mt: 1,
              minWidth: 300,
              backgroundColor: "#ffffff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 2,
            },
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
