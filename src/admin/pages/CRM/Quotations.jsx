// src/admin/pages/CRM/Quotations.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  Send,
  Check,
  XCircle,
  Copy,
  FileText,
  FileEdit,
  Send as SendIcon,
  CheckCircle2,
  XOctagon,
  IndianRupee,
  Clock,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import SendQuotationModal from "../../components/crm/SendQuotationModal";
import {
  fetchQuotations,
  fetchQuotationFormOptions,
  deleteQuotationApi,
  updateQuotationStatusApi,
  exportQuotations,
  fromQuotationApi,
  setCurrentPage,
  setFilters,
  resetFilters,
} from "../../store/slices/quotationSlice";
import ExportModal from "../../../components/common/ExportModal";

// ---------- helpers ----------
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "AED"
          ? "AED "
          : "";
  return `${symbol}${Number(n || 0).toLocaleString()}`;
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  const map = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    viewed:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[s] || map.draft;
};

const statusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const iconForStatus = (status) => {
  const s = String(status || "").toLowerCase();
  const map = {
    draft: FileEdit,
    sent: SendIcon,
    viewed: Eye,
    accepted: CheckCircle2,
    rejected: XOctagon,
    expired: Clock,
    cancelled: XCircle,
  };
  return map[s] || FileText;
};

const Quotations = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    quotations = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    options,
    submitting,
    exporting,
  } = useSelector((state) => state.quotations);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [sendOpen, setSendOpen] = useState(false);
  const [pendingSend, setPendingSend] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);

  // ── initial loads ──
  useEffect(() => {
    dispatch(fetchQuotationFormOptions());
  }, [dispatch]);

  // ── list fetch ──
  useEffect(() => {
    dispatch(
      fetchQuotations({
        page: currentPage,
        perPage,
        search: filters.search,
        status: filters.status,
        customer_id: filters.customer_id,
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

  const refetchList = () =>
    dispatch(
      fetchQuotations({
        page: currentPage,
        perPage,
        search: filters.search,
        status: filters.status,
        customer_id: filters.customer_id,
      }),
    );

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const activeFilterCount = useMemo(
    () => ["status", "customer_id"].filter((k) => filters[k]).length,
    [filters],
  );

  // Normalize for display
  const normalized = useMemo(
    () => (quotations || []).map((q) => fromQuotationApi(q)),
    [quotations],
  );

  // Summary
  const summary = useMemo(() => {
    const by = (s) =>
      normalized.filter((q) => String(q.status).toLowerCase() === s).length;
    const totalValue = normalized.reduce(
      (sum, q) => sum + Number(q.grandTotal || 0),
      0,
    );
    return {
      total: totalCount || normalized.length,
      draft: by("draft"),
      sent: by("sent"),
      accepted: by("accepted"),
      rejected: by("rejected"),
      totalValue,
    };
  }, [normalized, totalCount]);

  // ---------- handlers ----------
  const handleDeleteClick = (q) => {
    setPendingDelete(q);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteQuotationApi(pendingDelete.id)).unwrap();
      showToast(
        `Quotation ${pendingDelete.quotationNumber} deleted`,
        "success",
      );
      setConfirmOpen(false);
      setPendingDelete(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to delete quotation", "error");
    }
  };

  const handleSendClick = (q) => {
    setPendingSend(q);
    setSendOpen(true);
  };

  const handleSendConfirm = async ({ to } = {}) => {
    if (!pendingSend) return;
    try {
      await dispatch(
        updateQuotationStatusApi({ id: pendingSend.id, status: "sent" }),
      ).unwrap();
      showToast(
        `Quotation ${pendingSend.quotationNumber} sent${to ? ` to ${to}` : ""}`,
        "success",
      );
      setSendOpen(false);
      setPendingSend(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  const handleMarkStatus = async (q, status) => {
    try {
      await dispatch(updateQuotationStatusApi({ id: q.id, status })).unwrap();
      showToast(`${q.quotationNumber} marked as ${status}`, "success");
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  const handleDuplicate = (q) => {
    navigate(`/admin/crm/quotations/new?duplicate=${q.id}`);
  };

  const handleDownloadPdf = (q) => {
    showToast(`Generating PDF for ${q.quotationNumber}…`, "info");
    // TODO: wire to your pdf endpoint when ready
  };

  const handleExport = async (format) => {
    const exportFilters = {
      status: filters.status,
      customer_id: filters.customer_id,
      search: filters.search,
    };
    try {
      const serverFormat =
        format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx";
      await dispatch(
        exportQuotations({ format: serverFormat, filters: exportFilters }),
      ).unwrap();
      showToast("Export downloaded successfully", "success");
    } catch (err) {
      showToast(err || "Failed to export quotations", "error");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const updateFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  const customerOptions = (options.customers || []).map((c) =>
    typeof c === "string"
      ? { value: c, label: c }
      : { value: String(c.id), label: c.company_name || c.name || `#${c.id}` },
  );

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Quotations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, send, and track your price proposals
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
            onClick={() => navigate("/admin/crm/quotations/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Quotation
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Total"
          value={summary.total}
          icon={FileText}
          color="blue"
        />
        <SummaryCard
          label="Draft"
          value={summary.draft}
          icon={FileEdit}
          color="gray"
        />
        <SummaryCard
          label="Sent"
          value={summary.sent}
          icon={SendIcon}
          color="indigo"
        />
        <SummaryCard
          label="Accepted"
          value={summary.accepted}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Rejected"
          value={summary.rejected}
          icon={XOctagon}
          color="red"
        />
        <SummaryCard
          label="Total Value"
          value={formatCurrency(summary.totalValue)}
          icon={IndianRupee}
          color="purple"
          small
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
            placeholder="Search by number, customer, or opportunity..."
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
              value={filters.status}
              onChange={(v) => updateFilter("status", v)}
              options={options.statuses || []}
            />
            <FilterSelect
              label="Customer"
              value={filters.customer_id}
              onChange={(v) => updateFilter("customer_id", v)}
              options={customerOptions}
            />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[1000px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {[
                  "QUOTATION #",
                  "CUSTOMER",
                  "ISSUE DATE",
                  "VALID UNTIL",
                  "AMOUNT",
                  "STATUS",
                  "ACTIONS",
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
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading quotations...
                  </td>
                </tr>
              ) : normalized.length > 0 ? (
                normalized.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/admin/crm/quotations/${q.id}`)}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {q.quotationNumber}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {q.customerName}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(q.quotationDate)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(q.validUntil)}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(q.grandTotal, q.currency)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
                          q.status,
                        )}`}
                      >
                        {statusLabel(q.status)}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1">
                        <IconBtn
                          icon={Eye}
                          color="text-blue-500"
                          title="View"
                          onClick={() =>
                            navigate(`/admin/crm/quotations/${q.id}`)
                          }
                        />
                        <IconBtn
                          icon={Pencil}
                          color="text-amber-500"
                          title="Edit"
                          onClick={() =>
                            navigate(`/admin/crm/quotations/${q.id}/edit`)
                          }
                        />
                        {q.status === "draft" && (
                          <IconBtn
                            icon={Send}
                            color="text-indigo-500"
                            title="Send"
                            onClick={() => handleSendClick(q)}
                          />
                        )}
                        <IconBtn
                          icon={Check}
                          color="text-green-600"
                          title="Mark Accepted"
                          onClick={() => handleMarkStatus(q, "accepted")}
                          disabled={
                            q.status === "accepted" || q.status === "rejected"
                          }
                        />
                        <IconBtn
                          icon={XCircle}
                          color="text-red-500"
                          title="Mark Rejected"
                          onClick={() => handleMarkStatus(q, "rejected")}
                          disabled={
                            q.status === "accepted" || q.status === "rejected"
                          }
                        />
                        <IconBtn
                          icon={Trash2}
                          color="text-red-500"
                          title="Delete"
                          onClick={() => handleDeleteClick(q)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No quotations found
                  </td>
                </tr>
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

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Quotation"
        message={`Are you sure you want to delete ${pendingDelete?.quotationNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <SendQuotationModal
        isOpen={sendOpen}
        onClose={() => {
          setSendOpen(false);
          setPendingSend(null);
        }}
        quotation={pendingSend}
        onSend={handleSendConfirm}
      />
      {/* Export */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        title="Export Quotations"
        subtitle="Download the current filtered list"
        totalRecords={totalCount}
        formats={["csv", "xlsx", "pdf"]}
        defaultFormat="xlsx"
      />
    </div>
  );
};

// ---------- building blocks ----------
const SummaryCard = ({ label, value, icon: Icon, color, small }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
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
      <div
        className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}
      >
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

const FilterSelect = ({ label, value, onChange, options = [] }) => (
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
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  </div>
);

export default Quotations;
