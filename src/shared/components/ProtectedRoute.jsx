import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../admin/components/common/Loader";

const ProtectedRoute = ({ requiredType, children }) => {
  const { isAuthenticated, userType, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && userType !== requiredType) {
    // Redirect to appropriate dashboard if wrong type
    const redirectPath = userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;