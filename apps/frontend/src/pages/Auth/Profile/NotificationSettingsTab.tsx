import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import * as UserService from "../../../services/userService";
import {
  NOTIFICATION_SETTING_GROUPS,
  getNotificationSettings,
  NotificationSettingKey,
} from "../../../constants/notificationSettings.constants";
import { PanelHeader } from "../../../components/Layout";

// Todos los grupos se muestran en la configuración. Las claves controlan el
// filtrado en el NotificationContext (tanto notificaciones nuevas como
// cargadas), de modo que desactivar un tipo lo oculta para este usuario.
const HIDDEN_GROUP_IDS = new Set<string>([]);

const NotificationSettingsTab: React.FC = () => {
  const theme = useTheme();
  const { currentUser, setUser } = useAuthContext();
  const { showNotification } = useAppNotifications();
  const [settings, setSettings] = useState(() =>
    getNotificationSettings(currentUser?.settings),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const firstRenderRef = useRef(true);
  const requestSeqRef = useRef(0);
  const userRef = useRef(currentUser);
  const pendingSettingsRef = useRef(settings);
  userRef.current = currentUser;
  pendingSettingsRef.current = settings;

  // Solo los grupos visibles cuentan para el estado y el switch maestro, para
  // que el encabezado coincida con lo que el usuario ve en pantalla.
  const visibleGroups = useMemo(
    () => NOTIFICATION_SETTING_GROUPS.filter((group) => !HIDDEN_GROUP_IDS.has(group.id)),
    [],
  );
  const visibleKeys = useMemo(
    () => visibleGroups.flatMap((group) => group.items.map((item) => item.key)),
    [visibleGroups],
  );

  const allEnabled = useMemo(
    () => visibleKeys.every((key) => settings[key]),
    [settings, visibleKeys],
  );

  const persist = useCallback(
    async (next: Record<NotificationSettingKey, boolean>) => {
      const user = userRef.current;
      if (!user?.id) return;
      const seq = ++requestSeqRef.current;
      setSaving(true);
      try {
        const updatedUser = await UserService.updateUserSettings(user.id, {
          notifications: next,
        });
        // Ignore stale responses that resolved out of order (last write wins in DB)
        if (seq !== requestSeqRef.current) {
          return;
        }
        // Use the freshest settings from the server (merge preserves other keys)
        setUser({
          ...user,
          settings: (updatedUser.settings as Record<string, unknown> | undefined) ?? user.settings,
        });
        setSaved(true);
      } catch (error) {
        if (seq !== requestSeqRef.current) {
          return;
        }
        showNotification("Error al guardar la configuración de notificaciones", {
          severity: "error",
          duration: 5000,
        });
      } finally {
        if (seq === requestSeqRef.current) {
          setSaving(false);
        }
      }
    },
    [setUser, showNotification],
  );

  // Debounced auto-save (500ms) — same pattern as the AppBar dock sync.
  // Skips the initial mount so opening the tab doesn't fire a redundant save.
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = undefined;
      persist(settings);
    }, 500);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [settings, persist]);

  // Flush any pending change when the tab unmounts (e.g. switching tabs),
  // so a toggle within the debounce window isn't lost. persist is stable,
  // so this cleanup only runs on unmount.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        persist(pendingSettingsRef.current);
      }
    };
  }, [persist]);

  const handleToggle = useCallback((key: NotificationSettingKey, value: boolean) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleAll = useCallback(
    (value: boolean) => {
      setSaved(false);
      setSettings((prev) => {
        const next = { ...prev };
        visibleKeys.forEach((key) => {
          next[key] = value;
        });
        return next;
      });
    },
    [visibleKeys],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        border: theme.tokens.borders.paper,
        backgroundColor: theme.palette.background.paper,
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
        icon={<IconBell />}
        title="Notificaciones"
        description="Elige qué notificaciones quieres recibir en el sistema."
      />

      {/* Master toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 1.5,
          pr: 2,
          py: 1.25,
          borderRadius: "12px",
          mb: 1.5,
          backgroundColor: theme.tokens.colors.hoverSoft,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "10px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {allEnabled ? (
              <IconBell size={18} color={theme.palette.primary.contrastText} />
            ) : (
              <IconBellOff size={18} color={theme.palette.primary.contrastText} />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: theme.palette.text.primary }}
            >
              Todas las notificaciones
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary, display: "block" }}
            >
              {allEnabled
                ? "Todas las notificaciones están activadas"
                : "Algunas notificaciones están desactivadas"}
            </Typography>
          </Box>
        </Box>
        <Switch
          checked={allEnabled}
          disabled={saving}
          onChange={(event) => handleToggleAll(event.target.checked)}
          inputProps={{ "aria-label": "Todas las notificaciones" }}
          sx={{ flexShrink: 0 }}
        />
      </Box>

      {/* Groups */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: { xs: "visible", md: "auto" }, pr: { md: 0.5 } }}>
        {visibleGroups.map((group) => (
          <Box key={group.id} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: theme.palette.text.secondary,
                px: 1.5,
                mb: 0.75,
              }}
            >
              {group.title}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const checked = settings[item.key];
                return (
                  <Box
                    key={item.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: "12px",
                      transition: "background-color 0.15s",
                      "&:hover": {
                        backgroundColor:
                          theme.tokens.colors.hover,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          backgroundColor:
                            theme.tokens.colors.hover,
                          borderRadius: "10px",
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: checked ? theme.palette.primary.main : theme.palette.text.secondary,
                          transition: "color 0.2s ease",
                        }}
                      >
                        <Icon size={17} stroke={1.5} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary,
                            opacity: checked ? 1 : 0.55,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.72rem",
                            color: theme.palette.text.secondary,
                            display: "block",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={checked}
                      disabled={saving}
                      onChange={(event) => handleToggle(item.key, event.target.checked)}
                      inputProps={{ "aria-label": item.label }}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer — stable auto-save status (fixed text + subtle status dot) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pt: 2,
          mt: 1.5,
          borderTop: theme.tokens.borders.hairline,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.72rem",
            color: theme.palette.text.secondary,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          Los cambios se guardan automáticamente
          <Box
            component="span"
            aria-hidden
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: saving
                ? "#6366f1"
                : saved
                  ? "#22c55e"
                  : "transparent",
              transition: "background-color 0.3s ease",
              animation: saving ? "saveStatusPulse 1.2s ease-in-out infinite" : "none",
              "@keyframes saveStatusPulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.4, transform: "scale(0.7)" },
              },
            }}
          />
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationSettingsTab;
