import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
// Modal imports for employee
import MissedPunchOutModal from "../../employee/components/modals/MissedPunchoutModal";
import MissedPunchInModal from "../../employee/components/modals/MissedPunchInModal";
import LateCheckinModal from "../../employee/components/modals/LateCheckinModal";
import EarlyCheckinModal from "../../employee/components/modals/EarlyCheckinModal";
import { useDispatch, useSelector } from "react-redux";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Employee modal states
  const [showEarlyCheckin, setShowEarlyCheckin] = useState(false);
  const [showLateCheckin, setShowLateCheckin] = useState(false);
  const [showMissedPunchIn, setShowMissedPunchIn] = useState(false);
  const [showMissedPunchOut, setShowMissedPunchOut] = useState(false);

  // Get user type from the actual data structure (type instead of userType)
  const userType = user?.type;
  // Get permissions directly from user object
  const userPermissions = user?.permissions || {};
  // Get sidebar modules from user object
  const sidebarModules = user?.sidebar_modules || [];

  // Debug log
  console.log("Sidebar Debug:", { 
    user, 
    userType,
    userPermissions,
    sidebarModules
  });

  // Check if user has permission for a module (using the permissions structure from your API)
  const hasPermission = (moduleSlug, permissionType = "read") => {
    if (!moduleSlug) return true;
    
    // Super admins or roles with 'all' permissions can access everything
    if (userPermissions && userPermissions.all === true) return true;
    
    const modulePerm = userPermissions[moduleSlug];
    if (!modulePerm) return false;
    
    if (permissionType === "read") return modulePerm.read || false;
    if (permissionType === "edit") return modulePerm.edit || false;
    if (permissionType === "delete") return modulePerm.delete || false;
    
    return false;
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile, setIsOpen]);

  // Define menu items for admin
  const adminMenuItems = [
    { path: "/admin/dashboard", icon: "fas fa-chart-line", label: "Dashboard", moduleSlug: "dashboard" },
    { path: "/admin/employees/onboarding", icon: "fas fa-user-plus", label: "Onboarding", moduleSlug: "onboarding" },
    { path: "/admin/employees/offboarding", icon: "fas fa-user-minus", label: "Offboarding", moduleSlug: "offboarding" },
    { path: "/admin/employees", icon: "fas fa-users", label: "Employees", moduleSlug: "employees" },
    { path: "/admin/attendances", icon: "fas fa-fingerprint", label: "Attendance", moduleSlug: "attendance" },
    { path: "/admin/documents", icon: "fas fa-file-signature", label: "Documents", moduleSlug: "documents" },
    { path: "/admin/leaves", icon: "fas fa-calendar-check", label: "Leaves", moduleSlug: "leave" },
    { path: "/admin/task-reports", icon: "fas fa-tasks", label: "Task Reports", moduleSlug: "reports" },
    { path: "/admin/reports", icon: "fas fa-chart-line", label: "Reports", moduleSlug: "reports" },
    { path: "/admin/projects", icon: "fas fa-file", label: "Projects", moduleSlug: "projects" },
    { path: "/admin/tasks", icon: "fas fa-tasks", label: "Tasks", moduleSlug: "tasks" },
    { path: "/admin/payroll/add", icon: "fas fa-file-invoice-dollar", label: "Payroll", moduleSlug: "payroll" },
    { path: "/admin/role-management", icon: "fas fa-user-shield", label: "Roles", moduleSlug: "roles" },
    { path: "/admin/settings", icon: "fas fa-gear", label: "Settings", moduleSlug: "settings" },
  ];

  // Map for employee menu items (based on sidebar_modules)
  const getEmployeeNavItems = () => {
    const employeeMenuMap = {
      dashboard: { path: "/employee/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
      employees: { path: "/employee/employees", icon: "fas fa-users", label: "Employees" },
      projects: { path: "/employee/projects", icon: "fas fa-file", label: "Projects" },
      attendance: { path: "/employee/attendance", icon: "fas fa-fingerprint", label: "Attendance" },
      leave: { path: "/employee/leaves", icon: "fas fa-calendar-check", label: "My Leaves" },
      documents: { path: "/employee/documents", icon: "fas fa-file", label: "Documents" },
      reports: { path: "/employee/reports", icon: "fas fa-chart-line", label: "Reports" },
    };

    // Additional employee menus not in sidebar_modules
    const additionalEmployeeMenus = [
      { path: "/employee/tasks", icon: "fas fa-tasks", label: "My Tasks", moduleSlug: "tasks" },
      { path: "/employee/task-reports", icon: "fas fa-clipboard-list", label: "Task Reports", moduleSlug: "reports" },
      { path: "/employee/profile", icon: "fas fa-user-circle", label: "My Profile", moduleSlug: "profile" },
    ];

    // Build menus from sidebar_modules
    const menusFromModules = sidebarModules
      .filter(module => module.status === "active")
      .map(module => {
        const menuItem = employeeMenuMap[module.slug];
        if (menuItem && hasPermission(module.slug, "read")) {
          return {
            ...menuItem,
            moduleSlug: module.slug
          };
        }
        return null;
      })
      .filter(item => item !== null);

    // Add additional menus that have read permission
    const allowedAdditionalMenus = additionalEmployeeMenus.filter(menu => {
      if (menu.moduleSlug === "profile") return true; // Profile always shows
      return hasPermission(menu.moduleSlug, "read");
    });

    return [...menusFromModules, ...allowedAdditionalMenus];
  };

  // Build navigation items based on user type
  const getNavItems = () => {
    if (userType === "admin") {
      // Filter admin menus based on permissions
      return adminMenuItems.filter(item => {
        return hasPermission(item.moduleSlug, "read");
      });
    } else if (userType === "employee") {
      return getEmployeeNavItems();
    }
    return [];
  };

  // Attendance submenu items for employees
  const attendanceSubmenus = [
    {
      label: "Early Check-in",
      icon: "fas fa-sun",
      action: () => setShowEarlyCheckin(true),
      moduleSlug: "attendance",
      permissionType: "edit"
    },
    {
      label: "Late Check-in",
      icon: "fas fa-moon",
      action: () => setShowLateCheckin(true),
      moduleSlug: "attendance",
      permissionType: "edit"
    },
    {
      label: "Missed Punch In",
      icon: "fas fa-fingerprint",
      action: () => setShowMissedPunchIn(true),
      moduleSlug: "attendance",
      permissionType: "edit"
    },
    {
      label: "Missed Punch Out",
      icon: "fas fa-door-open",
      action: () => setShowMissedPunchOut(true),
      moduleSlug: "attendance",
      permissionType: "edit"
    },
  ];

  // Filter attendance submenus based on permissions
  const getAttendanceSubmenus = () => {
    if (userType !== "employee") return [];
    return attendanceSubmenus.filter(submenu => 
      hasPermission(submenu.moduleSlug, submenu.permissionType)
    );
  };

  const navItems = getNavItems();
  const isMyRequestsActive = location.pathname === "/employee/attendance-requests";

  // If no user data, return null
  if (!user || !userType) {
    console.log("No user data available");
    return null;
  }

  // Render Admin Sidebar (Desktop style with hover expand)
  if (userType === "admin") {
    return (
      <>
        {/* Mobile overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full bg-gray-900 z-50 transition-all duration-300
            flex flex-col
            ${isMobile
              ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-64`
              : "w-[72px] hover:w-64 group"
            }
          `}
          onMouseEnter={() => !isMobile && setIsOpen(true)}
          onMouseLeave={() => !isMobile && setIsOpen(false)}
        >
          {/* Logo Section */}
          <div className="flex-shrink-0 py-5 px-4 border-b border-white/10 flex justify-center items-center">
            <img
              src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
              alt="HMR Logo"
              className={`object-contain rounded-lg bg-white p-1 transition-all duration-300 ${!isMobile && !isOpen ? "w-10 h-10" : "w-12 h-12"}`}
            />
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/employees" || item.path === "/admin/dashboard"}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden ${
                    isActive
                      ? "bg-green-500/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <i className={item.icon + " w-6 text-lg flex-shrink-0"}></i>
                <span
                  className={`transition-opacity duration-200 ${
                    !isMobile && !isOpen
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Render Employee Sidebar
  return (
    <>
      {/* Mobile overlay for employee sidebar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Employee Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img
            src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
            alt="HMR Logo"
            className="logo-img"
          />
        </div>

        <nav>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Attendance Requests Section for Employees */}
          {userType === "employee" && hasPermission("attendance", "edit") && (
            <div className="nav-section">
              <Link
                to="/employee/attendance-requests"
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isMyRequestsActive ? "active" : ""}`}
              >
                <i className="fas fa-clock"></i>
                <span>My Requests</span>
              </Link>

              {/* Submenu Items */}
              <div className="nav-submenu">
                {getAttendanceSubmenus().map((submenu, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      submenu.action();
                      setIsOpen(false);
                    }}
                    className="nav-submenu-item"
                  >
                    <i className={submenu.icon}></i>
                    <span>{submenu.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Employee Modals */}
      <EarlyCheckinModal
        isOpen={showEarlyCheckin}
        onClose={() => setShowEarlyCheckin(false)}
      />
      <LateCheckinModal
        isOpen={showLateCheckin}
        onClose={() => setShowLateCheckin(false)}
      />
      <MissedPunchInModal
        isOpen={showMissedPunchIn}
        onClose={() => setShowMissedPunchIn(false)}
      />
      <MissedPunchOutModal
        isOpen={showMissedPunchOut}
        onClose={() => setShowMissedPunchOut(false)}
      />
    </>
  );
};

export default Sidebar;