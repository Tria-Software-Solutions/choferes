import { PERMISSIONS, ROUTES } from "../constants/constants";

// Single source of truth for the landing route after login / at "/".
// `isManagement` acota la landing de Roles a Gerencia/Administrativo, igual que
// el menú y la ruta: el permiso solo no basta.
export const getDefaultRoute = (
  userPermissions: string[],
  isManagement = false,
): string => {
  const has = (permission: string) =>
    Array.isArray(userPermissions) && userPermissions.includes(permission);

  // Los roles operativos (Chofer, Chofer Coordinador, Recepcionista,
  // Supervisor) aterrizan en su panel personal.
  // Gerencia/Admin conservan su landing actual aunque también tengan el permiso.
  if (!has(PERMISSIONS.VIEW_ADMIN) && has(PERMISSIONS.VIEW_MY_PANEL)) {
    return ROUTES.MY_PANEL;
  }

  const routePreferences = [
    ...(isManagement
      ? [{ route: ROUTES.ROLES, permission: PERMISSIONS.VIEW_ROLES }]
      : []),
    { route: ROUTES.DASHBOARD, permission: PERMISSIONS.VIEW_ADMIN },
    { route: ROUTES.VEHICLES, permission: PERMISSIONS.VIEW_VEHICLES },
    { route: ROUTES.EMPLOYEES, permission: PERMISSIONS.VIEW_EMPLOYEES },
    { route: ROUTES.SCHEDULES, permission: PERMISSIONS.VIEW_SCHEDULES },
  ];

  for (const { route, permission } of routePreferences) {
    if (
      Array.isArray(userPermissions) &&
      userPermissions.includes(permission)
    ) {
      return route;
    }
  }

  // Fallback that is always reachable for any authenticated user.
  return ROUTES.PROFILE;
};