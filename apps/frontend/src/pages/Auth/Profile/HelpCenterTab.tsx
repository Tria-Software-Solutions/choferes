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
import { IconArrowRight, IconBeach, IconBook, IconCalendarTime, IconChevronDown, IconCircleCheck, IconClock, IconFolder, IconHelpCircle, IconLayoutDashboard, IconLifebuoy, IconListCheck, IconMail, IconMessageCircle, IconMessageQuestion, IconCalendarUser, IconChartBar, IconReceipt, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import { Link as RouterLink } from "react-router-dom";
import ROUTES from "../../../constants/routes.constants";
import APPBAR_MENU from "../../../constants/appbar.constants";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import { useAuthContext } from "../../../context/AuthContext";
import { PanelHeader } from "../../../components/Layout";

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
      "Entra a Configuración → Cuenta y seguridad. Allí puedes actualizar tu contraseña ingresando tu contraseña actual y la nueva. Debe cumplir con los requisitos mínimos de seguridad.",
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
    icon: IconBook,
  },
  {
    id: "support",
    title: "Soporte técnico",
    description: "Contacta al equipo de soporte de la aplicación",
    icon: IconLifebuoy,
  },
  {
    id: "faq",
    title: "Preguntas frecuentes",
    description: "Encuentra respuestas a las dudas más comunes",
    icon: IconMessageQuestion,
  },
];

// Quick-guide steps with permission-gated navigation. La guía se arma según lo
// que el rol puede usar: los pasos de gestión (con permiso de planilla,
// horarios, etc.) los ve Gerencia/Administrativo, y los de autoservicio
// (Mi Panel, tareas, cuenta) los ve cualquier empleado.
const GUIDE_STEPS: {
  icon: React.ElementType;
  title: string;
  description: string;
  permission?: string;
  route: string;
  button: string;
}[] = [
  // ── Autoservicio (cualquier empleado con su panel) ──
  {
    icon: IconLayoutDashboard,
    title: "Abre tu Mi Panel",
    description: "Consulta tu horario, tus horas, tus pagos y tus avisos en un solo lugar.",
    permission: PERMISSION_CODES.VIEW_MY_PANEL,
    route: ROUTES.MY_PANEL,
    button: "Ir a mi panel",
  },
  {
    icon: IconShieldCheck,
    title: "Completa tu expediente",
    description: "Mantén al día tus datos de contacto, tu documento y tus vehículos desde la pestaña Datos.",
    permission: PERMISSION_CODES.VIEW_MY_PANEL,
    route: `${ROUTES.MY_PANEL}?tab=data`,
    button: "Ir a mis datos",
  },
  {
    icon: IconFolder,
    title: "Revisa tus documentos",
    description: "Descarga los archivos que administración comparte contigo o sube a tu expediente.",
    permission: PERMISSION_CODES.VIEW_MY_PANEL,
    route: `${ROUTES.MY_PANEL}?tab=documents`,
    button: "Ir a documentos",
  },
  {
    icon: IconBeach,
    title: "Solicita tus vacaciones",
    description: "Pide vacaciones y sigue el estado de tus solicitudes desde tu panel.",
    permission: PERMISSION_CODES.REQUEST_VACATION,
    route: `${ROUTES.MY_PANEL}?tab=vacations`,
    button: "Ir a vacaciones",
  },
  {
    icon: IconReceipt,
    title: "Consulta tus pagos",
    description: "Revisa tus boletas de pago por quincena desde la pestaña de pagos.",
    permission: PERMISSION_CODES.VIEW_MY_PANEL,
    route: `${ROUTES.MY_PANEL}?tab=payments`,
    button: "Ir a mis pagos",
  },
  {
    icon: IconListCheck,
    title: "Gestiona tus tareas",
    description: "Organiza tus tareas pendientes y recibe recordatorios de vencimiento.",
    permission: PERMISSION_CODES.VIEW_TASKS,
    route: ROUTES.TASKS,
    button: "Ir a tareas",
  },
  {
    icon: IconShieldCheck,
    title: "Protege tu cuenta",
    description: "Actualiza tu contraseña, tus accesos rápidos y tu preferencia de nombre.",
    permission: PERMISSION_CODES.VIEW_PROFILE,
    route: ROUTES.PROFILE,
    button: "Ir a configuración",
  },
  // ── Gestión (planilla, horarios, reportes) ──
  {
    icon: IconUsers,
    title: "Registra empleados",
    description: "Agrega a los choferes con sus datos personales en la sección de empleados.",
    permission: PERMISSION_CODES.VIEW_EMPLOYEES,
    route: ROUTES.EMPLOYEES,
    button: "Ir a empleados",
  },
  {
    icon: IconCalendarTime,
    title: "Crea horarios y turnos",
    description: "Define los horarios y los días de la semana en que aplica cada turno.",
    permission: PERMISSION_CODES.VIEW_SCHEDULES,
    route: ROUTES.SCHEDULES,
    button: "Ir a horarios",
  },
  {
    icon: IconCalendarUser,
    title: "Asigna empleados a las fechas",
    description: "En la vista de roles asigna un empleado y un horario a cada día de la semana.",
    permission: PERMISSION_CODES.VIEW_EMPLOYEE_HOURS,
    route: ROUTES.ROLES,
    button: "Ir a roles",
  },
  {
    icon: IconChartBar,
    title: "Revisa horas y reportes",
    description: "Consulta los resúmenes semanal, quincenal y mensual de horas trabajadas.",
    permission: PERMISSION_CODES.VIEW_WEEKLY_SUMMARY,
    route: ROUTES.DASHBOARD,
    button: "Ir a reportes",
  },
];

const SUPPORT_CHANNELS = [
  {
    icon: IconMail,
    label: "Correo electrónico",
    value: "support@triacr.com",
    href: "mailto:support@triacr.com",
  },
  {
    icon: IconMessageCircle,
    label: "WhatsApp",
    value: "+506 6216 4040",
    href: "https://wa.me/50662164040",
  },
  {
    icon: IconClock,
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

  // Solo los pasos que el rol puede ejecutar (autoservicio o gestión).
  const visibleGuideSteps = GUIDE_STEPS.filter(
    (step) => !step.permission || userCanSee(step.permission),
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
        icon={<IconHelpCircle />}
        title="Centro de ayuda"
        description="Recursos y guías para aprovechar al máximo la plataforma"
      />

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
                    : theme.tokens.colors.hoverStrong
                }`,
                backgroundColor: isActive
                  ? theme.tokens.colors.hoverStrong
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
                      : theme.tokens.colors.hover,
                    color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.main,
                    display: "flex",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} />
                </Box>
                {isActive && (
                  <IconCircleCheck size={16} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
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
            {visibleGuideSteps.length === 0 && (
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                No hay una guía específica para tu rol. Explora las secciones desde el menú
                superior para descubrir todo lo que puedes hacer.
              </Typography>
            )}
            {visibleGuideSteps.map((step, index) => {
              const Icon = step.icon;
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
                    border: theme.tokens.borders.paper,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      backgroundColor:
                        theme.tokens.colors.hover,
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
                        theme.tokens.colors.hover,
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
                      <IconArrowRight size={13} />
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
                border: theme.tokens.borders.paper,
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
                    theme.tokens.colors.hover,
                  color: theme.palette.primary.main,
                  display: "flex",
                }}
              >
                <IconLifebuoy size={22} />
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
                        theme.tokens.colors.hover,
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
                      border: theme.tokens.borders.paper,
                      backgroundColor: "transparent",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                      "&:hover": {
                        borderColor:
                          theme.tokens.colors.borderStrong,
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
                            theme.tokens.colors.hover,
                          color: theme.palette.text.secondary,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <IconHelpCircle size={15} stroke={2} />
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
                      <IconChevronDown
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
                            theme.tokens.colors.border
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
          border: theme.tokens.borders.paper,
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
              theme.tokens.colors.hover,
            color: theme.palette.text.secondary,
          }}
        >
          <IconMail size={18} stroke={1.8} />
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
              { label: APPBAR_MENU.SCHEDULES, route: ROUTES.SCHEDULES, canSee: userCanSee(PERMISSION_CODES.VIEW_SCHEDULES) },
              { label: APPBAR_MENU.VEHICLES, route: ROUTES.VEHICLES, canSee: userCanSee(PERMISSION_CODES.VIEW_VEHICLES) },
              { label: APPBAR_MENU.EMPLOYEES, route: ROUTES.EMPLOYEES, canSee: userCanSee(PERMISSION_CODES.VIEW_EMPLOYEES) },
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
                      theme.tokens.colors.border,
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
