import { useState, useEffect, useCallback } from "react";
import * as RolePermissionService from "../services/rolePermissionService";
import { useAuth } from "../context/AuthContext";
import { RolePermission } from "../models/RolePermission";

export const useRolePermissions = () => {
  const { currentUser } = useAuth();
  const [rolePermission, setRolePermission] = useState<RolePermission[]>([]);
  const [totalCountRolePermissions, setTotalCountRolePermissions] = useState(0);
  const [isLoadingRolePermissions, setIsLoadingRolePermissions] =
    useState(false);

  const getRolePermission = useCallback(async (roleId: number) => {
    setIsLoadingRolePermissions(true);
    try {
      const data = await RolePermissionService.getRolePermissions(roleId);
      setRolePermission(data);
      setTotalCountRolePermissions(data.length);
      return data;
    } catch (error) {
      console.error("Error fetching rolePermissions:", error);
      return [];
    } finally {
      setIsLoadingRolePermissions(false);
    }
  }, []);

  const createRolePermission = async (
    newRolePermission: Omit<RolePermission, "id">
  ) => {
    const createdRolePermission = await RolePermissionService.createRolePermission(
      newRolePermission
    );
    setRolePermission((prev) => [...prev, createdRolePermission]);
    setTotalCountRolePermissions((prev) => prev + 1);
  };

  const deleteRolePermission = async (
    roleId: number,
    permissionId: number
  ) => {
    await RolePermissionService.deleteRolePermission(roleId, permissionId);
    setRolePermission((prev) =>
      prev.filter(
        (rolePermission) =>
          rolePermission.roleId !== roleId &&
          rolePermission.permissionId !== permissionId
      )
    );
    setTotalCountRolePermissions((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      //getRolePermission();
    }
  }, [currentUser, getRolePermission]);

  return {
    rolePermission,
    totalCountRolePermissions,
    isLoadingRolePermissions,
    getRolePermission,
    createRolePermission,
    deleteRolePermission,
  };
};
