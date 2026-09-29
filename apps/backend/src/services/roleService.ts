// Service for business logic and database operations related to roles
// Note: Sequelize v3 doesn't export FindAndCountOptions
// Using inline Record<string, any> instead
import { getPositionForRoleName, POSITION_ROLE_NAMES } from "@choferes/shared";
import { Permission } from "../models/Permission";
import { Role } from "../models/Role";
import { ServiceError } from "../utils/errors";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

const positionLabel = (roleName: string): string =>
  POSITION_ROLE_NAMES[getPositionForRoleName(roleName) as keyof typeof POSITION_ROLE_NAMES] ??
  roleName;

// Un rol vinculado a un puesto (roles.positionKey) existe porque el puesto lo
// necesita: la cuenta de un empleado con ese puesto lo recibe al activarse y lo
// conserva al cambiar de puesto. Renombrarlo rompe `POSITION_ROLE_NAMES` y
// borrarlo deja a todos esos empleados sin rol (user_role tiene CASCADE), sin
// avisar. Por eso su identidad no se toca: se editan sus permisos, nunca su
// nombre, y no se borran.
const assertRoleExists = (role: Role | null): Role => {
  if (!role) throw new ServiceError(404, "Rol no encontrado");
  return role;
};

const assertRoleCanBeRenamed = (role: Role, data: Partial<Role>): void => {
  if (!role.positionKey || data.name === undefined || data.name === role.name) return;
  throw new ServiceError(
    409,
    `El rol "${role.name}" corresponde al puesto "${positionLabel(role.name)}" y no se puede ` +
      "renombrar ni eliminar. Cambia los permisos del rol, o el puesto del empleado, en su lugar.",
  );
};

// Get all roles with their permissions (paginated, searchable)
export const getRoles = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["name", "description"]);

  const options: Record<string, any> = {
    where: searchWhere,
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  };
  return paginate<Role>(Role, options, params);
};

// Get a role by its ID with permissions
export const getRoleById = async (id: number) =>
  Role.findByPk(id, {
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });

// Get a role by its name with permissions
export const getRoleByName = async (name: string) =>
  Role.findOne({
    where: { name },
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });

// Create a new role. New roles are always "personalizados": they follow no
// puesto, so `positionKey` is never accepted from the client.
export const createRole = async (data: Omit<Role, "id">) => {
  const { positionKey: _ignored, ...editable } = data as Partial<Role>;
  const newRole = await Role.create({ ...editable, positionKey: null });
  await newRole.reload();
  return newRole;
};

// Update a role by its ID. `positionKey` is server-owned: it is ignored here so
// nobody can attach (or detach) a role to a puesto from the editor, and a linked
// role keeps its name so `POSITION_ROLE_NAMES` stays true.
export const updateRole = async (id: number, data: Omit<Role, "id">) => {
  const { positionKey: _ignored, ...editable } = data as Partial<Role>;
  const role = assertRoleExists(await Role.findByPk(id));
  assertRoleCanBeRenamed(role, editable);
  await Role.update(editable, { where: { id } });
  return Role.findByPk(id);
};

// Delete a role by its ID
export const deleteRole = async (id: number) => {
  const role = assertRoleExists(await Role.findByPk(id));
  if (role.positionKey) {
    throw new ServiceError(
      409,
      `El rol "${role.name}" corresponde al puesto "${positionLabel(role.name)}" y no se puede ` +
        "eliminar: se lo asignan las cuentas de los empleados con ese puesto. Cámbialo en el puesto del empleado.",
    );
  }
  return Role.destroy({ where: { id } });
};
