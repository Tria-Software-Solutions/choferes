// Service for business logic and database operations related to users and authentication
import bcrypt from "bcrypt";
import { Response } from "express";
import Sequelize from "sequelize";
// Note: Sequelize v3 uses string operators ($or). Using inline types instead.
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { generateTokens } from "../utils/generateSecret";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";
import { assignRole, resolveRoleById } from "./userRoleService";
import { createNotification, notifyManagementRoles } from "./notificationService";
import { createSession, revokeAllSessionsForUser } from "./sessionService";
import { ServiceError } from "../utils/errors";
import sequelize from "../config/database";

// Sensitive columns that must never be serialized to API consumers.
// Requests targeting these columns use their dedicated endpoints instead,
// which always hash values before persisting them.
const SAFE_ATTRS = { exclude: ["password", "temporalPassword"] };

// Base where clause that excludes soft-deleted accounts from every listing query.
const ACTIVE_WHERE = { deletedAt: null };

// Fields whitelisted for the generic profile-update endpoint. mass assignment
// of password/isActive/settings/temporalPassword is not allowed through it.
const EDITABLE_FIELDS = ["firstName", "lastName", "username", "email", "avatar"];

// Fields accepted when creating a new user. isActive is intentionally not
// here (defaults to true) so anonymous registration can't self-activate.
const CREATABLE_FIELDS = ["firstName", "lastName", "username", "email", "password"];

// bcrypt cost factor. 12 (~250ms/hash on modern hardware) raises the cost of
// offline cracking well above the previous default of 10.
export const BCRYPT_ROUNDS = 12;

const ROLES_INCLUDE = [
  {
    model: Role,
    as: "roles",
    through: { attributes: [] },
  },
];

const ROLES_WITH_PERMISSIONS_INCLUDE = [
  {
    model: Role,
    as: "roles",
    through: { attributes: [] },
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  },
];

// Returns only the fields present in `fields` from the source object.
function pickFields<T extends Record<string, any>>(
  source: T,
  fields: string[],
): Record<string, any> {
  const result: Record<string, any> = {};
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  });
  return result;
}

// Builds a serializable user object without password hashes.
// `employeeId` is included so the client can resolve the linked employee
// (Planilla) and open the personal panel without a second lookup.
function toSafeUser(user: User): Record<string, any> {
  const {
    id,
    firstName,
    lastName,
    username,
    email,
    isActive,
    avatar,
    settings,
    roles,
    employeeId,
  } = user;
  return {
    id,
    firstName,
    lastName,
    username,
    email,
    isActive,
    avatar,
    settings,
    roles,
    employeeId: employeeId ?? null,
  };
}

// Pre-computed bcrypt hash used when the identifier matches no account, so a
// failed lookup costs the same as a failed password check (no timing oracle
// revealing which usernames exist).
const DUMMY_PASSWORD_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.xkKQ0c6nY6bP9.0p3H0NfOefXvUu";

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  INACTIVE: "User is inactive",
} as const;

// Checks a candidate password against the main and the temporary password.
const matchesAnyPassword = async (candidate: string, user: User): Promise<boolean> => {
  if (await bcrypt.compare(candidate, user.password)) return true;
  if (user.temporalPassword) return bcrypt.compare(candidate, user.temporalPassword);
  return false;
};

// Authenticates a user by username/email and password, returns tokens and user info.
// Unknown identifiers and wrong passwords fail with the same error so the
// endpoint can't be used to enumerate accounts; the "inactive" state is only
// disclosed once the credentials are proven valid.
export const authenticateUser = async (identifier: string, password: string, res: Response) => {
  try {
    const user = await User.findOne({
      where: { $or: [{ username: identifier }, { email: identifier }] },
      include: ROLES_WITH_PERMISSIONS_INCLUDE,
    });

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!(await matchesAnyPassword(password, user))) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new Error(AUTH_ERRORS.INACTIVE);
    }

    const session = await createSession(user.id);

    const { accessToken, refreshToken } = generateTokens(
      user.id.toString(),
      res,
      user.tokenVersion ?? 0,
      session,
    );

    // Never return the model instance — password/temporalPassword hashes must
    // not leave the service boundary.
    return { user: toSafeUser(user), accessToken, refreshToken };
  } catch (error) {
    // Re-throw known authentication errors
    if (
      error instanceof Error &&
      (Object.values(AUTH_ERRORS) as string[]).includes(error.message)
    ) {
      throw error;
    }

    // Log unknown errors and re-throw as generic
    // eslint-disable-next-line no-console
    console.error(
      "[authenticateUser] Unexpected error:",
      error instanceof Error ? error.message : error,
    );
    throw new Error("Authentication service error");
  }
};

// Verifies a user's current password (main or temporary). Used to confirm
// self-service password changes.
export const verifyUserPassword = async (id: number, candidate: string): Promise<boolean> => {
  const user = await User.findByPk(id);
  if (!user) return false;
  return matchesAnyPassword(candidate, user);
};

// Fetches all users with their roles (paginated, searchable). Excludes soft-deleted accounts.
export const getUsers = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["firstName", "lastName", "username", "email"]);

  const options: Record<string, any> = {
    where: { ...ACTIVE_WHERE, ...searchWhere },
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  };
  return paginate<User>(User, options, params);
};

// Fetches a user by ID with their roles. Returns null for soft-deleted accounts.
export const getUserById = async (id: number) =>
  User.findOne({
    where: { id, ...ACTIVE_WHERE },
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });

// Fetches a user by email with their roles. Returns null for soft-deleted accounts.
export const getUserByEmail = async (email: string) =>
  User.findOne({
    where: { email, ...ACTIVE_WHERE },
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });

// Fetches a user by username with their roles. Returns null for soft-deleted accounts.
export const getUserByUsername = async (username: string) =>
  User.findOne({
    where: { username, ...ACTIVE_WHERE },
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });

// Fetches all permissions for a user by aggregating permissions from all roles.
// Returns the STABLE CODES (permission.code) because the frontend gates every
// element against `PERMISSION_CODES.*` and the server authorizes against codes
// too (see middleware/authMiddleware). The Spanish labels are only for display
// and live in the permission catalog, not in the permission grants.
export const getUserPermissions = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: SAFE_ATTRS,
    include: ROLES_WITH_PERMISSIONS_INCLUDE,
  });

  if (!user) return null;

  const permissions =
    user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.code)) || [];

  return Array.from(new Set(permissions));
};

// Roles a asignar en el alta. Acepta `roleIds` (lista) y `roleId` (uno) para no
// romper a los clientes que solo mandan un rol. Se resuelve ANTES de crear la
// cuenta y se exige al menos uno, así la invariante "toda cuenta tiene al menos
// un rol" se cumple para todos los clientes de la API (y una lista vacía no
// deja una cuenta que se cuelgue de un permiso comodín).
const resolveRolesToGrant = async (data: Record<string, any>): Promise<Role[]> => {
  const raw = Array.isArray(data.roleIds) ? data.roleIds : [data.roleId];
  const provided = raw.filter((value: unknown) => value !== undefined && value !== null);
  const ids = provided.map((value: unknown) => Number(value));
  if (ids.length === 0 || ids.some((id: number) => !Number.isInteger(id) || id <= 0)) {
    throw new ServiceError(400, "El rol es requerido");
  }
  return Promise.all(Array.from(new Set(ids)).map((id) => resolveRoleById(id)));
};

// Creates a new user with hashed password (whitelisted fields only). Returns
// the safe projection: the created instance still holds the password hash.
//
// The roles (`roleIds`, or the single `roleId`) are NOT whitelisted for mass
// assignment: they are assigned in the same operation, so the account never
// lands without permissions if a second request fails. Resolving them BEFORE
// creating the account keeps the invariant "toda cuenta tiene al menos un rol"
// true for every client of the API.
export const createUser = async (data: Record<string, any>) => {
  const clean = pickFields(data, CREATABLE_FIELDS);
  const hashedPassword = await bcrypt.hash(clean.password, BCRYPT_ROUNDS);

  const roles = await resolveRolesToGrant(data);

  const created = await sequelize.transaction(async (transaction: unknown) => {
    const user = await User.create(
      {
        ...clean,
        password: hashedPassword,
      },
      { returning: true, transaction },
    );
    // Creating the account and granting its roles must be atomic: otherwise a
    // failure mid-way leaves a user without permissions (or with only some).
    await Promise.all(roles.map((role) => assignRole(user.id, role.id, transaction)));
    return user;
  });
  const roleNames = roles.map((role) => role.name).join(", ");

  await createNotification(created.id, {
    source: `account-created:${created.id}`,
    title: "Bienvenido a Choferes",
    message: `Tu cuenta fue creada con ${roles.length === 1 ? "el rol" : "los roles"} ${roleNames}.`,
    type: "success",
    category: "system",
    priority: "high",
    actionUrl: "/my-panel",
    actionText: "Ir a mi panel",
  });
  await notifyManagementRoles({
    source: `account-created:${created.id}`,
    title: "Cuenta creada",
    message: `Se creó la cuenta de ${created.firstName} ${created.lastName} (${created.username}) con ${roles.length === 1 ? "el rol" : "los roles"} ${roleNames}.`,
    type: "info",
    category: "system",
    priority: "medium",
    actionUrl: "/settings?tab=users",
    actionText: "Ver usuarios",
  });

  return toSafeUser(created);
};

// Updates user data by ID (accepts only whitelisted, non-sensitive fields)
export const updateUser = async (id: number, data: Record<string, any>) => {
  const clean = pickFields(data, EDITABLE_FIELDS);
  if (Object.keys(clean).length > 0) {
    await User.update(clean, { where: { id } });
  }
  return User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });
};

// Updates the active status of a user
export const updateUserStatus = async (id: number, status: boolean) => {
  const changes: Record<string, unknown> = { isActive: status };
  if (status) {
    // Reactivating a soft-deleted account must clear the soft-delete marker,
    // otherwise every listing (which filters deletedAt: null) keeps hiding it.
    changes.deletedAt = null;
  }
  await User.update(changes, { where: { id } });
  const user = await User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_WITH_PERMISSIONS_INCLUDE,
  });

  if (user) {
    await notifyManagementRoles({
      source: `user-status-${status ? "activated" : "deactivated"}:${id}:${Date.now()}`,
      title: status ? "Cuenta activada" : "Cuenta desactivada",
      message: `Se ${status ? "activó" : "desactivó"} la cuenta de ${user.firstName} ${user.lastName} (${user.username}).`,
      type: status ? "info" : "warning",
      category: "system",
      priority: status ? "low" : "high",
      actionUrl: "/settings?tab=users",
      actionText: "Ver usuarios",
    });
  }

  return user;
};

// Updates the password of a user (hashes new password). Any pending temporary
// password is revoked: it is a one-off recovery credential, not a second
// permanent password. tokenVersion is bumped so tokens issued before the change
// stop working (session revocation on password reset).
export const updateUserPassword = async (id: number, password: string) => {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await User.update(
    {
      password: hashedPassword,
      temporalPassword: null,
      tokenVersion: Sequelize.literal('"tokenVersion" + 1'),
    },
    { where: { id } },
  );
  // Bumping tokenVersion already invalidates access tokens; also revoke the
  // refresh sessions so the old refresh tokens can't mint new access tokens.
  await revokeAllSessionsForUser(id);
  await createNotification(id, {
    source: `password-changed:${id}:${Date.now()}`,
    title: "Contraseña actualizada",
    message: "Tu contraseña fue cambiada. Si no fuiste tú, contacta a tu administrador.",
    type: "warning",
    category: "system",
    priority: "high",
    actionUrl: "/settings?tab=password",
    actionText: "Ir a contraseña",
  });
  return User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });
};

// Updates the temporary password of a user (hashes new password)
export const updateUserTemporalPassword = async (id: number, temporalPassword: string) => {
  const hashedTemporalPassword = await bcrypt.hash(temporalPassword, BCRYPT_ROUNDS);
  await User.update({ temporalPassword: hashedTemporalPassword }, { where: { id } });
  await createNotification(id, {
    source: `temp-password-issued:${id}:${Date.now()}`,
    title: "Contraseña temporal generada",
    message:
      "Un administrador generó una contraseña temporal para tu cuenta. Úsala en tu próximo inicio de sesión.",
    type: "info",
    category: "system",
    priority: "medium",
    actionUrl: "/settings?tab=password",
    actionText: "Ir a contraseña",
  });
  return User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });
};

// Updates user settings (merges with existing settings)
export const updateUserSettings = async (id: number, settings: Record<string, unknown>) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  const currentSettings = (user.settings || {}) as Record<string, unknown>;
  const mergedSettings = { ...currentSettings, ...settings };

  await User.update({ settings: mergedSettings }, { where: { id } });
  return User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });
};

// Soft-deletes a user: sets deletedAt + isActive=false.
// Child records (tasks, notifications) are preserved for audit; the account
// becomes invisible in all listings and auth is blocked via isActive.
export const deleteUser = async (id: number) => {
  const result = await User.update({ deletedAt: new Date(), isActive: false }, { where: { id } });
  if (result[0] > 0) {
    await notifyManagementRoles({
      source: `user-deleted:${id}`,
      title: "Cuenta eliminada",
      message: `Se eliminó la cuenta #${id}.`,
      type: "error",
      category: "system",
      priority: "high",
      actionUrl: "/settings?tab=users",
      actionText: "Ver usuarios",
    });
  }
  return result;
};
