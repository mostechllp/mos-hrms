// src/admin/pages/crm/CrmReports.jsx

import { useMemo, useState } from "react";
import {
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Building2,
  Activity,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { showToast } from "../../../components/common/Toast";

// ============================================================
// STATIC DATA — replace with API calls later
// ============================================================

// --- Lead report ---
const LEADS_BY_SOURCE = [
  { name: "Website", value: 42 },
  { name: "Referral", value: 28 },
  { name: "Social Media", value: 18 },
  { name: "Phone", value: 14 },
  { name: "Email", value: 12 },
  { name: "Exhibition", value: 8 },
  { name: "Manual Entry", value: 4 },
  { name: "Other", value: 2 },
];

const LEADS_BY_STATUS = [
  { name: "New", value: 35 },
  { name: "Contacted", value: 42 },
  { name: "Qualified", value: 28 },
  { name: "Unqualified", value: 12 },
  { name: "Converted", value: 11 },
];

const LEADS_BY_MONTH = [
  { month: "Apr", count: 18 },
  { month: "May", count: 24 },
  { month: "Jun", count: 32 },
  { month: "Jul", count: 41 },
  { month: "Aug", count: 36 },
  { month: "Sep", count: 45 },
];

// --- Opportunity report ---
const PIPELINE_BY_STAGE = [
  { stage: "New", count: 45, value: 420000 },
  { stage: "Qualified", count: 28, value: 560000 },
  { stage: "Proposal Sent", count: 18, value: 380000 },
  { stage: "Negotiation", count: 12, value: 290000 },
  { stage: "Won", count: 12, value: 240000 },
  { stage: "Lost", count: 5, value: 80000 },
];

const PIPELINE_BY_SALESPERSON = [
  { name: "Riya Roy", won: 420000, open: 380000 },
  { name: "Karthik Raj", won: 310000, open: 520000 },
  { name: "Amina Khan", won: 280000, open: 240000 },
  { name: "Rahul Verma", won: 180000, open: 200000 },
  { name: "Aarav Mehta", won: 90000, open: 150000 },
];

const PIPELINE_BY_CUSTOMER = [
  { name: "Acme Corp", value: 450000, deals: 3 },
  { name: "XYZ Pvt Ltd", value: 500000, deals: 2 },
  { name: "Initech Solutions", value: 800000, deals: 1 },
  { name: "LMN Group", value: 300000, deals: 1 },
  { name: "Globex Ltd", value: 120000, deals: 1 },
];

// --- Sales performance ---
const SALES_PERFORMANCE_TREND = [
  { month: "Apr", won: 6, lost: 3, value: 240000 },
  { month: "May", won: 8, lost: 2, value: 320000 },
  { month: "Jun", won: 10, lost: 4, value: 410000 },
  { month: "Jul", won: 12, lost: 3, value: 480000 },
  { month: "Aug", won: 11, lost: 5, value: 440000 },
  { month: "Sep", won: 14, lost: 2, value: 620000 },
];

// --- Activity report ---
const ACTIVITY_SUMMARY = [
  { name: "Completed", value: 128, color: "#10b981" },
  { name: "Upcoming", value: 45, color: "#3b82f6" },
  { name: "Overdue", value: 12, color: "#ef4444" },
  { name: "Cancelled", value: 6, color: "#6b7280" },
];

const ACTIVITIES_BY_TYPE = [
  { type: "Call", count: 62 },
  { type: "Meeting", count: 34 },
  { type: "Email", count: 48 },
  { type: "Task", count: 38 },
  { type: "Site Visit", count: 9 },
];

// --- Quotation report ---
const QUOTATION_SUMMARY = [
  { name: "Draft", value: 12, amount: 1800000 },
  { name: "Sent", value: 28, amount: 4200000 },
  { name: "Viewed", value: 15, amount: 2350000 },
  { name: "Accepted", value: 22, amount: 3800000 },
  { name: "Rejected", value: 8, amount: 900000 },
  { name: "Expired", value: 5, amount: 620000 },
];

const QUOTATIONS_BY_MONTH = [
  { month: "Apr", count: 8, value: 780000 },
  { month: "May", count: 12, value: 1240000 },
  { month: "Jun", count: 16, value: 1820000 },
  { month: "Jul", count: 18, value: 2100000 },
  { month: "Aug", count: 22, value: 2650000 },
  { month: "Sep", count: 14, value: 1740000 },
];

// --- Customer report ---
const CUSTOMER_GROWTH = [
  { month: "Apr", new: 3, active: 42, inactive: 4 },
  { month: "May", new: 5, active: 46, inactive: 5 },
  { month: "Jun", new: 4, active: 49, inactive: 6 },
  { month: "Jul", new: 6, active: 54, inactive: 6 },
  { month: "Aug", new: 3, active: 57, inactive: 7 },
  { month: "Sep", new: 5, active: 61, inactive: 7 },
];

const CUSTOMERS_BY_INDUSTRY = [
  { name: "IT Services", value: 18 },
  { name: "Manufacturing", value: 14 },
  { name: "Fintech", value: 11 },
  { name: "Retail", value: 8 },
  { name: "Logistics", value: 6 },
  { name: "Healthcare", value: 5 },
  { name: "Aerospace", value: 4 },
];

const CUSTOMER_ACTIVITY = [
  { customer: "Acme Corp", activities: 42, opportunities: 3, quotations: 2 },
  { customer: "XYZ Pvt Ltd", activities: 38, opportunities: 2, quotations: 3 },
  { customer: "Initech Solutions", activities: 31, opportunities: 1, quotations: 1 },
  { customer: "LMN Group", activities: 24, opportunities: 1, quotations: 2 },
  { customer: "Globex Ltd", activities: 19, opportunities: 1, quotations: 1 },
];

// ============================================================
// Shared constants
// ============================================================

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#6b7280",
];

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const SALESPEOPLE = [
  { value: "", label: "All Salespersons" },
  { value: "riya", label: "Riya Roy" },
  { value: "karthik", label: "Karthik Raj" },
  { value: "amina", label: "Amina Khan" },
  { value: "rahul", label: "Rahul Verma" },
  { value: "aarav", label: "Aarav Mehta" },
];

const TEAMS = [
  { value: "", label: "All Teams" },
  { value: "sales", label: "Sales" },
  { value: "inside-sales", label: "Inside Sales" },
  { value: "field-sales", label: "Field Sales" },
];

const CUSTOMERS = [
  { value: "", label: "All Customers" },
  { value: "acme", label: "Acme Corp" },
  { value: "globex", label: "Globex Ltd" },
  { value: "initech", label: "Initech Solutions" },
  { value: "lmn", label: "LMN Group" },
];

const LEAD_SOURCES = [
  { value: "", label: "All Sources" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "exhibition", label: "Exhibition" },
  { value: "manual", label: "Manual Entry" },
  { value: "other", label: "Other" },
];

const STAGES = [
  { value: "", label: "All Stages" },
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const REPORT_TABS = [
  { key: "sales", label: "Sales Reports", icon: TrendingUp },
  { key: "leads", label: "Lead Report", icon: Users },
  { key: "opportunities", label: "Opportunity Report", icon: Target },
  { key: "performance", label: "Sales Performance", icon: Award },
  { key: "activities", label: "Activity Report", icon: Activity },
  { key: "quotations", label: "Quotation Report", icon: FileText },
  { key: "customers", label: "Customer Report", icon: Building2 },
];

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const formatNumber = (n) => Number(n || 0).toLocaleString();

// ============================================================
// Small UI primitives
// ============================================================

const Card = ({ title, subtitle, action, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const KpiStat = ({ label, value, icon: Icon, color = "blue", trend }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${map[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span
            className={`text-[11px] font-bold ${
              trend > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const CrmReports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState("month");
  const [salesperson, setSalesperson] = useState("");
  const [team, setTeam] = useState("");
  const [customer, setCustomer] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [stage, setStage] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeFilterCount = [
    dateRange !== "month" ? dateRange : null,
    salesperson,
    team,
    customer,
    leadSource,
    stage,
  ].filter(Boolean).length;

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: dispatch(fetchReport({ report: activeTab, ...filters }))
    setTimeout(() => {
      setRefreshing(false);
      showToast("Report refreshed", "success");
    }, 600);
  };

  const handleExportCSV = () => {
    // TODO: generate CSV from current report data
    showToast(`Exporting ${activeTab} report as CSV…`, "info");
  };

  const handleExportExcel = () => {
    showToast(`Exporting ${activeTab} report as Excel…`, "info");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            CRM Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Understand sales performance, pipeline health, and customer activity
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* ---------- Common filters bar ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Report Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filtersOpen ? "Hide" : "Show"}
          </span>
        </button>

        {filtersOpen && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            <FilterField label="Date Range">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {DATE_RANGES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Salesperson">
              <select
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {SALESPEOPLE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Team">
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Customer">
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {CUSTOMERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Lead Source">
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Stage">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FilterField>
          </div>
        )}
      </div>

      {/* ---------- Report tabs ---------- */}
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

      {/* ---------- Report content ---------- */}
      <div className="space-y-6">
        {activeTab === "sales" && <SalesReports />}
        {activeTab === "leads" && <LeadReport />}
        {activeTab === "opportunities" && <OpportunityReport />}
        {activeTab === "performance" && <SalesPerformanceReport />}
        {activeTab === "activities" && <ActivityReport />}
        {activeTab === "quotations" && <QuotationReport />}
        {activeTab === "customers" && <CustomerReport />}
      </div>
    </div>
  );
};

// ============================================================
// FilterField helper
// ============================================================

const FilterField = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </label>
    {children}
  </div>
);

// ============================================================
// REPORTS
// ============================================================

// ---------- 1. Sales Reports (landing) ----------
const SalesReports = () => {
  const totalWon = SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.won, 0);
  const totalLost = SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.lost, 0);
  const totalValue = SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.value, 0);
  const winRate =
    totalWon + totalLost > 0
      ? ((totalWon / (totalWon + totalLost)) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat label="Deals Won" value={totalWon} icon={Award} color="green" trend={12} />
        <KpiStat label="Deals Lost" value={totalLost} icon={TrendingDown} color="red" trend={-4} />
        <KpiStat label="Total Won Value" value={formatCurrency(totalValue)} icon={TrendingUp} color="blue" trend={18} />
        <KpiStat label="Win Rate" value={`${winRate}%`} icon={Target} color="purple" trend={3} />
      </div>

      {/* Chart */}
      <Card title="Sales Trend" subtitle="Won vs lost deals and total value by month">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={SALES_PERFORMANCE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "value" ? [formatCurrency(value), "Value"] : [value, name]
              }
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="won"
              stroke="#10b981"
              strokeWidth={2}
              name="Won"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="lost"
              stroke="#ef4444"
              strokeWidth={2}
              name="Lost"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card title="Monthly Summary">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {["Month", "Won", "Lost", "Value", "Win Rate"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALES_PERFORMANCE_TREND.map((m) => {
                const rate =
                  m.won + m.lost > 0
                    ? ((m.won / (m.won + m.lost)) * 100).toFixed(0)
                    : "0";
                return (
                  <tr
                    key={m.month}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {m.month}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {m.won}
                    </td>
                    <td className="px-3 py-2 text-xs text-red-600 dark:text-red-400 font-semibold">
                      {m.lost}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {formatCurrency(m.value)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ---------- 2. Lead Report ----------
const LeadReport = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiStat label="Total Leads" value={128} icon={Users} color="blue" trend={15} />
      <KpiStat label="Converted" value={11} icon={CheckCircle2} color="green" trend={8} />
      <KpiStat label="Converted Rate" value="8.6%" icon={Target} color="purple" trend={2} />
      <KpiStat
        label="Highest Source"
        value="Website"
        icon={TrendingUp}
        color="indigo"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Leads by Source">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={LEADS_BY_SOURCE}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {LEADS_BY_SOURCE.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Leads by Status">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={LEADS_BY_STATUS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {LEADS_BY_STATUS.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    <Card title="Leads Over Time" subtitle="New leads per month">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={LEADS_BY_MONTH}>
          <defs>
            <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#leadsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  </div>
);

// ---------- 3. Opportunity Report ----------
const OpportunityReport = () => {
  const totalPipeline = PIPELINE_BY_STAGE.reduce(
    (s, x) => s + x.value,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat label="Total Pipeline" value={formatCurrency(totalPipeline)} icon={TrendingUp} color="blue" />
        <KpiStat
          label="Open Deals"
          value={PIPELINE_BY_STAGE.slice(0, 4).reduce((s, x) => s + x.count, 0)}
          icon={Target}
          color="indigo"
        />
        <KpiStat
          label="Won Deals"
          value={PIPELINE_BY_STAGE.find((s) => s.stage === "Won")?.count || 0}
          icon={Award}
          color="green"
        />
        <KpiStat
          label="Lost Deals"
          value={PIPELINE_BY_STAGE.find((s) => s.stage === "Lost")?.count || 0}
          icon={TrendingDown}
          color="red"
        />
      </div>

      <Card title="Pipeline Value by Stage">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={PIPELINE_BY_STAGE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Value"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {PIPELINE_BY_STAGE.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pipeline by Salesperson">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={PIPELINE_BY_SALESPERSON} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="won" stackId="a" fill="#10b981" name="Won" />
              <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Open" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pipeline by Customer">
          <div className="space-y-3 mt-2">
            {PIPELINE_BY_CUSTOMER.map((c) => {
              const max = Math.max(
                ...PIPELINE_BY_CUSTOMER.map((x) => x.value),
              );
              const pct = (c.value / max) * 100;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {c.name}
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(c.value)} · {c.deals} deals
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 4. Sales Performance Report ----------
const SalesPerformanceReport = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiStat
        label="Won Deals"
        value={SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.won, 0)}
        icon={Award}
        color="green"
        trend={11}
      />
      <KpiStat
        label="Lost Deals"
        value={SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.lost, 0)}
        icon={TrendingDown}
        color="red"
        trend={-6}
      />
      <KpiStat
        label="Total Value"
        value={formatCurrency(
          SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.value, 0),
        )}
        icon={TrendingUp}
        color="blue"
        trend={16}
      />
      <KpiStat
        label="Avg. Deal Size"
        value={formatCurrency(
          SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.value, 0) /
            Math.max(
              SALES_PERFORMANCE_TREND.reduce((s, m) => s + m.won, 0),
              1,
            ),
        )}
        icon={Target}
        color="purple"
      />
    </div>

    <Card title="Sales Performance Trend" subtitle="Deals won vs lost, and total value">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={SALES_PERFORMANCE_TREND}>
          <defs>
            <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="won"
            stroke="#10b981"
            fill="url(#wonGrad)"
            name="Won"
          />
          <Area
            type="monotone"
            dataKey="lost"
            stroke="#ef4444"
            fill="url(#lostGrad)"
            name="Lost"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>

    <Card title="Salesperson Leaderboard">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {["Rank", "Salesperson", "Won", "Open", "Total", "Share"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[...PIPELINE_BY_SALESPERSON]
              .sort((a, b) => b.won + b.open - (a.won + a.open))
              .map((s, i) => {
                const total = s.won + s.open;
                const grand = PIPELINE_BY_SALESPERSON.reduce(
                  (acc, x) => acc + x.won + x.open,
                  0,
                );
                const share = ((total / grand) * 100).toFixed(1);
                return (
                  <tr
                    key={s.name}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                      #{i + 1}
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {s.name}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(s.won)}
                    </td>
                    <td className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {formatCurrency(s.open)}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {share}%
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

// ---------- 5. Activity Report ----------
const ActivityReport = () => {
  const totalActivities = ACTIVITY_SUMMARY.reduce((s, x) => s + x.value, 0);
  const completed =
    ACTIVITY_SUMMARY.find((x) => x.name === "Completed")?.value || 0;
  const completionRate =
    totalActivities > 0
      ? ((completed / totalActivities) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat label="Total Activities" value={totalActivities} icon={Activity} color="blue" />
        <KpiStat label="Completed" value={completed} icon={CheckCircle2} color="green" />
        <KpiStat
          label="Overdue"
          value={ACTIVITY_SUMMARY.find((x) => x.name === "Overdue")?.value || 0}
          icon={AlertCircle}
          color="red"
        />
        <KpiStat
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={Target}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Activity Status Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={ACTIVITY_SUMMARY}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {ACTIVITY_SUMMARY.map((a, i) => (
                  <Cell key={i} fill={a.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Activities by Type">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ACTIVITIES_BY_TYPE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ---------- 6. Quotation Report ----------
const QuotationReport = () => {
  const totalQuotations = QUOTATION_SUMMARY.reduce((s, x) => s + x.value, 0);
  const totalAmount = QUOTATION_SUMMARY.reduce((s, x) => s + x.amount, 0);
  const accepted = QUOTATION_SUMMARY.find((x) => x.name === "Accepted");
  const acceptanceRate =
    totalQuotations > 0
      ? (((accepted?.value || 0) / totalQuotations) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat label="Total Quotations" value={totalQuotations} icon={FileText} color="blue" />
        <KpiStat label="Total Value" value={formatCurrency(totalAmount)} icon={TrendingUp} color="green" />
        <KpiStat label="Accepted Value" value={formatCurrency(accepted?.amount || 0)} icon={Award} color="purple" />
        <KpiStat label="Acceptance Rate" value={`${acceptanceRate}%`} icon={Target} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quotations by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={QUOTATION_SUMMARY} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {QUOTATION_SUMMARY.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Quotations Over Time">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={QUOTATIONS_BY_MONTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "value"
                    ? [formatCurrency(value), "Value"]
                    : [value, "Count"]
                }
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Count"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                name="Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ---------- 7. Customer Report ----------
const CustomerReport = () => {
  const latest = CUSTOMER_GROWTH[CUSTOMER_GROWTH.length - 1];
  const totalNew = CUSTOMER_GROWTH.reduce((s, m) => s + m.new, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat label="Active Customers" value={latest.active} icon={Building2} color="green" trend={9} />
        <KpiStat label="New This Period" value={totalNew} icon={TrendingUp} color="blue" trend={14} />
        <KpiStat label="Inactive" value={latest.inactive} icon={TrendingDown} color="red" trend={-3} />
        <KpiStat
          label="Avg. Activities / Customer"
          value={(
            CUSTOMER_ACTIVITY.reduce((s, c) => s + c.activities, 0) /
            Math.max(CUSTOMER_ACTIVITY.length, 1)
          ).toFixed(1)}
          icon={Activity}
          color="purple"
        />
      </div>

      <Card title="Customer Growth" subtitle="New, active, and inactive customers by month">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={CUSTOMER_GROWTH}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={2} name="New" />
            <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active" />
            <Line type="monotone" dataKey="inactive" stroke="#ef4444" strokeWidth={2} name="Inactive" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Customers by Industry">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={CUSTOMERS_BY_INDUSTRY}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {CUSTOMERS_BY_INDUSTRY.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Customer Activity Leaderboard">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Customer", "Activities", "Opportunities", "Quotations"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {CUSTOMER_ACTIVITY.map((c) => (
                  <tr
                    key={c.customer}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {c.customer}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {c.activities}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {c.opportunities}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {c.quotations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CrmReports;