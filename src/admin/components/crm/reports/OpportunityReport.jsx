// src/admin/components/crm/reports/OpportunityReport.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { fetchOpportunityReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock, formatCurrency,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: {
 *     total_pipeline_value, formatted_total_pipeline,
 *     open_deals, won_deals, lost_deals
 *   },
 *   pipeline_by_stage: [{ stage, color, count, value, formatted_value }],
 *   pipeline_by_salesperson: [
 *     { salesperson, won_value, open_value, total_value,
 *       formatted_total, deals_count }
 *   ],
 *   pipeline_by_customer: [
 *     { customer, deals_count, value, formatted_value }
 *   ]
 * }
 */
const OpportunityReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { opportunity } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchOpportunityReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  const kpis = opportunity.data?.kpis || {};
  const byStageRaw = opportunity.data?.pipeline_by_stage || [];
  const bySalespersonRaw = opportunity.data?.pipeline_by_salesperson || [];
  const byCustomerRaw = opportunity.data?.pipeline_by_customer || [];

  // Stage chart — keep all stages (even 0) so the axis stays meaningful, but
  // use API-provided colors when available.
  const byStage = useMemo(
    () =>
      byStageRaw.map((s) => ({
        stage: s.stage,
        count: Number(s.count) || 0,
        value: Number(s.value) || 0,
        formatted_value: s.formatted_value || formatCurrency(s.value),
        color: s.color || "#3b82f6",
      })),
    [byStageRaw],
  );

  // Salesperson chart — rename fields to what Recharts expects
  const bySalesperson = useMemo(
    () =>
      bySalespersonRaw.map((s) => ({
        name: s.salesperson || "Unassigned",
        won: Number(s.won_value) || 0,
        open: Number(s.open_value) || 0,
        total: Number(s.total_value) || 0,
        formatted_total: s.formatted_total || formatCurrency(s.total_value),
        deals: Number(s.deals_count) || 0,
      })),
    [bySalespersonRaw],
  );

  // Customer bars — same treatment
  const byCustomer = useMemo(
    () =>
      byCustomerRaw.map((c) => ({
        name: c.customer || "Unknown",
        value: Number(c.value) || 0,
        formatted_value: c.formatted_value || formatCurrency(c.value),
        deals: Number(c.deals_count) || 0,
      })),
    [byCustomerRaw],
  );

  const maxCustomerValue = Math.max(
    ...byCustomer.map((c) => c.value),
    1,
  );

  if (opportunity.loading) return <LoadingBlock />;
  if (opportunity.error) return <ErrorBlock message={opportunity.error} />;
  if (!opportunity.data) return <EmptyBlock />;

  return (
    <div className="space-y-6">
      {/* KPI cards — correct keys */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Total Pipeline"
          value={
            kpis.formatted_total_pipeline ||
            formatCurrency(kpis.total_pipeline_value)
          }
          icon={TrendingUp}
          color="blue"
        />
        <KpiStat
          label="Open Deals"
          value={kpis.open_deals ?? 0}
          icon={Target}
          color="indigo"
        />
        <KpiStat
          label="Won Deals"
          value={kpis.won_deals ?? 0}
          icon={Award}
          color="green"
        />
        <KpiStat
          label="Lost Deals"
          value={kpis.lost_deals ?? 0}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Pipeline by Stage — uses API colors */}
      <Card title="Pipeline Value by Stage">
        {byStage.length === 0 ? (
          <EmptyBlock message="No stage data available yet." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value, _name, entry) => [
                  `${formatCurrency(value)} · ${entry.payload.count} deal${entry.payload.count === 1 ? "" : "s"}`,
                  entry.payload.stage,
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {byStage.map((row, i) => (
                  <Cell key={i} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Salesperson — stacked bars */}
        <Card title="Pipeline by Salesperson">
          {bySalesperson.length === 0 ? (
            <EmptyBlock message="No salesperson data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bySalesperson} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCurrency}
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
                <Bar
                  dataKey="open"
                  stackId="a"
                  fill="#3b82f6"
                  name="Open"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pipeline by Customer — horizontal bars with formatted totals */}
        <Card title="Pipeline by Customer">
          {byCustomer.length === 0 ? (
            <EmptyBlock message="No customer data available yet." />
          ) : (
            <div className="space-y-3 mt-2">
              {byCustomer.map((c) => {
                const pct = (c.value / maxCustomerValue) * 100;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {c.name}
                      </span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {c.formatted_value} · {c.deals} deal{c.deals === 1 ? "" : "s"}
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
          )}
        </Card>
      </div>

      {/* Salesperson breakdown table — surfaces deals count + totals */}
      {bySalesperson.length > 0 && (
        <Card title="Salesperson Pipeline Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Salesperson", "Deals", "Won", "Open", "Total"].map((h) => (
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
                {bySalesperson.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {s.name}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.deals}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(s.won)}
                    </td>
                    <td className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {formatCurrency(s.open)}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                      {s.formatted_total}
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

export default OpportunityReport;