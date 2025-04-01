import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { currentUser } = useAuthContext();
  return currentUser ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
