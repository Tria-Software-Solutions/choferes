import { useState, useEffect, useCallback } from "react";
import * as UserService from "../services/userService";
import * as RoleService from "../services/roleService";
import * as PermissionService from "../services/permissionService";
import * as UserRoleService from "../services/userRoleService";
import { User } from "../models/User";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";

export const useUsers = () => {
  const { currentUser, login, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<User[]>([]);
  const [totalCountUsers, setTotalCountUsers] = useState(0);
  const [totalCountRoles, setTotalCountRoles] = useState(0);
  const [totalCountPermissions, setTotalCountPermissions] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegisterUser = async (newUser: User) => {
    await UserService.registerUser(newUser);
    setUsers((prev) => [...prev, newUser]);
    setTotalCountUsers((prev) => prev + 1);
    await UserRoleService.assignUserRole(newUser.id, 0);
    navigate("/");
  };

  const handleLoginUser = async (username: string, password: string) => {
    setAuthError(null);
    try {
      const loginData = await UserService.loginUser(username, password);
      login(loginData.user, loginData.token);
      navigate("/roles");
    } catch (error) {
      setAuthError("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await UserService.fetchUsers();
      setUsers(data);
      setTotalCountUsers(data.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

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

  const handleUpdateUser = async (id: number, updatedUser: Partial<User>) => {
    await UserService.getUserById(id);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const handleUpdateRole = async (id: number, updatedRole: Partial<Role>) => {
    await RoleService.getRoleById(id);
    setRoles((prev) =>
      prev.map((role) => (role.id === id ? { ...role, ...updatedRole } : role))
    );
  };

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

  const handleLogoutUser = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchRoles();
      fetchPermissions();
    }
  }, [currentUser, fetchUsers, fetchRoles, fetchPermissions]);

  return {
    users,
    roles,
    permissions,
    totalCountUsers,
    totalCountRoles,
    totalCountPermissions,
    isLoadingUsers,
    isLoadingRoles,
    isLoadingPermissions,
    authError,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    handleRegisterUser,
    handleLoginUser,
    handleLogoutUser,
    handleUpdateUser,
    handleUpdateRole,
    handleUpdatePermission,
  };
};
