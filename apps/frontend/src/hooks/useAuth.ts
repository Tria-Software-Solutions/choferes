import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasManagementRole } from "@choferes/shared";
import { useAuthContext } from "../context/AuthContext";
import { authenticateUser as authenticateUserService } from "../services/userService";
import { getDefaultRoute } from "../utils/defaultRoute";
import ROUTES from "../constants/routes.constants";

interface Role {
  permissions?: Array<{ code: string }>;
}

interface Permission {
  code: string;
}

// Custom hook for authentication logic and user session management
export const useAuth = () => {
  const [authError, setAuthError] = useState<string>("");
  const { login, logout } = useAuthContext();
  const navigate = useNavigate();

  // Authenticates the user and handles login, permissions extraction, and navigation
  const authenticateUser = async (identifier: string, password: string) => {
    try {
      const response = await authenticateUserService(identifier, password);

      // Extract permission CODES from the nested structure: user.roles.permissions.
      // The frontend gates against stable codes (PERMISSION_CODES.*), so labels
      // (permission.name) are never used for authorization.
      const userPermissions: string[] = [];
      if (response.user?.roles) {
        response.user.roles.forEach((role: Role) => {
          if (role.permissions) {
            role.permissions.forEach((permission: Permission) => {
              if (permission.code && typeof permission.code === "string") {
                userPermissions.push(permission.code);
              }
            });
          }
        });
      }

      // Remove duplicates
      const uniquePermissions = Array.from(new Set(userPermissions));

      login(
        response.accessToken,
        response.refreshToken,
        response.user,
        uniquePermissions,
      );

      // Redirect to the first available route based on permissions. Roles solo
      // es landing para Gerencia/Administrativo.
      const defaultRoute = getDefaultRoute(
        uniquePermissions,
        hasManagementRole(response.user),
      );
      navigate(defaultRoute);
    } catch (error: unknown) {
      let errorMessage = "Error de autenticación";

      if (typeof error === "object" && error && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string; details?: unknown } };
        };
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;

          if (err.response.data.details) {
            if (typeof err.response.data.details === "string") {
              errorMessage += `: ${err.response.data.details}`;
            } else if (typeof err.response.data.details === "object") {
              const fieldErrors = Object.values(err.response.data.details)
                .filter(Boolean)
                .join(", ");
              if (fieldErrors) {
                errorMessage += `: ${fieldErrors}`;
              }
            }
          }
        }
      } else if (typeof error === "object" && error && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      setAuthError(errorMessage);
      throw error;
    }
  };

  // Logs out the user and navigates to the home page
  const logoutUser = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return {
    authError,
    authenticateUser,
    logoutUser,
  };
};
