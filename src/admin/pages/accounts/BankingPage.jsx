import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBankAccount } from "../../store/slices/accounts/bankingSlice";
import {
  Plus, ChevronDown, X, Building2, CreditCard, Wallet, Landmark,
  ShieldCheck, Trash2, Calendar, TrendingUp,
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

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const StatCard = ({ icon: Icon, label, value, tone = "default" }) => {
  const tones = {
    default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    pos: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    neg: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
      </div>
    </div>
  );
};

/* ---------- page ---------- */

const BankingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.banking.accounts);

  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteBankAccount(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete account.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accounts</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              {accounts.length === 0 ? "Banking" : "Banking Overview"}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {accounts.length === 0
                ? "Connect your bank and credit cards to get started"
                : `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"} connected`}
            </p>
          </div>

          {accounts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/accounts/banking/new")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> Add account
              </button>
              <GhostBtn className="!px-3 border border-slate-200 dark:border-slate-800">
                Manage rules
              </GhostBtn>
              <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800">
                <ChevronDown size={14} />
              </GhostBtn>
            </div>
          )}
        </header>

        {/* ---- Empty state ---- */}
        {accounts.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Landmark size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Stay on top of your money
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Connect your bank and credit cards to fetch all your transactions. Create, categorize and match these transactions to those you have in your books.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsConnectDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <ShieldCheck size={13} /> Connect bank
                </button>
                <button
                  onClick={() => navigate("/admin/accounts/banking/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus size={13} /> Add manually
                </button>
              </div>
            </div>

            <div className="mt-12 max-w-md mx-auto space-y-2">
              {[
                "Fetch transactions from supported banks",
                "Categorize and match transactions automatically",
                "Reconcile bank balances with your books",
              ].map((b) => (
                <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </Surface>
        ) : (
          <div className="space-y-4">

            {/* ---- Summary + chart ---- */}
            <Surface>
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  All accounts
                </h2>
                <GhostBtn className="border border-slate-200 dark:border-slate-800">
                  <Calendar size={13} /> Last 30 days <ChevronDown size={13} />
                </GhostBtn>
              </div>

              <div className="px-5 sm:px-6 py-5">
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-6">
                  <StatCard icon={Wallet} label="Cash in hand" value="₹-888.00" tone="neg" />
                  <StatCard icon={Landmark} label="Bank balance" value="₹0.00" tone="pos" />
                </div>

                <div className="relative h-56 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 pb-6 tabular-nums">
                    <span>0</span><span>-200</span><span>-400</span><span>-600</span><span>-800</span>
                  </div>
                  <svg className="w-full h-full pl-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0 50 L 80 50 Q 90 50 95 80 L 100 80" fill="none" stroke="#10B981" strokeWidth="1.5" />
                    <path d="M 0 50 L 75 50 Q 85 50 90 70 L 100 90" fill="none" stroke="#6B7280" strokeWidth="1.5" />
                  </svg>
                  <div className="absolute bottom-0 left-10 w-full flex justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2">
                    {["01 Oct","03 Oct","05 Oct","07 Oct","09 Oct","11 Oct","13 Oct","15 Oct","17 Oct","19 Oct","21 Oct","23 Oct","25 Oct","27 Oct","29 Oct"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-500 rounded-sm" /> Cash in hand</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-sm" /> Bank balance</div>
                </div>
              </div>
            </Surface>

            {/* ---- Active accounts table ---- */}
            <Surface className="overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Active accounts
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] whitespace-nowrap">
                  <thead>
                    <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-5 sm:px-6 py-2.5 text-left font-medium">Account</th>
                      <th className="px-4 py-2.5 text-right font-medium">Uncategorized</th>
                      <th className="px-4 py-2.5 text-right font-medium">Pending checks</th>
                      <th className="px-4 py-2.5 text-right font-medium">Amount in bank</th>
                      <th className="px-4 py-2.5 text-right font-medium">Amount in books</th>
                      <th className="px-4 py-2.5 text-right font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {accounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 group-hover:border-blue-400 transition-colors">
                              {acc.type === "Cash" ? <Wallet size={15} /> : <Building2 size={15} />}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {acc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500 tabular-nums">—</td>
                        <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500 tabular-nums">—</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{Number(acc.amountInBank).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{Number(acc.amountInBooks).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(acc); }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                              title="Delete account"
                              aria-label="Delete account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          </div>
        )}
      </div>

      {/* ---- Connect drawer ---- */}
      {isConnectDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity" onClick={() => setIsConnectDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Connect</p>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                    Bank accounts & credit cards
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsConnectDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              <p className="text-[12.5px] text-slate-500 leading-relaxed">
                Connect your bank accounts to fetch bank feeds using one of our third-party providers. Or add your bank accounts manually and import feeds.
              </p>

              <Surface className="p-4 flex flex-wrap items-center gap-4">
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 w-32 shrink-0">
                  Partner banks
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "standard chartered", cls: "text-blue-800 dark:text-blue-300" },
                    { label: "HSBC", cls: "text-red-600 dark:text-red-400" },
                    { label: "kotak", cls: "text-red-600 dark:text-red-400" },
                    { label: "SBI", cls: "text-blue-600 dark:text-blue-400" },
                    { label: "AXIS BANK", cls: "text-purple-800 dark:text-purple-300" },
                  ].map((b) => (
                    <div key={b.label} className={`h-8 bg-slate-100 dark:bg-slate-800 rounded-md px-2.5 flex items-center text-[11px] font-bold ${b.cls}`}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </Surface>

              <Surface>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-0.5">
                      Automatic bank feeds
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      Connect your bank accounts and fetch feeds via a third-party provider.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0">
                    Connect now
                  </button>
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { name: "PayPal", icon: <div className="text-blue-700 dark:text-blue-400 font-bold italic text-[11px]">PayPal</div> },
                      { name: "ICICI Bank (India)", icon: <div className="w-6 h-6 bg-orange-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold">i</div> },
                      { name: "HDFC Bank (India)", icon: <div className="w-6 h-6 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">H</div> },
                      { name: "State Bank of India", icon: <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">S</div> },
                      { name: "Kotak Mahindra Bank", icon: <div className="w-6 h-6 bg-blue-800 rounded-full text-white text-[10px] flex items-center justify-center font-bold">K</div> },
                      { name: "Axis Bank (India)", icon: <div className="w-6 h-6 bg-red-800 rounded text-white text-[10px] flex items-center justify-center font-bold">A</div> },
                      { name: "HDFC Bank — Credit", icon: <div className="w-6 h-6 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">H</div>, isCc: true },
                      { name: "SBI — Credit", icon: <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">S</div>, isCc: true },
                      { name: "American Express", icon: <div className="w-6 h-6 bg-blue-400 rounded text-white text-[10px] flex items-center justify-center font-bold">Am</div>, isCc: true },
                    ].map((bank, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        {bank.icon}
                        <span className="text-[12px] text-slate-800 dark:text-slate-200 font-medium truncate">{bank.name}</span>
                        {bank.isCc && (
                          <div className="ml-auto w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] shrink-0">↻</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11.5px] text-slate-500">
                    <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <CreditCard size={11} />
                    </div>
                    <span>Credit card</span>
                  </div>
                </div>
              </Surface>

              <Surface className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-1 flex items-center gap-2">
                    <Building2 size={15} className="text-blue-500 dark:text-blue-400" />
                    Add manually
                  </h3>
                  <p className="text-[12px] text-slate-500 max-w-2xl">
                    Can't connect your bank or card via a provider? Add the account manually using your account details.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/accounts/banking/new")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Plus size={13} /> Add account
                </button>
              </Surface>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={handleDeleteConfirm}
        title="Delete bank account"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting account, please wait..."
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BankingPage;