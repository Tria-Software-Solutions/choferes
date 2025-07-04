// All constants have their own files for better maintainability.
// See routes.constants.ts, appbar.constants.ts, pageTitle.constants.ts, permissions.constants.ts, days.constants.ts, overtime.constants.ts, colors.constants.ts, brands.constants.ts, state.constants.ts, table.constants.ts, selectorTable.constants.ts, forms.constants.ts, notifications.constants.ts, auth.constants.ts, management.constants.ts, errors.constants.ts, dialog.constants.ts, tableUI.constants.ts

// core.constants.ts - Shared core constants not split into domain-specific files

export { default as APPBAR_MENU } from "./appbar.constants";
export { default as PAGE_TITLE } from "./pageTitle.constants";
export { default as PERMISSIONS } from "./permissions.constants";
export { default as ROUTES } from "./routes.constants";
export { default as ERRORS } from "./errors.constants";
export { default as FORMS } from "./forms.constants";
export { default as SELECTOR_TABLE } from "./selectorTable.constants";
export { default as TABLE } from "./table.constants";
export { default as TABLE_UI } from "./tableUI.constants";
export { default as SEARCH_BAR } from "./searchBar.constants";
export { default as SNACKBAR } from "./snackbar.constants";
export { default as PAGINATION } from "./pagination.constants";
export { default as NOTIFICATIONS } from "./notifications.constants";
export { default as BRANDS_LIST } from "./brands.constants";
export { default as COLORS_LIST } from "./colors.constants";
export { default as DAYS_LIST } from "./days.constants";
export { default as OVERTIME } from "./overtime.constants";
export { default as STATE } from "./state.constants";
export {
  DASHBOARD,
  DASHBOARD_USERS,
  DASHBOARD_ROLES,
  DASHBOARD_PERMISSIONS,
} from "./dashboard.constants";

// Add other shared constants as needed
