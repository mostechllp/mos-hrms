import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ADMIN_ROUTE_MAP = {
  dashboard: "/admin/dashboard",
  onboarding: "/admin/employees/onboarding",
  offboarding: "/admin/employees/offboarding",
  employees: "/admin/employees",
  attendance: "/admin/attendances",
  "attendance-requests": "/admin/attendance-requests",
  "wfh-requests": "/admin/wfh-requests",
  documents: "/admin/documents",
  leave: "/admin/leaves",
  "my-leaves": "/admin/my-leaves",
  "task-reports": "/admin/task-reports",
  reports: "/admin/reports",
  projects: "/admin/projects",
  payroll: "/admin/payroll/add",
  roles: "/admin/role-management",
  settings: "/admin/settings",
};

const EMPLOYEE_ROUTE_MAP = {
  dashboard: "/employee/dashboard",
  onboarding: "/employee/onboarding",
  employees: "/employee/employees",
  attendance: "/employee/attendance",
  "attendance-requests": "/employee/attendance-requests",
  documents: "/employee/documents",
  "task-reports": "/employee/task-reports",
  reports: "/employee/reports",
  projects: "/employee/projects",
  settings: "/employee/settings",
  leave: "/employee/leave-management",
  "my-leaves": "/employee/leaves",
  "wfh-requests": "/employee/wfh",
  payroll: "/employee/payroll/add",
  roles: "/employee/role-management",
};

const ICON_MAP = {
  dashboard: "fas fa-chart-line",
  onboarding: "fas fa-user-plus",
  offboarding: "fas fa-user-minus",
  employees: "fas fa-users",
  attendance: "fas fa-fingerprint",
  "attendance-requests": "fas fa-clock",
  "wfh-requests": "fas fa-house-user",
  documents: "fas fa-file-signature",
  leave: "fas fa-calendar-check",
  "my-leaves": "fas fa-calendar-alt",
  "task-reports": "fas fa-tasks",
  reports: "fas fa-chart-bar",
  projects: "fas fa-folder",
  payroll: "fas fa-file-invoice-dollar",
  roles: "fas fa-user-shield",
  settings: "fas fa-gear",
};

// Define which modules are children of "Leaves" parent
const LEAVES_CHILDREN = ["leave", "my-leaves"];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

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

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile, setIsOpen]);

  const activeRouteMap = user?.type === 'admin' ? ADMIN_ROUTE_MAP : EMPLOYEE_ROUTE_MAP;
  
  // Get all available modules from API
  const allModules = (user?.sidebar_modules || [])
    .filter((mod) => mod.status === "active" && activeRouteMap[mod.slug]);

  // Build navigation with submenus
  const buildNavItems = () => {
    const navItems = [];
    const processedSlugs = new Set();

    // First, add all standalone modules (excluding leave-related ones)
    allModules.forEach((mod) => {
      if (!LEAVES_CHILDREN.includes(mod.slug)) {
        navItems.push({
          type: "single",
          slug: mod.slug,
          label: mod.name,
          path: activeRouteMap[mod.slug],
          icon: ICON_MAP[mod.slug] || "fas fa-circle",
        });
      }
    });

    // Then, add the "Leaves" parent menu at the end
    const hasLeaveModules = allModules.some(mod => 
      LEAVES_CHILDREN.includes(mod.slug)
    );

    if (hasLeaveModules) {
      // Get children modules
      const children = allModules
        .filter(mod => LEAVES_CHILDREN.includes(mod.slug))
        .map(mod => ({
          slug: mod.slug,
          label: mod.name,
          path: activeRouteMap[mod.slug],
          icon: ICON_MAP[mod.slug] || "fas fa-circle",
        }));

      // Check if any child is active
      const isActive = children.some(child => location.pathname === child.path);

      navItems.push({
        type: "parent",
        slug: "leaves",
        label: "Leaves",
        icon: "fas fa-calendar-check",
        children: children,
        isActive: isActive
      });

      // Mark children as processed
      children.forEach(child => processedSlugs.add(child.slug));
    }

    return navItems;
  };

  const navItems = buildNavItems();

  const toggleMenu = (slug) => {
    setExpandedMenus(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const isMenuExpanded = (slug) => {
    if (isMobile) return expandedMenus[slug] || false;
    return isOpen;
  };

  const showChevron = !isMobile && isOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
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
            className={`object-contain rounded-lg bg-white p-1 transition-all duration-300 ${
              !isMobile && !isOpen ? "w-10 h-10" : "w-12 h-12"
            }`}
          />
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {navItems.map((item) => {
            if (item.type === "parent") {
              const expanded = isMenuExpanded(item.slug);
              
              return (
                <div key={item.slug} className="mb-1">
                  {/* Parent Menu Item */}
                  <div
                    onClick={() => {
                      if (isMobile) {
                        toggleMenu(item.slug);
                      } else {
                        toggleMenu(item.slug);
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-5 py-3 mx-2 rounded-xl 
                      transition-all duration-200 cursor-pointer select-none
                      ${item.isActive ? "bg-green-500/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}
                    `}
                  >
                    <i className={item.icon + " w-6 text-lg flex-shrink-0"}></i>
                    <span
                      className={`flex-1 transition-opacity duration-200 ${
                        !isMobile && !isOpen
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                    {(isMobile || showChevron) && (
                      <i className={`fas fa-chevron-${expanded ? "up" : "down"} text-xs transition-transform duration-200 flex-shrink-0`}></i>
                    )}
                  </div>

                  {/* Submenu Items */}
                  {(isMobile ? expandedMenus[item.slug] : expanded) && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-700/50 pl-2">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.slug}
                          to={child.path}
                          onClick={() => {
                            if (isMobile) setIsOpen(false);
                          }}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-5 py-2 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-green-500/20 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/10"
                            }`
                          }
                        >
                          <i className={child.icon + " w-6 text-sm flex-shrink-0"}></i>
                          <span className="text-sm">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Single menu item
            return (
              <NavLink
                key={item.slug}
                to={item.path}
                end={item.path === "/admin/employees" || item.path === "/admin/dashboard" || item.path === "/employee/dashboard"}
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
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;