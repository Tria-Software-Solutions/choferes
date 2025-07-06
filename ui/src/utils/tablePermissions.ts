import { PERMISSIONS } from "../constants/constants";

export const checkEditPermissions = (userPermissions?: string[]): boolean => {
  return !!(
    userPermissions?.includes(PERMISSIONS.EDIT_EMPLOYEES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_SCHEDULES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_VEHICLES) ||
    userPermissions?.includes(PERMISSIONS.EDIT_USER) ||
    userPermissions?.includes(PERMISSIONS.EDIT_ROLE)
  );
};

export const checkDeletePermissions = (userPermissions?: string[]): boolean => {
  return !!(
    userPermissions?.includes(PERMISSIONS.DELETE_EMPLOYEES) ||
    userPermissions?.includes(PERMISSIONS.DELETE_SCHEDULES) ||
    userPermissions?.includes(PERMISSIONS.DELETE_VEHICLES) ||
    userPermissions?.includes(PERMISSIONS.ENABLE_DISABLE_USER) ||
    userPermissions?.includes(PERMISSIONS.DELETE_ROLE)
  );
};

export const canEditUser = (
  rowId: number,
  currentUserId?: number,
  userPermissions?: string[]
): boolean => {
  return checkEditPermissions(userPermissions) && rowId !== currentUserId;
};

export const canDeleteUser = (
  rowId: number,
  currentUserId?: number,
  userPermissions?: string[]
): boolean => {
  return checkDeletePermissions(userPermissions) && rowId !== currentUserId;
}; 