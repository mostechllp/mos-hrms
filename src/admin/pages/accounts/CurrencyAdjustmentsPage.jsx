// src/admin/pages/accounts/CurrencyAdjustmentsPage.jsx
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

  const totalAdjustments = adjustments.length;
  const gainCount = adjustments.filter((a) => a.gainLoss >= 0).length;
  const lossCount = adjustments.filter((a) => a.gainLoss < 0).length;
  const netGainLoss = adjustments.reduce((s, a) => s + (Number(a.gainLoss) || 0), 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Adjustments" value={totalAdjustments} icon="fas fa-coins" color="green" />
        <MiniStat label="Gains" value={gainCount} icon="fas fa-arrow-trend-up" color="blue" />
        <MiniStat label="Losses" value={lossCount} icon="fas fa-arrow-trend-down" color="violet" />
        <MiniStat
          label="Net Gain / Loss"
          value={`${netGainLoss >= 0 ? "+" : ""}${netGainLoss.toFixed(2)}`}
          icon="fas fa-scale-balanced"
          color={netGainLoss >= 0 ? "amber" : "red"}
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Base currency adjustments
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalAdjustments === 0
              ? "No adjustments recorded yet"
              : `${totalAdjustments} ${totalAdjustments === 1 ? "adjustment" : "adjustments"} recorded`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn className="border border-gray-200 dark:border-gray-700">
            <UserPlus size={13} /> Find accountants
          </GhostBtn>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Adjustment
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {totalAdjustments === 0 ? (
        <Card className="py-16 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Coins size={22} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              Record your first adjustment
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 mb-6">
              Record a base currency adjustment to correct fluctuations in
              exchange rates across your foreign-currency accounts.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={14} /> New adjustment
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
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              <Filter size={13} /> This month <ChevronDown size={13} />
            </GhostBtn>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
              aria-label="Select all"
            />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        Date <ChevronDown size={11} className="text-gray-400" />
                      </span>
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Currency</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Exchange rate</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Gain / loss</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Notes</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adj) => (
                    <tr
                      key={adj.id}
                      className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                          aria-label={`Select adjustment ${adj.id}`}
                        />
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        {adj.date}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {adj.currency}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                        {adj.exchangeRate}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                            adj.gainLoss >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
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
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                        {adj.notes || "—"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction
                            icon={Trash2}
                            label="Delete adjustment"
                            tone="danger"
                            onClick={() => setDeleteTarget(adj)}
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
      )}

      {/* ---- NEW ADJUSTMENT MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  New entry
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Base currency adjustment
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
                    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg whitespace-nowrap">
                      1 {currencyCode} =
                    </span>
                    <input
                      type="number"
                      step="0.000001"
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition tabular-nums"
                      value={formData.exchangeRate}
                      onChange={(e) => setField("exchangeRate", e.target.value)}
                    />
                    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg">
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
                  disabled={isLoading || !formData.notes}
                  className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CurrencyAdjustmentsPage;