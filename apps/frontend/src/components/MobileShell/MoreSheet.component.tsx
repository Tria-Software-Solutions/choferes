import React from "react";
import { Box, ButtonBase, SwipeableDrawer, Typography, useTheme } from "@mui/material";
import { IconChevronRight } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavIcon from "../NavIcon/NavIcon.component";
import UserAvatar from "../UserAvatar/UserAvatar.component";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { NAV_SHORT_LABELS } from "../../constants/appbar.constants";
import { APPBAR_MENU } from "../../constants/constants";
import { SAFE_AREA_BOTTOM, pressable } from "./mobileShell.constants";
import type { MobileTab } from "./MobileTabBar.component";
import type { UserLink } from "../../hooks/useAppNavigation";

interface MoreSheetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Secciones que no caben en la barra de pestañas. */
  links: MobileTab[];
  userLinks: UserLink[];
  currentUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
  } | null;
}

// Hoja inferior "Más": el resto de las secciones, la cuenta y las acciones de
// sesión. Se cierra arrastrándola hacia abajo, como en iOS y Android.
const MoreSheet: React.FC<MoreSheetProps> = ({ open, onOpen, onClose, links, userLinks, currentUser }) => {
  const { colors, borders } = useTheme().tokens;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const row = (
    key: string,
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    opts: { active?: boolean; danger?: boolean; chevron?: boolean } = {},
  ) => (
    <ButtonBase
      key={key}
      onClick={() => {
        onClose();
        onClick();
      }}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        gap: 1.5,
        minHeight: 52,
        px: 2,
        borderRadius: "12px",
        textAlign: "left",
        color: opts.danger ? colors.error : opts.active ? colors.accent : colors.text,
        backgroundColor: opts.active ? colors.accentSoft : "transparent",
        ...pressable,
      }}
    >
      <Box sx={{ display: "flex", color: opts.danger ? colors.error : opts.active ? colors.accent : colors.textMuted }}>
        {icon}
      </Box>
      <Typography component="span" sx={{ flex: 1, fontSize: "0.9375rem", fontWeight: opts.active ? 700 : 500 }}>
        {label}
      </Typography>
      {opts.chevron && <IconChevronRight size={18} color={colors.textSubtle} />}
    </ButtonBase>
  );

  const accountLinks = userLinks.filter((l) => l.label !== APPBAR_MENU.LOGOUT);
  const logout = userLinks.find((l) => l.label === APPBAR_MENU.LOGOUT);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableSwipeToOpen
      keepMounted={false}
      PaperProps={{
        sx: {
          maxHeight: "86dvh",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: colors.surface,
          backgroundImage: "none",
          border: borders.paper,
          borderBottom: "none",
          pb: SAFE_AREA_BOTTOM,
        },
      }}
    >
      <Box aria-hidden sx={{ display: "grid", placeItems: "center", pt: 1, pb: 0.5 }}>
        <Box sx={{ width: 36, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
      </Box>

      {currentUser && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5 }}>
          <UserAvatar user={currentUser} size={44} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }} noWrap>
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }} noWrap>
              {currentUser.email}
            </Typography>
          </Box>
          <ThemeToggle />
        </Box>
      )}

      <Box sx={{ overflowY: "auto", px: 1, pb: 1 }}>
        {links.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, mb: 1 }}>
            {links.map((link) =>
              row(
                link.path,
                NAV_SHORT_LABELS[link.label] ?? link.label,
                <NavIcon label={link.label} size={22} stroke={1.6} />,
                () => navigate(link.path),
                { active: pathname === link.path || pathname.startsWith(`${link.path}/`), chevron: true },
              ),
            )}
          </Box>
        )}

        <Box sx={{ borderTop: borders.hairline, pt: 1, display: "flex", flexDirection: "column", gap: 0.25 }}>
          {accountLinks.map((link) =>
            row(
              link.label,
              link.label,
              link.icon,
              () => (link.onClick ? link.onClick() : link.path && navigate(link.path)),
              { active: Boolean(link.path) && pathname.startsWith(link.path as string), chevron: true },
            ),
          )}
          {logout && row(logout.label, logout.label, logout.icon, () => logout.onClick?.(), { danger: true })}
        </Box>

        <Typography sx={{ textAlign: "center", fontSize: "0.65rem", color: colors.textMuted, py: 1.5 }}>
          Powered by Tria · © {new Date().getFullYear()} Choferes de Alquiler
        </Typography>
      </Box>
    </SwipeableDrawer>
  );
};

export default MoreSheet;
