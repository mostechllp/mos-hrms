import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAccount } from "../../store/slices/accounts/chartOfAccountsSlice";
import {
  Plus, ChevronDown, Search, Settings, UserPlus, X,
  MessageSquare, Edit2, FileText, BookOpen, Layers,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

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

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-[13px] text-slate-900 dark:text-slate-100 font-medium">
      {value || "—"}
    </p>
  </div>
);

/* ---------- page ---------- */

const ChartOfAccountsPage = () => {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.chartOfAccounts.accounts);
  const isLoading = useSelector((state) => state.chartOfAccounts.loading);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    type: "Other Asset",
    name: "",
    code: "",
    description: "",
    watchlist: false,
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await dispatch(addAccount(formData)).unwrap();
    setIsModalOpen(false);
    setFormData({
      type: "Other Asset",
      name: "",
      code: "",
      description: "",
      watchlist: false,
    });
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
              Chart of accounts
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {accounts.length === 0
                ? "No accounts yet"
                : `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"} in your chart`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn className="border border-slate-200 dark:border-slate-800">
              <UserPlus size={13} /> Find accountants
            </GhostBtn>

            <div className="inline-flex items-stretch rounded-lg overflow-hidden">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors rounded-l-lg"
              >
                <Plus size={13} /> New
              </button>
              <button
                className="inline-flex items-center px-2 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-l border-white/10 dark:border-slate-900/10 transition-colors rounded-r-lg"
                aria-label="More new options"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800">
              <MoreHorizontalIcon />
            </GhostBtn>
          </div>
        </header>

        {/* ---- Empty / Table ---- */}
        {accounts.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BookOpen size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Build your chart of accounts
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Organize every asset, liability, income, and expense into a
                structured chart of accounts.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> Create account
              </button>
            </div>

            <div className="mt-12 max-w-md mx-auto space-y-2">
              {[
                "Group accounts by type for accurate reporting",
                "Assign codes to keep the chart tidy",
                "Watch key accounts from your dashboard",
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
        ) : (
          <Surface className="overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                aria-label="Select all"
              />
              <div className="relative ml-auto w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search accounts…"
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
                    <th className="px-4 py-2.5 text-left font-medium">Account name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Account code</th>
                    <th className="px-4 py-2.5 text-left font-medium">Account type</th>
                    <th className="px-4 py-2.5 text-left font-medium">Documents</th>
                    <th className="px-4 py-2.5 text-left font-medium">Parent account</th>
                    <th className="px-4 py-2.5 text-right font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-[13px] text-slate-500"
                      >
                        No accounts match “{searchQuery}”
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        onClick={() => setSelectedAccount(acc)}
                      >
                        <td
                          className="px-4 sm:px-5 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                            aria-label={`Select account ${acc.name}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {acc.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {acc.code || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {acc.type}
                        </td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {acc.parent || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Account settings"
                          >
                            <Settings size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      {/* ---- DETAILS DRAWER ---- */}
      {selectedAccount && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedAccount(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[45%] lg:w-[40%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {selectedAccount.type}
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedAccount.name}
                </h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Comments"
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1">
              <GhostBtn>
                <Edit2 size={13} /> Edit
              </GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <GhostBtn>More</GhostBtn>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Balance + description */}
              <Surface className="px-5 py-5">
                <SectionLabel>Closing balance</SectionLabel>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                  ₹{Number(selectedAccount.balance).toFixed(2)}
                  <span className="text-[11px] font-medium text-slate-500 ml-1.5 align-middle uppercase tracking-wider">
                    Cr
                  </span>
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <DetailRow
                    label="Description"
                    value={selectedAccount.description}
                  />
                </div>
              </Surface>

              {/* Transactions */}
              <Surface className="py-12 px-5">
                <div className="max-w-xs mx-auto text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={22} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">
                    No transactions yet
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Transactions posted to this account will appear here.
                  </p>
                </div>
              </Surface>
            </div>
          </aside>
        </>
      )}

      {/* ---- CREATE ACCOUNT MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Create account
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

                <Field label="Account type" required>
                  <select
                    className={inputCls}
                    value={formData.type}
                    onChange={(e) => setField("type", e.target.value)}
                  >
                    <option value="Other Asset">Other Asset</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </Field>

                <Field label="Account name" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    autoFocus
                  />
                </Field>

                <Field label="Account code">
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.code}
                    onChange={(e) => setField("code", e.target.value)}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Max. 500 characters"
                    value={formData.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </Field>

                <label className="inline-flex items-center gap-2 text-[12.5px] text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.watchlist}
                    onChange={(e) => setField("watchlist", e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  Add to the watchlist on my dashboard
                </label>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name}
                  className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving…" : "Save account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

/* Tiny inline helper so the header right rail stays symmetric */
const MoreHorizontalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </svg>
);

export default ChartOfAccountsPage;