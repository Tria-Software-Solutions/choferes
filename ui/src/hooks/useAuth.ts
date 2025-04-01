import { useState } from "react";
import * as UserService from "../services/userService";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { login, logout } = useAuthContext();
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const authenticateUser = async (identifier: string, password: string) => {
    setAuthError(null);
    try {
      const response = await UserService.authenticateUser(identifier, password);
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

  return {
    authError,
    authenticateUser,
    logoutUser,
  };
};
