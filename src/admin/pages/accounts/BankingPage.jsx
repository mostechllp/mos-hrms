// src/admin/pages/accounts/BankingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBankAccount } from "../../store/slices/accounts/bankingSlice";
import {
  Plus, ChevronDown, X, Building2, CreditCard, Wallet, Landmark,
  ShieldCheck, Trash2, Calendar,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

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
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

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

const StatCard = ({ icon: Icon, label, value, tone = "default" }) => {
  const tones = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    pos: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    neg: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      </div>
    </div>
  );
};

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
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

  const totalAccounts = accounts?.length || 0;
  const cashInHand = accounts?.reduce(
    (s, a) => s + (a.type === "Cash" ? Number(a.amountInBooks) || 0 : 0),
    0
  ) || 0;
  const bankBalance = accounts?.reduce(
    (s, a) => s + (a.type !== "Cash" ? Number(a.amountInBank) || 0 : 0),
    0
  ) || 0;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Connected Accounts" value={totalAccounts} icon={Building2} color="green" />
        <MiniStat
          label="Cash in hand"
          value={`₹${cashInHand.toFixed(2)}`}
          icon={Wallet}
          color={cashInHand < 0 ? "red" : "blue"}
          isMoney
        />
        <MiniStat
          label="Bank balance"
          value={`₹${bankBalance.toFixed(2)}`}
          icon={Landmark}
          color="violet"
          isMoney
        />
        <MiniStat label="Providers" value={5} icon={ShieldCheck} color="amber" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {totalAccounts === 0 ? "Banking" : "Banking Overview"}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalAccounts === 0
              ? "Connect your bank and credit cards to get started"
              : `${totalAccounts} ${totalAccounts === 1 ? "account" : "accounts"} connected`}
          </p>
        </div>

        {totalAccounts > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/banking/new")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={14} /> Add account
            </button>
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              Manage rules
            </GhostBtn>
            <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700">
              <ChevronDown size={14} />
            </GhostBtn>
          </div>
        )}
      </div>

      {/* ---- Empty state ---- */}
      {totalAccounts === 0 ? (
        <Card className="py-16 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Landmark size={22} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              Stay on top of your money
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 mb-6">
              Connect your bank and credit cards to fetch all your transactions. Create,
              categorize and match these transactions to those you have in your books.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsConnectDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <ShieldCheck size={14} /> Connect bank
              </button>
              <button
                onClick={() => navigate("/admin/accounts/banking/new")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Plus size={14} /> Add manually
              </button>
            </div>
          </div>

          <div className="mt-12 max-w-md mx-auto space-y-2">
            {[
              "Fetch transactions from supported banks",
              "Categorize and match transactions automatically",
              "Reconcile bank balances with your books",
            ].map((b) => (
              <div key={b} className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300">
                <div className="w-1 h-1 rounded-full bg-green-500 mt-2 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">

          {/* ---- Summary + chart ---- */}
          <Card>
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                All accounts
              </h2>
              <GhostBtn className="border border-gray-200 dark:border-gray-700">
                <Calendar size={13} /> Last 30 days <ChevronDown size={13} />
              </GhostBtn>
            </div>

            <div className="px-5 sm:px-6 py-5">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-6">
                <StatCard icon={Wallet} label="Cash in hand" value={`₹${cashInHand.toFixed(2)}`} tone={cashInHand < 0 ? "neg" : "pos"} />
                <StatCard icon={Landmark} label="Bank balance" value={`₹${bankBalance.toFixed(2)}`} tone="pos" />
              </div>

              <div className="relative h-56 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500 pb-6 tabular-nums">
                  <span>0</span><span>-200</span><span>-400</span><span>-600</span><span>-800</span>
                </div>
                <svg className="w-full h-full pl-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 50 L 80 50 Q 90 50 95 80 L 100 80" fill="none" stroke="#10B981" strokeWidth="1.5" />
                  <path d="M 0 50 L 75 50 Q 85 50 90 70 L 100 90" fill="none" stroke="#6B7280" strokeWidth="1.5" />
                </svg>
                <div className="absolute bottom-0 left-10 w-full flex justify-between text-[10px] text-gray-400 dark:text-gray-500 pt-2">
                  {["01 Oct","03 Oct","05 Oct","07 Oct","09 Oct","11 Oct","13 Oct","15 Oct","17 Oct","19 Oct","21 Oct","23 Oct","25 Oct","27 Oct","29 Oct"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-gray-500 rounded-sm" /> Cash in hand</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-sm" /> Bank balance</div>
              </div>
            </div>
          </Card>

          {/* ---- Active accounts table ---- */}
          <Card className="overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                Active accounts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[900px] lg:min-w-0">
                <table className="w-full border-collapse text-xs md:text-[12.5px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-5 sm:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Account</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Uncategorized</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Pending checks</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount in bank</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount in books</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-5 sm:px-6 py-2 md:py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 group-hover:border-green-400 transition-colors">
                              {acc.type === "Cash" ? <Wallet size={15} /> : <Building2 size={15} />}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {acc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-gray-300 dark:text-gray-600 tabular-nums">—</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-gray-300 dark:text-gray-600 tabular-nums">—</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          ₹{Number(acc.amountInBank).toFixed(2)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          ₹{Number(acc.amountInBooks).toFixed(2)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={Trash2}
                              label="Delete account"
                              tone="danger"
                              onClick={() => setDeleteTarget(acc)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---- Connect drawer ---- */}
      {isConnectDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setIsConnectDrawerOpen(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Connect</p>
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                    Bank accounts & credit cards
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsConnectDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              <p className="text-xs md:text-[12.5px] text-gray-500 leading-relaxed">
                Connect your bank accounts to fetch bank feeds using one of our third-party
                providers. Or add your bank accounts manually and import feeds.
              </p>

              <Card className="p-4 flex flex-wrap items-center gap-4">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 w-32 shrink-0">
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
                    <div key={b.label} className={`h-8 bg-gray-100 dark:bg-gray-700 rounded-full px-3 flex items-center text-[11px] font-bold ${b.cls}`}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight mb-0.5">
                      Automatic bank feeds
                    </h3>
                    <p className="text-xs text-gray-500">
                      Connect your bank accounts and fetch feeds via a third-party provider.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all shrink-0">
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
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-green-400 cursor-pointer transition-colors"
                      >
                        {bank.icon}
                        <span className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate">{bank.name}</span>
                        {bank.isCc && (
                          <div className="ml-auto w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] shrink-0">↻</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11.5px] text-gray-500">
                    <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <CreditCard size={11} />
                    </div>
                    <span>Credit card</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight mb-1 flex items-center gap-2">
                    <Building2 size={15} className="text-blue-500 dark:text-blue-400" />
                    Add manually
                  </h3>
                  <p className="text-xs text-gray-500 max-w-2xl">
                    Can't connect your bank or card via a provider? Add the account manually
                    using your account details.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/accounts/banking/new")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shrink-0"
                >
                  <Plus size={13} /> Add account
                </button>
              </Card>
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