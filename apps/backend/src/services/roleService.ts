// Service for business logic and database operations related to roles
// Note: Sequelize v3 doesn't export FindAndCountOptions
// Using inline Record<string, any> instead
import { Permission } from "../models/Permission";
import { Role } from "../models/Role";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

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

// Create a new role
export const createRole = async (data: Omit<Role, "id">) => {
  const newRole = await Role.create(data);
  await newRole.reload();
  return newRole;
};

// Update a role by its ID
export const updateRole = async (id: number, data: Omit<Role, "id">) => {
  await Role.update(data, { where: { id } });
  return Role.findByPk(id);
};

// Delete a role by its ID
export const deleteRole = async (id: number) => Role.destroy({ where: { id } });
