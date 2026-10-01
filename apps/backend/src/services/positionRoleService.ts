// Relación puesto ↔ rol de acceso.
//
// Cada puesto (chofer, chofer coordinador, recepcionista, supervisor,
// administrativo, gerencia) tiene un rol con el mismo nombre
// (POSITION_ROLE_NAMES). La cuenta de un empleado recibe el rol de su puesto al
// activarse y lo conserva al cambiar de puesto. El puesto es obligatorio: no hay
// rol genérico de respaldo. Los roles personalizados son independientes del
// puesto y nunca se tocan aquí.
import {
  EMPLOYEE_POSITIONS,
  getEmployeePositions,
  POSITION_LINKED_ROLE_NAMES,
  getRoleNamesForPositions,
  isManagementRoleName,
} from "@choferes/shared";
import Employee from "../models/Employee";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { notifyAccountRoleChange } from "./notificationService";
import { UserRole } from "../models/UserRole";
import { ServiceError } from "../utils/errors";
import type { GrantDenial } from "./accessGrantService";
import { assignRole } from "./userRoleService";

export const SUPERVISOR_POSITION = "supervisor";
const SUPERVISOR_ROLE = "Supervisor";

// ¿Este rol se puede reasignar solo por un cambio de puesto? Todos los que nacen
// de un puesto, menos los de gestión: a alguien con Gerencia no se le baja el
// acceso por que le corrigieran el puesto en la ficha. Los roles personalizados
// tampoco siguen al puesto.
const isAutoAssignableRole = (name: string): boolean =>
  !isManagementRoleName(name) && (POSITION_LINKED_ROLE_NAMES as readonly string[]).includes(name);

// Normaliza lo que llega del cliente a una lista de puestos válidos: `positions`
// (lista) tiene prioridad sobre `position` (uno solo, formato anterior). Sin
// duplicados y en el orden recibido; el primero es el puesto principal.
export const normalizePositions = (input: {
  positions?: unknown;
  position?: unknown;
}): string[] | undefined => {
  if (input.positions === undefined && input.position === undefined) return undefined;
  let raw: unknown[] = [];
  if (Array.isArray(input.positions)) raw = input.positions;
  else if (input.position !== undefined) raw = [input.position];
  const list = Array.from(new Set(raw.map((value) => String(value ?? "").trim()).filter(Boolean)));
  const valid = (EMPLOYEE_POSITIONS as readonly string[]).includes.bind(EMPLOYEE_POSITIONS);
  if (list.length === 0 || !list.every((position) => valid(position))) {
    throw new ServiceError(
      400,
      "El empleado debe tener al menos un puesto y todos deben ser puestos válidos",
    );
  }
  return list;
};

// Roles que le corresponden a una lista de puestos. Los puestos son obligatorios
// y cada rol debe existir en la base; si falta cualquiera se falla explícitamente
// en vez de asignar un rol genérico.
export const resolveRolesForPositions = async (
  positions?: ReadonlyArray<string | null | undefined> | null,
): Promise<Role[]> => {
  const roleNames = getRoleNamesForPositions(positions ?? []);
  if (roleNames.length === 0) {
    throw new ServiceError(400, "El empleado debe tener un puesto para tener acceso al sistema");
  }
  const roles = await Role.findAll({ where: { name: roleNames } });
  const missing = roleNames.filter((name) => !roles.some((role) => role.name === name));
  if (missing.length > 0) {
    throw new ServiceError(500, `El rol del puesto "${missing[0]}" no está configurado`);
  }
  // Mismo orden que los puestos (el primero es el principal).
  return roleNames.map((name) => roles.find((role) => role.name === name) as Role);
};

// Da a la cuenta los roles de sus puestos, pero solo si quedó sin ninguno.
export const assignPositionRoleIfMissing = async (
  userId: number,
  positions?: ReadonlyArray<string | null | undefined> | null,
): Promise<Role[]> => {
  const hasAnyRole = await UserRole.findOne({ where: { userId } });
  if (hasAnyRole) return [];
  const roles = await resolveRolesForPositions(positions);
  await Promise.all(roles.map((role) => assignRole(userId, role.id)));
  return roles;
};

export interface AccountRoleChange {
  userId: number;
  roles: Role[];
}

// Cambio de roles que exigen los nuevos puestos sobre la cuenta vinculada al
// empleado, o null cuando no hay que tocar nada (sin cuenta, roles ya correctos,
// o la cuenta tiene un rol de gestión o personalizado, que no dependen del puesto).
export const planAccountRoleChange = async (
  employeeId: number,
  positions: ReadonlyArray<string> | null,
): Promise<AccountRoleChange | null> => {
  const user = await User.findOne({
    where: { employeeId },
    attributes: ["id"],
    include: [
      { model: Role, as: "roles", attributes: ["id", "name"], through: { attributes: [] } },
    ],
  });
  if (!user) return null;

  const currentRoles = user.roles ?? [];
  if (currentRoles.some((role) => !isAutoAssignableRole(role.name))) return null;

  const targets = await resolveRolesForPositions(positions);
  const sameSet =
    currentRoles.length === targets.length &&
    targets.every((target) => currentRoles.some((role) => role.id === target.id));
  if (sameSet) return null;
  return { userId: user.id, roles: targets };
};

// Deja a la cuenta únicamente con los roles indicados.
export const applyAccountRoles = async (userId: number, roles: Role[]): Promise<void> => {
  await UserRole.destroy({ where: { userId } });
  await Promise.all(roles.map((role) => assignRole(userId, role.id)));

  await notifyAccountRoleChange(userId, {
    action: `sus roles cambiaron a ${roles.map((role) => role.name).join(", ")} (según sus puestos)`,
  });
};

// Un supervisor debe tener el rol Supervisor (o uno de gestión, que lo supera).
// Devuelve el motivo del rechazo cuando `roleIds` dejaría a un supervisor sin él.
export const checkRolesFitEmployeePositions = async (
  userId: number,
  roleIds: number[],
): Promise<GrantDenial | null> => {
  const user = await User.findByPk(userId, { attributes: ["id", "employeeId"] });
  if (!user?.employeeId) return null;

  const employee = await Employee.findByPk(user.employeeId, {
    attributes: ["id", "position", "positions"],
  });
  if (!employee || !getEmployeePositions(employee).includes(SUPERVISOR_POSITION)) return null;

  const roles = await Role.findAll({ where: { id: roleIds } });
  if (roles.length !== new Set(roleIds).size) return { status: 404, message: "Rol no encontrado" };
  if (roles.some((role) => isManagementRoleName(role.name) || role.name === SUPERVISOR_ROLE)) {
    return null;
  }

  return {
    status: 409,
    message:
      'Este usuario es un empleado con el puesto Supervisor, así que debe tener el rol "Supervisor". ' +
      "Cambia primero su puesto en la ficha del empleado.",
  };
};
