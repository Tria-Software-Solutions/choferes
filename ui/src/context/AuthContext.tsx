import { createContext, useContext, useState } from "react";
import { User } from "../models/User";

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  userPermissions: string[];
  login: (user: User, token: string, userPermissions: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const storedToken = sessionStorage.getItem("token");
    return storedToken ? storedToken : null;
  });

  const [userPermissions, setUserPermissions] = useState(() => {
    const storedUserPermissions = sessionStorage.getItem("userPermissions");
    return storedUserPermissions ? JSON.parse(storedUserPermissions) : [];
  });


  const login = (
    currentUser: User,
    token: string,
    userPermissions: string[]
  ) => {
    setCurrentUser(currentUser);
    setToken(token);
    setUserPermissions(userPermissions);
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userPermissions", JSON.stringify(userPermissions));
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userPermissions");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, userPermissions, login, logout }}
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
