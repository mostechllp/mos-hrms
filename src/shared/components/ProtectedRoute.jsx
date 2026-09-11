import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../admin/components/common/Loader";

const ProtectedRoute = ({ requiredType, children }) => {
  const { isAuthenticated, userType, loading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin users
  if (userType === "admin") {
    // Admin trying to access employee route
    if (requiredType && requiredType !== "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return children || <Outlet />;
  }

  // Employee-side users
  const employeeTypes = ["employee", "hr", "manager", "team_lead"];

  if (employeeTypes.includes(userType)) {
    // Employee-side user trying to access admin route
    if (requiredType === "admin") {
      const currentPath = location.pathname;

      if (currentPath.startsWith("/admin")) {
        const rewrittenPath = currentPath.replace("/admin", "/employee");
        return <Navigate to={rewrittenPath} replace />;
      }

      return <Navigate to="/employee/dashboard" replace />;
    }

    return children || <Outlet />;
  }

  // Unknown/unsupported user type
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;