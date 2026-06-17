import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../admin/components/common/Loader";

const ProtectedRoute = ({ requiredType, children }) => {
  const { isAuthenticated, userType, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && userType !== requiredType) {
    // If an HR user (employee type) tries to access an admin-hardcoded route, auto-redirect to employee equivalent
    if (userType === "employee" && requiredType === "admin") {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/admin')) {
        const rewrittenPath = currentPath.replace('/admin', '/employee');
        return <Navigate to={rewrittenPath} replace />;
      }
    }

    // Redirect to appropriate dashboard if wrong type
    const redirectPath = userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;