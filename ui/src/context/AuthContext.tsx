import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../models/User";

// Helper functions for token storage with localStorage fallback
const setTokenWithFallback = (key: string, value: string, options?: Cookies.CookieAttributes) => {
  try {
    // Try to set cookie first
    Cookies.set(key, value, options);
    // Also store in localStorage as backup
    localStorage.setItem(key, value);
  } catch (error) {
    // Fallback to localStorage only
    localStorage.setItem(key, value);
  }
};

const getTokenWithFallback = (key: string): string | null => {
  try {
    // Try to get from cookie first
    const cookieValue = Cookies.get(key);
    if (cookieValue) return cookieValue;
    
    // Fallback to localStorage
    return localStorage.getItem(key);
  } catch (error) {
    // Fallback to localStorage only
    return localStorage.getItem(key);
  }
};

const removeTokenWithFallback = (key: string, options?: Cookies.CookieAttributes) => {
  try {
    // Try to remove from cookie first
    Cookies.remove(key, options);
    // Also remove from localStorage
    localStorage.removeItem(key);
  } catch (error) {
    // Fallback to localStorage only
    localStorage.removeItem(key);
  }
};

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  setUser: (updatedUser: User) => void;
  userPermissions: string[];
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

  // Handles login: sets tokens, user, and permissions in state, cookies, and sessionStorage
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
    
    // Check if we're in production to set appropriate cookie settings
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      expires: 1,
      secure: isProduction,
      sameSite: isProduction ? "none" as const : "lax" as const,
    };
    
    const refreshCookieOptions = {
      ...cookieOptions,
      expires: 7,
    };
    
    setTokenWithFallback("accessToken", accessToken, cookieOptions);
    setTokenWithFallback("refreshToken", refreshToken, refreshCookieOptions);
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("userPermissions", JSON.stringify(userPermissions));
  };

  // Handles logout: clears all auth state, cookies, and sessionStorage
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setUserPermissions([]);
    
    // Use same cookie options for removal as for setting
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      sameSite: isProduction ? "none" as const : "lax" as const,
    };
    
    removeTokenWithFallback("accessToken", cookieOptions);
    removeTokenWithFallback("refreshToken", cookieOptions);
    sessionStorage.clear();
  };

  // Updates the current user in state and sessionStorage
  const setUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        currentUser,
        userPermissions,
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
