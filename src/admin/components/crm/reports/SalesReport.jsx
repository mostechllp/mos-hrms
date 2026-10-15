// src/admin/components/crm/reports/SalesReport.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, TrendingDown, TrendingUp, Target } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { fetchSalesReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock, formatCurrency,
} from "./ReportPrimitives";

/**
 * Actual API shape (from backend):
 * {
 *   kpis: {
 *     deals_won, won_growth,
 *     deals_lost, lost_growth,
 *     total_won_value, formatted_total_won_value, value_growth,
 *     win_rate, win_rate_growth
 *   },
 *   sales_trend: {
 *     labels: [...], won_deals: [...], lost_deals: [...],
 *     values: [...], formatted_values: [...]
 *   },
 *   monthly_summary: [
 *     { month, month_full, won, lost, total, value, formatted_value, win_rate }
 *   ]
 * }
 */
const SalesReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { sales } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchSalesReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  if (sales.loading) return <LoadingBlock />;
  if (sales.error) return <ErrorBlock message={sales.error} />;
  if (!sales.data) return <EmptyBlock />;

  const kpis = sales.data.kpis || {};
  const trend = sales.data.sales_trend || {};
  const monthly = sales.data.monthly_summary || [];

  // Reconstruct the [{ month, won, lost, value }] shape the chart wants
  // from the parallel-array shape the API returns.
  const chartData = (trend.labels || []).map((month, i) => ({
    month,
    won: trend.won_deals?.[i] ?? 0,
    lost: trend.lost_deals?.[i] ?? 0,
    value: trend.values?.[i] ?? 0,
  }));

  // Parse "+100%" / "-40%" / "0%" strings into numbers for the trend badge
  const parseGrowth = (s) => {
    if (!s) return null;
    const n = Number(String(s).replace("%", "").replace("+", ""));
    return Number.isFinite(n) ? n : null;
  };

  return (
    <div className="space-y-6">
      {/* KPI cards — read from kpis.* */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Deals Won"
          value={kpis.deals_won ?? 0}
          icon={Award}
          color="green"
          trend={parseGrowth(kpis.won_growth)}
        />
        <KpiStat
          label="Deals Lost"
          value={kpis.deals_lost ?? 0}
          icon={TrendingDown}
          color="red"
          trend={parseGrowth(kpis.lost_growth)}
        />
        <KpiStat
          label="Total Won Value"
          value={
            kpis.formatted_total_won_value ||
            formatCurrency(kpis.total_won_value)
          }
          icon={TrendingUp}
          color="blue"
          trend={parseGrowth(kpis.value_growth)}
        />
        <KpiStat
          label="Win Rate"
          value={`${kpis.win_rate ?? 0}%`}
          icon={Target}
          color="purple"
          trend={parseGrowth(kpis.win_rate_growth)}
        />
      </div>

      {/* Sales trend chart — from reconstructed chartData */}
      <Card title="Sales Trend" subtitle="Won vs lost deals and total value by month">
        {chartData.length === 0 ? (
          <EmptyBlock message="No trend data available yet." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} name="Won" />
              <Line yAxisId="left" type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Lost" />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Value" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Monthly summary table — read from monthly_summary[] */}
      <Card title="Monthly Summary">
        {monthly.length === 0 ? (
          <EmptyBlock message="No monthly data available yet." />
        ) : (
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
                {monthly.map((m, idx) => (
                  <tr
                    key={`${m.month_full || m.month}-${idx}`}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {m.month_full || m.month}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {m.won ?? 0}
                    </td>
                    <td className="px-3 py-2 text-xs text-red-600 dark:text-red-400 font-semibold">
                      {m.lost ?? 0}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {m.formatted_value || formatCurrency(m.value)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {m.win_rate ?? 0}%
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

export default SalesReport;