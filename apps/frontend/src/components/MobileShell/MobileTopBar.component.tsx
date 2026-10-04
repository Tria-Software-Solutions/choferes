import React, { useState } from "react";
import { Badge, Box, ButtonBase, IconButton, Typography, useTheme } from "@mui/material";
import { IconBell, IconChevronLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getParentRoute } from "@choferes/shared";
import { useNotificationMenu } from "../../context/NotificationContext";
import NotificationMenu from "../NotificationMenu/NotificationMenu.component";
import { useNotificationNavigation } from "../../hooks/useNotificationNavigation";
import { NAV_SHORT_LABELS } from "../../constants/appbar.constants";
import { APPBAR_MENU, ROUTES } from "../../constants/constants";
import { getPlatform } from "../../utils/platform";
import { MOBILE_TOP_BAR_HEIGHT, SAFE_AREA_TOP, pressable } from "./mobileShell.constants";
import { useScreenChrome } from "./MobileScreenTitle";
import type { MobileTab } from "./MobileTabBar.component";

interface MobileTopBarProps {
  /** Todos los destinos conocidos, para resolver el título de la pantalla. */
  destinations: MobileTab[];
}

// Barra superior: título de la sección y, en pantallas de detalle, botón atrás.
// iOS centra el título; Android lo alinea a la izquierda (Material 3).
const MobileTopBar: React.FC<MobileTopBarProps> = ({ destinations }) => {
  const { colors, borders } = useTheme().tokens;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const openNotificationTarget = useNotificationNavigation();
  const { unreadCount } = useNotificationMenu();
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const isIos = getPlatform() === "ios";
  const screen = useScreenChrome();

  const current = destinations.find(
    (d) => pathname === d.path || pathname.startsWith(`${d.path}/`),
  );
  const parent = getParentRoute(pathname);
  const isDetail = Boolean(parent && current && parent === current.path);
  const showBack = isDetail || Boolean(screen.onBack);
  const title =
    screen.title ??
    (isDetail
      ? "Detalle"
      : current
        ? (NAV_SHORT_LABELS[current.label] ?? current.label)
        : APPBAR_MENU.TITLE_SIMPLIFIED);
  const sectionLabel = current ? (NAV_SHORT_LABELS[current.label] ?? current.label) : "Atrás";
  // iOS: un nombre largo pisaría el título centrado, así que se usa "Atrás".
  const backLabel = sectionLabel.length > 10 ? "Atrás" : sectionLabel;

  const goBack = () => {
    if (screen.onBack) {
      screen.onBack();
      return;
    }
    // idx > 0: hay una pantalla anterior dentro de la app; si no (enlace
    // directo o notificación), se sube a la ruta padre.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(parent ?? ROUTES.LOGIN, { replace: true });
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        pt: SAFE_AREA_TOP,
        backgroundColor: colors.appBarBg,
        borderBottom: borders.hairline,
        "@supports (backdrop-filter: blur(1px))": {
          backgroundColor: `${colors.appBarBg}E6`,
          backdropFilter: "saturate(180%) blur(18px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          height: MOBILE_TOP_BAR_HEIGHT,
          px: 1,
          gap: 0.5,
        }}
      >
        {showBack && (
          <ButtonBase
            onClick={goBack}
            aria-label={`Volver a ${sectionLabel}`}
            sx={{
              height: 44,
              minWidth: 44,
              pl: 0.25,
              pr: isIos ? 1 : 0.5,
              borderRadius: "10px",
              color: colors.accent,
              zIndex: 1,
              ...pressable,
            }}
          >
            <IconChevronLeft size={26} stroke={2} />
            {isIos && (
              <Typography component="span" sx={{ fontSize: "1rem", ml: -0.25 }}>
                {backLabel}
              </Typography>
            )}
          </ButtonBase>
        )}

        <Typography
          component="h1"
          noWrap
          sx={{
            fontSize: isIos ? "1.0625rem" : "1.25rem",
            fontWeight: isIos ? 700 : 600,
            letterSpacing: "-0.01em",
            color: colors.text,
            ...(isIos
              ? { position: "absolute", left: 72, right: 72, textAlign: "center", pointerEvents: "none" }
              : { flex: 1, pl: showBack ? 0 : 1 }),
          }}
        >
          {title}
        </Typography>

        <Box sx={{ flex: isIos ? 1 : 0 }} />
        <IconButton
          onClick={(event) => setNotificationsAnchor(event.currentTarget)}
          aria-label={
            unreadCount > 0
              ? `${APPBAR_MENU.NOTIFICATIONS} (${unreadCount} sin leer)`
              : APPBAR_MENU.NOTIFICATIONS
          }
          sx={{ width: 44, height: 44, zIndex: 1, ...pressable }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{ "& .MuiBadge-badge": { border: `2px solid ${colors.appBarBg}` } }}
          >
            <IconBell size={22} stroke={1.75} />
          </Badge>
        </IconButton>
      </Box>

      <NotificationMenu
        anchorEl={notificationsAnchor}
        onClose={() => setNotificationsAnchor(null)}
        onNotificationClick={(notification) => openNotificationTarget(notification.actionUrl)}
      />
    </Box>
  );
};

export default MobileTopBar;
