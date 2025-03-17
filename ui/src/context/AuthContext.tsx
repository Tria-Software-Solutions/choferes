import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../models/User";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  userPermissions: string[];
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
    userPermissions: string[]
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState(() => {
    const storedAccessToken = Cookies.get("accessToken");
    return storedAccessToken ? storedAccessToken : null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    const storedRefreshToken = Cookies.get("refreshToken");
    return storedRefreshToken ? storedRefreshToken : null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userPermissions, setUserPermissions] = useState(() => {
    const storedUserPermissions = sessionStorage.getItem("userPermissions");
    return storedUserPermissions ? JSON.parse(storedUserPermissions) : [];
  });

  const login = (
    accessToken: string,
    refreshToken: string,
    currentUser: User,
    userPermissions: string[]
  ) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setCurrentUser(currentUser);
    setUserPermissions(userPermissions);
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("userPermissions", JSON.stringify(userPermissions));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setUserPermissions(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    sessionStorage.clear();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
