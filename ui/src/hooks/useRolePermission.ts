import { useState, useEffect, useCallback } from "react";
import * as RolePermissionService from "../services/rolePermissionService";
import { useAuth } from "../context/AuthContext";
import { RolePermission } from "../models/RolePermission";

export const useRolePermissions = () => {
  const { currentUser } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [totalCountRolePermissions, setTotalCountRolePermissions] = useState(0);
  const [isLoadingRolePermissions, setIsLoadingRolePermissions] =
    useState(false);

  const getRolePermissions = useCallback(async () => {
    setIsLoadingRolePermissions(true);
    try {
      const data = await RolePermissionService.getRolePermissions();
      setRolePermissions(data);
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
    const createdRolePermission =
      await RolePermissionService.createRolePermission(newRolePermission);
    setRolePermissions((prev) => [...prev, createdRolePermission]);
    setTotalCountRolePermissions((prev) => prev + 1);
  };

  const deleteRolePermission = async (id: number) => {
    await RolePermissionService.deleteRolePermission(id);
    setRolePermissions((prev) =>
      prev.filter((rolePermission) => rolePermission.id !== id)
    );
    setTotalCountRolePermissions((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      getRolePermissions();
    }
  }, [currentUser, getRolePermissions]);

  return {
    rolePermission: rolePermissions,
    totalCountRolePermissions,
    isLoadingRolePermissions,
    getRolePermissions,
    createRolePermission,
    deleteRolePermission,
  };
};
