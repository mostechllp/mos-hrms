import React, { useState } from "react";
import {
  AlertTriangle, X, Search, ArrowRight, ArrowLeft, Filter,
  FileText, Wand2, Layers,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

/* ---------- primitives ---------- */

const Surface = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

/* ---------- page ---------- */

const BulkUpdatePage = () => {
  const [view, setView] = useState("initial"); // 'initial' | 'filtered'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    account: "",
    contact: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);

  const accountOptions = [
    "Employee Advance", "Accounts Payable", "Cash", "Bank", "Petty Cash", "Sales",
  ];
  const contactOptions = ["LocalFix", "Mrs. sss www", "Acme Corp"];

  const handleFilterChange = (field, value) =>
    setFilterData((prev) => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    setAppliedFilters(filterData);
    setIsFilterModalOpen(false);
    setView("filtered");
  };

  const handleReset = () => {
    setFilterData({
      account: "", contact: "", startDate: "", endDate: "", minAmount: "", maxAmount: "",
    });
    setAppliedFilters(null);
    setView("initial");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Accountant
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Bulk update accounts in transactions
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Re-account invoices, bills, expenses and more in one pass
            </p>
          </div>

          {view === "filtered" && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={13} /> Start over
            </button>
          )}
        </header>

        {/* ---- INITIAL STATE ---- */}
        {view === "initial" && (
          <div className="space-y-4">
            <Surface className="py-16 px-6">
              <div className="max-w-lg mx-auto text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Layers size={22} className="text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Bulk update accounts in transactions
                </h2>
                <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                  Filter transactions — invoices, credit notes, purchase orders,
                  expenses, bills, vendor credits — and bulk-update their accounts
                  with a new account.
                </p>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Filter size={13} /> Filter and bulk update
                </button>
              </div>

              <div className="mt-10 max-w-lg mx-auto space-y-2">
                {[
                  "Target a specific account and optional contact",
                  "Narrow further by date range or amount range",
                  "Review matches before applying the change",
                ].map((b) => (
                  <div
                    key={b}
                    className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300"
                  >
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </Surface>

            {/* Warning card */}
            <Surface className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-[12.5px] text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Bulk-updating accounts in transactions will cause significant
                      changes to your financial data.
                    </span>{" "}
                    We recommend doing this with the assistance of an accountant.
                  </p>
                </div>
              </div>
            </Surface>
          </div>
        )}

        {/* ---- FILTERED RESULTS ---- */}
        {view === "filtered" && (
          <div className="space-y-4">

            {/* Applied filters */}
            <Surface className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <SectionLabel>Filtered based on</SectionLabel>
                  <div className="space-y-1 text-[12.5px] text-slate-700 dark:text-slate-200">
                    <p>
                      <span className="text-slate-500">Account name: </span>
                      <span className="font-medium">
                        {appliedFilters?.account || "All"}
                      </span>
                    </p>
                    {appliedFilters?.contact && (
                      <p>
                        <span className="text-slate-500">Contact: </span>
                        <span className="font-medium">{appliedFilters.contact}</span>
                      </p>
                    )}
                    {(appliedFilters?.startDate || appliedFilters?.endDate) && (
                      <p>
                        <span className="text-slate-500">Date range: </span>
                        <span className="font-medium tabular-nums">
                          {appliedFilters.startDate || "…"} →{" "}
                          {appliedFilters.endDate || "…"}
                        </span>
                      </p>
                    )}
                    {(appliedFilters?.minAmount || appliedFilters?.maxAmount) && (
                      <p>
                        <span className="text-slate-500">Amount range: </span>
                        <span className="font-medium tabular-nums">
                          {appliedFilters.minAmount || "0"} →{" "}
                          {appliedFilters.maxAmount || "∞"}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  Change filter <ArrowRight size={13} />
                </button>
              </div>
            </Surface>

            {/* Empty results */}
            <Surface className="py-16 px-6">
              <div className="max-w-md mx-auto text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FileText size={22} className="text-slate-400" />
                </div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  No transactions found
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-1.5">
                  No invoices, credit notes, purchase orders, expenses, bills, or
                  vendor credits matched this filter. Try changing the criteria.
                </p>
              </div>
            </Surface>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleReset}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Go back
              </button>
              <button
                disabled
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- FILTER MODAL ---- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Filter
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Filter transactions
                </h2>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
              <p className="text-[12.5px] text-slate-500">
                Select an account and enter your ranges to filter your transactions.
              </p>

              <Field label="Account" required>
                <select
                  className={inputCls}
                  value={filterData.account}
                  onChange={(e) => handleFilterChange("account", e.target.value)}
                >
                  <option value="">Select an account</option>
                  {accountOptions.map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </Field>

              <Field label="Contact">
                <select
                  className={inputCls}
                  value={filterData.contact}
                  onChange={(e) => handleFilterChange("contact", e.target.value)}
                >
                  <option value="">Select contact</option>
                  {contactOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Date range">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className={`${inputCls} tabular-nums`}
                    value={filterData.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                  <span className="text-slate-400 text-[12px] shrink-0">–</span>
                  <input
                    type="date"
                    className={`${inputCls} tabular-nums`}
                    value={filterData.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Total amount range">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className={`${inputCls} tabular-nums`}
                    value={filterData.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  />
                  <span className="text-slate-400 text-[12px] shrink-0">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className={`${inputCls} tabular-nums`}
                    value={filterData.maxAmount}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  />
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                disabled={!filterData.account}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={13} /> Search
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BulkUpdatePage;