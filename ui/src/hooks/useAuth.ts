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
    } catch (error: any) {
      let errorMessage = "Error de autenticación";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        if (error.response.data.details) {
          if (typeof error.response.data.details === 'string') {
            errorMessage += `: ${error.response.data.details}`;
          } else if (typeof error.response.data.details === 'object') {
            const fieldErrors = Object.values(error.response.data.details)
              .filter(Boolean)
              .join(', ');
            if (fieldErrors) {
              errorMessage += `: ${fieldErrors}`;
            }
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
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
