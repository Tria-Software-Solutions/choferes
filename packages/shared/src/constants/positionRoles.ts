import type { EmployeePosition } from "../types/Employee";
import type { RoleName } from "./permissions";

/**
 * Cada puesto tiene un rol de acceso con el mismo nombre. Es la única fuente
 * de verdad de esa correspondencia: el backend la usa para dar el rol correcto
 * al activar el acceso de un empleado y para mantenerlo al cambiar de puesto.
 *
 * Los puestos son un conjunto cerrado en el código; los roles viven en la base
 * y se editan desde Configuración → Roles, así que un rol vinculado a un puesto
 * no se puede renombrar ni borrar (ver `roles.positionKey`).
 */
export const POSITION_ROLE_NAMES: Readonly<Record<EmployeePosition, RoleName>> = {
  chofer: "Chofer",
  chofer_coordinador: "Chofer Coordinador",
  recepcionista: "Recepcionista",
  supervisor: "Supervisor",
  administrativo: "Administrativo",
  gerencia: "Gerencia",
};

/** El rol genérico: se usa cuando el empleado no tiene puesto. No es un puesto. */
export const DEFAULT_ACCESS_ROLE = "Usuario";

/**
 * Roles que siguen al puesto del empleado ("Usuario" es el rol genérico de las
 * cuentas sin puesto y del que se parte al activar un acceso). Gerencia,
 * Administrativo y los roles personalizados son independientes del puesto y
 * nunca se tocan automáticamente.
 */
export const POSITION_LINKED_ROLE_NAMES: readonly RoleName[] = [
  DEFAULT_ACCESS_ROLE,
  ...Object.values(POSITION_ROLE_NAMES),
];

/** Claves de puesto que tienen un rol de acceso asociado. */
export const POSITION_KEYS: readonly EmployeePosition[] = Object.keys(
  POSITION_ROLE_NAMES,
) as EmployeePosition[];

/** Rol que corresponde a un puesto, o null si el puesto no existe o está vacío. */
export const getRoleNameForPosition = (
  position: string | null | undefined,
): RoleName | null => (position && POSITION_ROLE_NAMES[position as EmployeePosition]) || null;

/** Puesto al que corresponde un rol, o null si el rol no sigue a ningún puesto. */
export const getPositionForRoleName = (roleName: string | null | undefined): EmployeePosition | null => {
  if (!roleName) return null;
  const match = POSITION_KEYS.find(
    (key) => POSITION_ROLE_NAMES[key].toLowerCase() === roleName.trim().toLowerCase(),
  );
  return match ?? null;
};
