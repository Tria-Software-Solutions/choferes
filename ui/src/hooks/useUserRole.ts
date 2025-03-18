import { useState, useEffect, useCallback } from "react";
import * as UserRoleService from "../services/userRoleService";
import { UserRole } from "../models/UserRole";
import { useAuth } from "../context/AuthContext";

export const useUserRoles = () => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<UserRole[]>([]);
  const [totalCountUserRoles, setTotalCountUserRoles] = useState(0);
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false);

  const getUserRoles = useCallback(async () => {
    setIsLoadingUserRoles(true);
    try {
      const data = await UserRoleService.getUserRoles();
      setUserRole(data);
      setTotalCountUserRoles(data.length);
      return data;
    } catch (error) {
      console.error("Error fetching UserRoles:", error);
      return [];
    } finally {
      setIsLoadingUserRoles(false);
    }
  }, []);

  const getUserRoleByUserId = useCallback(async (userId: number) => {
    setIsLoadingUserRoles(true);
    try {
      return await UserRoleService.getUserRoleByUserId(userId);
    } catch (error) {
      console.error("Error fetching UserRole by userId", error);
    } finally {
      setIsLoadingUserRoles(false);
    }
  }, []);

  const createUserRole = async (newUserRole: Omit<UserRole, "id">) => {
    const createdUserRole = await UserRoleService.createUserRole(newUserRole);
    setUserRole((prev) => [...prev, createdUserRole]);
    setTotalCountUserRoles((prev) => prev + 1);
  };

  const updateUserRole = async (id: number, roleId: number) => {
    await UserRoleService.updateUserRole(id, roleId);
    setUserRole((prev) =>
      prev.map((userRole) =>
        userRole.id === id ? { ...userRole, roleId } : userRole
      )
    );
  };

  const deleteUserRole = async (id: number) => {
    await UserRoleService.deleteUserRole(id);
    setUserRole((prev) => prev.filter((userRole) => userRole.id !== id));
    setTotalCountUserRoles((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      getUserRoles();
    }
  }, [currentUser, getUserRoles]);

  return {
    userRole,
    totalCountUserRoles,
    isLoadingUserRoles,
    getUserRoles,
    getUserRoleByUserId,
    createUserRole,
    updateUserRole,
    deleteUserRole,
  };
};
