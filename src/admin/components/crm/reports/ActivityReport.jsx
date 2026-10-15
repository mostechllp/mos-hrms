// src/admin/components/crm/reports/ActivityReport.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Activity, CheckCircle2, AlertCircle, Target } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { fetchActivityReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: { total_activities, completed, overdue, completion_rate },
 *   status_breakdown: {
 *     completed, completed_pct,
 *     upcoming, upcoming_pct,
 *     overdue,   overdue_pct,
 *     cancelled, cancelled_pct
 *   },
 *   activities_by_type: [{ type, count, completed, pending }]
 * }
 */
const ActivityReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { activity } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchActivityReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  const kpis = activity.data?.kpis || {};
  const breakdown = activity.data?.status_breakdown || {};
  const byType = activity.data?.activities_by_type || [];

  // Convert the breakdown object to a Pie-friendly array
  const statusChart = useMemo(() => {
    const defs = [
      {
        key: "completed",
        label: "Completed",
        color: "#10b981",
      },
      {
        key: "upcoming",
        label: "Upcoming",
        color: "#3b82f6",
      },
      {
        key: "overdue",
        label: "Overdue",
        color: "#ef4444",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#6b7280",
      },
    ];
    return defs
      .map((d) => ({
        name: d.label,
        value: Number(breakdown[d.key]) || 0,
        pct: Number(breakdown[`${d.key}_pct`]) || 0,
        color: d.color,
      }))
      .filter((row) => row.value > 0);
  }, [breakdown]);

  // Only show types with count > 0 (API returns all types, including zeros)
  const typeChart = useMemo(
    () =>
      byType
        .filter((t) => (Number(t.count) || 0) > 0)
        .map((t) => ({
          type: t.type,
          count: Number(t.count) || 0,
          completed: Number(t.completed) || 0,
          pending: Number(t.pending) || 0,
        })),
    [byType],
  );

  if (activity.loading) return <LoadingBlock />;
  if (activity.error) return <ErrorBlock message={activity.error} />;
  if (!activity.data) return <EmptyBlock />;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Total Activities"
          value={kpis.total_activities ?? 0}
          icon={Activity}
          color="blue"
        />
        <KpiStat
          label="Completed"
          value={kpis.completed ?? 0}
          icon={CheckCircle2}
          color="green"
        />
        <KpiStat
          label="Overdue"
          value={kpis.overdue ?? 0}
          icon={AlertCircle}
          color="red"
        />
        <KpiStat
          label="Completion Rate"
          value={`${kpis.completion_rate ?? 0}%`}
          icon={Target}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Activity Status Breakdown">
          {statusChart.length === 0 ? (
            <EmptyBlock message="No status data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={2}
                  label={({ name, payload }) =>
                    `${name} ${payload?.pct ?? 0}%`
                  }
                  labelLine={false}
                >
                  {statusChart.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} activities`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Activities by Type">
          {typeChart.length === 0 ? (
            <EmptyBlock message="No activity data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.3}
                />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#10b981"
                  name="Completed"
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#f59e0b"
                  name="Pending"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Type breakdown table — surfaces pending counts */}
      {typeChart.length > 0 && (
        <Card title="Type Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Type", "Total", "Completed", "Pending", "Completion %"].map(
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
                {typeChart.map((t) => {
                  const rate =
                    t.count > 0
                      ? Math.round((t.completed / t.count) * 100)
                      : 0;
                  return (
                    <tr
                      key={t.type}
                      className="border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {t.type}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {t.count}
                      </td>
                      <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                        {t.completed}
                      </td>
                      <td className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        {t.pending}
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
      )}
    </div>
  );
};

export default ActivityReport;