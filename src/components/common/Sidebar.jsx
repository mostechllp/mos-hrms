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
  const [expandedMenus, setExpandedMenus] = useState({});
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
    
    // Super admins have access to everything
    if (user?.role?.name === "Super Admin") return true;
    if (userPermissions && userPermissions.all === true) return true;
    
    // Check if the module is explicitly assigned in sidebar_modules
    const hasSidebarModule = sidebarModules.some(mod => mod.slug === moduleSlug && mod.status === "active");
    
    const modulePerm = userPermissions[moduleSlug];
    
    // If it's a read permission check for rendering menus, checking sidebarModules is also a good fallback
    if (permissionType === "read" && !modulePerm && hasSidebarModule) {
      return true;
    }
    
    if (!modulePerm) return false;
    
    if (permissionType === "read") return modulePerm.read || false;
    if (permissionType === "edit") return modulePerm.edit || false;
    if (permissionType === "delete") return modulePerm.delete || false;
    
    return false;
  };

  // Toggle submenu expansion
  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
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
    { path: "/admin/leaves", icon: "fas fa-calendar-check", label: "Leaves", moduleSlug: "leaves" }, // fixed slug
    { 
      path: "/admin/task-reports", 
      icon: "fas fa-tasks", 
      label: "Task Reports", 
      moduleSlug: "reports",
      hasSubmenu: true,
      submenuItems: [
        { path: "/admin/task-reports", label: "All Task Reports", icon: "fas fa-list" },
        { path: "/employee/task-reports", label: "My Tasks", icon: "fas fa-user-tasks" }
      ]
    },
    { path: "/admin/reports", icon: "fas fa-chart-line", label: "Reports", moduleSlug: "reports" },
    { path: "/admin/projects", icon: "fas fa-file", label: "Projects", moduleSlug: "projects" },
    { path: "/admin/tasks", icon: "fas fa-tasks", label: "Tasks", moduleSlug: "projects" }, // grouped under projects
    { path: "/admin/payroll/add", icon: "fas fa-file-invoice-dollar", label: "Payroll", moduleSlug: "payroll" },
    { path: "/admin/role-management", icon: "fas fa-user-shield", label: "Roles", moduleSlug: "roles" },
    // Settings - Last item
    { path: "/admin/settings", icon: "fas fa-gear", label: "Settings", moduleSlug: "settings" },
  ];

  // Map for employee menu items
  const getEmployeeNavItems = () => {
    // Define the core employee functionalities
    const coreEmployeeMenus = [
      { path: "/employee/dashboard", icon: "fas fa-chart-line", label: "Dashboard", moduleSlug: "dashboard" },
      { path: "/employee/leaves", icon: "fas fa-calendar-check", label: "My Leaves", moduleSlug: "leave" },
      { path: "/employee/wfh", icon: "fas fa-home", label: "WFH Requests", moduleSlug: "wfh" },
      { path: "/employee/task-reports", icon: "fas fa-clipboard-list", label: "Task Reports", moduleSlug: "reports" },
      { path: "/employee/profile", icon: "fas fa-user-circle", label: "My Profile", moduleSlug: "profile" },
    ];

    // These are admin-style menus that some elevated employees might have
    const adminStyleMenus = {
      onboarding: { path: "/employee/onboarding", icon: "fas fa-user-plus", label: "Onboarding" },
      projects: { path: "/employee/projects", icon: "fas fa-file", label: "Projects" },
      documents: { path: "/employee/documents", icon: "fas fa-file", label: "Documents" },
      settings: { path: "/employee/settings", icon: "fas fa-gear", label: "Settings" },
      payroll: { path: "/employee/payroll", icon: "fas fa-file-invoice-dollar", label: "Payroll" },
      roles: { path: "/employee/roles", icon: "fas fa-user-shield", label: "Roles" },
    };

    let allMenus = [];

    // Always add the core employee menus unconditionally for regular employee portal functionalities
    coreEmployeeMenus.forEach(menu => {
      allMenus.push(menu);
    });

    // Add admin-style menus ONLY if they are explicitly in sidebarModules and the user has permission
    // This prevents standard employees from seeing admin pages in their sidebar.
    sidebarModules
      .filter(module => module.status === "active")
      .forEach(module => {
        // Skip modules that are already handled in coreEmployeeMenus
        if (coreEmployeeMenus.some(m => m.moduleSlug === module.slug)) return;

        const adminMenu = adminStyleMenus[module.slug];
        if (adminMenu && hasPermission(module.slug, "read")) {
          allMenus.push({
            ...adminMenu,
            moduleSlug: module.slug
          });
        }
      });

    // Sort menus: put Settings at the end
    const settingsIndex = allMenus.findIndex(m => m.label === "Settings" || m.moduleSlug === "settings");
    if (settingsIndex > -1) {
      const settings = allMenus.splice(settingsIndex, 1)[0];
      allMenus.push(settings);
    }
    
    return allMenus;
  };

  // Build navigation items based on user type
  const getNavItems = () => {
    if (userType === "admin") {
      // Filter admin menus based on permissions
      const filteredItems = adminMenuItems.filter(item => {
        return hasPermission(item.moduleSlug, "read");
      });
      
      // Ensure Settings is last
      const settingsIndex = filteredItems.findIndex(item => item.moduleSlug === "settings");
      if (settingsIndex > -1) {
        const settings = filteredItems.splice(settingsIndex, 1)[0];
        filteredItems.push(settings);
      }
      
      return filteredItems;
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
            {navItems.map((item) => {
              // Check if this item has submenu
              const hasSubmenu = item.hasSubmenu && item.submenuItems && item.submenuItems.length > 0;
              const isSubmenuOpen = expandedMenus[item.path] || false;
              const isActive = location.pathname === item.path || 
                (hasSubmenu && item.submenuItems.some(sub => location.pathname === sub.path));

              return (
                <div key={item.path}>
                  {hasSubmenu ? (
                    // Submenu parent item
                    <>
                      <div
                        onClick={() => toggleSubmenu(item.path)}
                        className={`flex items-center justify-between gap-3 px-5 py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden ${
                          isActive
                            ? "bg-green-500/20 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
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
                        </div>
                        <i className={`fas fa-chevron-${isSubmenuOpen ? 'up' : 'down'} text-xs transition-transform duration-200`}></i>
                      </div>
                      
                      {/* Submenu items */}
                      {(isSubmenuOpen || isMobile) && (
                        <div className="ml-8 space-y-1 mt-1">
                          {item.submenuItems.map((subItem) => {
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => isMobile && setIsOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-5 py-2 mx-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden text-sm ${
                                    isActive
                                      ? "bg-green-500/20 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-white/10"
                                  }`
                                }
                              >
                                <i className={subItem.icon + " w-5 text-sm flex-shrink-0"}></i>
                                <span>{subItem.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    // Regular menu item
                    <NavLink
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
                  )}
                </div>
              );
            })}
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
            const hasSubmenu = item.hasSubmenu && item.submenuItems && item.submenuItems.length > 0;
            const isSubmenuOpen = expandedMenus[item.path] || false;

            return (
              <div key={item.path}>
                {hasSubmenu ? (
                  <>
                    <div
                      onClick={() => toggleSubmenu(item.path)}
                      className={`nav-item ${isActive ? "active" : ""}`}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </span>
                      <i className={`fas fa-chevron-${isSubmenuOpen ? 'up' : 'down'} text-xs`}></i>
                    </div>
                    {isSubmenuOpen && (
                      <div className="nav-submenu" style={{ paddingLeft: '20px' }}>
                        {item.submenuItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setIsOpen(false)}
                              className={`nav-submenu-item ${isSubActive ? "active" : ""}`}
                            >
                              <i className={subItem.icon}></i>
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}

          {/* Attendance Requests Section for Employees */}
          {userType === "employee" && hasPermission("attendance", "read") && (
            <div className="nav-section">
              <Link
                to="/employee/attendance-requests"
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isMyRequestsActive ? "active" : ""}`}
              >
                <i className="fas fa-calendar-check"></i>
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