import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import {
  X, Layers, Users, Receipt, Edit2, Trash2, CheckCircle2,
  Clock, Calendar, RefreshCw, Tag, Hash,
} from "lucide-react";

const money = (v, currency = "INR") => {
  const n = Number(v) || 0;
  return `${currency === "INR" ? "₹" : currency + " "}${n.toLocaleString("en-IN")}`;
};

const StatusPill = ({ status }) => {
  const styles = {
    Active:    "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400",
    Draft:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    Archived:  "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const DetailBlock = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className={`text-[13px] md:text-sm font-medium text-gray-900 dark:text-gray-100 ${mono ? "tabular-nums" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const PlanDetailModal = ({ open, plan, onClose, onEdit, onDelete }) => {
  if (!open || !plan) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#eafaf1] dark:bg-green-900/20 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plan
              </p>
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate mt-0.5">
                {plan.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusPill status={plan.status} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">· {plan.code}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

          {plan.description && (
            <p className="text-[12.5px] md:text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
              {plan.description}
            </p>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </p>
              </div>
              <p className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white tabular-nums">
                {plan.billingCycle === "Usage-based" ? "Metered" : money(plan.price, plan.currency)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscribers
                </p>
              </div>
              <p className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white tabular-nums">
                {plan.subscriberCount ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trial
                </p>
              </div>
              <p className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white tabular-nums">
                {plan.trialDays ? `${plan.trialDays}d` : "None"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-1">
            <DetailBlock label="Billing interval" value={plan.interval} />
            <DetailBlock label="Billing cycle"    value={plan.billingCycle} />
            <DetailBlock label="Currency"         value={plan.currency} />
            <DetailBlock label="Plan code"        value={plan.code} mono />
          </div>

          {/* Features */}
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Features {plan.features?.length ? `(${plan.features.length})` : ""}
            </p>
            {plan.features?.length ? (
              <ul className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] md:text-[13px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-md px-3 py-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-gray-400">No features listed for this plan.</p>
            )}
          </div>

          {/* Meta */}
          {(plan.createdAt || plan.updatedAt) && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-[11px] text-gray-500 dark:text-gray-400">
              {plan.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Created {new Date(plan.createdAt).toLocaleDateString()}
                </div>
              )}
              {plan.updatedAt && (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Updated {new Date(plan.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-[12.5px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onDelete?.(plan); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button
            onClick={() => { onClose(); onEdit?.(plan); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit plan
          </button>
        </div>
      </div>
    </div>,
  document.body
  );
};

export default PlanDetailModal;