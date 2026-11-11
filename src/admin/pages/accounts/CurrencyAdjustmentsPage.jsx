import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdjustment,
  deleteAdjustment,
} from "../../store/slices/accounts/currencyAdjustmentsSlice";
import {
  Plus, ChevronDown, X, Filter, Trash2, UserPlus,
  TrendingUp, Coins,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

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

/* ---------- page ---------- */

const CurrencyAdjustmentsPage = () => {
  const dispatch = useDispatch();
  const adjustments = useSelector((state) => state.currencyAdjustments.adjustments);
  const isLoading = useSelector((state) => state.currencyAdjustments.loading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    currency: "AED- UAE Dirham",
    date: new Date().toISOString().split("T")[0],
    exchangeRate: "25.870544",
    notes: "",
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currency || !formData.exchangeRate || !formData.notes) return;

    await dispatch(addAdjustment(formData)).unwrap();
    setIsModalOpen(false);
    setFormData({
      currency: "AED- UAE Dirham",
      date: new Date().toISOString().split("T")[0],
      exchangeRate: "25.870544",
      notes: "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAdjustment(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  const currencyCode = formData.currency.split("-")[0].trim();

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
              Base currency adjustments
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {adjustments.length === 0
                ? "No adjustments recorded yet"
                : `${adjustments.length} ${adjustments.length === 1 ? "adjustment" : "adjustments"} recorded`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn className="border border-slate-200 dark:border-slate-800">
              <UserPlus size={13} /> Find accountants
            </GhostBtn>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New adjustment
            </button>
          </div>
        </header>

        {/* ---- Empty / Table ---- */}
        {adjustments.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Coins size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Record your first adjustment
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Record a base currency adjustment to correct fluctuations in
                exchange rates across your foreign-currency accounts.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> New adjustment
              </button>
            </div>

            <div className="mt-12 max-w-md mx-auto space-y-2">
              {[
                "Align foreign balances with the latest exchange rate",
                "Book unrealized gains and losses automatically",
                "Keep an audit trail of every revaluation",
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
              <GhostBtn className="border border-slate-200 dark:border-slate-800">
                <Filter size={13} /> This month <ChevronDown size={13} />
              </GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input
                type="checkbox"
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                aria-label="Select all"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-1">
                        Date <ChevronDown size={11} className="text-slate-400" />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Currency</th>
                    <th className="px-4 py-2.5 text-left font-medium">Exchange rate</th>
                    <th className="px-4 py-2.5 text-right font-medium">Gain / loss</th>
                    <th className="px-4 py-2.5 text-left font-medium">Notes</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adjustments.map((adj) => (
                    <tr
                      key={adj.id}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          aria-label={`Select adjustment ${adj.id}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">
                        {adj.date}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {adj.currency}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 tabular-nums">
                        {adj.exchangeRate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                            adj.gainLoss >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          <TrendingUp
                            size={12}
                            className={adj.gainLoss >= 0 ? "" : "rotate-180"}
                          />
                          {adj.gainLoss >= 0 ? "+" : ""}
                          {Number(adj.gainLoss).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                        {adj.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(adj);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                            title="Delete adjustment"
                            aria-label="Delete adjustment"
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
        )}
      </div>

      {/* ---- NEW ADJUSTMENT MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  New entry
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Base currency adjustment
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

                <Field label="Currency" required>
                  <select
                    className={inputCls}
                    value={formData.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                  >
                    <option value="AED- UAE Dirham">AED — UAE Dirham</option>
                    <option value="USD- US Dollar">USD — US Dollar</option>
                    <option value="EUR- Euro">EUR — Euro</option>
                    <option value="GBP- British Pound">GBP — British Pound</option>
                  </select>
                </Field>

                <Field label="Date of adjustment" required>
                  <input
                    type="date"
                    className={`${inputCls} tabular-nums`}
                    value={formData.date}
                    onChange={(e) => setField("date", e.target.value)}
                  />
                </Field>

                <Field label="Exchange rate" required>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg whitespace-nowrap">
                      1 {currencyCode} =
                    </span>
                    <input
                      type="number"
                      step="0.000001"
                      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
                      value={formData.exchangeRate}
                      onChange={(e) => setField("exchangeRate", e.target.value)}
                    />
                    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg">
                      INR
                    </span>
                  </div>
                </Field>

                <Field label="Notes" required>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Max. 500 characters"
                    value={formData.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </Field>
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
                  disabled={isLoading || !formData.notes}
                  className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving…" : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete adjustment"
        message="Are you sure you want to delete this currency adjustment? This action cannot be undone."
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

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

export default CurrencyAdjustmentsPage;