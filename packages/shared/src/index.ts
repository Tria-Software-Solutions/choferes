export { User } from "./types/User";
export { Employee } from "./types/Employee";
export {
  EMPLOYEE_TERMINATION_REASONS,
  TERMINATION_REASON_LABELS,
} from "./types/Employee";
export {
  EMPLOYEE_GENDERS,
  EMPLOYEE_POSITIONS,
  EMPLOYEE_POSITION_LABELS,
  getEmployeePositionLabel,
  getEmployeePositions,
  getEmployeePositionsLabel,
} from "./types/Employee";
export type {
  TerminationReason,
  EmployeeGender,
  EmployeePosition,
} from "./types/Employee";
export { LICENSE_TYPES } from "./types/EmployeeLicense";
export type { EmployeeLicense, LicenseType } from "./types/EmployeeLicense";
export {
  DISCIPLINARY_ACTION_TYPES,
  DISCIPLINARY_ACTION_TYPE_LABELS,
  DISCIPLINARY_SEVERITIES,
  DISCIPLINARY_SEVERITY_LABELS,
} from "./types/DisciplinaryAction";
export type {
  DisciplinaryAction,
  DisciplinaryActionType,
  DisciplinaryAttachment,
  DisciplinarySeverity,
} from "./types/DisciplinaryAction";
export { Vehicle } from "./types/Vehicle";
export { Role } from "./types/Role";
export { Permission } from "./types/Permission";
export { Schedule, ScheduleDay } from "./types/Schedule";
export { HoursWorked } from "./types/HoursWorked";
export { RolePermission } from "./types/RolePermission";
export { UserRole } from "./types/UserRole";
export { BiweeklySummary } from "./types/BiweeklySummary";
export { WeeklySummary } from "./types/WeeklySummary";
export { MonthlySummary } from "./types/MonthlySummary";

// Constants
export { default as PERMISSIONS } from "./constants/permissions";
export {
  PERMISSION_CATALOG,
  PERMISSION_CODES,
  PERMISSION_DEFINITIONS,
  PERMISSION_MODULE_ORDER,
  ALL_PERMISSION_CODES,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_NAMES,
  MANAGEMENT_ROLE_NAMES,
  isManagementRoleName,
  hasManagementRole,
  ADMIN_SETTINGS_ROLE_NAMES,
  isAdminSettingsRoleName,
  hasAdminSettingsRole,
  HIDDEN_ROLE_NAMES,
  isRoleSelectable,
  canGrantRole,
  isPermissionCode,
  getPermissionByCode,
} from "./constants/permissions";
export type {
  PermissionKey,
  PermissionModule,
  PermissionDefinition,
  RoleName,
  RoleGrantor,
  GrantableRole,
} from "./constants/permissions";
export {
  POSITION_ROLE_NAMES,
  POSITION_LINKED_ROLE_NAMES,
  POSITION_KEYS,
  getRoleNameForPosition,
  getRoleNamesForPositions,
  getPositionForRoleName,
} from "./constants/positionRoles";

// Validations
export {
  nameRegex,
  emailRegex,
  usernameRegex,
  passwordRegex,
  atpParkingLotRegex,
} from "./validations/regex";

// Pagination types
export {
  PaginationParams,
  PaginationMeta,
  PaginatedResult,
  QueryParams,
} from "./types/pagination";

// Documento de identidad (cédula, DIMEX, pasaporte) y nacionalidad
export {
  NATIONAL_ID_TYPES,
  NATIONAL_ID_TYPE_LABELS,
  NATIONAL_ID_MAX_LENGTH,
  DEFAULT_NATIONALITY,
  COUNTRY_NAMES,
  COUNTRY_CODES,
  isCountryCode,
  getCountryName,
  getFlagEmoji,
  nationalityForIdType,
  normalizeNationalId,
  validateNationalId,
  formatNationalId,
  isNationalIdType,
} from "./types/EmployeeIdentity";
export type { NationalIdType } from "./types/EmployeeIdentity";

// Restricción vehicular (hoy no circula) de San José
export {
  RESTRICTION_HOURS,
  WEEKDAY_NAMES,
  MAX_PLATES_PER_EMPLOYEE,
  normalizePlate,
  isValidPlate,
  getRestrictedWeekday,
  getPlateRestriction,
  formatPlate,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  DEFAULT_VEHICLE_TYPE,
} from "./types/VehicleRestriction";
export type { PlateRestriction, VehicleType, VehicleEntry } from "./types/VehicleRestriction";

// Acumulación de vacaciones (art. 153, Código de Trabajo CR). Compartida para
// que el saldo que propone el formulario de alta y el que calcula el backend
// salgan de la misma regla.
export {
  VACATION_WORKING_DAYS_PER_CYCLE,
  VACATION_CYCLE_DAYS,
  computeAccruedVacationDays,
  parseVacationDate,
  toVacationDateOnly,
} from "./types/VacationAccrual";
export type { VacationAccrualDetail } from "./types/VacationAccrual";
