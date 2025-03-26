import { useState, useEffect, useCallback } from "react";
import * as PermissionService from "../services/permissionService";
import { useRoles } from "./useRole";
import { Permission } from "../models/Permission";
import { useAuth } from "../context/AuthContext";

export const usePermissions = () => {
  const { currentUser } = useAuth();
  const { setRoles } = useRoles();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [totalCountPermissions, setTotalCountPermissions] = useState(0);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const getPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    try {
      const data = await PermissionService.getPermissions();
      setPermissions(data);
      setTotalCountPermissions(data.length);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  const getPermissionsByNames = useCallback(async (names: string[]) => {
    setIsLoadingPermissions(true);
    try {
      return await PermissionService.getPermissionsByNames(names);
    } catch (error) {
      console.error("Error fetching Permissions by Name", error);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  const updatePermission = async (
    id: number,
    updatedPermission: Partial<Permission>
  ) => {
    await PermissionService.getPermissionById(id);
    setRoles((prev) =>
      prev.map((permission) =>
        permission.id === id
          ? { ...permission, ...updatedPermission }
          : permission
      )
    );
  };

  const deletePermission = async (id: number) => {
    await PermissionService.deletePermission(id);
    setPermissions((prev) => prev.filter((permission) => permission.id !== id));
    setTotalCountPermissions((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      getPermissions();
    }
  }, [currentUser, getPermissions]);

  return {
    permissions,
    totalCountPermissions,
    isLoadingPermissions,
    getPermissions,
    getPermissionsByNames,
    updatePermission,
    deletePermission,
  };
};
