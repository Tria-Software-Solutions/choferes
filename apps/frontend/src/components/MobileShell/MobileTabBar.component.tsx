import React from "react";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import { IconDots } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavIcon from "../NavIcon/NavIcon.component";
import { NAV_SHORT_LABELS } from "../../constants/appbar.constants";
import { getPlatform } from "../../utils/platform";
import { MOBILE_TAB_BAR_HEIGHT, SAFE_AREA_BOTTOM, pressable } from "./mobileShell.constants";

export interface MobileTab {
  label: string;
  path: string;
}

interface MobileTabBarProps {
  tabs: MobileTab[];
  moreActive: boolean;
  moreOpen: boolean;
  onMore: () => void;
}

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

// Barra de pestañas inferior. iOS: superficie translúcida con ícono tintado.
// Android (Material 3): ícono sobre una "píldora" de indicador.
const MobileTabBar: React.FC<MobileTabBarProps> = ({ tabs, moreActive, moreOpen, onMore }) => {
  const { colors, borders } = useTheme().tokens;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAndroid = getPlatform() === "android";

  const renderTab = (key: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void) => (
    <ButtonBase
      key={key}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      sx={{
        flex: 1,
        minWidth: 0,
        height: MOBILE_TAB_BAR_HEIGHT,
        flexDirection: "column",
        gap: isAndroid ? 0.25 : 0.125,
        color: active ? colors.accent : colors.textMuted,
        ...pressable,
        "&:active": { opacity: 0.6, transform: "none" },
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          height: isAndroid ? 28 : 26,
          width: isAndroid ? 56 : 32,
          borderRadius: "999px",
          backgroundColor: isAndroid && active ? colors.accentSoft : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        {icon}
      </Box>
      <Typography
        component="span"
        noWrap
        sx={{ fontSize: "0.625rem", fontWeight: active ? 700 : 500, lineHeight: 1.1, maxWidth: "100%", px: 0.25 }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: "flex",
        pb: SAFE_AREA_BOTTOM,
        backgroundColor: colors.appBarBg,
        borderTop: borders.hairline,
        "@supports (backdrop-filter: blur(1px))": {
          backgroundColor: `${colors.appBarBg}E6`,
          backdropFilter: "saturate(180%) blur(18px)",
        },
      }}
    >
      {tabs.map((tab) =>
        renderTab(
          tab.path,
          NAV_SHORT_LABELS[tab.label] ?? tab.label,
          <NavIcon label={tab.label} size={isAndroid ? 22 : 24} stroke={isActivePath(pathname, tab.path) ? 2 : 1.6} />,
          isActivePath(pathname, tab.path),
          () => navigate(tab.path),
        ),
      )}
      {renderTab(
        "more",
        "Más",
        <IconDots size={isAndroid ? 22 : 24} stroke={moreActive || moreOpen ? 2 : 1.6} />,
        moreActive || moreOpen,
        onMore,
      )}
    </Box>
  );
};

export default MobileTabBar;
