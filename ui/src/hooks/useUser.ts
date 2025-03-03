import { useState, useEffect, useCallback } from "react";
import * as UserService from "../services/userService";
import * as UserRoleService from "../services/userRoleService";
import { User } from "../models/User";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Roles } from "../enums/roles";

export const useUsers = () => {
  const { currentUser, login, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCountUsers, setTotalCountUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegisterUser = async (newUser: Omit<User, "id">) => {
    const createdUser = await UserService.addUser(newUser);
    setUsers((prev) => [...prev, createdUser]);
    setTotalCountUsers((prev) => prev + 1);
    await UserRoleService.assignUserRole(createdUser.id, Roles.USER);
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

  const handleUpdateUser = async (id: number, updatedUser: Partial<User>) => {
    await UserService.getUserById(id);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const handleLogoutUser = () => {
    logout();
    navigate("/");
  };

  const handleDeleteUser = async (id: number) => {
    //await UserService.deleteUser(id);
    //setUsers((prev) => prev.filter((user) => user.id !== id));
    //setTotalCountUsers((prev) => prev - 1);
    //await UserRoleService.deleteAssignation(userId, roleId);
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  return {
    users,
    totalCountUsers,
    isLoadingUsers,
    authError,
    fetchUsers,
    handleRegisterUser,
    handleLoginUser,
    handleLogoutUser,
    handleUpdateUser,
    handleDeleteUser,
  };
};
