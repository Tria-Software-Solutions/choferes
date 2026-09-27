import { PERMISSIONS, ROUTES } from "../constants/constants";

// Single source of truth for the landing route after login / at "/".
export const getDefaultRoute = (userPermissions: string[]): string => {
  const routePreferences = [
    { route: ROUTES.ROLES, permission: PERMISSIONS.VIEW_ROLES },
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