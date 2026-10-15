// src/admin/components/crm/reports/CustomerReport.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2, Users, TrendingUp, Percent,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { fetchCustomerReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock, CHART_COLORS,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: {
 *     total_customers, active_customers, new_customers, active_ratio
 *   },
 *   by_type: [{ type, count, active }],
 *   by_industry: [{ name, count, active }]
 * }
 */
const CustomerReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { customer } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchCustomerReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  const kpis = customer.data?.kpis || {};
  const byType = customer.data?.by_type || [];
  const byIndustryRaw = customer.data?.by_industry || [];

  // Transform for the pie chart — API uses `count`, pie needs `value`
  const byIndustry = useMemo(
    () =>
      byIndustryRaw
        .filter((r) => (Number(r.count) || 0) > 0)
        .map((r) => ({
          name: r.name || "Unspecified",
          value: Number(r.count) || 0,
          active: Number(r.active) || 0,
        })),
    [byIndustryRaw],
  );

  if (customer.loading) return <LoadingBlock />;
  if (customer.error) return <ErrorBlock message={customer.error} />;
  if (!customer.data) return <EmptyBlock />;

  return (
    <div className="space-y-6">
      {/* KPI cards — correct keys */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Total Customers"
          value={kpis.total_customers ?? 0}
          icon={Users}
          color="blue"
        />
        <KpiStat
          label="Active"
          value={kpis.active_customers ?? 0}
          icon={Building2}
          color="green"
        />
        <KpiStat
          label="New This Period"
          value={kpis.new_customers ?? 0}
          icon={TrendingUp}
          color="indigo"
        />
        <KpiStat
          label="Active Ratio"
          value={`${kpis.active_ratio ?? 0}%`}
          icon={Percent}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers by Industry pie — only rendered when data exists */}
        <Card title="Customers by Industry">
          {byIndustry.length === 0 ? (
            <EmptyBlock message="No industry data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byIndustry}
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
                  {byIndustry.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} customer${value === 1 ? "" : "s"}`,
                    name,
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* By Type table — surfaces what the API actually returns */}
        <Card title="Customers by Type">
          {byType.length === 0 ? (
            <EmptyBlock message="No type data available yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {["Type", "Count", "Active", "Active %"].map((h) => (
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
                  {byType.map((t) => {
                    const count = Number(t.count) || 0;
                    const active = Number(t.active) || 0;
                    const pct =
                      count > 0 ? Math.round((active / count) * 100) : 0;
                    return (
                      <tr
                        key={t.type}
                        className="border-b border-gray-100 dark:border-gray-700/50"
                      >
                        <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {t.type || "Unspecified"}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {count}
                        </td>
                        <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                          {active}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Industry table — mirrors the pie, plus per-industry active counts */}
      {byIndustry.length > 0 && (
        <Card title="Industry Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Industry", "Customers", "Active", "Share"].map((h) => (
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
                {(() => {
                  const total = byIndustry.reduce(
                    (sum, r) => sum + r.value,
                    0,
                  );
                  return byIndustry.map((r) => {
                    const share =
                      total > 0 ? ((r.value / total) * 100).toFixed(0) : 0;
                    return (
                      <tr
                        key={r.name}
                        className="border-b border-gray-100 dark:border-gray-700/50"
                      >
                        <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {r.name}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {r.value}
                        </td>
                        <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                          {r.active}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerReport;