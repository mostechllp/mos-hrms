// src/admin/components/crm/reports/ReportPageShell.jsx
import { useState } from "react";
import { Download, Filter, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ExportModal from "../../../../components/common/ExportModal";
import {
  fetchReportFilterOptions,
  clearReportError,
} from "../../../store/slices/crmReportSlice";

const getOptionValue = (opt) => {
  if (opt === null || opt === undefined) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  return String(
    opt.id ??
      opt.value ??
      opt.team_id ??
      opt.salesperson_id ??
      opt.customer_id ??
      opt.code ??
      opt.key ??
      opt.name ??
      "",
  );
};

const getOptionLabel = (opt) => {
  if (opt === null || opt === undefined) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  const fullName = opt.first_name
    ? `${opt.first_name} ${opt.last_name || ""}`.trim()
    : null;
  return String(
    opt.label ??
      opt.name ??
      opt.team_name ??
      opt.company_name ??
      opt.customer_name ??
      opt.title ??
      fullName ??
      opt.value ??
      opt.id ??
      "",
  );
};

const sanitizeList = (rawList, defaultLabel = "") => {
  if (!Array.isArray(rawList)) return [];
  const normalizedDefault = defaultLabel.toLowerCase().trim();
  return rawList.filter((item) => {
    const val = getOptionValue(item).trim();
    const lbl = getOptionLabel(item).trim();
    if (!val && !lbl) return false;
    if (
      normalizedDefault &&
      (lbl.toLowerCase() === normalizedDefault ||
        val.toLowerCase() === normalizedDefault ||
        lbl.toLowerCase() === "all" ||
        val.toLowerCase() === "all")
    ) {
      return false;
    }
    return true;
  });
};

const SELECT_CLASS =
  "w-full px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500";

const OPTION_CLASS = "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";

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

  const teamsRaw =
    filterOptions?.teams?.length
      ? filterOptions.teams
      : filterOptions?.sales_teams || filterOptions?.salesTeams || [];

  const dateRangesList = sanitizeList(filterOptions?.date_ranges);
  const salespersonsList = sanitizeList(filterOptions?.salespersons, "All Salespersons");
  const teamsList = sanitizeList(teamsRaw, "All Teams");
  const customersList = sanitizeList(filterOptions?.customers, "All Customers");
  const leadSourcesList = sanitizeList(filterOptions?.lead_sources, "All Sources");
  const stagesList = sanitizeList(filterOptions?.stages, "All Stages");

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
                className={SELECT_CLASS}
              >
                {dateRangesList.map((d) => (
                  <option
                    key={getOptionValue(d)}
                    value={getOptionValue(d)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(d)}
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
                    className={SELECT_CLASS}
                  />
                </FilterField>
                <FilterField label="To">
                  <input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) => set("to_date", e.target.value)}
                    className={SELECT_CLASS}
                  />
                </FilterField>
              </>
            )}

            <FilterField label="Salesperson">
              <select
                value={filters.salesperson_id || ""}
                onChange={(e) => set("salesperson_id", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className={OPTION_CLASS}>
                  All Salespersons
                </option>
                {salespersonsList.map((s) => (
                  <option
                    key={getOptionValue(s)}
                    value={getOptionValue(s)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(s)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Team">
              <select
                value={filters.team_id || ""}
                onChange={(e) => set("team_id", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className={OPTION_CLASS}>
                  All Teams
                </option>
                {teamsList.map((t) => (
                  <option
                    key={getOptionValue(t)}
                    value={getOptionValue(t)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(t)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Customer">
              <select
                value={filters.customer_id || ""}
                onChange={(e) => set("customer_id", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className={OPTION_CLASS}>
                  All Customers
                </option>
                {customersList.map((c) => (
                  <option
                    key={getOptionValue(c)}
                    value={getOptionValue(c)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(c)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Lead Source">
              <select
                value={filters.lead_source || ""}
                onChange={(e) => set("lead_source", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className={OPTION_CLASS}>
                  All Sources
                </option>
                {leadSourcesList.map((s) => (
                  <option
                    key={getOptionValue(s)}
                    value={getOptionValue(s)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(s)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Stage">
              <select
                value={filters.stage || ""}
                onChange={(e) => set("stage", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className={OPTION_CLASS}>
                  All Stages
                </option>
                {stagesList.map((s) => (
                  <option
                    key={getOptionValue(s)}
                    value={getOptionValue(s)}
                    className={OPTION_CLASS}
                  >
                    {getOptionLabel(s)}
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