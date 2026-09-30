import { PERMISSION_CODES, ROUTES } from "../constants/constants";

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
  if (!has(PERMISSION_CODES.VIEW_ADMIN) && has(PERMISSION_CODES.VIEW_MY_PANEL)) {
    return ROUTES.MY_PANEL;
  }

  const routePreferences = [
    ...(isManagement
      ? [{ route: ROUTES.ROLES, permission: PERMISSION_CODES.VIEW_ROLES }]
      : []),
    { route: ROUTES.DASHBOARD, permission: PERMISSION_CODES.VIEW_ADMIN },
    { route: ROUTES.VEHICLES, permission: PERMISSION_CODES.VIEW_VEHICLES },
    { route: ROUTES.EMPLOYEES, permission: PERMISSION_CODES.VIEW_EMPLOYEES },
    { route: ROUTES.SCHEDULES, permission: PERMISSION_CODES.VIEW_SCHEDULES },
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