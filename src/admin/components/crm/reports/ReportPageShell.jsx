// src/admin/components/crm/reports/ReportPageShell.jsx
import { useState } from "react";
import { Download, Filter, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ExportModal from "../../../../components/common/ExportModal";
import {
  fetchReportFilterOptions,
  clearReportError,
} from "../../../store/slices/crmReportSlice";

const ReportPageShell = ({
  title,
  subtitle,
  filters,
  onFilterChange,
  onRefresh,
  onExport,          // (format) => Promise — called by the modal
  refreshing = false,
  exporting = false,
  children,
}) => {
  const dispatch = useDispatch();
  const { filterOptions } = useSelector((s) => s.crmReports);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const set = (k, v) => onFilterChange?.({ [k]: v });

  const activeFilterCount = Object.entries(filters || {}).filter(
    ([k, v]) =>
      v !== "" &&
      v !== null &&
      v !== undefined &&
      !(k === "date_range" && v === "month"),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Single Export button opens the ExportModal */}
          <button
            onClick={() => setExportOpen(true)}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
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
                value={filters.date_range || "month"}
                onChange={(e) => set("date_range", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                {filterOptions.date_ranges?.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FilterField>

            {filters.date_range === "custom" && (
              <>
                <FilterField label="From">
                  <input
                    type="date"
                    value={filters.from_date || ""}
                    onChange={(e) => set("from_date", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </FilterField>
                <FilterField label="To">
                  <input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) => set("to_date", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </FilterField>
              </>
            )}

            <FilterField label="Salesperson">
              <select
                value={filters.salesperson_id || ""}
                onChange={(e) => set("salesperson_id", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">All Salespersons</option>
                {filterOptions.salespersons?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Team">
              <select
                value={filters.team_id || ""}
                onChange={(e) => set("team_id", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">All Teams</option>
                {filterOptions.teams?.map((t) => (
                  <option key={t.id ?? t.value} value={t.id ?? t.value}>
                    {t.name ?? t.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Customer">
              <select
                value={filters.customer_id || ""}
                onChange={(e) => set("customer_id", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">All Customers</option>
                {filterOptions.customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Lead Source">
              <select
                value={filters.lead_source || ""}
                onChange={(e) => set("lead_source", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">All Sources</option>
                {filterOptions.lead_sources?.map((s) => (
                  <option key={s.value ?? s} value={s.value ?? s}>
                    {s.label ?? s}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Stage">
              <select
                value={filters.stage || ""}
                onChange={(e) => set("stage", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">All Stages</option>
                {filterOptions.stages?.map((s) => (
                  <option key={s.value ?? s} value={s.value ?? s}>
                    {s.label ?? s}
                  </option>
                ))}
              </select>
            </FilterField>
          </div>
        )}
      </div>

      {children}

      {/* Export Modal — the single entry point for all downloads */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={onExport}
        title={`Export ${title}`}
        subtitle="Choose a format and download the current report"
        totalRecords={1}                       // always allow export when a report is loaded
        formats={["csv", "xlsx", "pdf"]}
        defaultFormat="xlsx"
      />
    </div>
  );
};

const FilterField = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </label>
    {children}
  </div>
);

export default ReportPageShell;