import React, { useMemo } from "react";
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
import { IconApps, IconArrowDown, IconArrowUp, IconRotate } from "@tabler/icons-react";
import NavIcon from "../../../components/NavIcon/NavIcon.component";
import { useMenuPreferences } from "../../../hooks/useMenuPreferences";
import APPBAR_MENU from "../../../constants/appbar.constants";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import TopNav from "../../../components/AppBar/TopNav.component";
import { useAuthContext } from "../../../context/AuthContext";
import { PanelHeader } from "../../../components/Layout";

const DOCK_MENU_KEYS = [
  APPBAR_MENU.MY_PANEL,
  APPBAR_MENU.EMPLOYEES,
  APPBAR_MENU.SCHEDULES,
  APPBAR_MENU.ROLES,
  APPBAR_MENU.VEHICLES,
  APPBAR_MENU.DASHBOARD,
  APPBAR_MENU.TASKS,
  APPBAR_MENU.PROFILE,
];

const DOCK_MENU_PERMISSIONS: Record<string, string> = {
  [APPBAR_MENU.MY_PANEL]: PERMISSION_CODES.VIEW_MY_PANEL,
  [APPBAR_MENU.EMPLOYEES]: PERMISSION_CODES.VIEW_EMPLOYEES,
  [APPBAR_MENU.SCHEDULES]: PERMISSION_CODES.VIEW_SCHEDULES,
  [APPBAR_MENU.ROLES]: PERMISSION_CODES.VIEW_ROLES,
  [APPBAR_MENU.VEHICLES]: PERMISSION_CODES.VIEW_VEHICLES,
  [APPBAR_MENU.DASHBOARD]: PERMISSION_CODES.VIEW_ADMIN,
  [APPBAR_MENU.TASKS]: PERMISSION_CODES.VIEW_TASKS,
};

const QuickAccessTab: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();

  // Solo se listan (y se pueden ordenar u ocultar) los accesos que los
  // permisos del rol permiten ver — los mismos que arma la barra superior.
  const allowedKeys = useMemo(
    () =>
      DOCK_MENU_KEYS.filter((key) => {
        const requiredPermission = DOCK_MENU_PERMISSIONS[key];
        if (!requiredPermission) return true; // sin permiso requerido (Configuración)
        return Array.isArray(userPermissions) && userPermissions.includes(requiredPermission);
      }),
    [userPermissions],
  );

  const { preferences, itemOrder, toggleMenu, moveItem, resetDefaults } =
    useMenuPreferences(allowedKeys);

  const orderedKeys = itemOrder.filter((key) => allowedKeys.includes(key));

  const previewItems = orderedKeys
    .filter((key) => preferences[key] !== false)
    .filter((key) => key !== APPBAR_MENU.PROFILE)
    .map((key) => ({
      label: key,
      icon: <NavIcon label={key} />,
    }));
  const visibleCount = previewItems.length;

  // Mueve un acceso respecto a su vecino visible en la lista (los índices de la
  // lista filtrada pueden no coincidir con los del orden guardado).
  const moveKey = (key: string, direction: -1 | 1) => {
    const neighbor = orderedKeys[orderedKeys.indexOf(key) + direction];
    if (!neighbor) return;
    moveItem(itemOrder.indexOf(key), itemOrder.indexOf(neighbor));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "14px",
        border: theme.tokens.borders.paper,
        backgroundColor: theme.tokens.colors.surface,
        boxShadow: `0 1px 2px ${theme.tokens.shadows.card}`,
        display: "flex",
        flexDirection: "column",
        height: { xs: "calc(100dvh - 240px)", md: "100%" },
        minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <PanelHeader
        icon={<IconApps />}
        title="Accesos rápidos"
        description={visibleCount === 0
            ? "No tienes accesos visibles"
            : `${visibleCount} ${visibleCount === 1 ? "acceso visible" : "accesos visibles"} en la barra superior`}
      />

      {/* Preview of the top navigation bar */}
      <Box sx={{ mb: 2.5, flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", mb: 1 }}>
          Vista previa de la barra superior
        </Typography>
        <Box
          sx={{
            p: 1,
            borderRadius: "12px",
            border: theme.tokens.borders.paper,
            backgroundColor: theme.tokens.colors.appBarBg,
            overflowX: "auto",
            maxWidth: "100%",
          }}
        >
          {previewItems.length > 0 ? (
            <TopNav links={previewItems} compact={isSmallScreen} />
          ) : (
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", px: 1, py: 0.75 }}>
              Ningún acceso visible
            </Typography>
          )}
        </Box>
      </Box>

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
                  : theme.tokens.colors.hoverSoft,
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
                      aria-label={`Mover ${key} hacia arriba`}
                      disabled={index === 0}
                      onClick={() => moveKey(key, -1)}
                    >
                      <IconArrowUp size={14} />
                    </IconButton>
                  </span>
                </PremiumTooltip>
                <PremiumTooltip title="Mover abajo">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Mover ${key} hacia abajo`}
                      disabled={index === orderedKeys.length - 1}
                      onClick={() => moveKey(key, 1)}
                    >
                      <IconArrowDown size={14} />
                    </IconButton>
                  </span>
                </PremiumTooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Switch
                  checked={isVisible}
                  onChange={() => toggleMenu(key)}
                  inputProps={{ "aria-label": `Mostrar ${key} en la barra superior` }}
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
            startIcon={<IconRotate size={14} />}
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
