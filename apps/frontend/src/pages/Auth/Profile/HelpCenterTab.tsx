import React, { Fragment, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
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
  ArrowRight,
  Users,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
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

type HelpTopic = "guide" | "support" | "faq";

const HELP_TOPICS: {
  id: HelpTopic;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "guide",
    title: "Guía rápida",
    description: "Aprende los conceptos básicos de la plataforma",
    icon: BookOpen,
  },
  {
    id: "support",
    title: "Soporte técnico",
    description: "Contacta al equipo de soporte de la aplicación",
    icon: LifeBuoy,
  },
  {
    id: "faq",
    title: "Preguntas frecuentes",
    description: "Encuentra respuestas a las dudas más comunes",
    icon: MessageCircleQuestion,
  },
];

// Quick-guide steps with permission-gated navigation
const GUIDE_STEPS: {
  icon: React.ElementType;
  title: string;
  description: string;
  permission?: string;
  route: string;
  button: string;
}[] = [
  {
    icon: Users,
    title: "Registra empleados",
    description: "Agrega a los choferes con sus datos personales en la sección de empleados.",
    permission: PERMISSIONS.VIEW_EMPLOYEES,
    route: ROUTES.EMPLOYEES,
    button: "Ir a empleados",
  },
  {
    icon: CalendarDays,
    title: "Crea horarios y turnos",
    description: "Define los horarios y los días de la semana en que aplica cada turno.",
    permission: PERMISSIONS.VIEW_SCHEDULES,
    route: ROUTES.SCHEDULES,
    button: "Ir a horarios",
  },
  {
    icon: ClipboardList,
    title: "Asigna empleados a las fechas",
    description: "En la vista de roles asigna un empleado y un horario a cada día de la semana.",
    permission: PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
    route: ROUTES.ROLES,
    button: "Ir a roles",
  },
  {
    icon: LayoutDashboard,
    title: "Revisa horas y reportes",
    description: "Consulta los resúmenes semanal, quincenal y mensual de horas trabajadas.",
    permission: PERMISSIONS.VIEW_WEEKLY_SUMMARY,
    route: ROUTES.DASHBOARD,
    button: "Ir a reportes",
  },
];

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    label: "Correo electrónico",
    value: "support@triacr.com",
    href: "mailto:support@triacr.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+506 6216 4040",
    href: "https://wa.me/50662164040",
  },
  {
    icon: Clock,
    label: "Horario de atención",
    value: "Lunes a viernes, 8:00 a.m. – 6:00 p.m.",
  },
];

const HelpCenterTab: React.FC = () => {
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const [activeTopic, setActiveTopic] = useState<HelpTopic>("guide");
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

      {/* Selectable Topics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: { xs: 1, sm: 1.5 },
          mb: 2.5,
          flexShrink: 0,
        }}
      >
        {HELP_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isActive = activeTopic === topic.id;
          return (
            <Box
              key={topic.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTopic(topic.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTopic(topic.id);
                }
              }}
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: "12px",
                cursor: "pointer",
                border: `1.5px solid ${
                  isActive
                    ? theme.palette.primary.main
                    : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)"
                }`,
                backgroundColor: isActive
                  ? theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)"
                  : "transparent",
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
                    p: { xs: 0.75, sm: 1 },
                    borderRadius: "10px",
                    backgroundColor: isActive
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.main,
                    display: "flex",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} />
                </Box>
                {isActive && (
                  <CheckCircle2 size={16} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
                )}
              </Box>
              <Typography
                sx={{
                  fontWeight: isActive ? 700 : 650,
                  fontSize: { xs: "0.72rem", sm: "0.85rem" },
                  lineHeight: 1.25,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  transition: "color 0.2s ease",
                }}
              >
                {topic.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  lineHeight: 1.45,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {topic.description}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Content — changes with the selected topic */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }} key={activeTopic}>
        {activeTopic === "guide" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {GUIDE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const visible = !step.permission || userCanSee(step.permission);
              if (!visible) return null;
              return (
                <Box
                  key={step.title}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    gap: 1.5,
                    px: 1.5,
                    py: 1.5,
                    borderRadius: "12px",
                    border: `1px solid ${
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                    }`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 650, fontSize: "0.85rem", color: "text.primary", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Icon size={15} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.45, mt: 0.25 }}>
                      {step.description}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: "100%", sm: "auto" }, display: "flex", justifyContent: { xs: "flex-end", sm: "flex-start" } }}>
                    <Typography
                      component={RouterLink}
                      to={step.route}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {step.button}
                      <ArrowRight size={13} />
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {activeTopic === "support" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                }`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: "12px",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: theme.palette.primary.main,
                  display: "flex",
                }}
              >
                <LifeBuoy size={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
                  ¿Necesitas ayuda con la plataforma?
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.45 }}>
                  El equipo de soporte está disponible para resolver cualquier duda o inconveniente.
                </Typography>
              </Box>
            </Box>

            {SUPPORT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <Box
                  key={channel.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      color: theme.palette.primary.main,
                    }}
                  >
                    <Icon size={17} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary", display: "block" }}>
                      {channel.label}
                    </Typography>
                    {channel.href ? (
                      <Typography
                        component="a"
                        href={channel.href}
                        target={channel.href.startsWith("http") ? "_blank" : undefined}
                        rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                          display: "inline",
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {channel.value}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}>
                        {channel.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}

          </Box>
        )}

        {activeTopic === "faq" && (
          <>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <Box
                    key={faq.question}
                    sx={{
                      borderRadius: "12px",
                      border: `1px solid ${
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                      }`,
                      backgroundColor: "transparent",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                      "&:hover": {
                        borderColor:
                          theme.palette.mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)",
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
                          backgroundColor:
                            theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          color: theme.palette.text.secondary,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <HelpCircle size={15} strokeWidth={2} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: theme.palette.text.primary,
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
                          color: theme.palette.text.secondary,
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
                          borderLeft: `2px solid ${
                            theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
                          }`,
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
          </>
        )}
      </Box>

      {/* Quick access footer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          mt: 2.5,
          p: { xs: 1.5, sm: 2 },
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
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
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
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              lineHeight: 1.45,
              display: { xs: "none", sm: "block" },
            }}
          >
            Contacta al administrador del sistema o visita las secciones de la plataforma para
            obtener más información.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
          {(
            [
              { label: APPBAR_MENU.SCHEDULES, route: ROUTES.SCHEDULES, canSee: userCanSee(PERMISSIONS.VIEW_SCHEDULES) },
              { label: APPBAR_MENU.VEHICLES, route: ROUTES.VEHICLES, canSee: userCanSee(PERMISSIONS.VIEW_VEHICLES) },
              { label: APPBAR_MENU.EMPLOYEES, route: ROUTES.EMPLOYEES, canSee: userCanSee(PERMISSIONS.VIEW_EMPLOYEES) },
            ].filter((item) => item.canSee)
          ).map(({ label, route }, index) => (
            <Fragment key={route}>
              {index > 0 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    alignSelf: "center",
                    height: 16,
                    borderColor:
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                  }}
                />
              )}
              <Typography
                component={RouterLink}
                to={route}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {label}
              </Typography>
            </Fragment>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default HelpCenterTab;
