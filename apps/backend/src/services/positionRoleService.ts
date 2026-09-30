// Relación puesto ↔ rol de acceso.
//
// Cada puesto (chofer, chofer coordinador, recepcionista, supervisor,
// administrativo, gerencia) tiene un rol con el mismo nombre
// (POSITION_ROLE_NAMES). La cuenta de un empleado recibe el rol de su puesto al
// activarse y lo conserva al cambiar de puesto. El puesto es obligatorio: no hay
// rol genérico de respaldo. Los roles personalizados son independientes del
// puesto y nunca se tocan aquí.
import {
  POSITION_LINKED_ROLE_NAMES,
  getRoleNameForPosition,
  isManagementRoleName,
} from "@choferes/shared";
import Employee from "../models/Employee";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { createNotification } from "./notificationService";
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

// Rol que le corresponde a un puesto. El puesto es obligatorio y su rol debe
// existir en la base; si falta cualquiera de los dos se falla explícitamente en
// vez de asignar un rol genérico.
export const resolveRoleForPosition = async (position?: string | null): Promise<Role> => {
  const roleName = getRoleNameForPosition(position);
  if (!roleName) {
    throw new ServiceError(400, "El empleado debe tener un puesto para tener acceso al sistema");
  }
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw new ServiceError(500, `El rol del puesto "${roleName}" no está configurado`);
  }
  return role;
};

// Da a la cuenta el rol de su puesto, pero solo si quedó sin ninguno.
export const assignPositionRoleIfMissing = async (
  userId: number,
  position?: string | null,
): Promise<Role | null> => {
  const hasAnyRole = await UserRole.findOne({ where: { userId } });
  if (hasAnyRole) return null;
  const role = await resolveRoleForPosition(position);
  await assignRole(userId, role.id);
  return role;
};

export interface AccountRoleChange {
  userId: number;
  role: Role;
}

// Cambio de rol que exige un nuevo puesto sobre la cuenta vinculada al empleado,
// o null cuando no hay que tocar nada (sin cuenta, rol ya correcto, o la cuenta
// tiene un rol de gestión o personalizado, que no dependen del puesto).
export const planAccountRoleChange = async (
  employeeId: number,
  position: string | null,
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

  const target = await resolveRoleForPosition(position);
  if (currentRoles.length === 1 && currentRoles[0].id === target.id) return null;
  return { userId: user.id, role: target };
};

// Deja a la cuenta únicamente con el rol indicado.
export const applyAccountRole = async (userId: number, roleId: number): Promise<void> => {
  await UserRole.destroy({ where: { userId } });
  await assignRole(userId, roleId);

  const role = await Role.findByPk(roleId);
  await createNotification(userId, {
    source: `role-changed:${userId}:${roleId}`,
    title: "Tu rol cambió",
    message: `Tu rol en la plataforma cambió a ${role?.name ?? "uno nuevo"}.`,
    type: "info",
    category: "system",
    priority: "medium",
    actionUrl: "/dashboard",
    actionText: "Ir al panel",
  });
};

// Un supervisor debe tener el rol Supervisor (o uno de gestión, que lo supera).
// Devuelve el motivo del rechazo cuando `roleId` dejaría a un supervisor sin él.
export const checkRoleFitsEmployeePosition = async (
  userId: number,
  roleId: number,
): Promise<GrantDenial | null> => {
  const user = await User.findByPk(userId, { attributes: ["id", "employeeId"] });
  if (!user?.employeeId) return null;

  const employee = await Employee.findByPk(user.employeeId, { attributes: ["id", "position"] });
  if (employee?.position !== SUPERVISOR_POSITION) return null;

  const role = await Role.findByPk(roleId);
  if (!role) return { status: 404, message: "Rol no encontrado" };
  if (isManagementRoleName(role.name) || role.name === SUPERVISOR_ROLE) return null;

  return {
    status: 409,
    message:
      'Este usuario es un empleado con el puesto Supervisor, así que debe tener el rol "Supervisor". ' +
      "Cambia primero su puesto en la ficha del empleado.",
  };
};
