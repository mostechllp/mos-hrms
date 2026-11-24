// src/admin/pages/CustomersPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  clearError,
} from "../../store/slices/accounts/customersSlice";
import {
  Plus,
  ArrowUpDown,
  Download,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  UploadCloud,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  Columns,
  Loader2,
  Settings,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";



/* ---------- primitives (unchanged) ---------- */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    primary:
      "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    warning:
      "text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-full transition-all duration-200 ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
};

/* ---------- column definitions (unchanged) ---------- */
const ALL_COLUMNS = [
  { id: "displayName", label: "Name", locked: true },
  { id: "companyName", label: "Company Name" },
  { id: "email", label: "Email" },
  { id: "workPhone", label: "Phone" },
  { id: "receivables", label: "Receivables (BCY)" },
  { id: "unusedCredits", label: "Unused Credits (BCY)" },
  { id: "source", label: "Source" },
  { id: "firstName", label: "First Name" },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "balance_desc", label: "Highest Balance" },
  { value: "balance_asc", label: "Lowest Balance" },
];

/* ---------- page ---------- */
const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, loading, error, pagination } = useSelector(
    (s) => s.accountCustomers,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {}),
  );

  const [filters, setFilters] = useState({
    hasCompany: "all",
    portalAccess: "all",
    currency: "all",
  });
  const [sortBy, setSortBy] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  /* ---- fetch on mount + whenever page/search changes (server-driven) ---- */
  useEffect(() => {
    const params = { page, per_page: pageSize };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filters.currency !== "all") params.currency = filters.currency;
    if (filters.portalAccess !== "all")
      params.portal_access = filters.portalAccess === "yes" ? 1 : 0;
    if (filters.hasCompany !== "all")
      params.has_company = filters.hasCompany === "yes" ? 1 : 0;

    dispatch(fetchCustomers(params));
  }, [dispatch, page, pageSize, searchQuery, filters]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  /* ---- client-side sort (server already filtered) ---- */
  const processedCustomers = useMemo(() => {
    const result = [...customers];
    result.sort((a, b) => {
      if (sortBy === "name_asc")
        return (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "name_desc")
        return (b.displayName || "").localeCompare(a.displayName || "");
      if (sortBy === "balance_desc")
        return (b.openingBalance || 0) - (a.openingBalance || 0);
      if (sortBy === "balance_asc")
        return (a.openingBalance || 0) - (b.openingBalance || 0);
      return 0;
    });
    return result;
  }, [customers, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteCustomer(deleteTarget.id));
    if (deleteCustomer.fulfilled.match(result)) {
      if (selectedCustomer?.id === deleteTarget.id) setSelectedCustomer(null);
      setDeleteTarget(null);
    } else {
      setDeleteTarget(null);
    }
  };

  const toggleColumn = (id) =>
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalCustomers = pagination?.total ?? customers.length;

  const availableCurrencies = useMemo(
    () => [...new Set(customers.map((c) => c.currency).filter(Boolean))],
    [customers],
  );

  const hasActiveFilters =
    filters.hasCompany !== "all" ||
    filters.portalAccess !== "all" ||
    filters.currency !== "all";

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat
          label="Total Customers"
          value={totalCustomers}
          icon="fas fa-users"
          color="green"
        />
        <MiniStat
          label="With Company"
          value={customers.filter((c) => c.companyName).length}
          icon="fas fa-building"
          color="blue"
        />
        <MiniStat
          label="With Portal Access"
          value={customers.filter((c) => c.portalAccess).length}
          icon="fas fa-user-shield"
          color="violet"
        />
        <MiniStat
          label="Outstanding Balance"
          value={`$${customers.reduce((s, c) => s + (c.openingBalance || 0), 0).toFixed(2)}`}
          icon="fas fa-hand-holding-usd"
          color="amber"
          isMoney
        />
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalCustomers === 0
              ? "No customers yet"
              : `${totalCustomers} ${totalCustomers === 1 ? "customer" : "customers"} in your directory`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Download size={14} /> Import
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload size={14} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/accounts/sales/customers/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Customer
          </button>
        </div>
      </div>

      {/* Main */}
      {loading && customers.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 size={22} className="animate-spin text-green-500" />
          <span className="text-sm">Loading customers…</span>
        </Card>
      ) : totalCustomers === 0 && !searchQuery && !hasActiveFilters ? (
        <EmptyState navigate={navigate} />
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search customers…"
                value={searchQuery}
                onChange={(e) => {
                  setPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Columns size={15} />
              <span className="hidden md:inline">Columns</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.hasCompany}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, hasCompany: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Company: Any</option>
                <option value="yes">Has Company</option>
                <option value="no">No Company</option>
              </select>
              <select
                value={filters.portalAccess}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, portalAccess: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Portal: Any</option>
                <option value="yes">Portal Enabled</option>
                <option value="no">Portal Disabled</option>
              </select>
              <select
                value={filters.currency}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, currency: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Currency: Any</option>
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setPage(1);
                    setFilters({
                      hasCompany: "all",
                      portalAccess: "all",
                      currency: "all",
                    });
                  }}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {visibleColumns.displayName && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          Name <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.companyName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Company Name
                      </th>
                    )}
                    {visibleColumns.email && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Email
                      </th>
                    )}
                    {visibleColumns.workPhone && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Phone
                      </th>
                    )}
                    {visibleColumns.receivables && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Receivables (BCY)
                      </th>
                    )}
                    {visibleColumns.unusedCredits && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Unused Credits (BCY)
                      </th>
                    )}
                    {visibleColumns.source && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Source
                      </th>
                    )}
                    {visibleColumns.firstName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        First Name
                      </th>
                    )}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-10 text-center text-gray-500"
                      >
                        <Loader2
                          size={18}
                          className="inline animate-spin mr-2 text-green-500"
                        />{" "}
                        Loading…
                      </td>
                    </tr>
                  ) : processedCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No customers match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    processedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.displayName && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer);
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {customer.displayName}
                            </button>
                          </td>
                        )}
                        {visibleColumns.companyName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {customer.companyName || (
                              <span className="text-gray-300 dark:text-gray-600">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {customer.email || (
                              <span className="text-gray-300 dark:text-gray-600">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns.workPhone && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {customer.workPhone || (
                              <span className="text-gray-300 dark:text-gray-600">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns.receivables && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            ${(customer.openingBalance || 0).toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.unusedCredits && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                            $0.00
                          </td>
                        )}
                        {visibleColumns.source && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {customer.source || "Direct"}
                          </td>
                        )}
                        {visibleColumns.firstName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {customer.firstName || (
                              <span className="text-gray-300 dark:text-gray-600">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={Eye}
                              label="View"
                              tone="primary"
                              onClick={() => setSelectedCustomer(customer)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(
                                  `/admin/accounts/sales/customers/edit/${customer.id}`,
                                )
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(customer)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                Page {pagination.currentPage} of {pagination.lastPage} ·{" "}
                {pagination.total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Prev
                </button>
                <button
                  disabled={
                    pagination.currentPage >= pagination.lastPage || loading
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      <CustomizeColumnsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      {/* Drawer (unchanged markup, just uses selectedCustomer) */}
      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-[45%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedCustomer.displayName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/admin/accounts/sales/customers/edit/${selectedCustomer.id}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedCustomer)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
              <Card className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {[
                        selectedCustomer.salutation,
                        selectedCustomer.firstName,
                        selectedCustomer.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedCustomer.companyName || "Individual customer"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{selectedCustomer.email}</span>
                    </div>
                  )}
                  {(selectedCustomer.workPhone || selectedCustomer.mobile) && (
                    <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {selectedCustomer.workPhone}
                        {selectedCustomer.mobile &&
                          ` · ${selectedCustomer.mobile}`}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddressBlock
                  title="Billing address"
                  address={selectedCustomer.billingAddress}
                />
                <AddressBlock
                  title="Shipping address"
                  address={selectedCustomer.shippingAddress}
                />
              </div>
              <Card className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DetailItem
                    label="Currency"
                    value={selectedCustomer.currency}
                  />
                  <DetailItem
                    label="Payment terms"
                    value={selectedCustomer.paymentTerms}
                  />
                  <DetailItem
                    label="Portal access"
                    value={
                      selectedCustomer.portalAccess ? "Enabled" : "Disabled"
                    }
                  />
                </div>
              </Card>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete customer"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- sub-components (unchanged) ---------- */
const EmptyState = ({ navigate } /* same as original */) => (
  <Card className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Users size={22} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        Every sale starts with a customer
      </h2>
      <p className="text-sm text-gray-500 mt-1.5 mb-6">
        Create and manage customers and their contact persons, all in one place.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => navigate("/admin/accounts/sales/customers/new")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create customer
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <UploadCloud size={14} /> Import file
        </button>
      </div>
    </div>
    <div className="mt-12 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={14} className="text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Key benefits
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {[
          "Stay connected with multiple contact persons",
          "Provide portal access to customers",
          "Handle multiple addresses effortlessly",
          "Create multi-currency transactions for contacts",
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <CheckCircle2
              size={14}
              className="text-green-500 mt-0.5 shrink-0"
            />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const MiniStat = ({ label, value, icon, color, isMoney }) => {
  /* same as before */
  const bg =
    {
      green: "bg-green-100 dark:bg-green-900/30",
      blue: "bg-blue-100 dark:bg-blue-900/30",
      amber: "bg-amber-100 dark:bg-amber-900/30",
      red: "bg-red-100 dark:bg-red-900/30",
      violet: "bg-violet-100 dark:bg-violet-900/30",
    }[color] || "bg-gray-100 dark:bg-gray-700";
  const fg =
    {
      green: "text-green-600 dark:text-green-400",
      blue: "text-blue-600 dark:text-blue-400",
      amber: "text-amber-600 dark:text-amber-400",
      red: "text-red-600 dark:text-red-400",
      violet: "text-violet-600 dark:text-violet-400",
    }[color] || "text-gray-600 dark:text-gray-400";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div
          className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}
        >
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div
        className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

const AddressBlock = ({ title, address } /* same as before */) => (
  <Card className="p-4">
    <div className="flex items-center gap-1.5 mb-2">
      <MapPin size={12} className="text-gray-400" />
      <SectionLabel>{title}</SectionLabel>
    </div>
    {address?.street1 || address?.city ? (
      <div className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 space-y-0.5 leading-relaxed">
        {address.attention && (
          <p className="font-medium text-gray-800 dark:text-gray-100">
            {address.attention}
          </p>
        )}
        {address.street1 && <p>{address.street1}</p>}
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {[address.city, address.state].filter(Boolean).join(", ")}{" "}
          {address.pinCode}
        </p>
        {address.country && <p>{address.country}</p>}
        {address.phone && (
          <p className="text-[11.5px] text-gray-500 mt-1">
            Phone: {address.phone}
          </p>
        )}
      </div>
    ) : (
      <p className="text-xs md:text-[12.5px] text-gray-400 dark:text-gray-600">
        Not provided
      </p>
    )}
  </Card>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
      {value || <span className="text-gray-400 dark:text-gray-600">—</span>}
    </p>
  </div>
);

export default CustomersPage;
