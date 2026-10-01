// Rutas de la aplicación. Los paths están en inglés y son la única fuente de
// verdad: App.tsx, el menú, la navegación y los tests los leen de aquí, así que
// renombrar una ruta no puede quedar a medias.
const ROUTES = {
  DASHBOARD: "/dashboard",
  DOCUMENTS: "/documents",
  EMPLOYEES: "/employees",
  LOGIN: "/",
  MY_PANEL: "/my-panel",
  ROLES: "/roles",
  SCHEDULES: "/schedules",
  TASKS: "/tasks",
  PROFILE: "/settings",
  VEHICLES: "/vehicles",

  // Rutas que ya no existen y solo redirigen, para no romper enlaces guardados.
  LEGACY_MY_PANEL: "/mi-panel",
  LEGACY_PROFILE: "/profile",

  // Destinos fuera de la navegación: no aparecen en el menú.
  FORBIDDEN: "/forbidden",
  ERROR: "/error",
  SESSION_EXPIRED: "/session-expired",
  NOT_FOUND: "/notfound",
};
export default ROUTES;
