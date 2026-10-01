import { hasManagementRole } from "@choferes/shared";
import { PERMISSION_CODES as PERMISSIONS } from "../constants/permissions.constants";
import ROUTES from "../constants/routes.constants";

interface RecipientAccess {
  permissions: readonly string[];
  isManagement: boolean;
}

const SETTINGS_ADMIN_TABS: Record<string, string> = {
  users: PERMISSIONS.VIEW_USERS,
  roles: PERMISSIONS.VIEW_ROLES,
};

// Permiso que exige cada ruta a la que puede apuntar una notificación. Las más
// específicas van primero.
const ROUTE_PERMISSIONS: ReadonlyArray<[RegExp, string]> = [
  [/^\/my-panel$/, PERMISSIONS.VIEW_MY_PANEL],
  [/^\/employees(\/\d+)?$/, PERMISSIONS.VIEW_EMPLOYEES],
  [/^\/schedules$/, PERMISSIONS.VIEW_SCHEDULES],
  [/^\/vehicles$/, PERMISSIONS.VIEW_VEHICLES],
  [/^\/tasks$/, PERMISSIONS.VIEW_TASKS],
  [/^\/roles$/, PERMISSIONS.VIEW_ROLES],
];

/**
 * Decide a dónde lleva una notificación a quien la recibe. La notificación
 * trae una ruta pensada para el flujo (p. ej. la pestaña de vacaciones del
 * empleado), pero el destinatario puede no tener acceso a ella — una cuenta de
 * gestión no tiene "Mi Panel" — y entonces no debe aterrizar en "Prohibido".
 *
 * - Ruta alcanzable: se devuelve tal cual.
 * - Pestaña de administración sin acceso: se abre Configuración sin pestaña.
 * - Mi Panel sin acceso: la pantalla de inicio (`/`).
 * - Cualquier otra ruta sin acceso: `null` (la notificación solo se marca leída).
 */
export const resolveNotificationUrl = (
  actionUrl: string | undefined | null,
  access: RecipientAccess,
): string | null => {
  if (!actionUrl) return null;

  const [path, query = ""] = actionUrl.split("?");
  const has = (permission: string) => access.permissions.includes(permission);

  if (path === ROUTES.PROFILE) {
    const tab = new URLSearchParams(query).get("tab");
    const required = tab ? SETTINGS_ADMIN_TABS[tab] : undefined;
    if (required && !(access.isManagement && has(required))) return ROUTES.PROFILE;
    return actionUrl;
  }

  const match = ROUTE_PERMISSIONS.find(([pattern]) => pattern.test(path));
  if (!match) return actionUrl;
  if (has(match[1])) return actionUrl;
  // Avisos de cuenta/rol apuntan a Mi Panel: quien no lo tiene (gestión) va a su
  // pantalla de inicio en lugar de quedarse sin destino.
  return path === ROUTES.MY_PANEL ? ROUTES.LOGIN : null;
};

export const getRecipientAccess = (
  permissions: readonly string[] | undefined,
  user: Parameters<typeof hasManagementRole>[0],
): RecipientAccess => ({
  permissions: Array.isArray(permissions) ? permissions : [],
  isManagement: hasManagementRole(user),
});
