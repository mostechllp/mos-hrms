import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRolePermissions } from "../admin/store/slices/roleSlice";

export const usePermissions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { rolePermissions } = useSelector((state) => state.roles);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const userRoleId = user?.role?.id;
  const userType = user?.type || "employee";

  useEffect(() => {
    const loadPermissions = async () => {
      console.log("Loading permissions for user type:", userType);
      console.log("User role id:", userRoleId);
      
      if (userType === "admin") {
        // Admin has all permissions
        setUserPermissions({ all: true });
        setLoading(false);
        return;
      }

      // First check if user has permissions directly in the user object
      if (user?.permissions) {
        console.log("Permissions found directly in user object:", user.permissions);
        setUserPermissions(user.permissions);
        setLoading(false);
        return;
      }

      if (userRoleId) {
        // Check if we already have permissions for this role in Redux
        if (rolePermissions[userRoleId]) {
          console.log("Permissions found in Redux cache:", rolePermissions[userRoleId]);
          setUserPermissions(rolePermissions[userRoleId]);
          setLoading(false);
        } else {
          // Fetch permissions for the role
          console.log("Fetching permissions from API for role:", userRoleId);
          const result = await dispatch(fetchRolePermissions(userRoleId));
          if (result.payload) {
            console.log("Permissions fetched from API:", result.payload);
            setUserPermissions(result.payload);
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [dispatch, userRoleId, userType, rolePermissions, user]);

  const hasPermission = (module, action = "read") => {
    console.log(`Checking permission for module: ${module}, action: ${action}`);
    console.log("Current userPermissions:", userPermissions);
    
    // Admin has all permissions
    if (userType === "admin") return true;
    
    // If permissions object has 'all' flag
    if (userPermissions.all === true) return true;
    
    // Check if permission exists for the module
    if (module && userPermissions[module]) {
      const hasAccess = userPermissions[module][action] === true;
      console.log(`Permission for ${module}.${action}: ${hasAccess}`);
      return hasAccess;
    }
    
    console.log(`Module ${module} not found in permissions`);
    return false;
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(({ module, action = "read" }) => 
      hasPermission(module, action)
    );
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(({ module, action = "read" }) => 
      hasPermission(module, action)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userType,
    permissions: userPermissions,
    loading,
  };
};