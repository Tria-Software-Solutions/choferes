// Rules that stop a user from granting more access than they hold.
//
// Assigning roles and editing a role's permissions are guarded by a single
// permission each (users:create / users:edit, roles:edit). Without these checks
// a holder of, say, `users:create` could assign the all-powerful "Gerencia"
// role to anyone — including themselves.
import { canGrantRole } from "@choferes/shared";
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

// Returns why `actor` may not hand out `roleId` (it carries permissions the actor
// does not hold), or null when allowed. Used both when assigning a role to an
// existing user and when a role is derived automatically (new account, change
// of position), so nobody can gain access through a side door.
//
// The rule itself lives in @choferes/shared (`canGrantRole`) so the UI can
// disable the roles this actor is not allowed to grant, instead of offering an
// option the API would reject.
export const checkRoleGrant = async (
  actor: AuthenticatedUser,
  roleId: number,
): Promise<GrantDenial | null> => {
  const role = await Role.findByPk(roleId, { attributes: ["id", "name"] });
  if (!role) return { status: 404, message: "Rol no encontrado" };

  const codes = await getRolePermissionCodes(roleId);
  const grantable = canGrantRole(
    { permissions: actor.permissions, roles: actor.roles },
    { name: role.name, permissionCodes: codes ?? [] },
  );
  if (!grantable) {
    return { status: 403, message: "No puedes asignar un rol con permisos que tú no tienes" };
  }
  return null;
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
    const current = await UserRole.findAll({ where: { userId: targetUserId } });
    if (current.some((row) => row.roleId === roleId)) return null;
    return { status: 403, message: "No puedes cambiar tu propio rol" };
  }

  return checkRoleGrant(actor, roleId);
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

// Returns why `actor` may not remove `roleId` from `targetUserId`, or null when
// allowed. Prevents two foot-guns: stripping your own roles (self-lockout) and
// leaving an account with zero roles (it would lose all access).
export const checkRoleRemoval = async (
  actor: AuthenticatedUser,
  targetUserId: number,
  roleId: number,
): Promise<GrantDenial | null> => {
  if (targetUserId === actor.id) {
    return { status: 403, message: "No puedes quitarte tus propios roles" };
  }

  const remaining = await UserRole.findAll({
    where: { userId: targetUserId, roleId: { $ne: roleId } },
    attributes: ["roleId"],
  });
  if (remaining.length === 0) {
    return { status: 409, message: "Una cuenta debe conservar al menos un rol" };
  }
  return null;
};
