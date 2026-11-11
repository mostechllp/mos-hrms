import React, { useState } from "react";
import {
  Lock, Unlock, Info, UserPlus, ArrowRight, X, AlertTriangle,
  ShieldCheck, Layers,
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

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && <Info size={12} className="text-slate-400 ml-0.5" />}
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

  const renderModuleCard = (key, name) => {
    const module = modules[key];
    return (
      <Surface key={key} className="p-5 flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            module.locked
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          {module.locked ? <Lock size={18} /> : <Unlock size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {name}
            </h3>
            <Info size={12} className="text-slate-400 cursor-help" />
            {module.locked && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                Locked
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
            {module.locked
              ? `Transactions up to ${module.date} are locked.`
              : "You have not locked the transactions in this module."}
          </p>
        </div>

        {!module.locked && (
          <div className="shrink-0">
            <button
              onClick={() => handleOpenLockModal({ type: "module", key, name })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Lock size={13} /> Lock
            </button>
          </div>
        )}
      </Surface>
    );
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
              Transaction locking
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {anyLocked
                ? "One or more modules are locked"
                : "No modules locked yet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn className="border border-slate-200 dark:border-slate-800">
              <UserPlus size={13} /> Find accountants
            </GhostBtn>
          </div>
        </header>

        <div className="space-y-4">

          {/* Info card */}
          <Surface className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Transaction locking prevents you and your users from making any
                  changes to transactions that might affect your accounts. Once
                  locked, users cannot edit, modify, or delete any transactions
                  recorded before the specified date in this module.
                </p>
              </div>
            </div>
          </Surface>

          {/* Warning banner */}
          <Surface className="px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <AlertTriangle size={14} />
                </div>
                <p className="text-[12.5px] text-slate-700 dark:text-slate-200">
                  Restrict transaction locking with negative stock
                </p>
              </div>
              <GhostBtn className="shrink-0">Configure</GhostBtn>
            </div>
          </Surface>

          {/* ---- View: ALL ---- */}
          {viewMode === "all" ? (
            <div className="space-y-4">
              <Surface className="p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                      All transactions
                    </h3>
                    {modules.sales.locked && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <Lock size={13} /> Lock
                  </button>
                )}
              </Surface>

              <Surface className="p-5">
                <SectionLabel>Alternative</SectionLabel>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                  Lock individual modules
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mb-3">
                  Instead of locking everything at once, you can:
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Select the modules (Sales, Purchases, Banking, Accountant) you wish to lock individually.",
                    "Set different lock dates for each module.",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300"
                    >
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <GhostBtn
                  onClick={() => setViewMode("individual")}
                  className="border border-slate-200 dark:border-slate-800"
                >
                  <Lock size={13} /> Lock individual modules
                </GhostBtn>
              </Surface>
            </div>
          ) : (
            /* ---- View: INDIVIDUAL ---- */
            <div className="space-y-3">
              <SectionLabel>Modules</SectionLabel>
              {renderModuleCard("sales", "Sales")}
              {renderModuleCard("purchases", "Purchases")}
              {renderModuleCard("banking", "Banking")}
              {renderModuleCard("accountant", "Accountant")}

              <Surface className="p-5 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shrink-0">
                      <Layers size={15} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-0.5">
                        Lock all transactions at once
                      </h3>
                      <p className="text-[12.5px] text-slate-500 dark:text-slate-400 max-w-2xl">
                        Freeze Sales, Purchases, Banking, and Accountant in one
                        step instead of locking them individually.
                      </p>
                    </div>
                  </div>
                  <GhostBtn
                    onClick={() => setViewMode("all")}
                    className="border border-slate-200 dark:border-slate-800 shrink-0 self-start sm:self-auto"
                  >
                    Switch to lock all <ArrowRight size={13} />
                  </GhostBtn>
                </div>
              </Surface>
            </div>
          )}
        </div>
      </div>

      {/* ---- LOCK MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Lock
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  {lockTarget?.name}
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

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
                  />
                  <p className="text-[11.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
                    Once locked, you cannot edit, modify, or delete transactions
                    recorded before this date. This action cannot be undone.
                  </p>
                </div>
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
                  disabled={!reason.trim()}
                  className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TransactionLockingPage;