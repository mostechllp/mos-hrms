// src/admin/pages/accounts/ExpensesPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteExpense } from "../../store/slices/accounts/expensesSlice";
import {
  Plus, ArrowUpDown, Download, Upload,
  Search,
  Eye, Edit2, Trash2, X, RefreshCw, Printer,
  FileText, CheckCircle2, UploadCloud, CloudUpload, Receipt,
  Columns,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";

/* ---------- primitives ---------- */

const ALL_COLUMNS = [
  { id: "expenseAccount", label: "Expense account", locked: true },
  { id: "date", label: "Date" },
  { id: "vendor", label: "Vendor" },
  { id: "amount", label: "Amount" },
  { id: "paidThrough", label: "Paid through" },
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

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const ExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expenses = useSelector((s) => s.expenses.expenses) || [];

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(false);

  // Filter & Sort State
  const [billableFilter, setBillableFilter] = useState("all");
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
  const processedExpenses = useMemo(() => {
    let result = expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.expenseAccount?.toLowerCase().includes(q) ||
        (e.vendor && e.vendor.toLowerCase().includes(q));

      const isBillable = !!(e.isBillable || e.customerName);
      const matchesBillable =
        billableFilter === "all" ||
        (billableFilter === "billable" && isBillable) ||
        (billableFilter === "non-billable" && !isBillable);

      return matchesSearch && matchesBillable;
    });

    result.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, searchQuery, billableFilter, sortBy]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteExpense(deleteTarget.id));
      if (selectedExpense?.id === deleteTarget.id) setSelectedExpense(null);
      setDeleteTarget(null);
    }
  };

  const total = expenses.length;
  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const billable = expenses.filter((e) => e.isBillable || e.customerName).length;

  const hasActiveFilters = billableFilter !== "all";

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Expenses" value={total} icon="fas fa-receipt" color="green" />
        <MiniStat label="This Month" value={thisMonth} icon="fas fa-calendar-day" color="blue" />
        <MiniStat label="Billable" value={billable} icon="fas fa-file-invoice-dollar" color="violet" />
        <MiniStat
          label="Total Amount"
          value={`₹${totalAmount.toFixed(2)}`}
          icon="fas fa-indian-rupee-sign"
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Expenses
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No expenses recorded yet"
              : `${total} ${total === 1 ? "expense" : "expenses"} recorded`}
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
            onClick={() => navigate("/admin/accounts/purchases/expenses/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Expense
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/expenses/new")} />
      ) : (
        <Card className="overflow-hidden">

          {/* 🌟 UNIFIED TOOLBAR ROW 🌟 */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses…"
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

              {/* Billable Filter */}
              <select
                value={billableFilter}
                onChange={(e) => setBillableFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Billable: Any</option>
                <option value="billable">Billable</option>
                <option value="non-billable">Non-billable</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => setBillableFilter("all")}
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
                    {visibleColumns.expenseAccount && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          Expense account <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.date && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    )}
                    {visibleColumns.vendor && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Vendor</th>
                    )}
                    {visibleColumns.amount && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                    )}
                    {visibleColumns.paidThrough && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Paid through</th>
                    )}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {processedExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No expenses match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    processedExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowPdfView(false);
                        }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.expenseAccount && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExpense(expense);
                                setShowPdfView(false);
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {expense.expenseAccount}
                            </button>
                          </td>
                        )}

                        {visibleColumns.date && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {expense.date}
                          </td>
                        )}

                        {visibleColumns.vendor && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {expense.vendor || (
                              <span className="text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </td>
                        )}

                        {visibleColumns.amount && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            ₹{expense.amount.toFixed(2)}
                          </td>
                        )}

                        {visibleColumns.paidThrough && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {expense.paidThrough}
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
                                setSelectedExpense(expense);
                                setShowPdfView(false);
                              }}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/expenses/edit/${expense.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(expense)}
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
      {selectedExpense && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedExpense(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedExpense.expenseAccount}
                </h2>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
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
                    navigate(`/admin/accounts/purchases/expenses/edit/${selectedExpense.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={RefreshCw} label="Make recurring" />
                <GhostAction icon={Printer} label="PDF / Print" />
              </div>

              {/* Summary + upload */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                <Card className="p-4 space-y-4">
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Amount
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                      ₹{selectedExpense.amount.toFixed(2)}
                    </p>
                    <p className="text-[11.5px] text-gray-500 mt-1">
                      on {selectedExpense.date}
                    </p>
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                      Non-billable
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24">
                        Account
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 text-[11.5px] font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {selectedExpense.expenseAccount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24">
                        Paid through
                      </span>
                      <span className="text-xs md:text-[12.5px] text-gray-800 dark:text-gray-200">
                        {selectedExpense.paidThrough}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Receipt upload */}
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
                    <CloudUpload size={20} className="text-white" />
                  </div>
                  <p className="text-xs md:text-[12.5px] font-medium text-gray-800 dark:text-gray-200 mb-0.5">
                    Upload receipts
                  </p>
                  <p className="text-[11px] text-gray-500 mb-3">Max file size 10 MB</p>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <UploadCloud size={12} /> Choose files
                  </button>
                </div>
              </div>

              {/* PDF toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-gray-500">Preview as PDF</span>
                <button
                  onClick={() => setShowPdfView(!showPdfView)}
                  className={`w-8 rounded-full relative transition-colors ${
                    showPdfView ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  style={{ height: 18 }}
                  aria-pressed={showPdfView}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform ${
                      showPdfView ? "translate-x-3.5" : ""
                    }`}
                    style={{ width: 14, height: 14 }}
                  />
                </button>
              </div>

              {/* PDF preview */}
              {showPdfView && <ExpensePreview expense={selectedExpense} />}

              {/* Journal */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Journal</SectionLabel>
                  <span className="inline-flex items-center px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider bg-green-500 text-white rounded-full">
                    INR
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs md:text-[12px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                        <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                          Account
                        </th>
                        <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                          Debit
                        </th>
                        <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                          {selectedExpense.paidThrough}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">0.00</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {selectedExpense.amount.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                          {selectedExpense.expenseAccount}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {selectedExpense.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">0.00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2.5"></td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                          {selectedExpense.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                          {selectedExpense.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
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
        title="Delete expense"
        message={`Are you sure you want to delete this expense of ₹${deleteTarget?.amount}? This action cannot be undone.`}
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText, label: "Expense incurred" },
    { icon: RefreshCw, label: "Record expense" },
    { icon: FileText, label: "Billable → Invoice" },
    { icon: CheckCircle2, label: "Reimbursed", tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Receipt size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Time to manage your expenses
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Create and manage expenses that are part of your organization's
          operating costs.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Record expense
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle of an expense</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && (
                <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Record a single expense or add many in bulk",
          "Track mileage with automatic rate calculation",
          "Convert billable expenses into invoices",
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

const ExpensePreview = ({ expense }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl relative text-gray-800 dark:text-gray-200 shadow-soft">
    <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full">
      Non-billable
    </div>

    <div className="text-[11.5px] space-y-0.5 mb-6">
      <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
      <p className="text-gray-500">Keralam</p>
      <p className="text-gray-500">India</p>
      <p className="text-gray-500">fidh3549@gmail.com</p>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">
        Expense
      </h1>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 space-y-2 text-[11.5px]">
        <ReceiptRow label="Expense date" value={expense.date} />
        <ReceiptRow label="Expense account" value={expense.expenseAccount} />
        <ReceiptRow label="Currency" value="INR" />
        <ReceiptRow label="Paid through" value={expense.paidThrough} />
      </div>
      <div className="bg-green-500 text-white rounded-xl px-3 py-3 flex flex-col justify-center text-center">
        <p className="text-[9.5px] uppercase tracking-wider opacity-90 mb-0.5">
          Amount
        </p>
        <p className="text-lg font-bold tabular-nums">
          ₹{expense.amount.toFixed(2)}
        </p>
      </div>
    </div>

    <div className="mt-10 flex justify-end text-[10.5px] text-gray-500">
      <div className="text-center">
        <div className="w-40 h-px bg-gray-300 dark:bg-gray-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
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

export default ExpensesPage;