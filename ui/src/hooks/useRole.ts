import { useState, useEffect, useCallback } from "react";
import * as RoleService from "../services/roleService";
import { User } from "../models/User";
import { useAuth } from "../context/AuthContext";
import { Role } from "../models/Role";

export const useRoles = () => {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<User[]>([]);
  const [totalCountRoles, setTotalCountRoles] = useState(0);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const data = await RoleService.fetchRoles();
      setRoles(data);
      setTotalCountRoles(data.length);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const handleUpdateRole = async (id: number, updatedRole: Partial<Role>) => {
    await RoleService.getRoleById(id);
    setRoles((prev) =>
      prev.map((role) => (role.id === id ? { ...role, ...updatedRole } : role))
    );
  };

  const handleDeleteRole = async (id: number) => {
    //await UserService.deleteRole(id);
    //setRoles((prev) => prev.filter((role) => role.id !== id));
    //setTotalCountRoles((prev) => prev - 1);
    //await UserRoleService.deleteAssignation(userId, roleId);
  };

  useEffect(() => {
    if (currentUser) {
      fetchRoles();
    }
  }, [currentUser, fetchRoles]);

  return {
    roles,
    setRoles,
    totalCountRoles,
    isLoadingRoles,
    fetchRoles,
    handleUpdateRole,
    handleDeleteRole,
  };
};
