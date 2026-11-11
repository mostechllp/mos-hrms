import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteExpense } from "../../store/slices/accounts/expensesSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, RefreshCw, Printer,
  FileText, CheckCircle2, UploadCloud, CloudUpload, Receipt,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}>
      <Icon size={15} />
    </button>
  );
};

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const ExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expenses = useSelector((s) => s.expenses.expenses) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredExpenses = expenses.filter(
    (e) =>
      e.expenseAccount?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteExpense(deleteTarget.id));
      if (selectedExpense?.id === deleteTarget.id) setSelectedExpense(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Expenses
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {expenses.length === 0
                ? "No expenses recorded yet"
                : `${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"} recorded`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/expenses/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={ArrowUpDown} label="Sort by" />
                  <MenuItem icon={Download}   label="Import" />
                  <MenuItem icon={Upload}     label="Export" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings}   label="Preferences" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {expenses.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/expenses/new")} />
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label="Select all" />

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Expense account <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Paid through</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No expenses match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      onClick={() => { setSelectedExpense(expense); setShowPdfView(false); }}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${expense.expenseAccount}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {expense.expenseAccount}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{expense.date}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {expense.vendor || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{expense.amount.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{expense.paidThrough}</td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedExpense(expense); setShowPdfView(false); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/expenses/edit/${expense.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(expense)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      {/* ---- Drawer ---- */}
      {selectedExpense && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedExpense(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expense</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedExpense.expenseAccount}
                </h2>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

              {/* Actions row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/expenses/edit/${selectedExpense.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={RefreshCw} label="Make recurring" />
                <GhostAction icon={Printer}   label="PDF / Print" />
              </div>

              {/* Summary + upload */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                <Surface className="p-4 space-y-4">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Amount</p>
                    <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                      ₹{selectedExpense.amount.toFixed(2)}
                    </p>
                    <p className="text-[11.5px] text-slate-500 mt-1">on {selectedExpense.date}</p>
                    <span className="inline-flex items-center mt-2 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                      Non-billable
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider w-24">Account</span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[11.5px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                        {selectedExpense.expenseAccount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider w-24">Paid through</span>
                      <span className="text-[12.5px] text-slate-800 dark:text-slate-200">{selectedExpense.paidThrough}</span>
                    </div>
                  </div>
                </Surface>

                {/* Receipt upload */}
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-5 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center mb-3">
                    <CloudUpload size={20} className="text-white dark:text-slate-900" />
                  </div>
                  <p className="text-[12.5px] font-medium text-slate-800 dark:text-slate-200 mb-0.5">Upload receipts</p>
                  <p className="text-[11px] text-slate-500 mb-3">Max file size 10 MB</p>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <UploadCloud size={12} /> Choose files
                  </button>
                </div>
              </div>

              {/* PDF toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-slate-500">Preview as PDF</span>
                <button
                  onClick={() => setShowPdfView(!showPdfView)}
                  className={`w-8 rounded-full relative transition-colors ${showPdfView ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"}`}
                  style={{ height: 18 }}
                  aria-pressed={showPdfView}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-slate-900 rounded-full transition-transform ${showPdfView ? "translate-x-3.5" : ""}`} style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* PDF preview */}
              {showPdfView && <ExpensePreview expense={selectedExpense} />}

              {/* Journal */}
              <Surface className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Journal</SectionLabel>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider bg-emerald-600 text-white rounded">
                    INR
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                        <th className="text-left  font-medium px-3 py-2">Account</th>
                        <th className="text-right font-medium px-3 py-2">Debit</th>
                        <th className="text-right font-medium px-3 py-2">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{selectedExpense.paidThrough}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">0.00</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{selectedExpense.amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{selectedExpense.expenseAccount}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{selectedExpense.amount.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">0.00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 dark:border-slate-800">
                        <td className="px-3 py-2.5"></td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{selectedExpense.amount.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{selectedExpense.amount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Surface>
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Expense incurred" },
    { icon: RefreshCw,    label: "Record expense" },
    { icon: FileText,     label: "Billable → Invoice" },
    { icon: CheckCircle2, label: "Reimbursed",  tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Time to manage your expenses
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Create and manage expenses that are part of your organization's operating costs.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Record expense
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle of an expense</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
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
          <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800",
    pos:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

const ExpensePreview = ({ expense }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-2xl relative text-slate-800 dark:text-slate-200">
    <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
      Non-billable
    </div>

    <div className="text-[11.5px] space-y-0.5 mb-6">
      <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
      <p className="text-slate-500">Keralam</p>
      <p className="text-slate-500">India</p>
      <p className="text-slate-500">fidh3549@gmail.com</p>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Expense</h1>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 space-y-2 text-[11.5px]">
        <ReceiptRow label="Expense date"    value={expense.date} />
        <ReceiptRow label="Expense account" value={expense.expenseAccount} />
        <ReceiptRow label="Currency"        value="INR" />
        <ReceiptRow label="Paid through"    value={expense.paidThrough} />
      </div>
      <div className="bg-emerald-600 text-white rounded-md px-3 py-3 flex flex-col justify-center text-center">
        <p className="text-[9.5px] uppercase tracking-wider opacity-90 mb-0.5">Amount</p>
        <p className="text-lg font-semibold tabular-nums">₹{expense.amount.toFixed(2)}</p>
      </div>
    </div>

    <div className="mt-10 flex justify-end text-[10.5px] text-slate-500">
      <div className="text-center">
        <div className="w-40 h-px bg-slate-300 dark:bg-slate-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>
  </div>
);

const ReceiptRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default ExpensesPage;