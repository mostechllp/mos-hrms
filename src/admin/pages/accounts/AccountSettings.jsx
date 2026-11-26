import React, { useMemo, useState, useEffect } from "react";
import { useMenuVisibility } from "../../../context/MenuVisibilityContext";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { CheckCircle2, EyeOff, Eye, RotateCcw, Users } from "lucide-react";

/* -----------------------------------------------------------
   Menu structure (unchanged)
----------------------------------------------------------- */
const ACCOUNTS_MENU_STRUCTURE = [
  { slug: "accounts-dashboard", label: "Dashboard" },
  {
    slug: "sales",
    label: "Revenue",
    children: [
      { slug: "sales-customers", label: "Customers" },
      { slug: "sales-quotes", label: "Quotes" },
      { slug: "sales-orders", label: "Order Forms" },
      { slug: "sales-invoices", label: "Invoices" },
      { slug: "sales-recurring", label: "Subscriptions" },
      { slug: "sales-challans", label: "Delivery Challans" },
      { slug: "sales-payments", label: "Incoming Payments" },
      { slug: "sales-credits", label: "Customer Credits" },
    ],
  },
  {
    slug: "purchases",
    label: "Spend",
    children: [
      { slug: "purchases-vendors", label: "Vendors" },
      { slug: "purchases-orders", label: "Purchase Orders" },
      { slug: "purchases-bills", label: "Bills" },
      { slug: "purchases-recurring-bills", label: "Recurring Bills" },
      { slug: "purchases-expenses", label: "Expenses" },
      { slug: "purchases-recurring", label: "Recurring Expenses" },
      { slug: "purchases-payments", label: "Outgoing Payments" },
      { slug: "purchases-credits", label: "Vendor Credits" },
    ],
  },
  {
    slug: "money",
    label: "Money",
    children: [{ slug: "banking", label: "Bank Accounts" }],
  },
  {
    slug: "operations",
    label: "Operations",
    children: [
      {
        slug: "time-tracking",
        label: "Time & Billables",
        children: [
          { slug: "time-projects", label: "Projects" },
          { slug: "time-timesheet", label: "Timesheets" },
        ],
      },
      { slug: "items", label: "Catalogue" },
      { slug: "account-documents", label: "Documents" },
    ],
  },
  {
    slug: "accountant",
    label: "Controls",
    children: [
      { slug: "acc-coa", label: "Chart of Accounts" },
      { slug: "acc-journals", label: "Manual Journals" },
      { slug: "acc-currency", label: "Currency Adjustments" },
      { slug: "acc-budgets", label: "Budgets" },
      { slug: "acc-locking", label: "Period Locking" },
      { slug: "acc-bulk", label: "Bulk Reclassify" },
    ],
  },
  { slug: "accounts-reports", label: "Reports" },
];

/* -----------------------------------------------------------
   Dummy roles + default hidden slugs per role
----------------------------------------------------------- */
const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "accountant", label: "Accountant" },
  { value: "sales-manager", label: "Sales Manager" },
  { value: "sales-rep", label: "Sales Representative" },
  { value: "viewer", label: "Viewer (read-only)" },
  { value: "auditor", label: "Auditor" },
];

const DEFAULT_ROLE = "admin";

const ROLE_DEFAULTS = {
  admin: { hidden: [] },
  accountant: {
    hidden: ["money", "operations", "time-tracking", "items"],
  },
  "sales-manager": {
    hidden: [
      "purchases",
      "purchases-payments",
      "money",
      "accountant",
      "acc-currency",
      "acc-budgets",
      "acc-bulk",
    ],
  },
  "sales-rep": {
    hidden: [
      "purchases",
      "money",
      "accountant",
      "accounts-reports",
      "time-tracking",
      "items",
      "sales-credits",
    ],
  },
  viewer: {
    hidden: [
      "purchases",
      "purchases-payments",
      "purchases-recurring",
      "purchases-credits",
      "money",
      "operations",
      "accountant",
      "acc-bulk",
      "acc-journals",
      "acc-currency",
      "acc-budgets",
      "acc-locking",
    ],
  },
  auditor: {
    hidden: [
      "purchases",
      "purchases-payments",
      "money",
      "operations",
      "sales-payments",
      "acc-bulk",
    ],
  },
};

/* -----------------------------------------------------------
   Helpers: collect all slugs / leaf slugs
----------------------------------------------------------- */
const collectAllSlugs = (nodes, acc = []) => {
  for (const n of nodes) {
    acc.push(n.slug);
    if (n.children) collectAllSlugs(n.children, acc);
  }
  return acc;
};

const ALL_SLUGS = collectAllSlugs(ACCOUNTS_MENU_STRUCTURE);

/* -----------------------------------------------------------
   Component
----------------------------------------------------------- */
const AccountsMenuSettings = () => {
  const { isMenuVisible, toggleMenuVisibility, hiddenSlugs } =
    useMenuVisibility();

  const [role, setRole] = useState(() => {
    return localStorage.getItem("accounts_menu_active_role") || DEFAULT_ROLE;
  });

  // Per-role hidden map (persisted in localStorage)
  const [roleHiddenMap, setRoleHiddenMap] = useState(() => {
    try {
      const raw = localStorage.getItem("accounts_menu_role_permissions");
      if (raw) return JSON.parse(raw);
    } catch {
      /* noop */
    }
    // fall back to defaults
    const seed = {};
    for (const r of ROLES) seed[r.value] = ROLE_DEFAULTS[r.value]?.hidden || [];
    return seed;
  });

  // Persist role & permissions
  useEffect(() => {
    localStorage.setItem("accounts_menu_active_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(
      "accounts_menu_role_permissions",
      JSON.stringify(roleHiddenMap)
    );
    // If editing the currently active role, sync the live context
    if (role === (localStorage.getItem("accounts_menu_active_role") || DEFAULT_ROLE)) {
      const currentHidden = roleHiddenMap[role] || [];
      for (const slug of ALL_SLUGS) {
        const shouldBeVisible = !currentHidden.includes(slug);
        const currentlyVisible = isMenuVisible(slug);
        if (shouldBeVisible !== currentlyVisible) toggleMenuVisibility(slug);
      }
    }
  }, [roleHiddenMap, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const hiddenForRole = useMemo(
    () => new Set(roleHiddenMap[role] || []),
    [roleHiddenMap, role]
  );

  const isVisible = (slug) => !hiddenForRole.has(slug);

  const setSlugVisible = (slug, visible) => {
    setRoleHiddenMap((prev) => {
      const hidden = new Set(prev[role] || []);
      if (visible) hidden.delete(slug);
      else hidden.add(slug);
      return { ...prev, [role]: Array.from(hidden) };
    });
  };

  const toggleSlug = (slug) => setSlugVisible(slug, !isVisible(slug));

  const setGroupVisible = (node, visible) => {
    const slugs = collectAllSlugs([node]);
    setRoleHiddenMap((prev) => {
      const hidden = new Set(prev[role] || []);
      for (const s of slugs) {
        if (visible) hidden.delete(s);
        else hidden.add(s);
      }
      return { ...prev, [role]: Array.from(hidden) };
    });
  };

  const resetRoleToDefaults = () => {
    setRoleHiddenMap((prev) => ({
      ...prev,
      [role]: ROLE_DEFAULTS[role]?.hidden || [],
    }));
  };

  const showAllForRole = () => {
    setRoleHiddenMap((prev) => ({ ...prev, [role]: [] }));
  };

  /* -----------------------------------------------------------
     Sub-renderers
  ----------------------------------------------------------- */
  const Toggle = ({ checked, onChange, label }) => (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/50 dark:peer-focus:ring-green-800/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500" />
    </label>
  );

  const GroupActionButton = ({ onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] font-medium px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {children}
    </button>
  );

  const renderNode = (node, level = 0) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const visible = isVisible(node.slug);

    // Compute group stats for parent nodes
    let groupVisibleCount = 0;
    let groupTotalCount = 0;
    if (hasChildren) {
      for (const child of node.children) {
        if (child.children) {
          for (const g of child.children) {
            groupTotalCount += 1;
            if (isVisible(g.slug)) groupVisibleCount += 1;
          }
        }
        groupTotalCount += 1;
        if (isVisible(child.slug)) groupVisibleCount += 1;
      }
    }

    return (
      <div key={node.slug} className={level > 0 ? "mt-1" : ""}>
        <div
          className={[
            "group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
            level === 0
              ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300/60 dark:hover:border-green-700/60"
              : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60",
          ].join(" ")}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {level === 0 && (
              <span
                className={[
                  "inline-flex h-2 w-2 rounded-full shrink-0",
                  visible ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600",
                ].join(" ")}
                aria-hidden
              />
            )}

            <div className="min-w-0">
              <p
                className={[
                  "truncate",
                  level === 0
                    ? "text-sm font-semibold text-gray-800 dark:text-gray-100"
                    : "text-[13px] text-gray-700 dark:text-gray-200",
                ].join(" ")}
              >
                {node.label}
              </p>

              {hasChildren && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {groupVisibleCount} of {groupTotalCount} visible
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasChildren && (
              <>
                <GroupActionButton
                  onClick={() => setGroupVisible(node, true)}
                >
                  Show all
                </GroupActionButton>
                <GroupActionButton
                  onClick={() => setGroupVisible(node, false)}
                >
                  Hide all
                </GroupActionButton>
              </>
            )}
            <Toggle
              checked={visible}
              onChange={() => toggleSlug(node.slug)}
              label={`Toggle ${node.label}`}
            />
          </div>
        </div>

        {hasChildren && (
          <div className="mt-1 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  /* -----------------------------------------------------------
     Page render
  ----------------------------------------------------------- */
  const totalSlugs = ALL_SLUGS.length;
  const visibleCount = totalSlugs - hiddenForRole.size;
  const progress = Math.round((visibleCount / totalSlugs) * 100);

  return (
    <div className="w-full py-4 px-2 md:px-4">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-green-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
              Accounts · Role Permissions
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Menu Visibility
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose a role and toggle which menu items appear in the Accounts
            sidebar for that role.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Role
            </label>
            <SearchableSelect
              value={role}
              onChange={(val) => setRole(val)}
              options={ROLES}
              placeholder="Select role…"
              clearable={false}
            />
          </div>
        </div>
      </div>

      {/* --- Summary card --- */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {visibleCount} of {totalSlugs} menu items visible
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Editing permissions for{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {ROLES.find((r) => r.value === role)?.label || role}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={showAllForRole}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye size={13} /> Show all
            </button>
            <button
              type="button"
              onClick={resetRoleToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- Menu tree --- */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-3 sm:p-4 space-y-2">
        {ACCOUNTS_MENU_STRUCTURE.map((node) => renderNode(node, 0))}
      </div>

      {/* --- Footer hint --- */}
      <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200">
        <EyeOff size={14} className="shrink-0 mt-0.5" />
        <p>
          Toggling a parent hides or shows all of its children. Changes for the
          currently active role are applied live to the sidebar and saved
          per-role in the browser.
        </p>
      </div>
    </div>
  );
};

export default AccountsMenuSettings;