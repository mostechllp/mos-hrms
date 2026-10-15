// src/admin/components/crm/reports/ReportPrimitives.jsx
export const Card = ({ title, subtitle, action, children }) => (
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

export const KpiStat = ({ label, value, icon: Icon, color = "blue", trend }) => {
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
        {trend != null && (
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

export const LoadingBlock = ({ label = "Loading report…" }) => (
  <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400 text-sm">
    {label}
  </div>
);

export const ErrorBlock = ({ message }) => (
  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-sm text-red-700 dark:text-red-300">
    {message}
  </div>
);

export const EmptyBlock = ({ message = "No data available for the selected filters." }) => (
  <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
    {message}
  </div>
);

export const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#6b7280",
];

export const formatCurrency = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

export const formatNumber = (n) => Number(n || 0).toLocaleString();