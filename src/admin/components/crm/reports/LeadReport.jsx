// src/admin/components/crm/reports/LeadReport.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users, CheckCircle2, Target, TrendingUp, Award,
} from "lucide-react";
import { fetchLeadReport } from "../../../store/slices/crmReportSlice";
import {
  Card, KpiStat, LoadingBlock, ErrorBlock, EmptyBlock, formatCurrency,
} from "./ReportPrimitives";

/**
 * Actual API shape:
 * {
 *   kpis: {
 *     total_leads, converted_leads, qualified_leads,
 *     conversion_rate, total_expected_value, formatted_expected_value
 *   },
 *   leads_by_source: [{ source, count, converted, conversion_rate, value, formatted_value }],
 *   leads_by_status: [{ status, count }]
 * }
 */
const LeadReport = ({ filters, refreshing, onRefreshDone }) => {
  const dispatch = useDispatch();
  const { lead } = useSelector((s) => s.crmReports);

  useEffect(() => {
    dispatch(fetchLeadReport(filters)).finally(() => onRefreshDone?.());
  }, [dispatch, filters, onRefreshDone]);

  if (lead.loading) return <LoadingBlock />;
  if (lead.error) return <ErrorBlock message={lead.error} />;
  if (!lead.data) return <EmptyBlock />;

  const kpis = lead.data.kpis || {};
  const bySource = lead.data.leads_by_source || [];
  const byStatus = lead.data.leads_by_status || [];

  const topSource =
    [...bySource].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      ?.source || "—";

  const totalStatusCount = byStatus.reduce(
    (sum, s) => sum + (Number(s.count) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Total Leads"
          value={kpis.total_leads ?? 0}
          icon={Users}
          color="blue"
        />
        <KpiStat
          label="Converted"
          value={kpis.converted_leads ?? 0}
          icon={CheckCircle2}
          color="green"
        />
        <KpiStat
          label="Qualified"
          value={kpis.qualified_leads ?? 0}
          icon={Award}
          color="amber"
        />
        <KpiStat
          label="Conversion Rate"
          value={`${kpis.conversion_rate ?? 0}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStat
          label="Top Source"
          value={topSource}
          icon={TrendingUp}
          color="indigo"
        />
        <KpiStat
          label="Pipeline Value"
          value={
            kpis.formatted_expected_value ||
            formatCurrency(kpis.total_expected_value)
          }
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Leads by Source table */}
      <Card title="Leads by Source">
        {bySource.length === 0 ? (
          <EmptyBlock message="No source data available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    "Source",
                    "Leads",
                    "Converted",
                    "Conversion Rate",
                    "Expected Value",
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
                {bySource.map((s) => (
                  <tr
                    key={s.source}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {s.source || "Unknown"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.count ?? 0}
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {s.converted ?? 0}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.conversion_rate ?? 0}%
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                      {s.formatted_value || formatCurrency(s.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Leads by Status table */}
      <Card title="Leads by Status">
        {byStatus.length === 0 ? (
          <EmptyBlock message="No status data available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Status", "Leads", "Share"].map((h) => (
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
                {byStatus.map((s) => {
                  const share =
                    totalStatusCount > 0
                      ? ((Number(s.count) || 0) / totalStatusCount) * 100
                      : 0;
                  return (
                    <tr
                      key={s.status}
                      className="border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {s.status || "Unknown"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {s.count ?? 0}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span>{share.toFixed(0)}%</span>
                        </div>
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
  );
};

export default LeadReport;