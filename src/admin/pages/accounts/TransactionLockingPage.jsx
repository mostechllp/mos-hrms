// src/admin/pages/accounts/TransactionLockingPage.jsx
import React, { useState } from "react";
import {
  Lock, Unlock, Info, UserPlus, ArrowRight, X, AlertTriangle,
  ShieldCheck, Layers,
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

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
      {hint && <Info size={12} className="text-gray-400 ml-0.5" />}
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

const TransactionLockingPage = () => {
  const [viewMode, setViewMode] = useState("individual"); // 'individual' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState(null);
  const [lockDate, setLockDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  const [modules, setModules] = useState({
    sales: { locked: false, date: null },
    purchases: { locked: false, date: null },
    banking: { locked: false, date: null },
    accountant: { locked: false, date: null },
  });

  const handleOpenLockModal = (target) => {
    setLockTarget(target);
    setIsModalOpen(true);
  };

  const handleLockConfirm = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (lockTarget.type === "all") {
      setModules({
        sales: { locked: true, date: lockDate },
        purchases: { locked: true, date: lockDate },
        banking: { locked: true, date: lockDate },
        accountant: { locked: true, date: lockDate },
      });
    } else {
      setModules((prev) => ({
        ...prev,
        [lockTarget.key]: { locked: true, date: lockDate },
      }));
    }

    setIsModalOpen(false);
    setReason("");
  };

  const anyLocked = Object.values(modules).some((m) => m.locked);
  const lockedCount = Object.values(modules).filter((m) => m.locked).length;
  const unlockedCount = 4 - lockedCount;

  const renderModuleCard = (key, name) => {
    const module = modules[key];
    return (
      <Card key={key} className="p-5 flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            module.locked
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}
        >
          {module.locked ? <Lock size={18} /> : <Unlock size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              {name}
            </h3>
            <Info size={12} className="text-gray-400 cursor-help" />
            {module.locked && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                Locked
              </span>
            )}
          </div>
          <p className="text-xs md:text-[12.5px] text-gray-500 dark:text-gray-400">
            {module.locked
              ? `Transactions up to ${module.date} are locked.`
              : "You have not locked the transactions in this module."}
          </p>
        </div>

        {!module.locked && (
          <div className="shrink-0">
            <button
              onClick={() => handleOpenLockModal({ type: "module", key, name })}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Lock size={13} /> Lock
            </button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Modules" value={4} icon="fas fa-layer-group" color="green" />
        <MiniStat label="Locked" value={lockedCount} icon="fas fa-lock" color="blue" />
        <MiniStat label="Unlocked" value={unlockedCount} icon="fas fa-lock-open" color="violet" />
        <MiniStat
          label="Status"
          value={anyLocked ? "Secured" : "Open"}
          icon="fas fa-shield-halved"
          color={anyLocked ? "green" : "amber"}
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Transaction locking
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {anyLocked
              ? "One or more modules are locked"
              : "No modules locked yet"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GhostBtn className="border border-gray-200 dark:border-gray-700">
            <UserPlus size={13} /> Find accountants
          </GhostBtn>
        </div>
      </div>

      <div className="space-y-4">

        {/* Info card */}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
                Transaction locking prevents you and your users from making any
                changes to transactions that might affect your accounts. Once
                locked, users cannot edit, modify, or delete any transactions
                recorded before the specified date in this module.
              </p>
            </div>
          </div>
        </Card>

        {/* Warning banner */}
        <Card className="px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <AlertTriangle size={14} />
              </div>
              <p className="text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200">
                Restrict transaction locking with negative stock
              </p>
            </div>
            <GhostBtn className="shrink-0 border border-gray-200 dark:border-gray-700">
              Configure
            </GhostBtn>
          </div>
        </Card>

        {/* ---- View: ALL ---- */}
        {viewMode === "all" ? (
          <div className="space-y-4">
            <Card className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                    All transactions
                  </h3>
                  {modules.sales.locked && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-[12.5px] text-gray-500 dark:text-gray-400">
                  {modules.sales.locked
                    ? `All transactions up to ${modules.sales.date} are locked.`
                    : "You have not opted to lock all transactions."}
                </p>
              </div>
              {!modules.sales.locked && (
                <button
                  onClick={() =>
                    handleOpenLockModal({ type: "all", name: "All transactions" })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all shrink-0"
                >
                  <Lock size={13} /> Lock All
                </button>
              )}
            </Card>

            <Card className="p-5">
              <SectionLabel>Alternative</SectionLabel>
              <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight mb-2">
                Lock individual modules
              </h3>
              <p className="text-xs md:text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">
                Instead of locking everything at once, you can:
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "Select the modules (Sales, Purchases, Banking, Accountant) you wish to lock individually.",
                  "Set different lock dates for each module.",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300"
                  >
                    <div className="w-1 h-1 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <GhostBtn
                onClick={() => setViewMode("individual")}
                className="border border-gray-200 dark:border-gray-700"
              >
                <Lock size={13} /> Lock individual modules
              </GhostBtn>
            </Card>
          </div>
        ) : (
          /* ---- View: INDIVIDUAL ---- */
          <div className="space-y-3">
            <SectionLabel>Modules</SectionLabel>
            {renderModuleCard("sales", "Sales")}
            {renderModuleCard("purchases", "Purchases")}
            {renderModuleCard("banking", "Banking")}
            {renderModuleCard("accountant", "Accountant")}

            <Card className="p-5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg shrink-0">
                    <Layers size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight mb-0.5">
                      Lock all transactions at once
                    </h3>
                    <p className="text-xs md:text-[12.5px] text-gray-500 dark:text-gray-400 max-w-2xl">
                      Freeze Sales, Purchases, Banking, and Accountant in one
                      step instead of locking them individually.
                    </p>
                  </div>
                </div>
                <GhostBtn
                  onClick={() => setViewMode("all")}
                  className="border border-gray-200 dark:border-gray-700 shrink-0 self-start sm:self-auto"
                >
                  Switch to lock all <ArrowRight size={13} />
                </GhostBtn>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ---- LOCK MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Lock
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  {lockTarget?.name}
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
            <form onSubmit={handleLockConfirm}>
              <div className="px-5 py-5 space-y-4">

                <Field label="Lock date" required hint>
                  <input
                    type="date"
                    className={`${inputCls} tabular-nums`}
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                  />
                </Field>

                <Field label="Reason" required>
                  <textarea
                    rows={4}
                    className={inputCls}
                    placeholder="Enter the reason for locking…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Field>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
                  />
                  <p className="text-[11.5px] text-gray-700 dark:text-gray-200 leading-relaxed">
                    Once locked, you cannot edit, modify, or delete transactions
                    recorded before this date. This action cannot be undone.
                  </p>
                </div>
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
                  disabled={!reason.trim()}
                  className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lock
                </button>
              </div>
            </form>
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
        <div className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
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

export default TransactionLockingPage;