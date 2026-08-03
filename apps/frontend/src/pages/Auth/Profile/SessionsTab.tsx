import React, { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  MonitorSmartphone,
  LogOut,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuthContext } from "../../../context/AuthContext";

const SessionsTab: React.FC = () => {
  const theme = useTheme();
  const { currentUser, loggedInAt, logout } = useAuthContext();

  const deviceInfo = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    const os = (() => {
      if (/Windows/i.test(ua)) return "Windows";
      if (/Mac OS/i.test(ua)) return "macOS";
      if (/Android/i.test(ua)) return "Android";
      if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
      if (/Linux/i.test(ua)) return "Linux";
      return "Desconocido";
    })();
    const browser = (() => {
      if (/Edg\//i.test(ua)) return "Edge";
      if (/Chrome\//i.test(ua)) return "Chrome";
      if (/Firefox\//i.test(ua)) return "Firefox";
      if (/Safari\//i.test(ua)) return "Safari";
      return "Navegador";
    })();
    return { isMobile, isTablet, os, browser };
  }, []);

  const DeviceIcon = deviceInfo.isMobile
    ? Smartphone
    : deviceInfo.isTablet
      ? MonitorSmartphone
      : Laptop;

  const loginDate = loggedInAt ? new Date(loggedInAt) : null;

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
        height: { xs: "auto", md: "100%" },
        minHeight: { xs: "calc(100dvh - 240px)", md: 0 },
        overflow: "auto",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
          <Box sx={{ color: theme.palette.primary.main, display: "flex", alignItems: "center" }}>
            <ShieldCheck size={20} strokeWidth={1.5} />
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
            Sesiones activas
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", letterSpacing: "0.02em", ml: 5 }}
        >
          Dispositivos donde tienes tu cuenta abierta
        </Typography>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, mb: 2 }} />

      <Box sx={{ flex: 1, minHeight: 0 }}>
      {/* Current session */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(99, 179, 237, 0.25)"
              : "rgba(21, 101, 192, 0.2)"
          }`,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(99, 179, 237, 0.08)"
              : "rgba(21, 101, 192, 0.05)",
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 1.25,
            borderRadius: "10px",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <DeviceIcon size={20} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
              Esta sesión
            </Typography>
            <Chip
              label="Activa"
              size="small"
              color="primary"
              sx={{ fontSize: "0.62rem", height: 18, "& .MuiChip-label": { px: 0.75 } }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.5 }}>
            {deviceInfo.browser} en {deviceInfo.os}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            Iniciada el {loginDate
              ? format(loginDate, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
              : "hoy"}
          </Typography>
        </Box>
      </Box>

      {/* Other sessions */}
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
          }`,
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 0.25 }}>
          Otros dispositivos
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.5 }}>
          Solo puedes ver tu sesión actual desde este dispositivo. Tu acceso se guarda de forma
          segura en este navegador con tokens de sesión renovables.
        </Typography>
      </Box>
      </Box>

      {/* Sign out everywhere */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          pt: 3,
          mt: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
          }`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box sx={{ color: theme.palette.warning.main, display: "flex", flexShrink: 0 }}>
            <AlertTriangle size={20} strokeWidth={1.5} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 650, fontSize: "0.85rem", color: "text.primary" }}>
              Cerrar sesión en todos los dispositivos
            </Typography>
            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {currentUser?.username ?? "Tu cuenta"} quedará cerrada en cualquier equipo donde
              tengas la sesión abierta.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={15} />}
          onClick={logout}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            fontSize: "0.78rem",
            px: 2.5,
            py: 1,
          }}
        >
          Cerrar todas las sesiones
        </Button>
      </Box>
    </Paper>
  );
};

export default SessionsTab;
