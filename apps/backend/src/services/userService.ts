// Service for business logic and database operations related to users and authentication
import bcrypt from "bcrypt";
import { Response } from "express";
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
import { assignRole, resolveDefaultRole, resolveRoleById } from "./userRoleService";

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

    const { accessToken, refreshToken } = generateTokens(user.id.toString(), res);

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
// Returns display LABELS (not codes) because this feeds the frontend UI, which
// gates elements against `PERMISSIONS.*` labels. Server-side authorization uses
// `permission.code` instead (see middleware/authMiddleware).
export const getUserPermissions = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: SAFE_ATTRS,
    include: ROLES_WITH_PERMISSIONS_INCLUDE,
  });

  if (!user) return null;

  const permissions =
    user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name)) || [];

  return Array.from(new Set(permissions));
};

// Creates a new user with hashed password (whitelisted fields only). Returns
// the safe projection: the created instance still holds the password hash.
//
// `roleId` (optional, not whitelisted for mass assignment) chooses the role;
// when omitted the default "Usuario" role is used. Assigning the role here —
// and resolving it BEFORE creating the account — keeps the invariant "toda
// cuenta tiene al menos un rol" true for every client of the API, instead of
// relying on a second request from the UI.
export const createUser = async (data: Record<string, any>) => {
  const clean = pickFields(data, CREATABLE_FIELDS);
  const hashedPassword = await bcrypt.hash(clean.password, 10);

  const role =
    data.roleId != null ? await resolveRoleById(Number(data.roleId)) : await resolveDefaultRole();

  const created = await User.create(
    {
      ...clean,
      password: hashedPassword,
    },
    { returning: true },
  );

  await assignRole(created.id, role.id);

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
  await User.update({ isActive: status }, { where: { id } });
  const user = await User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_WITH_PERMISSIONS_INCLUDE,
  });
  return user;
};

// Updates the password of a user (hashes new password). Any pending temporary
// password is revoked: it is a one-off recovery credential, not a second
// permanent password.
export const updateUserPassword = async (id: number, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.update({ password: hashedPassword, temporalPassword: null }, { where: { id } });
  return User.findByPk(id, {
    attributes: SAFE_ATTRS,
    include: ROLES_INCLUDE,
  });
};

// Updates the temporary password of a user (hashes new password)
export const updateUserTemporalPassword = async (id: number, temporalPassword: string) => {
  const hashedTemporalPassword = await bcrypt.hash(temporalPassword, 10);
  await User.update({ temporalPassword: hashedTemporalPassword }, { where: { id } });
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
export const deleteUser = async (id: number) =>
  User.update({ deletedAt: new Date(), isActive: false }, { where: { id } });
