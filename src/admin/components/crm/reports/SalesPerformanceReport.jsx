// src/admin/components/crm/reports/SalesPerformanceReport.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, TrendingDown, TrendingUp, Target } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { fetchSalesPerformanceReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock, formatCurrency,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: {
 *     won_deals, won_growth (string "+100%"),
 *     lost_deals, lost_growth,
 *     total_value, formatted_total_value, value_growth,
 *     avg_deal_size, formatted_avg_deal_size
 *   },
 *   performance_trend: { labels, won_deals, lost_deals, values },
 *   salesperson_leaderboard: [
 *     { salesperson, won_value, formatted_won, open_value, formatted_open,
 *       total_value, formatted_total, share_percent, deals_count, rank }
 *   ]
 * }
 */
const SalesPerformanceReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { salesPerformance } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchSalesPerformanceReport(filters)).finally(() =>
      onRefreshDone?.(),
    );
  }, [dispatch, filters, onRefreshDone]);

  if (salesPerformance.loading) return <LoadingBlock />;
  if (salesPerformance.error)
    return <ErrorBlock message={salesPerformance.error} />;
  if (!salesPerformance.data) return <EmptyBlock />;

  const kpis = salesPerformance.data.kpis || {};
  const trend = salesPerformance.data.performance_trend || {};
  const leaderboard = salesPerformance.data.salesperson_leaderboard || [];

  // Reconstruct chart-friendly array from parallel arrays
  const chartData = (trend.labels || []).map((month, i) => ({
    month,
    won: trend.won_deals?.[i] ?? 0,
    lost: trend.lost_deals?.[i] ?? 0,
    value: trend.values?.[i] ?? 0,
  }));

  // Turn "+100%" → 100 (for the KpiStat badge)
  const parseGrowth = (s) => {
    if (s == null) return null;
    const n = Number(String(s).replace("%", "").replace("+", ""));
    return Number.isFinite(n) ? n : null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Won Deals"
          value={kpis.won_deals ?? 0}
          icon={Award}
          color="green"
          trend={parseGrowth(kpis.won_growth)}
        />
        <KpiStat
          label="Lost Deals"
          value={kpis.lost_deals ?? 0}
          icon={TrendingDown}
          color="red"
          trend={parseGrowth(kpis.lost_growth)}
        />
        <KpiStat
          label="Total Value"
          value={
            kpis.formatted_total_value ||
            formatCurrency(kpis.total_value)
          }
          icon={TrendingUp}
          color="blue"
          trend={parseGrowth(kpis.value_growth)}
        />
        <KpiStat
          label="Avg. Deal Size"
          value={
            kpis.formatted_avg_deal_size ||
            formatCurrency(kpis.avg_deal_size)
          }
          icon={Target}
          color="purple"
        />
      </div>

      <Card
        title="Sales Performance Trend"
        subtitle="Deals won vs lost, and total value"
      >
        {chartData.length === 0 ? (
          <EmptyBlock message="No trend data available yet." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
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
        )}
      </Card>

      <Card title="Salesperson Leaderboard">
        {leaderboard.length === 0 ? (
          <EmptyBlock message="No salesperson data available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    "Rank",
                    "Salesperson",
                    "Deals",
                    "Won",
                    "Open",
                    "Total",
                    "Share",
                  ].map((h) => (
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
                {/* API already sorted by rank; keep server order */}
                {leaderboard.map((s) => (
                  <tr
                    key={s.salesperson}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                      {s.rank || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {s.salesperson || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.deals_count ?? 0}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {s.formatted_won || formatCurrency(s.won_value)}
                    </td>
                    <td className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {s.formatted_open || formatCurrency(s.open_value)}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                      {s.formatted_total || formatCurrency(s.total_value)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${Math.min(Number(s.share_percent) || 0, 100)}%`,
                            }}
                          />
                        </div>
                        <span>{Number(s.share_percent)?.toFixed(1) ?? "0.0"}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesPerformanceReport;