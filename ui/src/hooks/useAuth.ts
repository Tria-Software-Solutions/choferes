import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { authenticateUser as authenticateUserService } from "../services/userService";

export const useAuth = () => {
  const [authError, setAuthError] = useState<string>("");
  const { login, logout } = useAuthContext();
  const navigate = useNavigate();

  const authenticateUser = async (identifier: string, password: string) => {
    try {
      const response = await authenticateUserService(identifier, password);
      login(
        response.accessToken,
        response.refreshToken,
        response.user,
        response.userPermissions || [],
      );
      navigate("/dashboard");
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
