// src/components/layout/Sidebar.jsx (or wherever this file is located)
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../../public/fav-light.png"
import { useMenuVisibility } from "../../context/MenuVisibilityContext";

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
  "crm-proposals": "/admin/crm/proposals",
  meetings: "/admin/meetings",

  // Accounts
  accounts: "/admin/accounts",
  "accounts-dashboard": "/admin/accounts/dashboard",
  "chart-of-accounts": "/admin/accounts/chart-of-accounts",
  "journal-entries": "/admin/accounts/journal-entries",
  incomes: "/admin/accounts/incomes",
  expenses: "/admin/accounts/expenses",
  "general-ledger": "/admin/accounts/general-ledger",
  "trial-balance": "/admin/accounts/trial-balance",
  "accounts-reports": "/admin/accounts/reports",

  "subscriptions": "/admin/subscriptions",
  "subscriptions-plans": "/admin/subscriptions/plans",
  "subscriptions-subscribers": "/admin/subscriptions/subscribers",
};

const EMPLOYEE_ROUTE_MAP = {
  ...ADMIN_ROUTE_MAP, // Fallback/Base
  dashboard: "/employee/dashboard",
  onboarding: "/employee/onboarding",
  employees: "/employee/employees",
  attendance: "/employee/attendance",
  offboarding: "/employee/offboarding",
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
  "my-warnings": "/employee/my-warnings",
  "my-attendance-requests": "/employee/my-attendance-requests",
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
  "crm-proposals": "/employee/crm/proposals",
  meetings: "/employee/meetings",
  "my-meetings": "/employee/my-meetings",
  // Accounts
  accounts: "/employee/accounts",
  "accounts-dashboard": "/employee/accounts/dashboard",
  "chart-of-accounts": "/employee/accounts/chart-of-accounts",
  "journal-entries": "/employee/accounts/journal-entries",
  incomes: "/employee/accounts/incomes",
  expenses: "/employee/accounts/expenses",
  "general-ledger": "/employee/accounts/general-ledger",
  "trial-balance": "/employee/accounts/trial-balance",
  "accounts-reports": "/employee/accounts/reports",

  "subscriptions": "/employee/subscriptions",
  "subscriptions-plans": "/employee/subscriptions/plans",
  "subscriptions-subscribers": "/employee/subscriptions/subscribers",
  "my-subscription": "/employee/subscriptions/my-subscription",
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
  "my-warnings": "fas fa-triangle-exclamation",
  
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
  "crm-proposals": "fas fa-file-lines",
  meetings: "fas fa-calendar-days",
  "my-meetings": "fas fa-calendar-alt",
  
  // Accounts (Top Level)
  accounts: "fas fa-compass",
  "accounts-dashboard": "fas fa-gauge",
  sales: "fas fa-arrow-trend-up",
  purchases: "fas fa-arrow-trend-down",
  money: "fas fa-wallet",
  operations: "fas fa-layer-group",
  accountant: "fas fa-sliders",
  "accounts-reports": "fas fa-chart-line",
  "accounts-settings": "fas fa-sliders",
  
  // Accounts (Level 2 & 3 Leaves)
  items: "fas fa-cubes",
  "time-tracking": "fas fa-stopwatch",
  banking: "fas fa-vault",
  "account-documents": "fas fa-folder-tree",
  
  // Money Sub-items
  "money-cards": "fas fa-credit-card",
  "money-transfers": "fas fa-money-bill-transfer",
  
  // Operations Sub-items
  "time-projects": "fas fa-diagram-project",
  "time-timesheet": "fas fa-clock-rotate-left",

  subscriptions: "fas fa-arrows-rotate",
  "subscriptions-plans": "fas fa-layer-group",
  "subscriptions-subscribers": "fas fa-users",
  "my-subscription": "fas fa-id-card",
};

const PARENT_MENU_CONFIG = {
  crm: {
    label: "CRM",
    icon: "fas fa-handshake",
    permissionKeys: ["crm", "crm-dashboard"],
    expandOnHover: false,
    children: [
      { slug: "crm-dashboard", label: "Dashboard", path: ADMIN_ROUTE_MAP["crm-dashboard"], employeePath: EMPLOYEE_ROUTE_MAP["crm-dashboard"] },
      { slug: "crm-leads", label: "Leads", path: ADMIN_ROUTE_MAP["crm-leads"], employeePath: EMPLOYEE_ROUTE_MAP["crm-leads"] },
      { slug: "crm-customers", label: "Customers", path: ADMIN_ROUTE_MAP["crm-customers"], employeePath: EMPLOYEE_ROUTE_MAP["crm-customers"] },
      { slug: "crm-opportunities", label: "Opportunities", path: ADMIN_ROUTE_MAP["crm-opportunities"], employeePath: EMPLOYEE_ROUTE_MAP["crm-opportunities"] },
      { slug: "crm-activities", label: "Activities", path: ADMIN_ROUTE_MAP["crm-activities"], employeePath: EMPLOYEE_ROUTE_MAP["crm-activities"] },
      { slug: "crm-quotations", label: "Quotations", path: ADMIN_ROUTE_MAP["crm-quotations"], employeePath: EMPLOYEE_ROUTE_MAP["crm-quotations"] },
      { slug: "crm-proposals", label: "Proposals", path: ADMIN_ROUTE_MAP["crm-proposals"], employeePath: EMPLOYEE_ROUTE_MAP["crm-proposals"] },
      { slug: "crm-products", label: "Products & Services", path: ADMIN_ROUTE_MAP["crm-products"], employeePath: EMPLOYEE_ROUTE_MAP["crm-products"] },
      { slug: "crm-reports", label: "Reports", path: ADMIN_ROUTE_MAP["crm-reports"], employeePath: EMPLOYEE_ROUTE_MAP["crm-reports"] },
      { slug: "crm-settings", label: "CRM Settings", path: ADMIN_ROUTE_MAP["crm-settings"], employeePath: EMPLOYEE_ROUTE_MAP["crm-settings"] },
    ],
    order: 20,
  },
  accounts: {
    label: "Accounts",
    icon: "fas fa-compass",
    permissionKeys: ["accounts", "accounts-dashboard"],
    expandOnHover: false,
    children: [
      { slug: "accounts-dashboard", label: "Dashboard", path: "/admin/accounts/dashboard", employeePath: "/employee/accounts/dashboard" },
      {
        slug: "sales",
        label: "Revenue",
        path: "#",
        employeePath: "#",
        children: [
          { slug: "sales-customers", label: "Customers", path: "/admin/accounts/sales/customers", employeePath: "/employee/accounts/sales/customers" },
          { slug: "sales-quotes", label: "Quotes", path: "/admin/accounts/sales/quotes", employeePath: "/employee/accounts/sales/quotes" },
          { slug: "sales-orders", label: "Order Forms", path: "/admin/accounts/sales/orders", employeePath: "/employee/accounts/sales/orders" },
          { slug: "sales-invoices", label: "Invoices", path: "/admin/accounts/sales/invoices", employeePath: "/employee/accounts/sales/invoices" },
          { slug: "sales-recurring", label: "Subscriptions", path: "/admin/accounts/sales/recurring", employeePath: "/employee/accounts/sales/recurring" },
          { slug: "sales-challans", label: "Delivery Challans", path: "/admin/accounts/sales/challans", employeePath: "/employee/accounts/sales/challans" },
          { slug: "sales-payments", label: "Incoming Payments", path: "/admin/accounts/sales/payments", employeePath: "/employee/accounts/sales/payments" },
          { slug: "sales-credits", label: "Customer Credits", path: "/admin/accounts/sales/credit-notes", employeePath: "/employee/accounts/sales/credit-notes" },
        ],
      },
      {
        slug: "purchases",
        label: "Spend",
        path: "#",
        employeePath: "#",
        children: [
          { slug: "purchases-vendors", label: "Vendors", path: "/admin/accounts/purchases/vendors", employeePath: "/employee/accounts/purchases/vendors" },
          { slug: "purchases-orders", label: "Purchase Orders", path: "/admin/accounts/purchases/purchase-orders", employeePath: "/employee/accounts/purchases/purchase-orders" },
          { slug: "purchases-bills", label: "Bills", path: "/admin/accounts/purchases/bills", employeePath: "/employee/accounts/purchases/bills" },
          { slug: "purchases-recurring-bills", label: "Recurring Bills", path: "/admin/accounts/purchases/recurring-bills", employeePath: "/employee/accounts/purchases/recurring-bills" },
          { slug: "purchases-expenses", label: "Expenses", path: "/admin/accounts/purchases/expenses", employeePath: "/employee/accounts/purchases/expenses" },
          { slug: "purchases-recurring", label: "Recurring Expenses", path: "/admin/accounts/purchases/recurring-expenses", employeePath: "/employee/accounts/purchases/recurring-expenses" },
          { slug: "purchases-payments", label: "Outgoing Payments", path: "/admin/accounts/purchases/payments-made", employeePath: "/employee/accounts/purchases/payments-made" },
          { slug: "purchases-credits", label: "Vendor Credits", path: "/admin/accounts/purchases/vendor-credits", employeePath: "/employee/accounts/purchases/vendor-credits" },
        ],
      },
      {
        slug: "money",
        label: "Money",
        path: "#",
        employeePath: "#",
        children: [
          { slug: "banking", label: "Bank Accounts", path: "/admin/accounts/banking", employeePath: "/employee/accounts/banking" },
        ],
      },
      {
        slug: "operations",
        label: "Operations",
        path: "#",
        employeePath: "#",
        children: [
          {
            slug: "time-tracking",
            label: "Time & Billables",
            path: "#",
            employeePath: "#",
            children: [
              { slug: "time-projects", label: "Projects", path: "/admin/accounts/time-tracking/projects", employeePath: "/employee/accounts/time-tracking/projects" },
              { slug: "time-timesheet", label: "Timesheets", path: "/admin/accounts/time-tracking/timesheet", employeePath: "/employee/accounts/time-tracking/timesheet" },
            ],
          },
          { slug: "items", label: "Catalogue", path: "/admin/accounts/items", employeePath: "/employee/accounts/items" },
          { slug: "account-documents", label: "Documents", path: "/admin/accounts/documents", employeePath: "/employee/accounts/documents" },
        ],
      },
      {
        slug: "accountant",
        label: "Controls",
        path: "#",
        employeePath: "#",
        children: [
          { slug: "acc-coa", label: "Chart of Accounts", path: "/admin/accounts/accountant/chart-of-accounts", employeePath: "/employee/accounts/accountant/chart-of-accounts" },
          { slug: "acc-journals", label: "Manual Journals", path: "/admin/accounts/accountant/manual-journals", employeePath: "/employee/accounts/accountant/manual-journals" },
          { slug: "acc-currency", label: "Currency Adjustments", path: "/admin/accounts/accountant/currency-adjustments", employeePath: "/employee/accounts/accountant/currency-adjustments" },
          { slug: "acc-budgets", label: "Budgets", path: "/admin/accounts/accountant/budgets", employeePath: "/employee/accounts/accountant/budgets" },
          { slug: "acc-locking", label: "Period Locking", path: "/admin/accounts/accountant/transaction-locking", employeePath: "/employee/accounts/accountant/transaction-locking" },
          { slug: "acc-bulk", label: "Bulk Reclassify", path: "/admin/accounts/accountant/bulk-update", employeePath: "/employee/accounts/accountant/bulk-update" },
        ],
      },
      { slug: "accounts-reports", label: "Reports", path: "/admin/accounts/reports", employeePath: "/employee/accounts/reports" },
      { 
        slug: "accounts-settings", 
        label: "Menu Settings", 
        path: "/admin/accounts/settings", 
        employeePath: "/employee/accounts/settings" 
      },
    ],
    order: 25,
  },
  subscriptions: {
    label: "Subscriptions",
    icon: "fas fa-arrows-rotate",
    permissionKeys: ["subscriptions", "subscriptions-plans"],
    expandOnHover: false,
    children: [
      { slug: "subscriptions-plans", label: "Plans", path: ADMIN_ROUTE_MAP["subscriptions-plans"], employeePath: EMPLOYEE_ROUTE_MAP["subscriptions-plans"] },
      { slug: "subscriptions-subscribers", label: "Subscribers", path: ADMIN_ROUTE_MAP["subscriptions-subscribers"], employeePath: EMPLOYEE_ROUTE_MAP["subscriptions-subscribers"] },
    ],
    order: 24,
  },
};

const getAllSlugs = (children) => {
  let slugs = [];
  children.forEach((c) => {
    slugs.push(c.slug);
    if (c.children) {
      slugs = [...slugs, ...getAllSlugs(c.children)];
    }
  });
  return slugs;
};

const ALL_PARENT_CHILD_SLUGS = Object.values(PARENT_MENU_CONFIG).flatMap((c) =>
  getAllSlugs(c.children),
);

const MODULE_ORDER = {
  dashboard: 1, onboarding: 2, employees: 3, warnings: 4, "my-warnings": 4,
  offboarding: 5, projects: 6, "project-tasks": 7, attendance: 8, documents: 9,
  reports: 10, settings: 11, roles: 12, payroll: 13, leaves: 14, organization: 15,
  "my-payroll": 16, meetings: 18, "my-meetings": 19, accounts: 25, "accounts-dashboard": 25,
  sales: 26, purchases: 27, money: 28, operations: 29, accountant: 30, "accounts-reports": 31,
  subscriptions: 24, "subscriptions-plans": 24, "subscriptions-subscribers": 24, "my-subscription": 23,
};

const HIDDEN_FOR_ADMIN = ["my-leaves", "my-tasks", "my-warnings", "my-subscription"];
const ALWAYS_SHOWN_MODULES = ["projects", "project-tasks"];

const Sidebar = ({
  isMobile,
  mobileOpen,
  setMobileOpen,
  collapsed,
  onToggleCollapse,
}) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { isMenuVisible } = useMenuVisibility(); // <-- Hook into context

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile, setMobileOpen]);

  const showLabels = isMobile || !collapsed;
  const isCollapsedDesktop = !isMobile && collapsed;
  const itemPad = isCollapsedDesktop ? "justify-center px-0" : "px-5";

  const isAdmin = user?.type === "admin";
  const activeRouteMap = isAdmin ? ADMIN_ROUTE_MAP : EMPLOYEE_ROUTE_MAP;
  const permissions = user?.permissions || {};
  const hasAllPermissions = user?.permissions?.all === true;

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
    if (isAdmin) return !HIDDEN_FOR_ADMIN.includes(slug);
    return true;
  };

  const allModules = (user?.sidebar_modules || [])
    .filter((mod) => {
      if (mod.status !== "active" || !activeRouteMap[mod.slug]) return false;
      if (!hasReadPermission(mod.slug)) return false;
      if (!shouldShowForAdmin(mod.slug)) return false;
      return true;
    })
    .map((mod) => mod.slug);

  const buildNavItems = () => {
    const processedSlugs = new Set();
    const parentItems = [];
    const standaloneItems = [];

    Object.entries(PARENT_MENU_CONFIG).forEach(([parentKey, config]) => {
      if (!canAccessParent(config)) return;

      const mapChildren = (children) =>
        children
          .filter((child) => {
            // 🌟 CUSTOM FILTER LOGIC 🌟
            // If this is the Accounts parent, check if the child is hidden in settings
            if (parentKey === "accounts") {
              if (child.slug === "accounts-settings") return true;
              return isMenuVisible(child.slug);
            }
            // For other parents (CRM, Subscriptions), keep them as they are
            return true; 
          })
          .map((child) => {
            const isAccordion = child.children && child.children.length > 0;
            return {
              slug: child.slug,
              label: child.label,
              path: isAccordion ? "#" : isAdmin ? child.path : child.employeePath,
              icon: ICON_MAP[child.slug] || "fas fa-circle",
              // Also filter nested children if needed (e.g., inside "sales" or "purchases")
              children: isAccordion 
                ? mapChildren(child.children) 
                : null,
            };
          });

      const children = mapChildren(config.children);
      
      // If all children are hidden, don't show the parent (optional, but good UX)
      if (children.length === 0) return;

      const isActive = children.some(
        (child) =>
          location.pathname === child.path ||
          (child.children &&
            child.children.some((c) => c.path === location.pathname)),
      );

      parentItems.push({
        type: "parent",
        slug: parentKey,
        label: config.label,
        icon: config.icon,
        children,
        isActive,
        order: config.order || 500,
      });

      processedSlugs.add(parentKey);
      getAllSlugs(config.children).forEach((s) => processedSlugs.add(s));
    });

    allModules.forEach((slug) => {
      if (processedSlugs.has(slug)) return;
      if (ALL_PARENT_CHILD_SLUGS.includes(slug)) return;

      const module = user?.sidebar_modules?.find((m) => m.slug === slug);
      let moduleName = module?.name || slug;

      if (moduleName === "My Tasks" || slug === "my-tasks")
        moduleName = "My Task Reports";
      if (slug === "project-tasks") moduleName = "Project Tasks";
      if (slug === "warnings") moduleName = "Warnings";
      if (slug === "my-warnings") moduleName = "My Warnings";
      if (slug === "my-subscription") moduleName = "My Subscription";

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

  const handleParentClick = (slug) => {
    if (isCollapsedDesktop) {
      onToggleCollapse();
      setExpandedMenus((prev) => ({ ...prev, [slug]: true }));
    } else {
      toggleMenu(slug);
    }
  };

  const isMenuExpanded = (item) =>
    showLabels && (expandedMenus[item.slug] || false);

  const handleEmptyAreaClick = (e) => {
    if (e.target === e.currentTarget) {
      onToggleCollapse();
    }
  };

  const renderSubMenu = (children, level = 1) => (
    <div
      className={`mt-1 space-y-1 ${level === 1 ? "ml-6 border-l-2 border-gray-700/50 pl-2" : "ml-4 border-l border-gray-700/30 pl-2"}`}
    >
      {children.map((child) => {
        const hasChildren = child.children && child.children.length > 0;
        const isChildExpanded = expandedMenus[child.slug] || false;
        const isChildActive =
          location.pathname === child.path ||
          (hasChildren &&
            child.children.some((c) => c.path === location.pathname));

        if (hasChildren) {
          return (
            <div key={child.slug}>
              <div
                onClick={() => toggleMenu(child.slug)}
                className={`flex items-center justify-between gap-3 px-3 py-2 mx-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  isChildActive
                    ? "sidebar-active text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${child.icon} w-5 text-xs flex-shrink-0`}></i>
                  <span className="text-sm">{child.label}</span>
                </div>
                <i
                  className={`fas fa-chevron-${isChildExpanded ? "up" : "down"} text-[10px]`}
                ></i>
              </div>
              {isChildExpanded && renderSubMenu(child.children, level + 1)}
            </div>
          );
        }

        return (
          <NavLink
            key={child.slug}
            to={child.path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "sidebar-active text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`
            }
          >
            <i className={`${child.icon} w-5 text-xs flex-shrink-0`}></i>
            <span className="text-sm">{child.label}</span>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 z-50 transition-all duration-300 flex flex-col ${
          isMobile
            ? `w-[288px] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : collapsed
              ? "w-[72px]"
              : "w-[268px]"
        }`}
      >
        <div
          className={`flex-shrink-0 h-[88px] border-b border-white/10 flex items-center ${
            isCollapsedDesktop ? "justify-center px-0" : "justify-between px-4"
          }`}
        >
          {!isCollapsedDesktop && (
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={logo}
                alt="HMR Logo"
                className="w-12 h-12 flex-shrink-0 object-contain rounded-lg p-1"
              />
              <div className="min-w-0 leading-tight">
                <p className="text-white text-lg font-semibold truncate">
                  MOSTECH
                </p>
                <p className="text-white/70 text-xs truncate">HRMS Solution</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => (isMobile ? setMobileOpen(false) : onToggleCollapse())}
            aria-label={
              isMobile ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={
              isMobile ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-gray-200 transition-colors duration-200 hover:bg-green-500 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <line x1="15" y1="4" x2="15" y2="20" />
            </svg>
          </button>
        </div>

        <nav 
          onClick={handleEmptyAreaClick}
          className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600 cursor-default"
        >
          {navItems.map((item) => {
            if (item.type === "parent") {
              const expanded = isMenuExpanded(item);
              return (
                <div key={item.slug} className="mb-1">
                  <div
                    onClick={() => handleParentClick(item.slug)}
                    title={isCollapsedDesktop ? item.label : undefined}
                    className={`flex items-center gap-3 ${itemPad} py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                      item.isActive
                        ? "sidebar-active text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <i
                      className={item.icon + " w-6 text-lg text-center flex-shrink-0"}
                    ></i>
                    {showLabels && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        <i
                          className={`fas fa-chevron-${expanded ? "up" : "down"} text-xs flex-shrink-0`}
                        ></i>
                      </>
                    )}
                  </div>
                  {expanded && renderSubMenu(item.children, 1)}
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
                title={isCollapsedDesktop ? item.label : undefined}
                onClick={() => isMobile && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 ${itemPad} py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden ${
                    isActive
                      ? "sidebar-active text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <i
                  className={item.icon + " w-6 text-lg text-center flex-shrink-0"}
                ></i>
                {showLabels && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;