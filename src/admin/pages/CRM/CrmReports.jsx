// src/admin/pages/crm/CrmReports.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp, Users, Target, Award, Activity, FileText, Building2,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import {
  fetchReportFilterOptions,
  exportSalesReport, exportOpportunityReport,
  exportSalesPerformanceReport, exportActivityReport,
  exportQuotationReport, exportCustomerReport, exportLeadReport,
} from "../../store/slices/crmReportSlice";
import ReportPageShell from "../../components/crm/reports/ReportPageShell";
import SalesReport from "../../components/crm/reports/SalesReport";
import LeadReport from "../../components/crm/reports/LeadReport";
import OpportunityReport from "../../components/crm/reports/OpportunityReport";
import SalesPerformanceReport from "../../components/crm/reports/SalesPerformanceReport";
import ActivityReport from "../../components/crm/reports/ActivityReport";
import QuotationReport from "../../components/crm/reports/QuotationReport";
import CustomerReport from "../../components/crm/reports/CustomerReport";

const REPORT_TABS = [
  { key: "sales", label: "Sales Reports", icon: TrendingUp },
  { key: "leads", label: "Lead Report", icon: Users },
  { key: "opportunities", label: "Opportunity Report", icon: Target },
  { key: "performance", label: "Sales Performance", icon: Award },
  { key: "activities", label: "Activity Report", icon: Activity },
  { key: "quotations", label: "Quotation Report", icon: FileText },
  { key: "customers", label: "Customer Report", icon: Building2 },
];

// Maps each tab to its export thunk
const EXPORT_BY_TAB = {
  sales: exportSalesReport,
  leads: exportLeadReport,
  opportunities: exportOpportunityReport,
  performance: exportSalesPerformanceReport,
  activities: exportActivityReport,
  quotations: exportQuotationReport,
  customers: exportCustomerReport,
};

const TAB_TITLES = {
  sales: {
    title: "Sales Reports",
    subtitle: "Deals won vs lost, total value, and monthly performance",
  },
  leads: {
    title: "Lead Report",
    subtitle: "Lead sources, statuses, and monthly acquisition trends",
  },
  opportunities: {
    title: "Opportunity Report",
    subtitle: "Pipeline value by stage, salesperson, and customer",
  },
  performance: {
    title: "Sales Performance",
    subtitle: "Salesperson leaderboard and win/loss trends",
  },
  activities: {
    title: "Activity Report",
    subtitle: "Calls, meetings, and follow-ups across the team",
  },
  quotations: {
    title: "Quotation Report",
    subtitle: "Quotation statuses, values, and monthly volume",
  },
  customers: {
    title: "Customer Report",
    subtitle: "Customer growth, industries, and engagement",
  },
};

const CrmReports = () => {
  const dispatch = useDispatch();
  const { exporting } = useSelector((s) => s.crmReports);

  const [activeTab, setActiveTab] = useState("sales");
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    date_range: "month",
    from_date: "",
    to_date: "",
    salesperson_id: "",
    team_id: "",
    customer_id: "",
    lead_source: "",
    stage: "",
  });

  // Load filter options once
  useEffect(() => {
    dispatch(fetchReportFilterOptions());
  }, [dispatch]);

  const handleFilterChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
  };

  const triggerRefresh = () => setRefreshing(true);
  const doneRefresh = () => setRefreshing(false);

  // remove the individual handlers, keep a single:
const handleExport = async (format) => {
  const thunk = EXPORT_BY_TAB[activeTab];
  if (!thunk) return;
  try {
    await dispatch(thunk({ filters, format })).unwrap();
    showToast(`Export downloaded (${format.toUpperCase()})`, "success");
  } catch (err) {
    showToast(err || "Failed to export report", "error");
    throw err;                 // let ExportModal show its own failure state
  }
};

  const meta = TAB_TITLES[activeTab];

  const commonProps = useMemo(
    () => ({
      filters,
      refreshing,
      onRefreshDone: doneRefresh,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, refreshing],
  );

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          CRM Reports
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Understand sales performance, pipeline health, and customer activity
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shell + active report */}
      <ReportPageShell
        title={meta.title}
        subtitle={meta.subtitle}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={triggerRefresh}
        onExport={handleExport} 
        refreshing={refreshing}
        exporting={exporting}
      >
        {activeTab === "sales" && <SalesReport {...commonProps} />}
        {activeTab === "leads" && <LeadReport {...commonProps} />}
        {activeTab === "opportunities" && <OpportunityReport {...commonProps} />}
        {activeTab === "performance" && (
          <SalesPerformanceReport {...commonProps} />
        )}
        {activeTab === "activities" && <ActivityReport {...commonProps} />}
        {activeTab === "quotations" && <QuotationReport {...commonProps} />}
        {activeTab === "customers" && <CustomerReport {...commonProps} />}
      </ReportPageShell>
    </div>
  );
};

export default CrmReports;