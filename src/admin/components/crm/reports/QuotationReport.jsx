// src/admin/components/crm/reports/QuotationReport.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText, TrendingUp, Award, Target } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { fetchQuotationReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock,
  formatCurrency,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: {
 *     total_quotations,
 *     total_value, formatted_total_value,
 *     accepted_value, formatted_accepted_value,
 *     acceptance_rate
 *   },
 *   quotations_by_status: [
 *     { status, color, count, value, formatted_value }
 *   ],
 *   quotations_over_time: {
 *     labels, counts, values, formatted_values
 *   }
 * }
 */
const QuotationReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { quotation } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchQuotationReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  const kpis = quotation.data?.kpis || {};
  const byStatusRaw = quotation.data?.quotations_by_status || [];
  const byTimeRaw = quotation.data?.quotations_over_time || {};

  // Bar chart: use the API-provided colors. Filter out zero-count statuses
  // so we don't render empty rows.
  const byStatus = useMemo(
    () =>
      byStatusRaw
        .filter((s) => (Number(s.count) || 0) > 0)
        .map((s) => ({
          name: s.status,
          count: Number(s.count) || 0,
          value: Number(s.value) || 0,
          formatted_value: s.formatted_value || formatCurrency(s.value),
          color: s.color || "#3b82f6",
        })),
    [byStatusRaw],
  );

  // Line chart: reconstruct from parallel arrays
  const byMonth = useMemo(
    () =>
      (byTimeRaw.labels || []).map((month, i) => ({
        month,
        count: byTimeRaw.counts?.[i] ?? 0,
        value: byTimeRaw.values?.[i] ?? 0,
      })),
    [byTimeRaw],
  );

  if (quotation.loading) return <LoadingBlock />;
  if (quotation.error) return <ErrorBlock message={quotation.error} />;
  if (!quotation.data) return <EmptyBlock />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Total Quotations"
          value={kpis.total_quotations ?? 0}
          icon={FileText}
          color="blue"
        />
        <KpiStat
          label="Total Value"
          value={kpis.formatted_total_value || formatCurrency(kpis.total_value)}
          icon={TrendingUp}
          color="green"
        />
        <KpiStat
          label="Accepted Value"
          value={
            kpis.formatted_accepted_value ||
            formatCurrency(kpis.accepted_value)
          }
          icon={Award}
          color="purple"
        />
        <KpiStat
          label="Acceptance Rate"
          value={`${kpis.acceptance_rate ?? 0}%`}
          icon={Target}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quotations by Status">
          {byStatus.length === 0 ? (
            <EmptyBlock message="No status data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value, _name, entry) => [
                    `${value} · ${entry.payload.formatted_value}`,
                    entry.payload.name,
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {byStatus.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Quotations Over Time">
          {byMonth.length === 0 ? (
            <EmptyBlock message="No time-series data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCurrency}
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
          )}
        </Card>
      </div>

      {/* Status breakdown table — shows value per status, which the chart can't */}
      {byStatus.length > 0 && (
        <Card title="Status Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Status", "Count", "Value"].map((h) => (
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
                {byStatus.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.count}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.formatted_value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuotationReport;