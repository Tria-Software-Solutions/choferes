import React, { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  HelpCircle,
  ChevronDown,
  MessageCircleQuestion,
  LifeBuoy,
  BookOpen,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes.constants";
import APPBAR_MENU from "../../../constants/appbar.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import { useAuthContext } from "../../../context/AuthContext";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "¿Cómo agendo un servicio de mensajería?",
    answer:
      "Ve a la sección de Mensajería desde el menú superior, completa el formulario con los datos del envío y confirma. El sistema te mostrará el estado del servicio en tiempo real.",
  },
  {
    question: "¿Cómo puedo cambiar mi contraseña?",
    answer:
      "Entra a Configuración → Contraseña y Seguridad. Allí puedes actualizar tu contraseña ingresando tu contraseña actual y la nueva. Debe cumplir con los requisitos mínimos de seguridad.",
  },
  {
    question: "¿Qué hago si olvidé mi contraseña?",
    answer:
      "En la pantalla de inicio de sesión selecciona la opción de recuperación. Si no puedes restablecerla, contacta al administrador del sistema para que te asigne una nueva.",
  },
  {
    question: "¿Cómo personalizo los accesos rápidos?",
    answer:
      "Entra a Configuración → Accesos rápidos. Desde allí puedes mostrar u ocultar los elementos de la barra superior y cambiar su orden arrastrándolos. Los cambios se guardan automáticamente.",
  },
  {
    question: "¿Cómo se notifican los cambios en los servicios?",
    answer:
      "Las notificaciones aparecen en el ícono de campana de la barra superior. Puedes marcarlas como leídas, filtrarlas por prioridad y administrarlas desde Configuración → Notificaciones.",
  },
];

const HELP_TOPICS = [
  {
    title: "Guía rápida",
    description: "Aprende los conceptos básicos de la plataforma",
    icon: BookOpen,
    action: "Ver guía",
  },
  {
    title: "Soporte técnico",
    description: "Contacta al equipo de soporte de la aplicación",
    icon: LifeBuoy,
    action: "Contactar",
  },
  {
    title: "Preguntas frecuentes",
    description: "Encuentra respuestas a las dudas más comunes",
    icon: MessageCircleQuestion,
    action: "Explorar",
  },
];

const HelpCenterTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userPermissions } = useAuthContext();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const userCanSee = (permission: string) =>
    Array.isArray(userPermissions) && userPermissions.includes(permission);

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
        minHeight: 0,
        overflow: "auto",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
          <Box sx={{ color: theme.palette.primary.main, display: "flex", alignItems: "center" }}>
            <HelpCircle size={20} strokeWidth={1.5} />
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
            Centro de ayuda
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", letterSpacing: "0.02em", ml: 5 }}
        >
          Recursos y guías para aprovechar al máximo la plataforma
        </Typography>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, mb: 2 }} />

      {/* Topics */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
        {HELP_TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <Box
              key={topic.title}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                }`,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "10px",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    color: theme.palette.primary.main,
                    display: "flex",
                  }}
                >
                  <Icon size={18} />
                </Box>
                <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                  {topic.action}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 650, fontSize: "0.85rem", color: "text.primary" }}>
                {topic.title}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.45 }}>
                {topic.description}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* FAQ */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "text.primary",
          mb: 1,
        }}
      >
        Preguntas frecuentes
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        {FAQS.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <Box
              key={faq.question}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${
                  isOpen
                    ? "rgba(139,92,246,0.35)"
                    : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)"
                }`,
                backgroundColor: isOpen
                  ? theme.palette.mode === "dark"
                    ? "rgba(139,92,246,0.05)"
                    : "rgba(139,92,246,0.03)"
                  : "transparent",
                transition: "all 0.2s ease",
                overflow: "hidden",
                "&:hover": {
                  borderColor: isOpen
                    ? "rgba(139,92,246,0.35)"
                    : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(0,0,0,0.16)",
                },
              }}
            >
              <Button
                fullWidth
                onClick={() => setOpenFaq(isOpen ? null : index)}
                sx={{
                  justifyContent: "flex-start",
                  gap: 1.5,
                  textTransform: "none",
                  borderRadius: "12px",
                  py: 1.5,
                  px: 2,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "text.primary",
                  textAlign: "left",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "9px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isOpen
                      ? theme.palette.mode === "dark"
                        ? "rgba(139,92,246,0.2)"
                        : "rgba(139,92,246,0.12)"
                      : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    color: isOpen
                      ? "#a78bfa"
                      : theme.palette.text.secondary,
                    transition: "all 0.2s ease",
                  }}
                >
                  <HelpCircle size={15} strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: isOpen ? 700 : 600,
                      fontSize: "0.85rem",
                      color: isOpen
                        ? "#a78bfa"
                        : theme.palette.text.primary,
                      lineHeight: 1.3,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
                <ChevronDown
                  size={16}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                    color: isOpen
                      ? "#a78bfa"
                      : theme.palette.text.secondary,
                  }}
                />
              </Button>
              <Collapse in={isOpen}>
                <Box
                  sx={{
                    mx: 2,
                    mt: 0.75,
                    mb: 1.75,
                    pl: 1.5,
                    borderLeft: "2px solid rgba(139,92,246,0.35)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.78rem",
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Quick access footer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mt: { xs: 2, md: 2.5 },
          p: 2,
          borderRadius: "12px",
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
          }`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            color: theme.palette.text.secondary,
          }}
        >
          <Mail size={18} strokeWidth={1.8} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary", mb: 0.25 }}>
            ¿No encuentras lo que buscas?
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.45 }}>
            Contacta al administrador del sistema o visita las secciones de la plataforma para
            obtener más información.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
          {userCanSee(PERMISSIONS.VIEW_SCHEDULES) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(ROUTES.SCHEDULES)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.72rem",
                borderRadius: "10px",
                px: 2,
              }}
            >
              {APPBAR_MENU.SCHEDULES}
            </Button>
          )}
          {userCanSee(PERMISSIONS.VIEW_VEHICLES) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(ROUTES.VEHICLES)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.72rem",
                borderRadius: "10px",
                px: 2,
              }}
            >
              {APPBAR_MENU.VEHICLES}
            </Button>
          )}
          {userCanSee(PERMISSIONS.VIEW_EMPLOYEES) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(ROUTES.EMPLOYEES)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.72rem",
                borderRadius: "10px",
                px: 2,
              }}
            >
              {APPBAR_MENU.EMPLOYEES}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default HelpCenterTab;
