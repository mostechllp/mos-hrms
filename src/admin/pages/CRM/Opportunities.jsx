// src/admin/pages/crm/Opportunities.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, Download, Eye, Pencil, Trash2,
  Briefcase, IndianRupee, CalendarClock, X, List, KanbanSquare,
  Target, CheckCircle2, XCircle,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ExportModal from "../../../components/common/ExportModal";
import {
  fetchOpportunities, fetchOpportunityFormOptions, fetchOpportunityStats,
  fetchOpportunityPipeline, deleteOpportunityApi, exportOpportunities,
  fromOpportunityApi, setCurrentPage, setFilters, resetFilters,
} from "../../store/slices/opportunitySlice";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR" ? "₹" : currency === "USD" ? "$" :
    currency === "AED" ? "AED " : currency === "EUR" ? "€" :
    currency === "GBP" ? "£" : currency === "SGD" ? "S$" : "";
  return `${symbol}${Number(n || 0).toLocaleString()}`;
};

// API-driven badge renderer (falls back to neutral colors if no badge object)
const Badge = ({ badge, fallbackLabel, fallbackClass }) => {
  if (badge) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
        style={{
          backgroundColor: badge.bg,
          color: badge.color,
        }}
      >
        {badge.name}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${fallbackClass}`}
    >
      {fallbackLabel}
    </span>
  );
};

const stageColorHex = (stage) => {
  // fallback when API doesn't provide stage_badge (pipeline view uses this)
  const map = {
    New: "#3b82f6", Qualified: "#6366f1", "Proposal Sent": "#8b5cf6",
    Negotiation: "#f59e0b", Won: "#10b981", Lost: "#ef4444",
  };
  return map[stage] || "#6b7280";
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const Opportunities = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    opportunities = [], loading, totalCount, currentPage, perPage,
    filters, options, stats, pipeline = [], pipelineLoading,
    submitting,
  } = useSelector((s) => s.opportunities);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("table");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => { dispatch(fetchOpportunityFormOptions()); }, [dispatch]);
  useEffect(() => { dispatch(fetchOpportunityStats()); }, [dispatch]);

  // list fetch
  useEffect(() => {
    dispatch(fetchOpportunities({
      page: currentPage, perPage,
      search: filters.search, stage: filters.stage,
      customer_id: filters.customer_id, assigned_to: filters.assigned_to,
      product: filters.product, priority: filters.priority,
      sort_by: filters.sort_by, sort_order: filters.sort_order,
    }));
  }, [dispatch, currentPage, perPage, filters]);

  // pipeline fetch (only when in pipeline view)
  useEffect(() => {
    if (view !== "pipeline") return;
    dispatch(fetchOpportunityPipeline({
      search: filters.search, stage: filters.stage,
      customer_id: filters.customer_id, assigned_to: filters.assigned_to,
      product: filters.product, priority: filters.priority,
    }));
  }, [dispatch, view, filters]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) dispatch(setFilters({ search: searchInput }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line

  const refetchList = () => dispatch(fetchOpportunities({
    page: currentPage, perPage,
    search: filters.search, stage: filters.stage,
    customer_id: filters.customer_id, assigned_to: filters.assigned_to,
    product: filters.product, priority: filters.priority,
    sort_by: filters.sort_by, sort_order: filters.sort_order,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const activeFilterCount = useMemo(
    () => ["stage", "customer_id", "assigned_to", "product", "priority"]
      .filter((k) => filters[k]).length,
    [filters],
  );

  const normalized = useMemo(
    () => (opportunities || []).map((o) => fromOpportunityApi(o)),
    [opportunities],
  );

  // summary from stats API
  const summary = useMemo(() => {
    if (stats) {
      return {
        total: stats.total ?? totalCount,
        open: stats.open ?? 0,
        pipelineValue: Number(stats.pipeline_value ?? stats.total_value ?? 0),
        won: stats.won ?? 0,
        lost: stats.lost ?? 0,
        closingThisMonth: stats.closing_this_month ?? 0,
      };
    }
    return {
      total: totalCount,
      open: 0,
      pipelineValue: 0,
      won: 0,
      lost: 0,
      closingThisMonth: 0,
    };
  }, [stats, totalCount]);

  // delete
  const handleDeleteClick = (o) => { setPendingDelete(o); setConfirmOpen(true); };
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteOpportunityApi(pendingDelete.id)).unwrap();
      showToast(`Opportunity "${pendingDelete.name}" deleted`, "success");
      setConfirmOpen(false); setPendingDelete(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to delete opportunity", "error");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const updateFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  // ------------------------------------------------------------
  // Dropdown options — use ACTUAL form-options keys
  // ------------------------------------------------------------
  const customerOptions = useMemo(
    () =>
      (options.customers || []).map((c) =>
        typeof c === "string"
          ? { value: c, label: c }
          : { value: String(c.id), label: c.company_name || c.name || `#${c.id}` },
      ),
    [options.customers],
  );

  const assignedOptions = useMemo(
    () =>
      (options.salespersons || options.sales_people || []).map((s) =>
        typeof s === "string"
          ? { value: s, label: s }
          : { value: String(s.id), label: s.name || s.full_name || `#${s.id}` },
      ),
    [options.salespersons, options.sales_people],
  );

  const productOptions = useMemo(
    () =>
      (options.products || options.products_services || []).map((p) =>
        typeof p === "string"
          ? { value: p, label: p }
          : { value: String(p.id ?? p.name), label: p.name || p.product_name || String(p) },
      ),
    [options.products, options.products_services],
  );

  const stageOptions = useMemo(
    () =>
      (options.stages || []).map((s) =>
        typeof s === "string" ? s : s.name || s.stage || s.value,
      ),
    [options.stages],
  );

  const priorityOptions = useMemo(
    () => options.priorities || ["Low", "Medium", "High"],
    [options.priorities],
  );

  const handleExport = async (format) => {
    try {
      await dispatch(exportOpportunities({
        format,
        filters: {
          search: filters.search, stage: filters.stage,
          customer_id: filters.customer_id, assigned_to: filters.assigned_to,
          product: filters.product, priority: filters.priority,
        },
      })).unwrap();
      showToast("Export downloaded successfully", "success");
    } catch (err) {
      showToast(err || "Failed to export opportunities", "error");
    }
  };

  // ------------------------------------------------------------
  // Pipeline — trust the API's shape
  // ------------------------------------------------------------
  const pipelineGroups = useMemo(() => {
    if (!Array.isArray(pipeline)) return [];
    return pipeline.map((col) => {
      const items = col.opportunities || col.items || [];
      return {
        key: col.stage || col.key || col.name,
        label: col.stage || col.label || col.name || col.key,
        items: items.map((o) => fromOpportunityApi(o)),
        total: Number(col.total_value ?? col.total ?? 0),
        badge: col.badge || col.stage_badge || null,
      };
    });
  }, [pipeline]);

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Opportunities
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setExportOpen(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/crm/opportunities/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total" value={summary.total} icon={Briefcase} color="blue" />
        <SummaryCard label="Open" value={summary.open} icon={Target} color="indigo" />
        <SummaryCard label="Pipeline Value" value={formatCurrency(summary.pipelineValue)} icon={IndianRupee} color="purple" small />
        <SummaryCard label="Won" value={summary.won} icon={CheckCircle2} color="green" />
        <SummaryCard label="Lost" value={summary.lost} icon={XCircle} color="red" />
        <SummaryCard label="Closing This Month" value={summary.closingThisMonth} icon={CalendarClock} color="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, customer, ID, or product..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
            activeFilterCount > 0
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Filter size={15} /> Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "table" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            title="Table view"
          ><List size={15} /></button>
          <button
            onClick={() => setView("pipeline")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "pipeline" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            title="Pipeline view"
          ><KanbanSquare size={15} /></button>
        </div>
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <FilterSelect label="Stage" value={filters.stage} onChange={(v) => updateFilter("stage", v)} options={stageOptions} />
            <FilterSelect label="Customer" value={filters.customer_id} onChange={(v) => updateFilter("customer_id", v)} options={customerOptions} />
            <FilterSelect label="Assigned" value={filters.assigned_to} onChange={(v) => updateFilter("assigned_to", v)} options={assignedOptions} />
            <FilterSelect label="Product" value={filters.product} onChange={(v) => updateFilter("product", v)} options={productOptions} />
            <FilterSelect label="Priority" value={filters.priority} onChange={(v) => updateFilter("priority", v)} options={priorityOptions} />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-3">
              <button onClick={clearFilters} className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[1100px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {["OPP ID","OPPORTUNITY","CUSTOMER","PRODUCT","VALUE","STAGE","PROB.","EXPECTED CLOSE","ASSIGNED","PRIORITY","ACTIONS"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Loading opportunities...</td></tr>
                  ) : normalized.length > 0 ? (
                    normalized.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)}
                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {o.opportunityId}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {o.name}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {o.customerName}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {o.productDisplay || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {o.formattedValue || formatCurrency(o.estimatedValue, o.currency)}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            badge={o.stageBadge}
                            fallbackLabel={o.stage}
                            fallbackClass="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {o.probability}%
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {o.formattedExpectedClose || formatDate(o.expectedClose)}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {o.assignedTo}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            badge={o.priorityBadge}
                            fallbackLabel={o.priority}
                            fallbackClass="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <IconBtn icon={Eye} color="text-blue-500" title="View" onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)} />
                            <IconBtn icon={Pencil} color="text-amber-500" title="Edit" onClick={() => navigate(`/admin/crm/opportunities/${o.id}/edit`)} />
                            <IconBtn icon={Trash2} color="text-red-500" title="Delete" onClick={() => handleDeleteClick(o)} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No opportunities found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => dispatch(setCurrentPage(p))}
              totalItems={totalCount}
              itemsPerPage={perPage}
            />
          )}
        </>
      )}

      {/* PIPELINE VIEW */}
      {view === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          {pipelineLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading pipeline…</div>
          ) : pipelineGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No pipeline data available
            </div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {pipelineGroups.map((col) => (
                <div key={col.key} className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              col.badge?.color || stageColorHex(col.key),
                          }}
                        />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {col.label}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                        {col.items.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {formatCurrency(col.total)}
                    </p>
                  </div>
                  <div className="p-3 space-y-2 flex-1 max-h-[600px] overflow-y-auto">
                    {col.items.length > 0 ? col.items.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                            {o.customerName}
                          </p>
                          <Badge
                            badge={o.priorityBadge}
                            fallbackLabel={o.priority}
                            fallbackClass="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 truncate">
                          {o.productDisplay || "—"} · {o.formattedValue || formatCurrency(o.estimatedValue, o.currency)}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                          <span>Assigned: {o.assignedTo}</span>
                          <span>{o.probability}%</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-[11px] text-gray-400 dark:text-gray-500">No opportunities</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        title="Export Opportunities"
        subtitle="Download the current filtered list"
        totalRecords={totalCount}
        formats={["csv", "xlsx", "pdf"]}
        defaultFormat="xlsx"
      />
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------
const SummaryCard = ({ label, value, icon: Icon, color, small }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${map[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}>
        {value}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
};

const IconBtn = ({ icon: Icon, color, title, onClick }) => (
  <button onClick={onClick} title={title} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color}`}>
    <Icon size={14} />
  </button>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">All</option>
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>{o}</option>
        ) : (
          <option key={o.value} value={o.value}>{o.label}</option>
        ),
      )}
    </select>
  </div>
);

export default Opportunities;