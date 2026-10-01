import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  ButtonBase,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { IconBell, IconChevronDown, IconMenu2 } from "@tabler/icons-react";
import MobileMenuDrawer from "../MobileMenu/MobileMenu.component";
import NotificationMenu from "../NotificationMenu/NotificationMenu.component";
import TopNav from "./TopNav.component";
import { useNotificationNavigation } from "../../hooks/useNotificationNavigation";
import { useMenuPreferences } from "../../hooks/useMenuPreferences";
import { useAuthContext } from "../../context/AuthContext";
import * as UserService from "../../services/userService";
import UserAvatar from "../UserAvatar/UserAvatar.component";
import { APPBAR_MENU, ROUTES } from "../../constants/constants";
import { useNotificationMenu } from "../../context/NotificationContext";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
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

// Brand lockup: crest + wordmark. Clicking it goes to the user's home route.
const Brand: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { colors } = useTheme().tokens;
  return (
    <ButtonBase
      onClick={onClick}
      aria-label="Ir al inicio"
      sx={{ display: "flex", alignItems: "center", gap: 1.25, borderRadius: "10px", pr: 1, flexShrink: 0 }}
    >
      <Box component="img" src={logo} alt="" sx={{ width: 30, height: "auto", display: "block" }} />
      <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
        <Box component="span" sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em", color: colors.text }}>
          Choferes
        </Box>
        <Box
          component="span"
          sx={{
            mt: "3px",
            fontWeight: 600,
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: colors.textMuted,
          }}
        >
          de Alquiler
        </Box>
      </Box>
    </ButtonBase>
  );
};

// AppBarComponent renders the main application bar: brand, primary navigation,
// theme toggle, notifications and the user menu (drawer navigation on mobile).
const AppBarComponent: React.FC<AppBarComponentProps> = ({ title, userLinks = [], links }) => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const openNotificationTarget = useNotificationNavigation();
  const location = useLocation();
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isCompactNav = useMediaQuery(theme.breakpoints.down("lg"));
  const { unreadCount } = useNotificationMenu();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  // Visible/ordered sections come from the user's menu preferences
  // (Configuración → Accesos rápidos) and are synced to their settings.
  const linkKeys = useMemo(() => links.map((l) => l.label), [links]);
  const { preferences, itemOrder, isMenuVisible } = useMenuPreferences(linkKeys);

  const dockSyncRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!currentUser?.id) return undefined;
    clearTimeout(dockSyncRef.current);
    dockSyncRef.current = setTimeout(() => {
      UserService.updateUserSettings(currentUser.id, {
        dock: { preferences, order: itemOrder },
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(dockSyncRef.current);
  }, [preferences, itemOrder, currentUser?.id]);

  const visibleLinks = useMemo(() => {
    const ordered = [...links].sort(
      (a, b) => itemOrder.indexOf(a.label) - itemOrder.indexOf(b.label),
    );
    return ordered.filter((link) => isMenuVisible(link.label));
  }, [links, itemOrder, isMenuVisible]);

  // Settings lives in the user menu on desktop; the bar only lists sections.
  const navLinks = useMemo(
    () => visibleLinks.filter((link) => link.label !== APPBAR_MENU.PROFILE),
    [visibleLinks],
  );

  // Mobile drawer: dedupe user links against nav links by label.
  const mobileUserLinks = useMemo(() => {
    const linkLabels = new Set(visibleLinks.map((link) => link.label));
    return userLinks.filter((link) => !linkLabels.has(link.label));
  }, [visibleLinks, userLinks]);

  const hasNotificationsAccess = () => {
    return !!currentUser;
  };


  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          minHeight: { xs: 56, md: 60 },
          px: { xs: 1.5, sm: 2, md: 2.5 },
          gap: { xs: 1, md: 2 },
        }}
      >
        <Brand onClick={() => navigate(ROUTES.LOGIN)} />

        {!isMobile && (
          <>
            <Divider orientation="vertical" flexItem sx={{ my: 1.75, borderColor: colors.border }} />
            <TopNav
              links={navLinks}
              pathname={location.pathname}
              onNavigate={navigate}
              compact={isCompactNav && navLinks.length > 4}
            />
          </>
        )}

        <Box sx={{ flex: 1 }} />

        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ThemeToggle />

            {hasNotificationsAccess() && (
              <Tooltip title={APPBAR_MENU.NOTIFICATIONS}>
                <IconButton
                  onClick={(event) => setNotificationsAnchor(event.currentTarget)}
                  aria-label={
                    unreadCount > 0
                      ? `${APPBAR_MENU.NOTIFICATIONS} (${unreadCount} sin leer)`
                      : APPBAR_MENU.NOTIFICATIONS
                  }
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                    sx={{ "& .MuiBadge-badge": { border: `2px solid ${colors.appBarBg}` } }}
                  >
                    <IconBell size={18} stroke={1.75} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {!isMobile && (
              <ButtonBase
                onClick={(event) => setUserMenuAnchor(event.currentTarget)}
                aria-label={APPBAR_MENU.USER_MENU}
                aria-haspopup="menu"
                aria-expanded={Boolean(userMenuAnchor)}
                sx={{
                  ml: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  height: 40,
                  pl: 0.5,
                  pr: 1,
                  borderRadius: "999px",
                  border: borders.paper,
                  transition: "background-color 0.15s ease",
                  "&:hover": { backgroundColor: colors.hover },
                  "&.Mui-focusVisible": { outline: borders.focus, outlineOffset: 1 },
                }}
              >
                <UserAvatar user={currentUser} size={30} />
                <Box sx={{ display: { md: "none", lg: "block" }, textAlign: "left", maxWidth: 160 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentUser.firstName} {currentUser.lastName}
                  </Typography>
                </Box>
                <IconChevronDown size={16} color={colors.textMuted} />
              </ButtonBase>
            )}

            {isMobile && (
              <>
                <IconButton onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú de navegación">
                  <IconMenu2 size={20} stroke={1.75} />
                </IconButton>
                <MobileMenuDrawer
                  open={mobileMenuOpen}
                  onClose={() => setMobileMenuOpen(false)}
                  title={title}
                  navLinks={visibleLinks}
                  userLinks={mobileUserLinks}
                  currentUser={currentUser}
                />
              </>
            )}
          </Box>
        )}

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 240 } } }}
        >
          {currentUser && (
            <Box sx={{ px: 1.5, pt: 1, pb: 1.25, display: "flex", alignItems: "center", gap: 1.25 }}>
              <UserAvatar user={currentUser} size={36} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.3 }} noWrap>
                  {currentUser.firstName} {currentUser.lastName}
                </Typography>
                <Typography variant="caption" component="div" noWrap>
                  {currentUser.email}
                </Typography>
              </Box>
            </Box>
          )}
          <Divider sx={{ my: 0.5 }} />
          {userLinks.map((link) => {
            const isLogout = link.label === APPBAR_MENU.LOGOUT;
            return [
              isLogout ? <Divider key={`${link.label}-divider`} sx={{ my: 0.5 }} /> : null,
              <MenuItem
                key={link.label}
                onClick={() => {
                  setUserMenuAnchor(null);
                  if (link.onClick) link.onClick();
                  else if (link.path) navigate(link.path);
                }}
                sx={isLogout ? { color: colors.error, "& svg": { color: colors.error } } : undefined}
              >
                {link.icon &&
                  React.cloneElement(link.icon as React.ReactElement, {
                    size: 16,
                    strokeWidth: 1.75,
                    color: isLogout ? colors.error : colors.textMuted,
                  })}
                {link.label}
              </MenuItem>,
            ];
          })}
        </Menu>

        <NotificationMenu
          anchorEl={notificationsAnchor}
          onClose={() => setNotificationsAnchor(null)}
          onNotificationClick={(notification) => {
            openNotificationTarget(notification.actionUrl);
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(AppBarComponent);
