// Permission catalog — re-exported from @choferes/shared (single source of truth).
//
// Authorization MUST use stable codes (`PERMISSION_CODES.*`), never the Spanish
// labels. The `PERMISSIONS` (key -> label) map is still exported for display
// helpers and backwards compatibility.
export {
  PERMISSIONS,
  PERMISSION_CATALOG,
  PERMISSION_CODES,
  PERMISSION_DEFINITIONS,
  PERMISSION_MODULE_ORDER,
  ALL_PERMISSION_CODES,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_NAMES,
  isPermissionCode,
  getPermissionByCode,
} from "@choferes/shared";

export type {
  PermissionKey,
  PermissionModule,
  PermissionDefinition,
  RoleName,
} from "@choferes/shared";
