// Single source of truth for the navigation iconography.
//
// Every entry point (top bar, mobile drawer, quick-access dock and the help
// center) resolves its icon from this map, so a concept always keeps the same
// icon across the app. Icons are chosen for the meaning of the destination, not
// for the widget that happens to render them:
//
//   Roles      -> calendario + persona (la vista reparte gente por horario)
//   Reportes   -> gráfico de barras (la vista resume horas en gráficos)
//   Tareas     -> lista con check    (tareas pendientes del usuario)
//   Vehículos  -> estacionamiento    (la flota se administra junto al parqueo)
//   Planilla   -> personas (nómina de la flota)
//   Horarios   -> calendario con hora (turnos y horas, no sólo días)
import {
  IconCalendarTime,
  IconCalendarUser,
  IconLayoutGrid,
  IconListCheck,
  IconLogout,
  IconChartBar,
  IconSettings,
  IconParking,
  IconUsers,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import APPBAR_MENU from "./appbar.constants";

export const NAV_ICONS: Record<string, TablerIcon> = {
  [APPBAR_MENU.ROLES]: IconCalendarUser,
  [APPBAR_MENU.DASHBOARD]: IconChartBar,
  [APPBAR_MENU.VEHICLES]: IconParking,
  [APPBAR_MENU.EMPLOYEES]: IconUsers,
  [APPBAR_MENU.SCHEDULES]: IconCalendarTime,
  [APPBAR_MENU.TASKS]: IconListCheck,
  [APPBAR_MENU.PROFILE]: IconSettings,
  [APPBAR_MENU.LOGOUT]: IconLogout,
};

/** Used when a menu label has no entry in the map (never expected, but safe). */
export const NAV_ICON_FALLBACK = IconLayoutGrid;

export default NAV_ICONS;
