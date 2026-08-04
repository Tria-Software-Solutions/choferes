import React from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Blocks, ArrowUp, ArrowDown, RotateCcw, NotepadText, ChartNoAxesCombined, CircleParking, UsersRound, CalendarDays, Settings } from "lucide-react";
import { useMenuPreferences } from "../../../hooks/useMenuPreferences";
import APPBAR_MENU from "../../../constants/appbar.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import Dock from "../../../components/Dock/Dock.component";
import { useAuthContext } from "../../../context/AuthContext";

const DOCK_MENU_KEYS = [
  APPBAR_MENU.ROLES,
  APPBAR_MENU.DASHBOARD,
  APPBAR_MENU.VEHICLES,
  APPBAR_MENU.EMPLOYEES,
  APPBAR_MENU.SCHEDULES,
  APPBAR_MENU.PROFILE,
];

const DOCK_MENU_PERMISSIONS: Record<string, string> = {
  [APPBAR_MENU.ROLES]: PERMISSIONS.VIEW_ROLES,
  [APPBAR_MENU.DASHBOARD]: PERMISSIONS.VIEW_ADMIN,
  [APPBAR_MENU.VEHICLES]: PERMISSIONS.VIEW_VEHICLES,
  [APPBAR_MENU.EMPLOYEES]: PERMISSIONS.VIEW_EMPLOYEES,
  [APPBAR_MENU.SCHEDULES]: PERMISSIONS.VIEW_SCHEDULES,
};

const DOCK_MENU_ICONS: Record<string, React.ReactNode> = {
  [APPBAR_MENU.ROLES]: <NotepadText size={22} strokeWidth={1.5} />,
  [APPBAR_MENU.DASHBOARD]: <ChartNoAxesCombined size={22} strokeWidth={1.5} />,
  [APPBAR_MENU.VEHICLES]: <CircleParking size={22} strokeWidth={1.5} />,
  [APPBAR_MENU.EMPLOYEES]: <UsersRound size={22} strokeWidth={1.5} />,
  [APPBAR_MENU.SCHEDULES]: <CalendarDays size={22} strokeWidth={1.5} />,
  [APPBAR_MENU.PROFILE]: <Settings size={22} strokeWidth={1.5} />,
};

const QuickAccessTab: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();
  const { preferences, itemOrder, toggleMenu, moveItem, resetDefaults } =
    useMenuPreferences(DOCK_MENU_KEYS);

  const orderedKeys = itemOrder.filter((key) => DOCK_MENU_KEYS.includes(key));
  const visibleCount = orderedKeys.filter((key) => preferences[key] !== false).length;

  const previewItems = orderedKeys
    .filter((key) => preferences[key] !== false)
    .filter((key) => {
      const requiredPermission = DOCK_MENU_PERMISSIONS[key];
      if (!requiredPermission) return true; // no permission required (e.g. Configuración)
      return (
        Array.isArray(userPermissions) &&
        userPermissions.includes(requiredPermission)
      );
    })
    .map((key) => ({
      label: key,
      icon: DOCK_MENU_ICONS[key],
      onClick: () => {},
      active: false,
    }));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        border: `1px solid ${
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
        }`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        height: { xs: "calc(100dvh - 240px)", md: "100%" },
        minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
          <Box sx={{ color: theme.palette.primary.main, display: "flex", alignItems: "center" }}>
            <Blocks size={20} strokeWidth={1.5} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.15rem",
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Accesos rápidos
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", letterSpacing: "0.02em", ml: 5 }}
        >
          {visibleCount === 0
            ? "No tienes accesos visibles"
            : `${visibleCount} ${visibleCount === 1 ? "acceso visible" : "accesos visibles"} en la barra superior`}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, mb: 1.5 }} />

      {/* Dock preview - exact copy of the real dock */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.75,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.primary" }}>
            Vista previa del dock
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
            {visibleCount === 0
              ? "Ningún acceso visible"
              : `${orderedKeys.length - visibleCount === 0 ? "Todos" : `${orderedKeys.length - visibleCount} oculto${orderedKeys.length - visibleCount === 1 ? "" : "s"}`}`}
          </Typography>
        </Box>

        <Box sx={{ borderRadius: "16px", overflowX: "auto", maxWidth: "100%" }}>
          <Dock
            items={previewItems}
            itemPreferences={preferences}
            itemOrder={itemOrder}
            distance={isSmallScreen ? 100 : 150}
            baseItemSize={isSmallScreen ? 36 : 44}
            magnification={isSmallScreen ? 46 : 58}
            spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
          />
        </Box>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, mb: 1.5 }} />

      {/* Item list */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", mb: 1 }}>
        {orderedKeys.map((key, index) => {
          const isVisible = preferences[key] !== false;
          return (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1.25,
                px: 1.5,
                borderRadius: "12px",
                mb: 0.5,
                backgroundColor: isVisible
                  ? "transparent"
                  : theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.025)",
                transition: "background-color 0.15s",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : theme.palette.action.hover,
                },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: isVisible ? "text.primary" : "text.secondary",
                  }}
                >
                  {key}
                </Typography>
                {!isVisible && (
                  <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                    Oculto en la barra superior
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                <PremiumTooltip title="Mover arriba">
                  <span>
                    <IconButton
                      size="small"
                      disabled={index === 0}
                      onClick={() => moveItem(index, index - 1)}
                    >
                      <ArrowUp size={14} />
                    </IconButton>
                  </span>
                </PremiumTooltip>
                <PremiumTooltip title="Mover abajo">
                  <span>
                    <IconButton
                      size="small"
                      disabled={index === orderedKeys.length - 1}
                      onClick={() => moveItem(index, index + 1)}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                  </span>
                </PremiumTooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Switch
                  checked={isVisible}
                  onChange={() => toggleMenu(key)}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer actions */}
      <Box sx={{ mt: { xs: 2, md: 2.5 }, flexShrink: 0 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Los cambios se reflejan al instante en la barra superior y se guardan automáticamente.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RotateCcw size={14} />}
            onClick={resetDefaults}
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          >
            Restaurar valores
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default QuickAccessTab;
