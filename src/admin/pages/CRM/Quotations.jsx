// src/admin/pages/crm/Quotations.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// ------------------------------------------------------------
// STATIC DATA
// ------------------------------------------------------------

const QUOTATIONS = [
  {
    id: 1,
    number: "Q-2026-0148",
    customer: "Acme Corp",
    opportunity: "Acme Corp Payroll Renewal",
    issueDate: "2026-09-14",
    validUntil: "2026-10-14",
    amount: 250000,
    currency: "INR",
    status: "Sent",
    createdBy: "Riya Roy",
  },
  {
    id: 2,
    number: "Q-2026-0147",
    customer: "Globex Ltd",
    opportunity: "Globex Attendance System",
    issueDate: "2026-09-12",
    validUntil: "2026-10-12",
    amount: 120000,
    currency: "INR",
    status: "Accepted",
    createdBy: "Amina Khan",
  },
  {
    id: 3,
    number: "Q-2026-0146",
    customer: "Initech Solutions",
    opportunity: "Initech Custom Development",
    issueDate: "2026-09-10",
    validUntil: "2026-10-10",
    amount: 800000,
    currency: "INR",
    status: "Draft",
    createdBy: "Karthik Raj",
  },
  {
    id: 4,
    number: "Q-2026-0145",
    customer: "LMN Group",
    opportunity: "LMN Group HRMS Upgrade",
    issueDate: "2026-09-05",
    validUntil: "2026-10-05",
    amount: 300000,
    currency: "INR",
    status: "Viewed",
    createdBy: "Riya Roy",
  },
  {
    id: 5,
    number: "Q-2026-0144",
    customer: "PQR Solutions",
    opportunity: "PQR Solutions CRM Setup",
    issueDate: "2026-08-28",
    validUntil: "2026-09-28",
    amount: 150000,
    currency: "INR",
    status: "Rejected",
    createdBy: "Karthik Raj",
  },
  {
    id: 6,
    number: "Q-2026-0143",
    customer: "Umbrella Inc",
    opportunity: "Umbrella Inc HRMS",
    issueDate: "2026-07-20",
    validUntil: "2026-08-20",
    amount: 180000,
    currency: "INR",
    status: "Expired",
    createdBy: "Aarav Mehta",
  },
  {
    id: 7,
    number: "Q-2026-0142",
    customer: "Acme Corp",
    opportunity: "Acme Corp ERP",
    issueDate: "2026-09-10",
    validUntil: "2026-10-10",
    amount: 450000,
    currency: "INR",
    status: "Sent",
    createdBy: "Riya Roy",
  },
];

const STATUSES = [
  "Draft",
  "Sent",
  "Viewed",
  "Accepted",
  "Rejected",
  "Expired",
  "Cancelled",
];

const CUSTOMERS = [
  "Acme Corp",
  "Globex Ltd",
  "Initech Solutions",
  "LMN Group",
  "PQR Solutions",
  "Umbrella Inc",
];

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (n, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "";
  return `${symbol}${Number(n || 0).toLocaleString()}`;
};

const statusBadge = (status) => {
  const map = {
    Draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Viewed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    Accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Expired: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Draft;
};

const statusIcon = (status) => {
  const map = {
    Draft: FileEdit,
    Sent: SendIcon,
    Viewed: Eye,
    Accepted: CheckCircle2,
    Rejected: XOctagon,
    Expired: Clock,
    Cancelled: XCircle,
  };
  return map[status] || FileText;
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const Quotations = () => {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState(QUOTATIONS);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", customer: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [sendOpen, setSendOpen] = useState(false);
  const [pendingSend, setPendingSend] = useState(null);

  // ------------------------------------------------------------
  // Filtering
  // ------------------------------------------------------------
  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      if (filters.status && q.status !== filters.status) return false;
      if (filters.customer && q.customer !== filters.customer) return false;

      if (search) {
        const s = search.toLowerCase();
        return (
          q.number.toLowerCase().includes(s) ||
          q.customer.toLowerCase().includes(s) ||
          q.opportunity.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [quotations, filters, search]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const pageQuotations = filtered.slice(start, start + perPage);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  const summary = useMemo(() => {
    const draft = quotations.filter((q) => q.status === "Draft");
    const sent = quotations.filter((q) => q.status === "Sent");
    const accepted = quotations.filter((q) => q.status === "Accepted");
    const rejected = quotations.filter((q) => q.status === "Rejected");
    const totalValue = quotations.reduce((sum, q) => sum + q.amount, 0);

    return {
      total: quotations.length,
      draft: draft.length,
      sent: sent.length,
      accepted: accepted.length,
      rejected: rejected.length,
      totalValue,
    };
  }, [quotations]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleDeleteClick = (q) => {
    setPendingDelete(q);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setQuotations((prev) => prev.filter((q) => q.id !== pendingDelete.id));
    showToast(`Quotation ${pendingDelete.number} deleted`, "success");
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleSendClick = (q) => {
    setPendingSend(q);
    setSendOpen(true);
  };

  const handleSendConfirm = ({ to, subject, message }) => {
    if (!pendingSend) return;
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === pendingSend.id ? { ...q, status: "Sent" } : q,
      ),
    );
    showToast(`Quotation ${pendingSend.number} sent to ${to}`, "success");
    setSendOpen(false);
    setPendingSend(null);
  };

  const handleMarkAccepted = (q) => {
    setQuotations((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, status: "Accepted" } : x)),
    );
    showToast(`${q.number} marked as accepted`, "success");
  };

  const handleMarkRejected = (q) => {
    setQuotations((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, status: "Rejected" } : x)),
    );
    showToast(`${q.number} marked as rejected`, "success");
  };

  const handleDuplicate = (q) => {
    const newQ = {
      ...q,
      id: Date.now(),
      number: `Q-2026-${String(150 + quotations.length).padStart(4, "0")}`,
      issueDate: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Draft",
    };
    setQuotations((prev) => [newQ, ...prev]);
    showToast(`Duplicated as ${newQ.number}`, "success");
  };

  const handleDownloadPdf = (q) => {
    showToast(`Generating PDF for ${q.number}…`, "info");
  };

  const clearFilters = () => {
    setFilters({ status: "", customer: "" });
    setSearch("");
    setCurrentPage(1);
  };

  const resetToFirstPage = () => setCurrentPage(1);

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* ---------- Header ---------- */}
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
            onClick={() => showToast("Export started", "success")}
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

      {/* ---------- Summary cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total" value={summary.total} icon={FileText} color="blue" />
        <SummaryCard label="Draft" value={summary.draft} icon={FileEdit} color="gray" />
        <SummaryCard label="Sent" value={summary.sent} icon={SendIcon} color="indigo" />
        <SummaryCard label="Accepted" value={summary.accepted} icon={CheckCircle2} color="green" />
        <SummaryCard label="Rejected" value={summary.rejected} icon={XOctagon} color="red" />
        <SummaryCard
          label="Total Value"
          value={formatCurrency(summary.totalValue)}
          icon={IndianRupee}
          color="purple"
          small
        />
      </div>

      {/* ---------- Search + Filters ---------- */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
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
              onChange={(v) => { setFilters((f) => ({ ...f, status: v })); resetToFirstPage(); }}
              options={STATUSES}
            />
            <FilterSelect
              label="Customer"
              value={filters.customer}
              onChange={(v) => { setFilters((f) => ({ ...f, customer: v })); resetToFirstPage(); }}
              options={CUSTOMERS}
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

      {/* ---------- Table ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[1000px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {[
                  "QUOTATION #",
                  "CUSTOMER",
                  "OPPORTUNITY",
                  "ISSUE DATE",
                  "VALID UNTIL",
                  "AMOUNT",
                  "STATUS",
                  "CREATED BY",
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
              {pageQuotations.length > 0 ? (
                pageQuotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() =>
                      navigate(`/admin/crm/quotations/${q.id}`)
                    }
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {q.number}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {q.customer}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 max-w-[220px] truncate">
                      {q.opportunity}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(q.issueDate)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(q.validUntil)}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(q.amount, q.currency)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
                          q.status,
                        )}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {q.createdBy}
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
                        <IconBtn
                          icon={FileDown}
                          color="text-gray-500"
                          title="Download PDF"
                          onClick={() => handleDownloadPdf(q)}
                        />
                        <IconBtn
                          icon={Send}
                          color="text-indigo-500"
                          title="Send"
                          onClick={() => handleSendClick(q)}
                          disabled={q.status === "Accepted" || q.status === "Rejected"}
                        />
                        <IconBtn
                          icon={Check}
                          color="text-green-600"
                          title="Mark Accepted"
                          onClick={() => handleMarkAccepted(q)}
                          disabled={q.status === "Accepted" || q.status === "Rejected"}
                        />
                        <IconBtn
                          icon={XCircle}
                          color="text-red-500"
                          title="Mark Rejected"
                          onClick={() => handleMarkRejected(q)}
                          disabled={q.status === "Accepted" || q.status === "Rejected"}
                        />
                        <IconBtn
                          icon={Copy}
                          color="text-teal-500"
                          title="Duplicate"
                          onClick={() => handleDuplicate(q)}
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
                    colSpan={9}
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

      {/* ---------- Pagination ---------- */}
      {totalFiltered > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalFiltered}
          itemsPerPage={perPage}
        />
      )}

      {/* ---------- Delete confirm ---------- */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Quotation"
        message={`Are you sure you want to delete ${pendingDelete?.number}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ---------- Send modal ---------- */}
      <SendQuotationModal
        isOpen={sendOpen}
        onClose={() => {
          setSendOpen(false);
          setPendingSend(null);
        }}
        quotation={pendingSend}
        onSend={handleSendConfirm}
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
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div
        className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}
      >
        {value}
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

export default Quotations;