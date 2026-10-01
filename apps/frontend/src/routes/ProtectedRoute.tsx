import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import ROUTES from "../constants/routes.constants";

const ProtectedRoute = () => {
  const { currentUser } = useAuthContext();
  return currentUser ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
