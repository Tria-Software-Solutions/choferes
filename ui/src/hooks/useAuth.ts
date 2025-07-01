import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { authenticateUser as authenticateUserService } from "../services/userService";
import { PERMISSIONS, ROUTES } from "../constants/constants";

interface Role {
  permissions?: Array<{ name: string }>;
}

interface Permission {
  name: string;
}

export const useAuth = () => {
  const [authError, setAuthError] = useState<string>("");
  const { login, logout } = useAuthContext();
  const navigate = useNavigate();

  const getDefaultRoute = (userPermissions: string[]) => {
    // Define the order of preference for routes
    const routePreferences = [
      { route: ROUTES.ROLES, permission: PERMISSIONS.VIEW_ROLES },
      { route: ROUTES.DASHBOARD, permission: PERMISSIONS.VIEW_ADMIN },
      { route: ROUTES.EMPLOYEES, permission: PERMISSIONS.VIEW_EMPLOYEES },
      { route: ROUTES.SCHEDULES, permission: PERMISSIONS.VIEW_SCHEDULES },
      { route: ROUTES.VEHICLES, permission: PERMISSIONS.VIEW_VEHICLES },
      {
        route: ROUTES.COURIER_SERVICE,
        permission: PERMISSIONS.VIEW_COURIER_SERVICE,
      },
    ];

    // Find the first route the user has permission to access
    for (const { route, permission } of routePreferences) {
      if (userPermissions.includes(permission)) {
        return route;
      }
    }

    // If no specific permissions, default to courier service (most basic)
    return ROUTES.COURIER_SERVICE;
  };

  const authenticateUser = async (identifier: string, password: string) => {
    try {
      const response = await authenticateUserService(identifier, password);

      // Extract permissions from the nested structure: user.roles.permissions
      const userPermissions: string[] = [];
      if (response.user?.roles) {
        response.user.roles.forEach((role: Role) => {
          if (role.permissions) {
            role.permissions.forEach((permission: Permission) => {
              if (permission.name && typeof permission.name === "string") {
                userPermissions.push(permission.name);
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

      // Redirect to the first available route based on permissions
      const defaultRoute = getDefaultRoute(uniquePermissions);
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
