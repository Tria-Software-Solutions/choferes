import React from "react";
import { Badge, Box, IconButton, Skeleton, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { IconBeach, IconHourglass, IconMapPin, IconMapPinOff, IconRefresh } from "@tabler/icons-react";
import type { User } from "../../../models/User";
import { getEmployeePositionLabel } from "../../../models/Employee";
import EmployeeAvatar from "../../../components/EmployeeAvatar/EmployeeAvatar.component";
import UserAvatar from "../../../components/UserAvatar/UserAvatar.component";
import { formatTenure } from "../../../utils/tenure";
import {
  detailHeaderStyles,
  emailStyles,
  identityBoxStyles,
  metaChipStyles,
  metaChipsRowStyles,
  nameStyles,
  tabsBoxStyles,
} from "../../EmployeeDetail/styles";
import {
  capitalize,
  formatHours,
  formatLongDate,
  greeting,
  isAssigned,
  shortTenure,
  toISODate,
  type AttentionTone,
  type LinkedOverview,
  type PanelTabKey,
} from "../panelModel";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export interface PanelTabDescriptor {
  key: PanelTabKey;
  label: string;
  icon: React.ElementType;
  alert?: { tone: AttentionTone; hint: string };
}

const BADGE_COLOR: Record<AttentionTone, "error" | "warning" | "info"> = {
  danger: "error",
  warning: "warning",
  info: "info",
};

interface MyPanelHeaderProps {
  user: User | null;
  overview: LinkedOverview | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  tabs: PanelTabDescriptor[];
  showTabs: boolean;
  activeTab: PanelTabKey;
  onTabChange: (tab: PanelTabKey) => void;
  now: Date;
}

// Cabecera de "Mi Panel": identidad de la persona (saludo, puesto, datos
// clave) y, debajo, el menú secundario en pestañas — mismo patrón que el
// expediente de un empleado.
export const MyPanelHeader: React.FC<MyPanelHeaderProps> = ({
  user,
  overview,
  loading,
  refreshing,
  onRefresh,
  tabs,
  showTabs,
  activeTab,
  onTabChange,
  now,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const employee = overview?.employee;

  const firstName = user?.firstName || employee?.firstName || "";
  const position = employee ? getEmployeePositionLabel(employee.position, employee.gender) : null;
  const dateText = capitalize(formatLongDate(now));
  const subtitle = [position, dateText].filter(Boolean).join(" · ");

  const available = overview?.vacationAccrual?.availableDays ?? employee?.vacationDays ?? null;
  const tenure = shortTenure(formatTenure(employee?.contractStartDate));
  const todayDay = overview?.week?.days.find((day) => day.date === toISODate(now));
  const todayPlace = isAssigned(todayDay) ? todayDay.scheduleLabel : null;

  const avatarSize = isSmallScreen ? 52 : 64;

  return (
    <Box component="header" sx={detailHeaderStyles(theme)}>
      <Box sx={{ ...(identityBoxStyles as object), alignItems: { xs: "flex-start", sm: "center" } }}>
        {employee ? (
          <EmployeeAvatar
            employee={{
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              avatar: employee.avatar ?? user?.avatar ?? undefined,
            }}
            size={avatarSize}
            sx={{ border: `2px solid ${theme.palette.background.paper}` }}
          />
        ) : (
          <UserAvatar user={user} size={avatarSize} />
        )}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h1" sx={nameStyles}>
            {greeting(now.getHours())}
            {firstName ? `, ${firstName}` : ""}
          </Typography>
          <Typography sx={emailStyles}>{subtitle}</Typography>

          <Box sx={metaChipsRowStyles}>
            {loading && !overview ? (
              <>
                <Skeleton variant="rounded" width={132} height={24} sx={{ borderRadius: 999 }} />
                <Skeleton variant="rounded" width={112} height={24} sx={{ borderRadius: 999 }} />
                <Skeleton variant="rounded" width={140} height={24} sx={{ borderRadius: 999 }} />
              </>
            ) : (
              <>
                {overview && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    {todayPlace ? (
                      <IconMapPin size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    ) : (
                      <IconMapPinOff size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    )}
                    {todayPlace ? `Hoy: ${todayPlace}` : "Hoy: sin lugar asignado"}
                  </Box>
                )}
                {tenure && (
                  <Box
                    component="span"
                    sx={{ ...(metaChipStyles(theme) as object), display: { xs: "none", sm: "inline-flex" } }}
                  >
                    <IconHourglass size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    {tenure} en la empresa
                  </Box>
                )}
                {available != null && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    <IconBeach size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    {formatHours(available)} {available === 1 ? "día" : "días"} de vacaciones
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        <Tooltip title="Actualizar">
          <span style={{ alignSelf: "flex-start" }}>
            <IconButton
              aria-label="Actualizar mi panel"
              onClick={onRefresh}
              disabled={refreshing || loading}
              size="small"
              sx={{ color: theme.tokens.colors.textMuted }}
            >
              <IconRefresh
                size={18}
                style={refreshing ? { animation: `${spin} 900ms linear infinite` } : undefined}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {showTabs && (
        <Box sx={tabsBoxStyles(theme)}>
          <Tabs
            value={activeTab}
            onChange={(_event, value: PanelTabKey) => onTabChange(value)}
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={false}
            aria-label="Secciones de Mi Panel"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  label={tab.label}
                  aria-label={tab.alert ? `${tab.label}, ${tab.alert.hint}` : undefined}
                  icon={
                    <Badge
                      variant="dot"
                      color={tab.alert ? BADGE_COLOR[tab.alert.tone] : "default"}
                      invisible={!tab.alert}
                      sx={{
                        // El tema fija 16px de alto a todas las insignias; aquí es un punto.
                        "& .MuiBadge-badge": {
                          minWidth: 0,
                          width: 9,
                          height: 9,
                          p: 0,
                          borderRadius: "50%",
                          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                        },
                      }}
                    >
                      <Icon size={17} />
                    </Badge>
                  }
                  iconPosition="start"
                  disableRipple
                />
              );
            })}
          </Tabs>
        </Box>
      )}
    </Box>
  );
};
