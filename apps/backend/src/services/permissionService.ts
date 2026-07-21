// Service for business logic and database operations related to permissions
// Note: Sequelize v3 uses string operators ($in, $or, $iLike)
// Using inline types instead of missing Sequelize type exports
import { Permission } from "../models/Permission";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

// Get all permissions (paginated, searchable)
export const getPermissions = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["name"]);

  const options: Record<string, any> = {
    where: searchWhere,
    order: [["name", "ASC"]],
  };
  return paginate<Permission>(Permission, options, params);
};

// Get a permission by its ID
export const getPermissionById = async (id: number) => Permission.findByPk(id);

// Get a permission by its name
export const getPermissionByName = async (name: string) =>
  Permission.findOne({
    where: { name },
  });

// Get permissions by an array of names
export const getPermissionsByNames = async (names: string[]) =>
  Permission.findAll({
    where: {
      name: {
        $in: names,
      },
    },
  });

// Create a new permission
export const createPermission = async (data: Omit<Permission, "id">) => {
  const newPermission = await Permission.create(data);
  await newPermission.reload();
  return newPermission;
};

// Update a permission by its ID
export const updatePermission = async (id: number, data: Omit<Permission, "id">) => {
  await Permission.update(data, { where: { id } });
  return Permission.findByPk(id);
};

// Delete a permission by its ID
export const deletePermission = async (id: number) => Permission.destroy({ where: { id } });
