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
  leaves: "/admin/leaves",
  "my-leaves": "/admin/my-leaves",
  "task-reports": "/admin/task-reports",
  reports: "/admin/reports",
  projects: "/admin/projects",
  "project-tasks": "/admin/project-tasks",
  payroll: "/admin/payroll",
  roles: "/admin/role-management",
  settings: "/admin/settings",
  "my-tasks": "/admin/my-tasks",
  organizations: "/admin/organizations",
  "my-payroll": "/employee/my-payroll",
  warnings: "/admin/warnings",
  // CRM
  "crm-dashboard": "/admin/crm/dashboard",
  "crm-leads": "/admin/crm/leads",
  "crm-customers": "/admin/crm/customers",
  "crm-opportunities": "/admin/crm/opportunities",
  "crm-activities": "/admin/crm/activities",
  "crm-quotations": "/admin/crm/quotations",
  "crm-products": "/admin/crm/products",
  "crm-reports": "/admin/crm/reports",
  "crm-settings": "/admin/crm/settings",
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
  "project-tasks": "/employee/project-tasks",
  settings: "/employee/settings",
  leaves: "/employee/leave-management",
  "my-leaves": "/employee/leaves",
  "wfh-requests": "/employee/wfh",
  payroll: "/employee/payroll/add",
  roles: "/employee/role-management",
  "my-tasks": "/employee/my-tasks",
  organizations: "/employee/organizations",
  "my-payroll": "/employee/my-payroll",
  warnings: "/employee/warnings",
  // CRM
  "crm-dashboard": "/employee/crm/dashboard",
  "crm-leads": "/employee/crm/leads",
  "crm-customers": "/employee/crm/customers",
  "crm-opportunities": "/employee/crm/opportunities",
  "crm-activities": "/employee/crm/activities",
  "crm-quotations": "/employee/crm/quotations",
  "crm-products": "/employee/crm/products",
  "crm-reports": "/employee/crm/reports",
  "crm-settings": "/employee/crm/settings",
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
  leaves: "fas fa-calendar-check",
  "my-leaves": "fas fa-calendar-alt",
  "task-reports": "fas fa-tasks",
  "project-tasks": "fa-solid fa-diagram-project",
  reports: "fas fa-chart-bar",
  projects: "fas fa-folder",
  payroll: "fas fa-file-invoice-dollar",
  roles: "fas fa-user-shield",
  settings: "fas fa-gear",
  "my-tasks": "fas fa-user-check",
  organizations: "fas fa-building",
  "my-payroll": "fas fa-file-invoice-dollar",
  warnings: "fas fa-triangle-exclamation",
  // CRM
  "crm-dashboard": "fas fa-gauge-high",
  "crm-leads": "fas fa-user-tag",
  "crm-customers": "fas fa-address-book",
  "crm-opportunities": "fas fa-bullseye",
  "crm-activities": "fas fa-phone-volume",
  "crm-quotations": "fas fa-file-invoice",
  "crm-products": "fas fa-box-open",
  "crm-reports": "fas fa-chart-pie",
  "crm-settings": "fas fa-sliders",
};

// ============================================================
// PARENT MENU CONFIG
// ------------------------------------------------------------
// Gated by a single permission key (or any of several). If the
// user has read access to that key, the whole group renders.
//
// `expandOnHover: false` keeps the group collapsed until the
// user clicks its header — regardless of the sidebar's
// hover-expand behaviour.
// ============================================================
const PARENT_MENU_CONFIG = {
  crm: {
    label: "CRM",
    icon: "fas fa-handshake",
    permissionKeys: ["crm", "crm-dashboard"],
    expandOnHover: false, // only expands on click
    children: [
      { slug: "crm-dashboard", label: "Dashboard", path: ADMIN_ROUTE_MAP["crm-dashboard"], employeePath: EMPLOYEE_ROUTE_MAP["crm-dashboard"] },
      { slug: "crm-leads", label: "Leads", path: ADMIN_ROUTE_MAP["crm-leads"], employeePath: EMPLOYEE_ROUTE_MAP["crm-leads"] },
      { slug: "crm-customers", label: "Customers", path: ADMIN_ROUTE_MAP["crm-customers"], employeePath: EMPLOYEE_ROUTE_MAP["crm-customers"] },
      { slug: "crm-opportunities", label: "Opportunities", path: ADMIN_ROUTE_MAP["crm-opportunities"], employeePath: EMPLOYEE_ROUTE_MAP["crm-opportunities"] },
      { slug: "crm-activities", label: "Activities", path: ADMIN_ROUTE_MAP["crm-activities"], employeePath: EMPLOYEE_ROUTE_MAP["crm-activities"] },
      { slug: "crm-quotations", label: "Quotations", path: ADMIN_ROUTE_MAP["crm-quotations"], employeePath: EMPLOYEE_ROUTE_MAP["crm-quotations"] },
      { slug: "crm-products", label: "Products & Services", path: ADMIN_ROUTE_MAP["crm-products"], employeePath: EMPLOYEE_ROUTE_MAP["crm-products"] },
      { slug: "crm-reports", label: "Reports", path: ADMIN_ROUTE_MAP["crm-reports"], employeePath: EMPLOYEE_ROUTE_MAP["crm-reports"] },
      { slug: "crm-settings", label: "CRM Settings", path: ADMIN_ROUTE_MAP["crm-settings"], employeePath: EMPLOYEE_ROUTE_MAP["crm-settings"] },
    ],
    order: 20,
  },
};

const ALL_PARENT_CHILD_SLUGS = Object.values(PARENT_MENU_CONFIG).flatMap((c) =>
  c.children.map((child) => child.slug),
);

const MODULE_ORDER = {
  dashboard: 1,
  onboarding: 2,
  employees: 3,
  warnings: 4,
  offboarding: 5,
  projects: 6,
  "project-tasks": 7,
  attendance: 8,
  documents: 9,
  reports: 10,
  settings: 11,
  roles: 12,
  payroll: 13,
  leaves: 14,
  organization: 15,
  "my-payroll": 16,
};

const HIDDEN_FOR_ADMIN = ["my-leaves", "task-reports", "my-tasks"];
const ALWAYS_SHOWN_MODULES = ["projects", "project-tasks"];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location, isMobile, setIsOpen]);

  const isAdmin = user?.type === "admin";
  const activeRouteMap = isAdmin ? ADMIN_ROUTE_MAP : EMPLOYEE_ROUTE_MAP;
  const permissions = user?.permissions || {};
  const hasAllPermissions = user?.permissions?.all === true;

  // ---- Permission helpers ----
  const hasReadPermission = (slug) => {
    if (hasAllPermissions) return true;
    if (isAdmin && ALWAYS_SHOWN_MODULES.includes(slug)) return true;
    const p = permissions[slug];
    return p ? p.read === true : false;
  };

  const canAccessParent = (config) => {
    if (hasAllPermissions) return true;
    const keys = config.permissionKeys || [];
    return keys.some((key) => {
      const p = permissions[key];
      return p && p.read === true;
    });
  };

  const shouldShowForAdmin = (slug) => {
    if (hasAllPermissions) return !HIDDEN_FOR_ADMIN.includes(slug);
    return true;
  };

  // ---- Flat module list (permission-filtered) ----
  const allModules = (user?.sidebar_modules || [])
    .filter((mod) => {
      if (mod.status !== "active" || !activeRouteMap[mod.slug]) return false;
      if (!hasReadPermission(mod.slug)) return false;
      if (!shouldShowForAdmin(mod.slug)) return false;
      return true;
    })
    .map((mod) => mod.slug);

  // ---- Build nav items ----
  const buildNavItems = () => {
    const processedSlugs = new Set();
    const parentItems = [];
    const standaloneItems = [];

    Object.entries(PARENT_MENU_CONFIG).forEach(([parentKey, config]) => {
      if (!canAccessParent(config)) return;

      const children = config.children.map((child) => ({
        slug: child.slug,
        label: child.label,
        path: isAdmin ? child.path : child.employeePath,
        icon: ICON_MAP[child.slug] || "fas fa-circle",
      }));

      const isActive = children.some(
        (child) => location.pathname === child.path,
      );

      parentItems.push({
        type: "parent",
        slug: parentKey,
        label: config.label,
        icon: config.icon,
        children,
        isActive,
        order: config.order || 500,
        expandOnHover: config.expandOnHover !== false, // default true
      });

      children.forEach((c) => processedSlugs.add(c.slug));
    });

    allModules.forEach((slug) => {
      if (processedSlugs.has(slug)) return;
      if (ALL_PARENT_CHILD_SLUGS.includes(slug)) return;

      const module = user?.sidebar_modules?.find((m) => m.slug === slug);
      let moduleName = module?.name || slug;

      if (moduleName === "My Tasks" || slug === "my-tasks") {
        moduleName = "Task Reports";
      }
      if (slug === "project-tasks") {
        moduleName = "Project Tasks";
      }
      if (slug === "warnings") {
        moduleName = isAdmin ? "Warnings" : "My Warnings";
      }

      standaloneItems.push({
        type: "single",
        slug,
        label: moduleName,
        path: activeRouteMap[slug],
        icon: ICON_MAP[slug] || "fas fa-circle",
        order: MODULE_ORDER[slug] || 100,
      });
    });

    const allItems = [...standaloneItems, ...parentItems];
    allItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    return allItems;
  };

  const navItems = buildNavItems();

  const toggleMenu = (slug) => {
    setExpandedMenus((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // ------------------------------------------------------------
  // Per-parent expansion rule:
  //  - On mobile: always driven by `expandedMenus` (click).
  //  - On desktop:
  //      * if the parent has `expandOnHover === false`, only
  //        expands when the user has clicked it.
  //      * otherwise it follows the sidebar's hover-expand state.
  // ------------------------------------------------------------
  const isMenuExpanded = (parentItem) => {
    if (isMobile) return expandedMenus[parentItem.slug] || false;
    if (parentItem.expandOnHover === false) {
      return expandedMenus[parentItem.slug] || false;
    }
    return isOpen;
  };

  const showChevron = !isMobile && isOpen;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 z-50 transition-all duration-300
          flex flex-col
          ${
            isMobile
              ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-64`
              : "w-[72px] hover:w-64 group"
          }
        `}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        <div className="flex-shrink-0 py-5 px-4 border-b border-white/10 flex justify-center items-center">
          <img
            src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
            alt="HMR Logo"
            className={`object-contain rounded-lg bg-white p-1 transition-all duration-300 ${
              !isMobile && !isOpen ? "w-10 h-10" : "w-12 h-12"
            }`}
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {navItems.map((item) => {
            if (item.type === "parent") {
              const expanded = isMenuExpanded(item);
              return (
                <div key={item.slug} className="mb-1">
                  <div
                    onClick={() => toggleMenu(item.slug)}
                    className={`
                      flex items-center gap-3 px-5 py-3 mx-2 rounded-xl 
                      transition-all duration-200 cursor-pointer select-none
                      ${
                        item.isActive
                          ? "bg-green-500/20 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }
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
                      <i
                        className={`fas fa-chevron-${
                          expanded ? "up" : "down"
                        } text-xs transition-transform duration-200 flex-shrink-0`}
                      ></i>
                    )}
                  </div>

                  {expanded && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-700/50 pl-2">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.slug}
                          to={child.path}
                          onClick={() => isMobile && setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-5 py-2 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-green-500/20 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/10"
                            }`
                          }
                        >
                          <i className={`${child.icon} w-6 text-sm flex-shrink-0`}></i>
                          <span className="text-sm">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.slug}
                to={item.path}
                end={
                  item.path === "/admin/employees" ||
                  item.path === "/admin/dashboard" ||
                  item.path === "/employee/dashboard"
                }
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