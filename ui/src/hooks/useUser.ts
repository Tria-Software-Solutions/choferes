import { useState, useEffect, useCallback } from "react";
import * as UserService from "../services/userService";
import { User } from "../models/User";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useUsers = () => {
  const { currentUser, login, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await UserService.fetchUsers();
      setUsers(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const handleRegisterUser = async (newUser: User) => {
    await UserService.registerUser(newUser);
    setUsers((prev) => [...prev, newUser]);
    setTotalCount((prev) => prev + 1);
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

  const handleUpdateUser = async (id: number, updatedUser: Partial<User>) => {
    await UserService.getUserById(id);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const handleLogoutUser = () => {
    localStorage.removeItem("lastRoute");
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  return {
    users,
    totalCount,
    isLoadingUsers,
    authError,
    fetchUsers,
    handleRegisterUser,
    handleLoginUser,
    handleLogoutUser,
    handleUpdateUser,
  };
};
