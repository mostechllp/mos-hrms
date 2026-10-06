// src/admin/pages/CRM/Leads.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Pencil,
  Trash2,
  UserCog,
  UserCheck,
  Briefcase,
  CalendarClock,
  X,
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ConvertLeadModal from "../../components/crm/ConvertLeadModal";
import ExportModal from "../../../components/common/ExportModal";
import {
  fetchLeads,
  deleteLeadApi,
  convertLeadApi,
  fetchLeadStats,
  fetchLeadFormOptions,
  setCurrentPage,
  setFilters,
  resetFilters,
  fetchPendingFollowUps,
  exportLeadsPdf,
  exportLeadsExcel,
} from "../../store/slices/leadSlice";

// ---------- helpers ----------
// ---------- helpers ----------
const formatDate = (d) => {
  if (!d || d === "—") return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadge = (status) => {
  const map = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Contacted:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Working: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Qualified:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Unqualified:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    Converted:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] || map.New;
};

const priorityBadge = (priority) => {
  const map = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medium:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return (
    map[priority] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
  );
};

// ── getters ──
const getLeadName = (l) => l?.lead_name || "—";
const getLeadCompany = (l) => l?.company_name || "—";
const getLeadType = (l) => l?.lead_type || "—";
const getLeadStatus = (l) => l?.lead_status || "New";
const getLeadSource = (l) => l?.lead_source || "—";
const getLeadPriority = (l) => l?.priority || "—";
const getLeadIndustry = (l) => l?.industry || "—";
const getLeadDesignation = (l) => l?.designation || "—";
const getLeadEmail = (l) => l?.email || "—";
const getLeadPhone = (l) => l?.primary_phone || "—";
const getLeadAltPhone = (l) => l?.alternate_phone || "—";

const getLeadAssigned = (l) => {
  const sp = l?.assigned_salesperson;
  if (sp) {
    const full = `${sp.first_name || ""} ${sp.last_name || ""}`.trim();
    if (full) return full;
  }
  return l?.assigned_salesperson_name || "—";
};

const getLeadSalesTeam = (l) => l?.sales_team || "—";

const getLeadProducts = (l) =>
  Array.isArray(l?.interested_products) && l.interested_products.length > 0
    ? l.interested_products
    : [];

const getLeadExpectedValue = (l) => {
  if (l?.expected_value === null || l?.expected_value === undefined) return "—";
  const n = Number(l.expected_value);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getLeadExpectedClosing = (l) => l?.expected_closing_date || "—";

const getLeadNextFollowUp = (l) => l?.next_follow_up_at || "—";
const getLeadFollowUpType = (l) => l?.follow_up_type || "—";
const getLeadCreatedAt = (l) => l?.created_at || "";
const priorityDot = (priority) => {
  switch (priority) {
    case "Low":
      return "bg-green-500";
    case "Medium":
      return "bg-amber-500";
    case "High":
      return "bg-red-500";
    case "Urgent":
      return "bg-rose-500";
    default:
      return "bg-gray-300 dark:bg-gray-600";
  }
};

// ---------- component ----------
const Leads = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    leads = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    stats,
    submitting,
    convertingId,
    options,
    exporting,
  } = useSelector((state) => state.leads);

  const { pendingFollowUpsTotal } = useSelector((s) => s.leads);

  useEffect(() => {
    dispatch(fetchPendingFollowUps({ perPage: 15 }));
  }, [dispatch]);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [convertOpen, setConvertOpen] = useState(false);
  const [pendingConvert, setPendingConvert] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);

  // ── initial load ──
  useEffect(() => {
    dispatch(fetchLeadFormOptions());
    dispatch(fetchLeadStats());
  }, [dispatch]);

  // ── fetch list on filter/page change ──
  useEffect(() => {
    dispatch(
      fetchLeads({
        page: currentPage,
        perPage,
        search: filters.search,
        lead_status: filters.lead_status,
        priority: filters.priority,
        lead_source: filters.lead_source,
        lead_type: filters.lead_type,
        assigned_salesperson_id: filters.assigned_salesperson_id,
        sales_team: filters.sales_team,
        industry: filters.industry,
        date_from: filters.date_from,
        date_to: filters.date_to,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      }),
    );
  }, [dispatch, currentPage, perPage, filters]);

  // ── debounced search ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const activeFilterCount = useMemo(
    () =>
      [
        "lead_status",
        "priority",
        "lead_source",
        "lead_type",
        "assigned_salesperson_id",
        "sales_team",
        "industry",
        "date_from",
        "date_to",
      ].filter((k) => filters[k]).length,
    [filters],
  );

  // ── handlers ──
  const handleDeleteClick = (l) => {
    setPendingDelete(l);
    setConfirmOpen(true);
  };

  const handleExport = async (format) => {
  // Build the same filter set the list uses
  const exportFilters = {
    search: filters.search,
    lead_status: filters.lead_status,
    priority: filters.priority,
    lead_source: filters.lead_source,
    lead_type: filters.lead_type,
    assigned_salesperson_id: filters.assigned_salesperson_id,
    sales_team: filters.sales_team,
    industry: filters.industry,
    date_from: filters.date_from,
    date_to: filters.date_to,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
  };

  if (format === "pdf") {
    await dispatch(exportLeadsPdf({ filters: exportFilters })).unwrap();
  } else {
    const serverFormat = format === "csv" ? "csv" : "xlsx";
    await dispatch(
      exportLeadsExcel({ format: serverFormat, filters: exportFilters }),
    ).unwrap();
  }

  showToast("Export downloaded successfully", "success");
};

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteLeadApi(pendingDelete.id)).unwrap();
      showToast(`Lead ${getLeadName(pendingDelete)} deleted`, "success");
      setConfirmOpen(false);
      setPendingDelete(null);
      dispatch(fetchLeadStats());
    } catch (err) {
      showToast(err || "Failed to delete lead", "error");
    }
  };

  const handleConvertClick = (l) => {
    setPendingConvert(l);
    setConvertOpen(true);
  };

  const handleConvertSubmit = async ({ converted_value, conversion_note }) => {
    if (!pendingConvert) return;
    try {
      await dispatch(
        convertLeadApi({
          id: pendingConvert.id,
          converted_value,
          conversion_note,
        }),
      ).unwrap();
      showToast(`${getLeadName(pendingConvert)} converted`, "success");
      setConvertOpen(false);
      setPendingConvert(null);
      dispatch(fetchLeadStats());
    } catch (err) {
      showToast(err || "Failed to convert lead", "error");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const updateFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your sales leads and track their progress
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* <button
            onClick={() => navigate("/admin/crm/leads/import")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Upload size={15} /> Import
          </button> */}
          <button
  onClick={() => setExportOpen(true)}
  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
>
  <Download size={15} /> Export
</button>
          <button
            onClick={() => navigate("/admin/crm/leads/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Total Leads"
          value={stats.total_leads}
          icon={Users}
          color="blue"
        />
        <SummaryCard
          label="New"
          value={stats.new_leads}
          icon={UserPlus}
          color="indigo"
        />
        <SummaryCard
          label="Qualified"
          value={stats.qualified_leads}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Unqualified"
          value={stats.leads_by_status?.Unqualified || 0}
          icon={XCircle}
          color="gray"
        />
        <SummaryCard
          label="Converted"
          value={stats.converted_leads}
          icon={UserCheck}
          color="purple"
        />
        <SummaryCard
          label="Follow-ups Due"
          value={pendingFollowUpsTotal}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, company, email, phone, or ID..."
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
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterSelect
              label="Status"
              value={filters.lead_status}
              onChange={(v) => updateFilter("lead_status", v)}
              options={options.lead_statuses || []}
            />
            <FilterSelect
              label="Source"
              value={filters.lead_source}
              onChange={(v) => updateFilter("lead_source", v)}
              options={options.lead_sources || []}
            />
            <FilterSelect
              label="Type"
              value={filters.lead_type}
              onChange={(v) => updateFilter("lead_type", v)}
              options={options.lead_types || []}
            />
            <FilterSelect
              label="Priority"
              value={filters.priority}
              onChange={(v) => updateFilter("priority", v)}
              options={options.priorities || []}
            />
            <FilterSelect
              label="Industry"
              value={filters.industry}
              onChange={(v) => updateFilter("industry", v)}
              options={options.industries || []}
            />
            <FilterSelect
              label="Sales Team"
              value={filters.sales_team}
              onChange={(v) => updateFilter("sales_team", v)}
              options={options.sales_teams || []}
            />
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter("date_from", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter("date_to", e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
              >
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-soft">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[90px]" /> {/* LEAD ID */}
            <col className="w-[22%]" /> {/* NAME + COMPANY */}
            <col className="w-[18%]" /> {/* CONTACT */}
            <col className="w-[10%]" /> {/* SOURCE */}
            <col className="w-[10%]" /> {/* STATUS */}
            <col className="w-[16%]" /> {/* ASSIGNED TO + TEAM */}
            <col className="w-[10%]" /> {/* CREATED */}
            <col className="w-[120px]" /> {/* ACTIONS */}
          </colgroup>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              {[
                "LEAD ID",
                "NAME",
                "CONTACT",
                "SOURCE",
                "STATUS",
                "ASSIGNED TO",
                "CREATED",
                "ACTIONS",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading leads...
                </td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => navigate(`/admin/crm/leads/${l.id}`)}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  {/* LEAD ID */}
                  <td className="px-2 py-2 text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                    {l.lead_id || l.id}
                  </td>

                  {/* NAME + COMPANY */}
                  <td className="px-2 py-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot(
                          getLeadPriority(l),
                        )}`}
                        title={`Priority: ${getLeadPriority(l)}`}
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {getLeadName(l)}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {getLeadCompany(l)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CONTACT */}
                  <td className="px-2 py-2 min-w-0">
                    <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate">
                      {getLeadPhone(l)}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {getLeadEmail(l)}
                    </div>
                  </td>

                  {/* SOURCE */}
                  <td className="px-2 py-2 text-[11px] text-gray-600 dark:text-gray-400 truncate">
                    {getLeadSource(l)}
                  </td>

                  {/* STATUS */}
                  <td className="px-2 py-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
                        getLeadStatus(l),
                      )}`}
                    >
                      {getLeadStatus(l)}
                    </span>
                  </td>

                  {/* ASSIGNED TO + TEAM */}
                  <td className="px-2 py-2 min-w-0">
                    <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate">
                      {getLeadAssigned(l)}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {getLeadSalesTeam(l)}
                    </div>
                  </td>

                  {/* CREATED */}
                  <td className="px-2 py-2 text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(getLeadCreatedAt(l))}
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="px-2 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-0.5">
                      <IconBtn
                        icon={Eye}
                        color="text-blue-500"
                        title="View"
                        onClick={() => navigate(`/admin/crm/leads/${l.id}`)}
                      />
                      <IconBtn
                        icon={Pencil}
                        color="text-amber-500"
                        title="Edit"
                        onClick={() =>
                          navigate(`/admin/crm/leads/${l.id}/edit`)
                        }
                      />
                      <IconBtn
                        icon={UserCheck}
                        color="text-green-500"
                        title="Convert"
                        onClick={() => handleConvertClick(l)}
                        disabled={
                          getLeadStatus(l) === "Converted" ||
                          convertingId === l.id
                        }
                      />
                      <IconBtn
                        icon={Trash2}
                        color="text-red-500"
                        title="Delete"
                        onClick={() => handleDeleteClick(l)}
                        disabled={submitting}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${getLeadName(pendingDelete)}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <ConvertLeadModal
        isOpen={convertOpen}
        onClose={() => {
          setConvertOpen(false);
          setPendingConvert(null);
        }}
        lead={pendingConvert}
        onSubmit={handleConvertSubmit}
      />
      <ExportModal
  isOpen={exportOpen}
  onClose={() => setExportOpen(false)}
  onExport={handleExport}
  title="Export Leads"
  subtitle="Download the current filtered list"
  totalRecords={totalCount}
  formats={["csv", "xlsx", "pdf"]}
  defaultFormat="xlsx"
/>
    </div>
  );
};

// ---- building blocks ----
const SummaryCard = ({ label, value, icon: Icon, color }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {value ?? 0}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

const IconBtn = ({ icon: Icon, color, title, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color} disabled:opacity-30 disabled:cursor-not-allowed`}
  >
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
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default Leads;
