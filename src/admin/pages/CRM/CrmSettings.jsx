// src/admin/pages/crm/CrmSettings.jsx
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GripVertical,
  Target,
  Building2,
  Activity,
  Package,
  Shield,
  Settings as SettingsIcon,
  Search,
} from "lucide-react";
import LeadSettings from "../../components/crm/settings/LeadSettings";
import OpportunitySettings from "../../components/crm/settings/OpportunitySettings";
import CustomerSettings from "../../components/crm/settings/CustomerSettings";
import ActivitySettings from "../../components/crm/settings/ActivitySettings";
import ProductSettings from "../../components/crm/settings/ProductSettings";
import PermissionSettings from "../../components/crm/settings/PermissionSettings";

// ============================================================
// SECTION TABS
// ============================================================
const SECTIONS = [
  { key: "lead", label: "Lead Settings", icon: Target },
  { key: "opportunity", label: "Opportunity Settings", icon: GripVertical },
  { key: "customer", label: "Customer Settings", icon: Building2 },
  { key: "activity", label: "Activity Settings", icon: Activity },
  { key: "product", label: "Product Settings", icon: Package },
  { key: "permissions", label: "CRM Permissions", icon: Shield },
];

const DEFAULT_TAB = "lead";

// ============================================================
// MAIN COMPONENT
// ============================================================
const CrmSettings = () => {
  // 👈 Read the `tab` query param (defaults to "lead")
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Validate against known section keys; fall back to default
  const activeSection = SECTIONS.some((s) => s.key === tabParam)
    ? tabParam
    : DEFAULT_TAB;

  const handleTabChange = (key) => {
    // Preserve other query params if any, just update `tab`
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    setSearchParams(next, { replace: true });
  };

  const filteredSections = useMemo(() => {
    const q = (searchParams.get("q") || "").toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => s.label.toLowerCase().includes(q));
  }, [searchParams]);

  // Sidebar search term (kept in local state so it doesn't spam the URL)
  const [sidebarSearch, setSidebarSearch] = useMemo(
    () => [searchParams.get("q") || "", null],
    [searchParams]
  );

  return (
    <div className="w-full space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              CRM Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Configure lists, workflows, and defaults used across CRM forms
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Two-column layout ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 h-fit lg:sticky lg:top-4">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={sidebarSearch}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("q", e.target.value);
                else next.delete("q");
                setSearchParams(next, { replace: true });
              }}
              placeholder="Search sections..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => handleTabChange(sec.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition-colors ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  }`}
                >
                  <Icon size={15} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 space-y-4">
          {activeSection === "lead" && <LeadSettings />}
          {activeSection === "opportunity" && <OpportunitySettings />}
          {activeSection === "customer" && <CustomerSettings />}
          {activeSection === "activity" && <ActivitySettings />}
          {activeSection === "product" && <ProductSettings />}
          {activeSection === "permissions" && <PermissionSettings />}
        </div>
      </div>
    </div>
  );
};

export default CrmSettings;