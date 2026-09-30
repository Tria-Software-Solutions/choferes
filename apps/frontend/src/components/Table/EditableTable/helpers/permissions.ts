import { PERMISSION_CODES } from "../../../../constants/constants";

/**
 * Checks if user has edit permissions for a specific item
 */
export const checkEditPermissions = (
  permissions: string[] | undefined,
  itemPermissions?: string[],
): boolean => {
  if (!permissions) return false;
  
  const requiredPermissions = itemPermissions || [Object.values(PERMISSION_CODES)[0]];
  return requiredPermissions.some((permission) => permissions.includes(permission));
};

/**
 * Checks if user has delete permissions for a specific item
 */
export const checkDeletePermissions = (
  permissions: string[] | undefined,
  itemPermissions?: string[],
): boolean => {
  if (!permissions) return false;
  
  const requiredPermissions = itemPermissions || [Object.values(PERMISSION_CODES)[0]];
  return requiredPermissions.some((permission) => permissions.includes(permission));
}; 