import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../models/User";
import {
  setTokenWithFallback,
  getTokenWithFallback,
  removeTokenWithFallback,
} from "../utils/tokenStorage";
import { getUserPermissions } from "../services/userService";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  setUser: (updatedUser: User) => void;
  userPermissions: string[];
  loggedInAt: string | null;
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
    userPermissions: string[],
  ) => void;
  logout: () => void;
}

// AuthContext provides authentication state and logic for the application.
// Includes access/refresh tokens, current user, user permissions, and login/logout/setUser functions.
// Use useAuthContext() to access the context in child components.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State for access token, initialized from cookies or localStorage fallback
  const [accessToken, setAccessToken] = useState(() => {
    return getTokenWithFallback("accessToken");
  });

  // State for refresh token, initialized from cookies or localStorage fallback
  const [refreshToken, setRefreshToken] = useState(() => {
    return getTokenWithFallback("refreshToken");
  });

  // State for current user, initialized from sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // State for user permissions, initialized from sessionStorage
  const [userPermissions, setUserPermissions] = useState(() => {
    const storedUserPermissions = sessionStorage.getItem("userPermissions");
    return storedUserPermissions ? JSON.parse(storedUserPermissions) : [];
  });

  // State for the login timestamp, initialized from sessionStorage
  const [loggedInAt, setLoggedInAt] = useState<string | null>(() => {
    return sessionStorage.getItem("loggedInAt");
  });

  // Handles login: sets tokens (in-memory; httpOnly cookies are set by the
  // backend), user and permissions in state/sessionStorage
  const login = (
    accessToken: string,
    refreshToken: string,
    currentUser: User,
    userPermissions: string[],
  ) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setCurrentUser(currentUser);
    setUserPermissions(userPermissions);
    const loginTime = new Date().toISOString();
    setLoggedInAt(loginTime);

    setTokenWithFallback("accessToken", accessToken);
    setTokenWithFallback("refreshToken", refreshToken);
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("userPermissions", JSON.stringify(userPermissions));
    sessionStorage.setItem("loggedInAt", loginTime);
  };

  // Handles logout: clears all auth state and sessionStorage
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setUserPermissions([]);
    setLoggedInAt(null);

    removeTokenWithFallback("accessToken");
    removeTokenWithFallback("refreshToken");
    sessionStorage.clear();
  };

  // Updates the current user in state and sessionStorage
  const setUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  // Refresh permissions from the server on mount so DB changes
  // (e.g. newly granted permissions) take effect without re-login
  useEffect(() => {
    let cancelled = false;
    if (!accessToken || !currentUser?.id) return;

    getUserPermissions(currentUser.id)
      .then((permissions) => {
        if (cancelled) return;
        setUserPermissions(permissions);
        sessionStorage.setItem("userPermissions", JSON.stringify(permissions));
      })
      .catch(() => {
        // Keep the sessionStorage permissions on failure
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, currentUser?.id]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        currentUser,
        userPermissions,
        loggedInAt,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  // Custom hook to access the AuthContext
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
