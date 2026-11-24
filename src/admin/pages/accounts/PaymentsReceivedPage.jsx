// src/admin/pages/accounts/PaymentsReceivedPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updatePaymentStatus, deletePayment } from "../../store/slices/accounts/paymentsReceivedSlice";
import {
  Plus, ArrowUpDown, Download, Upload,
  Search, Filter,
  Eye, Edit2, Trash2, X, Printer, CheckCircle2,
  CreditCard, Landmark, Wallet, FileText, Banknote,
  Columns,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";

/* ---------- primitives ---------- */

const ALL_COLUMNS = [
  { id: "paymentNumber", label: "Payment #", locked: true },
  { id: "customerName", label: "Customer" },
  { id: "paymentDate", label: "Date" },
  { id: "paymentMode", label: "Mode" },
  { id: "amountReceived", label: "Amount received" },
  { id: "status", label: "Status" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "amount_asc", label: "Lowest Amount" },
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

const StatusPill = ({ status }) => {
  const styles = {
    Draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    Paid:  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    <span
      className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-semibold whitespace-nowrap capitalize ${styles[status] || styles.Draft}`}
    >
      {status}
    </span>
  );
};

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const PaymentsReceivedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const payments = useSelector((s) => s.paymentsReceived.payments) || [];

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Column Customization State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  const toggleColumn = (id) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtering & Sorting Logic
  const processedPayments = useMemo(() => {
    let result = payments.filter((p) => {
      const matchesSearch =
        p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.paymentDate) - new Date(a.paymentDate);
      if (sortBy === "date_asc") return new Date(a.paymentDate) - new Date(b.paymentDate);
      if (sortBy === "amount_desc") return b.amountReceived - a.amountReceived;
      if (sortBy === "amount_asc") return a.amountReceived - b.amountReceived;
      return 0;
    });

    return result;
  }, [payments, searchQuery, statusFilter, sortBy]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deletePayment(deleteTarget.id));
      if (selectedPayment?.id === deleteTarget.id) setSelectedPayment(null);
      setDeleteTarget(null);
    }
  };

  const handleMarkAsPaid = () => {
    if (selectedPayment) {
      dispatch(updatePaymentStatus({ id: selectedPayment.id, status: "Paid" }));
      setSelectedPayment({ ...selectedPayment, status: "Paid" });
    }
  };

  const total = payments.length;
  const paid = payments.filter((p) => p.status === "Paid").length;
  const drafts = payments.filter((p) => p.status === "Draft").length;
  const totalAmount = payments.reduce((s, p) => s + (p.amountReceived || 0), 0);

  const hasActiveFilters = statusFilter !== "all";

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Payments" value={total} icon="fas fa-receipt" color="green" />
        <MiniStat label="Paid" value={paid} icon="fas fa-check-circle" color="blue" />
        <MiniStat label="Drafts" value={drafts} icon="fas fa-pen-to-square" color="amber" />
        <MiniStat
          label="Total Received"
          value={`₹${totalAmount.toFixed(2)}`}
          icon="fas fa-indian-rupee-sign"
          color="green"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Payments Received
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No payments received yet"
              : `${total} ${total === 1 ? "payment" : "payments"} recorded`}
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
            onClick={() => navigate("/admin/accounts/sales/payments/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Payment
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onGoToInvoices={() => navigate("/admin/accounts/sales/invoices")} />
      ) : (
        <Card className="overflow-hidden">

          {/* 🌟 UNIFIED TOOLBAR ROW 🌟 */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments…"
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

            {/* Inline Filters & Sort */}
            <div className="flex flex-wrap items-center gap-2 flex-1">

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Status: Any</option>
                <option value="Draft">Draft</option>
                <option value="Paid">Paid</option>
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
                    {visibleColumns.paymentNumber && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          Payment # <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.customerName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                    )}
                    {visibleColumns.paymentDate && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    )}
                    {visibleColumns.paymentMode && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Mode</th>
                    )}
                    {visibleColumns.amountReceived && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount received</th>
                    )}
                    {visibleColumns.status && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    )}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {processedPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No payments match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    processedPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.paymentNumber && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPayment(payment);
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {payment.paymentNumber}
                            </button>
                          </td>
                        )}

                        {visibleColumns.customerName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {payment.customerName}
                          </td>
                        )}

                        {visibleColumns.paymentDate && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {payment.paymentDate}
                          </td>
                        )}

                        {visibleColumns.paymentMode && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {payment.paymentMode}
                          </td>
                        )}

                        {visibleColumns.amountReceived && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            ₹{payment.amountReceived.toFixed(2)}
                          </td>
                        )}

                        {visibleColumns.status && (
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <StatusPill status={payment.status} />
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
                              onClick={() => setSelectedPayment(payment)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/sales/payments/edit/${payment.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(payment)}
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
        </Card>
      )}

      {/* 🌟 REUSABLE CUSTOMIZE COLUMNS MODAL 🌟 */}
      <CustomizeColumnsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      {/* ---- Drawer ---- */}
      {selectedPayment && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedPayment(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Payment received
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                    {selectedPayment.paymentNumber}
                  </h2>
                  <StatusPill status={selectedPayment.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    navigate(`/admin/accounts/sales/payments/edit/${selectedPayment.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Printer} label="PDF / Print" />
                {selectedPayment.status === "Draft" && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 size={13} /> Mark as paid
                  </button>
                )}
              </div>

              {/* Draft banner */}
              {selectedPayment.status === "Draft" && (
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
                        Mark the payment as paid to confirm that it has been
                        received.
                      </p>
                      <button
                        onClick={handleMarkAsPaid}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                      >
                        <CheckCircle2 size={12} /> Mark as paid
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              <PaymentReceipt payment={selectedPayment} />

              {/* Deposit info */}
              <Card className="p-4">
                <SectionLabel>More information</SectionLabel>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-[12.5px]">
                  <span className="text-gray-500">Deposit to</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {selectedPayment.depositTo}
                  </span>
                </div>
              </Card>

              {/* Journal */}
              <Card className="p-4">
                <SectionLabel>Journal</SectionLabel>
                <p className="text-xs md:text-[12.5px] text-gray-500 leading-relaxed">
                  Journal entries will not be available for payments in the{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedPayment.status}
                  </span>{" "}
                  state.
                </p>
              </Card>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete payment"
        message={`Are you sure you want to delete payment "${deleteTarget?.paymentNumber}"? This action cannot be undone.`}
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

const EmptyState = ({ onGoToInvoices }) => {
  const channels = [
    { icon: Wallet, label: "PayPal" },
    { icon: CreditCard, label: "Card" },
    { icon: Landmark, label: "Bank" },
    { icon: FileText, label: "Manual" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Banknote size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          No payments received yet
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Payments will appear once your customers pay their invoices.
        </p>
        <button
          onClick={onGoToInvoices}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          Go to unpaid invoices
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Payment lifecycle</SectionLabel>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <LifeStep icon={FileText} label="Initial request" tone="accent" />
          <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
          <LifeStep icon={FileText} label="Reminders" />
          <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
          {channels.map((c, i) => (
            <React.Fragment key={c.label}>
              <LifeStep icon={c.icon} label={c.label} tone="accent" />
              {i < channels.length - 1 && (
                <span className="text-gray-300 dark:text-gray-700 text-xs">·</span>
              )}
            </React.Fragment>
          ))}
          <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
          <LifeStep icon={CheckCircle2} label="Payment received" tone="pos" />
        </div>

        <p className="text-center text-[11.5px] text-gray-500 mt-4">
          Received via{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Client portal
          </span>{" "}
          or manually recorded
        </p>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Automatically charge cards for recurring invoices",
          "Configure gateways to accept online payments",
          "Record offline payments and send receipts",
        ].map((b) => (
          <div
            key={b}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    pos: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    accent:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium ${tones[tone || "default"]}`}
    >
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

/* ---------- payment receipt ---------- */

const PaymentReceipt = ({ payment }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl relative text-gray-800 dark:text-gray-200 shadow-soft">
    {payment.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full">
        Draft
      </div>
    )}

    <div className="text-[11.5px] space-y-0.5 mb-6">
      <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
      <p className="text-gray-500">Keralam</p>
      <p className="text-gray-500">India</p>
      <p className="text-gray-500">fidh3549@gmail.com</p>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">
        Payment receipt
      </h1>
      <p className="text-[11px] text-gray-500 mt-0.5">#{payment.paymentNumber}</p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 space-y-2 text-[11.5px]">
        <ReceiptRow label="Payment date" value={payment.paymentDate} />
        {payment.reference && (
          <ReceiptRow label="Reference" value={payment.reference} />
        )}
        <ReceiptRow label="Payment mode" value={payment.paymentMode} />
      </div>
      <div className="bg-green-500 text-white rounded-xl px-3 py-3 flex flex-col justify-center text-center">
        <p className="text-[9.5px] uppercase tracking-wider opacity-90 mb-0.5">
          Amount received
        </p>
        <p className="text-lg font-bold tabular-nums">
          ₹{payment.amountReceived.toFixed(2)}
        </p>
      </div>
    </div>

    <div className="mb-6">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Amount in words
      </p>
      <p className="text-[11.5px] italic text-gray-700 dark:text-gray-300">
        Indian Rupee Two Hundred Twenty-Two Only
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Received from
        </p>
        <p className="text-[11.5px] font-medium text-gray-800 dark:text-gray-100">
          {payment.customerName}
        </p>
      </div>
      <div className="text-right flex flex-col justify-end">
        <div className="w-32 h-px bg-gray-300 dark:bg-gray-700 mb-1 ml-auto"></div>
        <p className="text-[9.5px] text-gray-500">Authorized signature</p>
      </div>
    </div>
  </div>
);

const ReceiptRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
  </div>
);

export default PaymentsReceivedPage;