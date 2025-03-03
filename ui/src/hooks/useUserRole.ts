import { useState, useEffect, useCallback } from "react";
import * as UserRoleService from "../services/userRoleService";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../models/UserRole";

export const useUserRoles = () => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<UserRole[]>([]);
  const [totalCountUserRoles, setTotalCountUserRoles] = useState(0);
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false);

  const getUserRoles = useCallback(async (roleId: number) => {
    setIsLoadingUserRoles(true);
    try {
      const data = await UserRoleService.getUserRoles(roleId);
      setUserRole(data);
      setTotalCountUserRoles(data.length);
      return data;
    } catch (error) {
      console.error("Error fetching userRoles:", error);
      return [];
    } finally {
      setIsLoadingUserRoles(false);
    }
  }, []);

  const createUserRole = async (newUserRole: Omit<UserRole, "id">) => {
    const createdUserRole = await UserRoleService.createUserRole(newUserRole);
    setUserRole((prev) => [...prev, createdUserRole]);
    setTotalCountUserRoles((prev) => prev + 1);
  };

  const deleteUserRole = async (userId: number, roleId: number) => {
    await UserRoleService.deleteUserRole(userId, roleId);
    setUserRole((prev) =>
      prev.filter(
        (userRole) => userRole.userId !== userId && userRole.roleId !== roleId
      )
    );
    setTotalCountUserRoles((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      //getUserRoles();
    }
  }, [currentUser, getUserRoles]);

  return {
    userRole,
    totalCountUserRoles,
    isLoadingUserRoles,
    getUserRoles,
    createUserRole,
    deleteUserRole,
  };
};
