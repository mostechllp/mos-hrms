// src/admin/pages/crm/CrmDashboard.jsx
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  Briefcase,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  AlertCircle,
  Target,
  FileText,
  DollarSign,
  RefreshCw,
  Plus,
  Eye,
  BarChart3,
  FilePlus,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchCrmDashboard,
  setDashboardFilter,
} from "../../store/slices/crmDashboardSlice";

// ------------------------------------------------------------
// Config
// ------------------------------------------------------------
const CARD_COLOR_MAP = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  orange:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  indigo:
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  purple:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
};

const priorityBadge = (priority) => {
  const map = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Medium:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return map[priority] || map.Medium;
};

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const formatCurrency = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const ICON_BY_NAME = {
  briefcase: Briefcase,
  "file-text": FileText,
  "user-check": UserCheck,
  "user-plus": UserPlus,
  users: Users,
};

const SECONDARY_CARD_DEFS = [
  { key: "newLeadsThisMonth", icon: Users, color: "blue" },
  { key: "wonDealsThisMonth", icon: TrendingUp, color: "green" },
  { key: "lostDealsThisMonth", icon: TrendingDown, color: "red" },
  { key: "followUpsDueToday", icon: CalendarClock, color: "amber" },
  { key: "overdueActivities", icon: AlertCircle, color: "orange" },
  { key: "conversionRate", icon: Target, color: "indigo" },
  { key: "quotationValue", icon: FileText, color: "purple" },
  { key: "averageDealValue", icon: DollarSign, color: "teal" },
];

// Shared heights for the two activity panels
const PANEL_MAX_H = "max-h-[440px]";
const ACTIVITY_LIST_MAX_H = "max-h-[380px]";

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const CrmDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error, filters } = useSelector((s) => s.crmDashboard);

  useEffect(() => {
    dispatch(fetchCrmDashboard(filters));
  }, [dispatch, filters]);

  const {
    kpis,
    salesPipeline,
    leadSources,
    monthlySales,
    upcomingActivities,
    recentActivities,
    filters: filterOptions,
  } = data;

  const handleRefresh = () => dispatch(fetchCrmDashboard(filters));
  const setFilter = (k, v) => dispatch(setDashboardFilter({ [k]: v }));

  const pipelineChart = useMemo(
    () =>
      salesPipeline.map((s) => ({
        stage: s.stage,
        count: s.count,
        value: s.value,
        formatted_value: s.formattedValue,
        color: s.color,
      })),
    [salesPipeline],
  );

  const sourceChart = useMemo(
    () =>
      leadSources.map((s) => ({
        name: s.source,
        value: s.count,
        percentage: s.percentage,
        color: s.color,
      })),
    [leadSources],
  );

  const salesTrend = useMemo(
    () =>
      monthlySales.series.length
        ? monthlySales.series
        : monthlySales.labels.map((m, i) => ({
            month: m,
            deals: monthlySales.deals?.[i] ?? 0,
            value: monthlySales.values?.[i] ?? 0,
            formattedValue: monthlySales.formattedValues?.[i] ?? null,
          })),
    [monthlySales],
  );

  if (loading && !data.kpis?.totalLeads?.label) {
    return (
      <div className="w-full py-16 text-center text-gray-500 dark:text-gray-400">
        Loading CRM dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-16 text-center space-y-3">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const dateRangesMap = filterOptions.dateRanges || {};
  const salespersons = filterOptions.salespersons || [];
  const salesTeams = filterOptions.salesTeams || [];

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            CRM Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your sales pipeline, leads, and activities
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <select
            value={filters.date_range}
            onChange={(e) => setFilter("date_range", e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {Object.entries(dateRangesMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filters.salesperson_id}
            onChange={(e) => setFilter("salesperson_id", e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Salespersons</option>
            {salespersons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filters.team_id}
            onChange={(e) => setFilter("team_id", e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {salesTeams.map((t) => (
              <option key={t} value={t === "All Teams" ? "" : t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden lg:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* PRIMARY SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <PrimaryCard kpi={kpis.totalLeads} icon={Users} color="blue" />
        <PrimaryCard kpi={kpis.totalCustomers} icon={UserCheck} color="green" />
        <PrimaryCard
          kpi={kpis.openOpportunities}
          icon={Briefcase}
          color="purple"
        />
        <PrimaryCard
          kpi={kpis.estimatedOpenDealValue}
          icon={IndianRupee}
          color="amber"
        />
      </div>

      {/* SECONDARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {SECONDARY_CARD_DEFS.map(({ key, icon, color }) => {
          const kpi = kpis[key] || { display: 0, label: "" };
          const Icon = icon;
          return (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${CARD_COLOR_MAP[color]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                {kpi.display}
              </div>
              <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {kpi.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Sales Pipeline" icon={BarChart3}>
          {pipelineChart.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.3}
                />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, _name, entry) => {
                    const row = entry.payload;
                    return [
                      `${value} deal${value === 1 ? "" : "s"} · ${row.formatted_value || formatCurrency(row.value)}`,
                      row.stage,
                    ];
                  }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipelineChart.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Lead Sources">
          {sourceChart.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={2}
                  label={({ name, payload }) =>
                    `${name} ${payload?.percentage ?? 0}%`
                  }
                  labelLine={false}
                >
                  {sourceChart.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, entry) => [
                    `${value} lead${value === 1 ? "" : "s"} (${entry.payload.percentage}%)`,
                    name,
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* MONTHLY SALES */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Monthly Sales
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="bg-blue-500" label="Deals" />
            <LegendDot color="bg-emerald-500" label="Value" />
          </div>
        </div>
        {salesTrend.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.3}
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value, name, entry) =>
                  name === "value"
                    ? [
                        entry.payload.formattedValue || formatCurrency(value),
                        "Value",
                      ]
                    : [value, "Deals"]
                }
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="deals"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="deals"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="value"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* UPCOMING + RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Upcoming Activities (fixed header + scrollable table) ── */}
        <div
          className={`lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${PANEL_MAX_H}`}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Upcoming Activities
            </h2>
            <button
              onClick={() => navigate("/admin/crm/activities")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No upcoming activities in this range.
            </div>
          ) : (
            <div className={`flex-1 overflow-auto scrollbar-thin ${ACTIVITY_LIST_MAX_H}`}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {[
                      "Activity",
                      "Customer",
                      "Assignee",
                      "Due",
                      "Priority",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingActivities.map((a) => {
                    const badgeStyle = a.priorityBadge
                      ? {
                          backgroundColor: a.priorityBadge.bg,
                          color: a.priorityBadge.color,
                        }
                      : undefined;
                    const badgeClass = a.priorityBadge
                      ? ""
                      : priorityBadge(a.priority);

                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <td className="px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {a.title}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                          {a.customer || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                          {a.assignee || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                          {a.dueLabel || formatDate(a.dueDate)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                            style={badgeStyle}
                          >
                            {a.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                          {a.status}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() =>
                              navigate(
                                a.id
                                  ? `/admin/crm/activities/${a.id}`
                                  : "/admin/crm/activities",
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Recent Activity (fixed header + scrollable list) ── */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${PANEL_MAX_H}`}
        >
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            {recentActivities.length > 0 && (
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                {recentActivities.length} event
                {recentActivities.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto scrollbar-thin ${ACTIVITY_LIST_MAX_H}`}>
            <div className="p-4 space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  Nothing recent.
                </p>
              ) : (
                recentActivities.map((act) => {
                  const Icon = ICON_BY_NAME[act.icon] || AlertCircle;
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 last:pb-0"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${act.color}20` }}
                      >
                        <Icon size={16} style={{ color: act.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {act.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            icon={Plus}
            label="Add Lead"
            color="bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate("/admin/crm/leads/new")}
          />
          <QuickAction
            icon={UserPlus}
            label="Add Customer"
            color="bg-green-500 hover:bg-green-600"
            onClick={() => navigate("/admin/crm/customers/new")}
          />
          <QuickAction
            icon={ClipboardList}
            label="Add Opportunity"
            color="bg-gray-500 hover:bg-gray-600"
            onClick={() => navigate("/admin/crm/opportunities/new")}
          />
          <QuickAction
            icon={CalendarClock}
            label="Schedule Activity"
            color="bg-amber-500 hover:bg-amber-600"
            onClick={() => navigate("/admin/crm/activities")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <SecondaryAction
            icon={Eye}
            label="View All Leads"
            onClick={() => navigate("/admin/crm/leads")}
          />
          <SecondaryAction
            icon={BarChart3}
            label="View Pipeline"
            onClick={() => navigate("/admin/crm/opportunities")}
          />
          <SecondaryAction
            icon={FileText}
            label="View Reports"
            onClick={() => navigate("/admin/crm/reports")}
          />
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------
const PrimaryCard = ({ kpi, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gray-100 dark:bg-gray-700/50">
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
    </div>
    <div
      className={`text-2xl md:text-3xl font-bold ${color === "amber" ? "text-amber-600 dark:text-amber-400" : ""}`}
    >
      {kpi.display}
    </div>
    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
      {kpi.label}
    </div>
  </div>
);

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {Icon && <Icon size={16} className="text-gray-400" />}
    </div>
    {children}
  </div>
);

const Empty = () => (
  <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
    No data available yet.
  </div>
);

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
  </div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${color}`}
  >
    <Icon size={16} /> {label}
  </button>
);

const SecondaryAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
  >
    <Icon size={15} /> {label}
  </button>
);

export default CrmDashboard;