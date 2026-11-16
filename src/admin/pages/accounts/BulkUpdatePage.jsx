// src/admin/pages/accounts/BulkUpdatePage.jsx
import React, { useState } from "react";
import {
  AlertTriangle, X, Search, ArrowRight, ArrowLeft, Filter,
  FileText, Layers,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
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
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Target Account" value={appliedFilters?.account || "—"} icon="fas fa-book" color="green" />
        <MiniStat label="Contact" value={appliedFilters?.contact || "All"} icon="fas fa-user" color="blue" />
        <MiniStat
          label="Date Range"
          value={
            appliedFilters?.startDate || appliedFilters?.endDate
              ? "Filtered"
              : "Any"
          }
          icon="fas fa-calendar"
          color="violet"
        />
        <MiniStat
          label="Amount Range"
          value={
            appliedFilters?.minAmount || appliedFilters?.maxAmount
              ? "Filtered"
              : "Any"
          }
          icon="fas fa-indian-rupee-sign"
          color="amber"
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Bulk update accounts
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            Re-account invoices, bills, expenses and more in one pass
          </p>
        </div>

        {view === "filtered" && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft size={13} /> Start over
          </button>
        )}
      </div>

      {/* ---- INITIAL STATE ---- */}
      {view === "initial" && (
        <div className="space-y-4">
          <Card className="py-16 px-6">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Layers size={22} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                Bulk update accounts in transactions
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-6">
                Filter transactions — invoices, credit notes, purchase orders,
                expenses, bills, vendor credits — and bulk-update their accounts
                with a new account.
              </p>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Filter size={14} /> Filter and bulk update
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
                  className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300"
                >
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-2 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Warning card */}
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 leading-relaxed">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Bulk-updating accounts in transactions will cause significant
                    changes to your financial data.
                  </span>{" "}
                  We recommend doing this with the assistance of an accountant.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---- FILTERED RESULTS ---- */}
      {view === "filtered" && (
        <div className="space-y-4">

          {/* Applied filters */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <SectionLabel>Filtered based on</SectionLabel>
                <div className="space-y-1 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200">
                  <p>
                    <span className="text-gray-500">Account name: </span>
                    <span className="font-semibold">
                      {appliedFilters?.account || "All"}
                    </span>
                  </p>
                  {appliedFilters?.contact && (
                    <p>
                      <span className="text-gray-500">Contact: </span>
                      <span className="font-semibold">{appliedFilters.contact}</span>
                    </p>
                  )}
                  {(appliedFilters?.startDate || appliedFilters?.endDate) && (
                    <p>
                      <span className="text-gray-500">Date range: </span>
                      <span className="font-semibold tabular-nums">
                        {appliedFilters.startDate || "…"} →{" "}
                        {appliedFilters.endDate || "…"}
                      </span>
                    </p>
                  )}
                  {(appliedFilters?.minAmount || appliedFilters?.maxAmount) && (
                    <p>
                      <span className="text-gray-500">Amount range: </span>
                      <span className="font-semibold tabular-nums">
                        {appliedFilters.minAmount || "0"} →{" "}
                        {appliedFilters.maxAmount || "∞"}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <GhostBtn
                onClick={() => setIsFilterModalOpen(true)}
                className="border border-gray-200 dark:border-gray-700 shrink-0"
              >
                Change filter <ArrowRight size={13} />
              </GhostBtn>
            </div>
          </Card>

          {/* Empty results */}
          <Card className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText size={22} className="text-gray-400" />
              </div>
              <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
                No transactions found
              </h3>
              <p className="text-xs md:text-[12.5px] text-gray-500 mt-1.5">
                No invoices, credit notes, purchase orders, expenses, bills, or
                vendor credits matched this filter. Try changing the criteria.
              </p>
            </div>
          </Card>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Go back
            </button>
            <button
              disabled
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* ---- FILTER MODAL ---- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Filter
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Filter transactions
                </h2>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
              <p className="text-xs md:text-[12.5px] text-gray-500">
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
                  <span className="text-gray-400 text-xs shrink-0">–</span>
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
                  <span className="text-gray-400 text-xs shrink-0">–</span>
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
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                disabled={!filterData.account}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon, color }) => {
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
        <div className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div className={`text-base md:text-xl font-bold ${fg} tabular-nums truncate`}>
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

export default BulkUpdatePage;