// src/admin/pages/accounts/VendorsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendors,
  deleteVendor,
  clearError,
} from "../../store/slices/accounts/vendorsSlice";
import {
  Plus,
  ArrowUpDown,
  Download,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  UserPlus,
  UploadCloud,
  Mail,
  Printer,
  Building2,
  Columns,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";
import { showToast } from "../../../components/common/Toast";

/* ---------- primitives ---------- */

const ALL_COLUMNS = [
  { id: "displayName", label: "Display name", locked: true },
  { id: "companyName", label: "Company" },
  { id: "email", label: "Email" },
  { id: "workPhone", label: "Work phone" },
  { id: "openingBalance", label: "Payables" },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A–Z", sort_by: "name", sort_dir: "asc" },
  { value: "name_desc", label: "Name Z–A", sort_by: "name", sort_dir: "desc" },
  { value: "payables_desc", label: "Highest Payables", sort_by: "opening_balance", sort_dir: "desc" },
  { value: "payables_asc", label: "Lowest Payables", sort_by: "opening_balance", sort_dir: "asc" },
];

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
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
    default: "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
    danger: "text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    primary: "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    warning: "text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30",
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

const DetailItem = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-medium ${
        tone === "pos"
          ? "text-green-600 dark:text-green-400"
          : tone === "neg"
          ? "text-red-600 dark:text-red-400"
          : "text-gray-800 dark:text-gray-100"
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

/* ---------- page ---------- */

const VendorsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const vendorsSlice = useSelector((s) => s.vendors) || {};
  const vendors = vendorsSlice.vendors || [];
  const loading = vendorsSlice.loading ?? false;
  const error = vendorsSlice.error ?? null;
  const pagination = vendorsSlice.pagination ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  /* ---- load list whenever page / search / filters / sort change ---- */
  useEffect(() => {
    const params = { page, per_page: pageSize };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (statusFilter !== "all") params.status = statusFilter;

    const sort = SORT_OPTIONS.find((o) => o.value === sortBy);
    if (sort) {
      params.sort_by = sort.sort_by;
      params.sort_dir = sort.sort_dir;
    }

    dispatch(fetchVendors(params));
  }, [dispatch, page, pageSize, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const toggleColumn = (id) =>
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ---- render rows (server-paginated, no extra client work) ---- */
  const renderedVendors = vendors;

  const total = pagination?.total ?? vendors.length;
  const totalPages = pagination?.lastPage ?? 1;
  const currentPage = pagination?.currentPage ?? 1;

  const withCompany = vendors.filter((v) => v.companyName).length;
  const withPortal = vendors.filter((v) => v.portalAccess).length;
  const totalPayables = vendors.reduce((s, v) => s + (v.openingBalance || 0), 0);

  const hasActiveFilters = statusFilter !== "all";

  /* ---- handlers ---- */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      await dispatch(deleteVendor(target.id)).unwrap();
      if (selectedVendor?.id === target.id) setSelectedVendor(null);
      showToast("Vendor deleted", "success");
    } catch (e) {
      showToast(typeof e === "string" ? e : "Delete failed", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <span className="inline-flex items-center gap-2">
            <AlertCircle size={14} />
            {typeof error === "string" ? error : error?.message || "Something went wrong"}
          </span>
          <button
            onClick={() => dispatch(clearError())}
            className="text-[11px] font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Vendors" value={total} icon="fas fa-truck" color="green" />
        <MiniStat label="With Company" value={withCompany} icon="fas fa-building" color="blue" />
        <MiniStat label="With Portal Access" value={withPortal} icon="fas fa-user-shield" color="violet" />
        <MiniStat
          label="Total Payables"
          value={`₹${totalPayables.toFixed(2)}`}
          icon="fas fa-hand-holding-usd"
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Vendors
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No vendors yet"
              : `${total} ${total === 1 ? "vendor" : "vendors"} in your directory`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload size={14} /> Import
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Download size={14} /> Export
          </button>

          <button
            onClick={() => navigate("/admin/accounts/purchases/vendors/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Vendor
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {loading && vendors.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 size={22} className="animate-spin text-green-500" />
          <span className="text-sm">Loading vendors…</span>
        </Card>
      ) : total === 0 && !searchQuery && !hasActiveFilters ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/vendors/new")} />
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Status: Any</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {visibleColumns.displayName && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          Display name <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.companyName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Company</th>
                    )}
                    {visibleColumns.email && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Email</th>
                    )}
                    {visibleColumns.workPhone && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Work phone</th>
                    )}
                    {visibleColumns.openingBalance && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Payables</th>
                    )}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        <Loader2 size={18} className="inline animate-spin mr-2 text-green-500" />
                        Loading…
                      </td>
                    </tr>
                  ) : renderedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No vendors match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    renderedVendors.map((vendor) => (
                      <tr
                        key={vendor.id}
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setActiveTab("Overview");
                        }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.displayName && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVendor(vendor);
                                setActiveTab("Overview");
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {vendor.displayName || "—"}
                            </button>
                          </td>
                        )}
                        {visibleColumns.companyName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {vendor.companyName || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {vendor.email || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.workPhone && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {vendor.workPhone || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.openingBalance && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            ₹{(vendor.openingBalance || 0).toFixed(2)}
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
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setActiveTab("Overview");
                              }}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/vendors/edit/${vendor.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(vendor)}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages} · {total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* ---- Drawer ---- */}
      {selectedVendor && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedVendor.displayName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    navigate(`/admin/accounts/purchases/vendors/edit/${selectedVendor.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "Comments", "Transactions", "Mails", "Statement"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "Overview" && (
                <div className="flex flex-col lg:flex-row gap-4 p-5 sm:p-6">
                  <div className="lg:w-64 space-y-4 shrink-0">
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm shrink-0">
                          {selectedVendor.displayName?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {selectedVendor.displayName}
                          </p>
                          {selectedVendor.email && (
                            <p className="text-[11.5px] text-gray-500 truncate">
                              {selectedVendor.email}
                            </p>
                          )}
                          {selectedVendor.workPhone && (
                            <p className="text-[11.5px] text-gray-500">
                              {selectedVendor.workPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 space-y-2">
                      <SectionLabel>Other details</SectionLabel>
                      <DetailItem label="Currency" value={selectedVendor.currency} />
                      <DetailItem
                        label="Status"
                        value={selectedVendor.status === "active" ? "Active" : "Inactive"}
                        tone={selectedVendor.status === "active" ? "pos" : "neg"}
                      />
                      <DetailItem label="Payment terms" value={selectedVendor.paymentTerms} />
                      <DetailItem
                        label="Opening balance"
                        value={`₹${(selectedVendor.openingBalance || 0).toFixed(2)}`}
                      />
                    </Card>

                    {selectedVendor.remarks && (
                      <Card className="p-4">
                        <SectionLabel>Remarks</SectionLabel>
                        <p className="text-[11.5px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {selectedVendor.remarks}
                        </p>
                      </Card>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <Card className="p-4 bg-green-50 dark:bg-green-900/20 !border-green-200/80 dark:!border-green-800/60">
                      <div className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100">
                            What's next?
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                            Create a purchase order or record a bill for this vendor.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors">
                              New bill
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-medium text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              New purchase order
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <div>
                          <SectionLabel>Payables</SectionLabel>
                          <p className="text-[11.5px] text-gray-500">
                            Payment due period{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {selectedVendor.paymentTerms || "—"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                              <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Currency
                              </th>
                              <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Outstanding
                              </th>
                              <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Unused credits
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="px-3 md:px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                {selectedVendor.currency || "INR"}
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-right tabular-nums">
                                ₹{(selectedVendor.openingBalance || 0).toFixed(2)}
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-right tabular-nums">
                                ₹0.00
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "Statement" && (
                <div className="p-5 sm:p-6">
                  <StatementPreview vendor={selectedVendor} />
                </div>
              )}

              {activeTab !== "Overview" && activeTab !== "Statement" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    No data
                  </p>
                  <p className="text-xs text-gray-500">
                    Nothing to show under {activeTab} yet.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete vendor"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon, color, isMoney }) => {
  const bg = {
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    violet: "bg-violet-100 dark:bg-violet-900/30",
  }[color] || "bg-gray-100 dark:bg-gray-700";

  const fg = {
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

const EmptyState = ({ onCreate }) => (
  <Card className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <UserPlus size={22} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        Every purchase starts with a vendor
      </h2>
      <p className="text-sm text-gray-500 mt-1.5 mb-6">
        Create and manage your vendors and their contact persons, all in one place.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create vendor
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <UploadCloud size={14} /> Import file
        </button>
      </div>
    </div>
  </Card>
);

const StatementPreview = ({ vendor }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl text-gray-800 dark:text-gray-200 shadow-soft">
    <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {vendor.companyName || vendor.displayName}
        </p>
        {vendor.email && <p className="text-gray-500">{vendor.email}</p>}
        {vendor.workPhone && <p className="text-gray-500">{vendor.workPhone}</p>}
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Statement of accounts
        </h1>
        <p className="text-[11px] text-gray-500 mt-1">As of today</p>
      </div>
    </div>

    <div className="text-[11.5px] mb-6">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        To
      </p>
      <p className="font-medium text-gray-800 dark:text-gray-100">
        {vendor.displayName}
      </p>
    </div>

    <table className="w-full border-collapse text-[11.5px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
          <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Account summary
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <td className="py-2 px-2 text-gray-500">Opening balance</td>
          <td className="py-2 px-2 text-right tabular-nums">
            ₹{(vendor.openingBalance || 0).toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default VendorsPage;