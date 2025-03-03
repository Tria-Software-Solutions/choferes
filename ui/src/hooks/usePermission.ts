import { useState, useEffect, useCallback } from "react";
import * as PermissionService from "../services/permissionService";
import { User } from "../models/User";
import { useAuth } from "../context/AuthContext";
import { Permission } from "../models/Permission";
import { useRoles } from "./useRole";

export const usePermissions = () => {
  const { currentUser } = useAuth();
  const { setRoles } = useRoles();
  const [permissions, setPermissions] = useState<User[]>([]);
  const [totalCountPermissions, setTotalCountPermissions] = useState(0);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    try {
      const data = await PermissionService.fetchPermissions();
      setPermissions(data);
      setTotalCountPermissions(data.length);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  const handleUpdatePermission = async (
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

  const handleDeletePermission = async (id: number) => {
    //await UserService.deletePermission(id);
    //setPermissions((prev) => prev.filter((permission) => permission.id !== id));
    //setTotalCountPermissions((prev) => prev - 1);
    //await RolePermissionService.deleteAssignation(userId, roleId);
  };

  useEffect(() => {
    if (currentUser) {
      fetchPermissions();
    }
  }, [currentUser, fetchPermissions]);

  return {
    permissions,
    totalCountPermissions,
    isLoadingPermissions,
    fetchPermissions,
    handleUpdatePermission,
    handleDeletePermission,
  };
};
