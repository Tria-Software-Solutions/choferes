import { useState, useEffect, useCallback } from "react";
import * as UserService from "../services/userService";
import * as RoleService from "../services/roleService";
import { useUserRoles } from "./useUserRole";
import { User } from "../models/User";
import { UserRole } from "../models/UserRole";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Roles } from "../enums/roles";

export const useUsers = () => {
  const { currentUser, login, logout } = useAuth();
  const { createUserRole, deleteUserRole } = useUserRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCountUsers, setTotalCountUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const authenticateUser = async (username: string, password: string) => {
    setAuthError(null);
    try {
      const response = await UserService.authenticateUser(username, password);
      const userPermissions = await UserService.getUserPermissions(
        response.user.id
      );
      login(
        response.accessToken,
        response.refreshToken,
        response.user,
        userPermissions
      );
      navigate("/roles");
    } catch (error) {
      setAuthError("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logoutUser = () => {
    logout();
    navigate("/");
  };

  const getUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
      setTotalCountUsers(data.length);
    } catch (error) {
      console.error("Error fetching Users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const getUserById = useCallback(async (id: number) => {
    setIsLoadingUsers(true);
    try {
      return await UserService.getUserById(id);
    } catch (error) {
      console.error("Error fetching User by Id", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const getUserByUsername = useCallback(async (username: string) => {
    setIsLoadingUsers(true);
    try {
      return await UserService.getUserByUsername(username);
    } catch (error) {
      console.error("Error fetching User by Username", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const getUserPermissions = useCallback(async (id: number) => {
    setIsLoadingUsers(true);
    try {
      return await UserService.getUserPermissions(id);
    } catch (error) {
      console.error("Error fetching User with Permissions", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const createUser = async (newUser: Omit<User, "id" | "role">) => {
    const createdUser = await UserService.createUser(newUser);
    setUsers((prev) => [...prev, createdUser]);
    setTotalCountUsers((prev) => prev + 1);
    const createdUserRole: Omit<UserRole, "id"> = {
      userId: createdUser.id,
      roleId: Roles.USER,
    };
    createUserRole(createdUserRole);
    navigate("/");
  };

  const updateUser = async (id: number, updatedUser: Partial<User>) => {
    await UserService.updateUser(id, updatedUser);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const deleteUser = async (userId: number, userRoleId: number) => {
    deleteUserRole(userRoleId);
    await UserService.deleteUser(userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setTotalCountUsers((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentUser) {
      getUsers();
    }
  }, [currentUser, getUsers]);

  return {
    users,
    totalCountUsers,
    isLoadingUsers,
    authError,
    authenticateUser,
    logoutUser,
    getUsers,
    getUserById,
    getUserPermissions,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
  };
};
