// src/admin/pages/accounts/ChartOfAccountsPage.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAccount } from "../../store/slices/accounts/chartOfAccountsSlice";
import {
  Plus, ChevronDown, Search, Settings, UserPlus, X,
  MessageSquare, Edit2, FileText, BookOpen,
  Book, Building2, TrendingUp, TrendingDown
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

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-xs md:text-[13px] text-gray-900 dark:text-gray-100 font-medium">
      {value || "—"}
    </p>
  </div>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    primary:
      "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    warning:
      "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-colors ${tones[tone]}`}
    >
      <Icon size={14} />
    </button>
  );
};

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

  const totalAccounts = accounts.length;
  const assetCount = accounts.filter((a) => a.type?.toLowerCase().includes("asset")).length;
  const incomeCount = accounts.filter((a) => a.type?.toLowerCase().includes("income")).length;
  const expenseCount = accounts.filter((a) => a.type?.toLowerCase().includes("expense")).length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Accounts" value={totalAccounts} icon={Book} color="green" />
        <MiniStat label="Assets" value={assetCount} icon={Building2} color="blue" />
        <MiniStat label="Income" value={incomeCount} icon={TrendingUp} color="violet" />
        <MiniStat label="Expenses" value={expenseCount} icon={TrendingDown} color="amber" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Chart of accounts
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalAccounts === 0
              ? "No accounts yet"
              : `${totalAccounts} ${totalAccounts === 1 ? "account" : "accounts"} in your chart`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn className="border border-gray-200 dark:border-gray-700">
            <UserPlus size={13} /> Find accountants
          </GhostBtn>

          <div className="inline-flex items-stretch rounded-full overflow-hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={13} /> New Account
            </button>
            <button
              className="inline-flex items-center px-2 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 border-l border-white/20 transition-all"
              aria-label="More new options"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          <button
            className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontalIcon />
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {totalAccounts === 0 ? (
        <Card className="py-16 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <BookOpen size={22} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              Build your chart of accounts
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 mb-6">
              Organize every asset, liability, income, and expense into a
              structured chart of accounts.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={14} /> Create account
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
                className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300"
              >
                <div className="w-1 h-1 rounded-full bg-green-500 mt-2 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
              aria-label="Select all"
            />
            <div className="relative ml-auto w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search accounts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Account name</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Account code</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Account type</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Documents</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Parent account</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-xs md:text-[13px] text-gray-500"
                      >
                        No accounts match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setSelectedAccount(acc)}
                      >
                        <td
                          className="px-3 md:px-4 py-2 md:py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select account ${acc.name}`}
                          />
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccount(acc);
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {acc.name}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                          {acc.code || "—"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {acc.type}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-300 dark:text-gray-600">
                          —
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {acc.parent || "—"}
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <IconAction icon={Edit2}    label="Edit"     tone="warning" onClick={() => {}} />
                            <IconAction icon={Settings} label="Settings" onClick={() => {}} />
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

      {/* ---- DETAILS DRAWER ---- */}
      {selectedAccount && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedAccount(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[45%] lg:w-[40%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  {selectedAccount.type}
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedAccount.name}
                </h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconAction icon={MessageSquare} label="Comments" onClick={() => {}} />
                <IconAction icon={Settings}      label="Settings" onClick={() => {}} />
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-1">
              <GhostBtn>
                <Edit2 size={13} /> Edit
              </GhostBtn>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <GhostBtn>More</GhostBtn>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Balance + description */}
              <Card className="px-5 py-5">
                <SectionLabel>Closing balance</SectionLabel>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                  ₹{Number(selectedAccount.balance).toFixed(2)}
                  <span className="text-[11px] font-medium text-gray-500 ml-1.5 align-middle uppercase tracking-wider">
                    Cr
                  </span>
                </p>
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <DetailRow
                    label="Description"
                    value={selectedAccount.description}
                  />
                </div>
              </Card>

              {/* Transactions */}
              <Card className="py-12 px-5">
                <div className="max-w-xs mx-auto text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText size={22} className="text-gray-400" />
                  </div>
                  <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
                    No transactions yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Transactions posted to this account will appear here.
                  </p>
                </div>
              </Card>
            </div>
          </aside>
        </>
      )}

      {/* ---- CREATE ACCOUNT MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Create account
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

                <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.watchlist}
                    onChange={(e) => setField("watchlist", e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                  />
                  Add to the watchlist on my dashboard
                </label>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name}
                  className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon: Icon, color, isMoney }) => {
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
          {Icon && <Icon size={18} className={fg} />}
        </div>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
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