import { useState, useEffect, useCallback } from "react";
import * as RoleService from "../services/roleService";
import * as RolePermissionService from "../services/rolePermissionService";
import { useAuth } from "../context/AuthContext";
import { Role } from "../models/Role";
import { useRolePermissions } from "./useRolePermission";

export const useRoles = () => {
  const { currentUser } = useAuth();
  const { createRolePermission } = useRolePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalCountRoles, setTotalCountRoles] = useState(0);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const getRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const data = await RoleService.getRoles();
      setRoles(data);
      setTotalCountRoles(data.length);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const getRoleById = useCallback(async (id: number) => {
    setIsLoadingRoles(true);
    try {
      return await RoleService.getRoleById(id);
    } catch (error) {
      console.error("Error fetching Role by Id", error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const getRoleByName = useCallback(async (name: string) => {
    setIsLoadingRoles(true);
    try {
      return await RoleService.getRoleByName(name);
    } catch (error) {
      console.error("Error fetching Role by Name", error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const createRole = async (
    newRole: Omit<Role, "id">,
    newPermissionIds?: number[]
  ) => {
    const createdRole = await RoleService.createRole(newRole);
    setRoles((prev) => [...prev, createdRole]);
    setTotalCountRoles((prev) => prev + 1);
    if (Array.isArray(newPermissionIds) && newPermissionIds.length > 0) {
      await Promise.all(
        newPermissionIds.map((permissionId) =>
          createRolePermission({
            roleId: createdRole.id,
            permissionId,
          })
        )
      );
    }
  };

  const updateRole = async (
    id: number,
    updatedRole: Partial<Role>,
    newPermissionIds?: number[]
  ) => {
    await RoleService.updateRole(id, updatedRole);
    if (newPermissionIds) {
      await RolePermissionService.updateRolePermission(id, newPermissionIds);
    }
    setRoles((prev) =>
      prev.map((role) => (role.id === id ? { ...role, ...updatedRole } : role))
    );

    setRoles((prev) =>
      prev.map((role) =>
        role.id === id
          ? {
              ...role,
              ...updatedRole,
              permissionIds: newPermissionIds ?? role.permissionIds,
            }
          : role
      )
    );
  };

  const deleteRole = async (id: number) => {
    await RoleService.deleteRole(id);
    setRoles((prev) => prev.filter((role) => role.id !== id));
    setTotalCountRoles((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      getRoles();
    }
  }, [currentUser, getRoles]);

  return {
    roles,
    setRoles,
    totalCountRoles,
    isLoadingRoles,
    getRoles,
    getRoleById,
    getRoleByName,
    createRole,
    updateRole,
    deleteRole,
  };
};
