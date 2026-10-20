// src/admin/pages/CRM/Customers.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, Download, Eye, Pencil, Trash2,
  UserPlus, Briefcase, CalendarClock, X, Users,
  UserCheck, UserX, UserPlus2, Briefcase as BriefcaseIcon,
  Clock, LayoutGrid, List,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ExportModal from "../../../components/common/ExportModal";
import {
  fetchCustomers,
  fetchCustomerStats,
  fetchCustomerFormOptions,
  deleteCustomerApi,
  exportCustomersExcel,
  exportCustomersPdf,
  setCurrentPage,
  setFilters,
  resetFilters,
} from "../../store/slices/customerSlice";

// ---------- helpers ----------
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    Blacklisted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] || map.Active;
};

const getCompany = (c) => c?.company_name || "—";
const getContactName = (c) => c?.contact_person_name || "—";
const getContactEmail = (c) => c?.contact_email || "—";
const getContactPhone = (c) => c?.contact_phone || "—";
const getIndustry = (c) => c?.industry || "—";
const getStatus = (c) => c?.customer_status || "Active";
const getCustomerSince = (c) => c?.customer_since || "";
const getCustomerId = (c) => c?.customer_id || c?.id || "—";
const getCity = (c) => c?.city || "—";
const getType = (c) => c?.customer_type || "Company";

const getAccountManager = (c) => {
  const am = c?.account_manager;
  if (am) {
    const full = `${am.first_name || ""} ${am.last_name || ""}`.trim();
    if (full) return full;
    if (am.name) return am.name;
  }
  return c?.account_manager_name || "—";
};

const Customers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    customers = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    stats,
    submitting,
    options,
    exporting,
  } = useSelector((state) => state.customers);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("table");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);

  // ── initial load ──
  useEffect(() => {
    dispatch(fetchCustomerFormOptions());
    dispatch(fetchCustomerStats());
  }, [dispatch]);

  // ── list fetch ──
  useEffect(() => {
    dispatch(
      fetchCustomers({
        page: currentPage,
        perPage,
        search: filters.search,
        customer_status: filters.customer_status,
        customer_type: filters.customer_type,
        customer_category: filters.customer_category,
        industry: filters.industry,
        account_manager_id: filters.account_manager_id,
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
        "customer_status", "customer_type", "customer_category",
        "industry", "account_manager_id",
      ].filter((k) => filters[k]).length,
    [filters],
  );

  const handleDeleteClick = (c) => {
    setPendingDelete(c);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteCustomerApi(pendingDelete.id)).unwrap();
      showToast(`Customer ${getCompany(pendingDelete)} deleted`, "success");
      setConfirmOpen(false);
      setPendingDelete(null);
      dispatch(fetchCustomerStats());
    } catch (err) {
      showToast(err || "Failed to delete customer", "error");
    }
  };

  const handleExport = async (format) => {
    const exportFilters = {
      search: filters.search,
      customer_status: filters.customer_status,
      customer_type: filters.customer_type,
      customer_category: filters.customer_category,
      industry: filters.industry,
      account_manager_id: filters.account_manager_id,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    };

    if (format === "pdf") {
      await dispatch(exportCustomersPdf({ filters: exportFilters })).unwrap();
    } else {
      const serverFormat = format === "csv" ? "csv" : "xlsx";
      await dispatch(
        exportCustomersExcel({ format: serverFormat, filters: exportFilters }),
      ).unwrap();
    }
    showToast("Export downloaded successfully", "success");
  };

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const updateFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  const summary = useMemo(
    () => ({
      total: stats.total_customers,
      active: stats.active_customers,
      inactive: stats.inactive_customers,
      newThisMonth: stats.new_this_month,
      withOpenOpps: stats.with_open_opportunities,
      needsFollowUp: stats.needs_follow_up,
    }),
    [stats],
  );

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer relationships and records
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setExportOpen(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/crm/customers/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total" value={summary.total} icon={Users} color="blue" />
        <SummaryCard label="Active" value={summary.active} icon={UserCheck} color="green" />
        <SummaryCard label="Inactive" value={summary.inactive} icon={UserX} color="gray" />
        <SummaryCard label="New This Month" value={summary.newThisMonth} icon={UserPlus2} color="indigo" />
        <SummaryCard label="With Open Deals" value={summary.withOpenOpps} icon={BriefcaseIcon} color="purple" />
        <SummaryCard label="Needs Follow-up" value={summary.needsFollowUp} icon={Clock} color="amber" />
      </div>

      {/* Search + Filters + View toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by company, contact, email, phone, or ID..."
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

        <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title="Table view"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              view === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterSelect
              label="Status"
              value={filters.customer_status}
              onChange={(v) => updateFilter("customer_status", v)}
              options={options.customer_statuses || []}
            />
            <FilterSelect
              label="Type"
              value={filters.customer_type}
              onChange={(v) => updateFilter("customer_type", v)}
              options={options.customer_types || []}
            />
            <FilterSelect
              label="Category"
              value={filters.customer_category}
              onChange={(v) => updateFilter("customer_category", v)}
              options={options.customer_categories || []}
            />
            <FilterSelect
              label="Industry"
              value={filters.industry}
              onChange={(v) => updateFilter("industry", v)}
              options={options.industries || []}
            />
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

      {/* Table view */}
      {view === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {[
                  "CUSTOMER ID", "COMPANY", "PRIMARY CONTACT", "EMAIL",
                  "PHONE", "INDUSTRY", "ACCOUNT MANAGER", "STATUS",
                  "SINCE", "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/admin/crm/customers/${c.id}`)}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {getCustomerId(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {getCompany(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {getContactName(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {getContactEmail(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {getContactPhone(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {getIndustry(c)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {getAccountManager(c)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(getStatus(c))}`}>
                        {getStatus(c)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(getCustomerSince(c))}
                    </td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <IconBtn icon={Eye} color="text-blue-500" title="View"
                          onClick={() => navigate(`/admin/crm/customers/${c.id}`)} />
                        <IconBtn icon={Pencil} color="text-amber-500" title="Edit"
                          onClick={() => navigate(`/admin/crm/customers/${c.id}/edit`)} />
                        <IconBtn icon={UserPlus} color="text-indigo-500" title="Add Contact"
                          onClick={() => showToast("Add contact — later", "info")} />
                        <IconBtn icon={Briefcase} color="text-purple-500" title="Add Opportunity"
                          onClick={() => showToast("Add opportunity — later", "info")} />
                        <IconBtn icon={CalendarClock} color="text-teal-500" title="Schedule"
                          onClick={() => showToast("Schedule — later", "info")} />
                        <IconBtn icon={Trash2} color="text-red-500" title="Delete"
                          onClick={() => handleDeleteClick(c)} disabled={submitting} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/admin/crm/customers/${c.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {getCompany(c).charAt(0)}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(getStatus(c))}`}>
                  {getStatus(c)}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {getCompany(c)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {getIndustry(c)} · {getCity(c)}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Users size={12} /> {getContactName(c)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <UserCheck size={12} /> {getAccountManager(c)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${getCompany(pendingDelete)}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        title="Export Customers"
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
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={undefined}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value ?? 0}</div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
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
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default Customers;