import { useState, useEffect, useCallback } from "react";
import * as UserService from "../services/userService";
import { User } from "../models/User";
import { useNavigate } from "react-router-dom";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
    console.log("username: ", username);
    console.log("password: ", password);
    setAuthError(null);
    try {
      const loginData = await UserService.loginUser(username, password);
      console.log("loginData: ", loginData);
      setCurrentUser(loginData.user);
      localStorage.setItem("token", loginData.token);
      navigate("/roles");
    } catch (error) {
      setAuthError("Login failed. Please check your credentials.");
    }
  };

  const handleUpdateUser = async (id: number, updatedUser: Partial<User>) => {
    await UserService.getUserById(id);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    totalCount,
    isLoadingUsers,
    currentUser,
    authError,
    fetchUsers,
    handleRegisterUser,
    handleLoginUser,
    handleLogoutUser,
    handleUpdateUser,
  };
};
