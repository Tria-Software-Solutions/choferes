import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../models/User";

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
  // State for access token, initialized from cookies
  const [accessToken, setAccessToken] = useState(() => {
    const storedAccessToken = Cookies.get("accessToken");
    return storedAccessToken ? storedAccessToken : null;
  });

  // State for refresh token, initialized from cookies
  const [refreshToken, setRefreshToken] = useState(() => {
    const storedRefreshToken = Cookies.get("refreshToken");
    return storedRefreshToken ? storedRefreshToken : null;
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
    
    Cookies.set("accessToken", accessToken, cookieOptions);
    Cookies.set("refreshToken", refreshToken, refreshCookieOptions);
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
    
    Cookies.remove("accessToken", cookieOptions);
    Cookies.remove("refreshToken", cookieOptions);
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
