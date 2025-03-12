import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../models/User";

interface AuthContextType {
  currentUser: User | null;
  userPermissions: string[];
  login: (user: User, userPermissions: string[], accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userPermissions, setUserPermissions] = useState(() => {
    const storedUserPermissions = sessionStorage.getItem("userPermissions");
    return storedUserPermissions ? JSON.parse(storedUserPermissions) : [];
  });


  const login = (
    currentUser: User,
    userPermissions: string[],
    accessToken: string,
    refreshToken: string
  ) => {
    setCurrentUser(currentUser);
    setUserPermissions(userPermissions);
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("userPermissions", JSON.stringify(userPermissions));
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
  };

  const logout = () => {
    setCurrentUser(null);
    setUserPermissions(null);
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("userPermissions");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userPermissions, login, logout }}
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
