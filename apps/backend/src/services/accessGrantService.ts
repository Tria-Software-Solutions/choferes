// Rules that stop a user from granting more access than they hold.
//
// Assigning roles and editing a role's permissions are guarded by a single
// permission each (users:create / users:edit, roles:edit). Without these checks
// a holder of, say, `users:create` could assign the all-powerful "Gerencia"
// role to anyone — including themselves.
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { UserRole } from "../models/UserRole";
import type { AuthenticatedUser } from "../middleware/authorize";

export interface GrantDenial {
  status: number;
  message: string;
}

const holdsAll = (actor: AuthenticatedUser, codes: string[]): boolean =>
  actor.permissions.includes("*") || codes.every((code) => actor.permissions.includes(code));

// Permission codes currently granted to a role, or null when the role doesn't exist.
export const getRolePermissionCodes = async (roleId: number): Promise<string[] | null> => {
  const role = await Role.findByPk(roleId, {
    include: [
      { model: Permission, as: "permissions", through: { attributes: [] }, attributes: ["code"] },
    ],
  });
  if (!role) return null;
  return ((role.permissions ?? []) as Permission[]).map((permission) => permission.code);
};

// Codes for the given permission ids, or null when any id is unknown.
export const getPermissionCodesByIds = async (ids: number[]): Promise<string[] | null> => {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return [];
  const rows = (await Permission.findAll({
    where: { id: { $in: unique } },
    attributes: ["id", "code"],
  })) as Permission[];
  return rows.length === unique.length ? rows.map((row) => row.code) : null;
};

// Returns why `actor` may not give `roleId` to `targetUserId`, or null when allowed.
export const checkRoleAssignment = async (
  actor: AuthenticatedUser,
  targetUserId: number,
  roleId: number,
): Promise<GrantDenial | null> => {
  if (targetUserId === actor.id) {
    // Re-saving your own profile resends the role you already have; allow that
    // no-op but never a change of your own role.
    const current = await UserRole.findOne({ where: { userId: targetUserId } });
    if (current && current.roleId === roleId) return null;
    return { status: 403, message: "No puedes cambiar tu propio rol" };
  }

  const codes = await getRolePermissionCodes(roleId);
  if (!codes) return { status: 404, message: "Rol no encontrado" };
  if (!holdsAll(actor, codes)) {
    return { status: 403, message: "No puedes asignar un rol con permisos que tú no tienes" };
  }
  return null;
};

// Returns why `actor` may not set `permissionIds` on `roleId`, or null when allowed.
// Only newly added permissions are checked, so removing access is always possible.
export const checkPermissionGrant = async (
  actor: AuthenticatedUser,
  roleId: number,
  permissionIds: number[],
): Promise<GrantDenial | null> => {
  const requested = await getPermissionCodesByIds(permissionIds);
  if (!requested) return { status: 400, message: "La solicitud incluye permisos inválidos" };

  const current = await getRolePermissionCodes(roleId);
  if (!current) return { status: 404, message: "Rol no encontrado" };

  const added = requested.filter((code) => !current.includes(code));
  if (!holdsAll(actor, added)) {
    return { status: 403, message: "No puedes otorgar permisos que tú no tienes" };
  }
  return null;
};
