import React from "react";
import { createPortal } from "react-dom";
import {
  X, User, Users, Mail, Calendar, TrendingUp, Receipt,
  CheckCircle2, Clock, Layers, CreditCard,
} from "lucide-react";

const money = (v, currency = "INR") => {
  const n = Number(v) || 0;
  return `${currency === "INR" ? "₹" : currency + " "}${n.toLocaleString("en-IN")}`;
};

const StatusPill = ({ status }) => {
  const styles = {
    Active:    "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400",
    Trialing:  "bg-[#f0f4ff] text-[#3b82f6] dark:bg-blue-900/30 dark:text-blue-400",
    "Past due":"bg-[#fff8e6] text-[#f59e0b] dark:bg-amber-900/30 dark:text-amber-400",
    Cancelled: "bg-[#fee2e2] text-[#ef4444] dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-[13px] md:text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-words ${mono ? "tabular-nums" : ""}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

const SubscriberDetailModal = ({ open, subscriber, plan, onClose }) => {
  if (!open || !subscriber) return null;

  const formatDate = (v) => {
    if (!v || v === "—") return "—";
    try {
      return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return v; }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-fade-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-base">
              {subscriber.customer?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subscriber
              </p>
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate mt-0.5">
                {subscriber.customer}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusPill status={subscriber.status} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">· {subscriber.plan}</span>
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
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Left — subscriber info */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Contact
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1">
                <InfoRow icon={User}     label="Customer"      value={subscriber.customer} />
                <InfoRow icon={Mail}     label="Email"         value={subscriber.email} />
              </div>
            </div>

            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Subscription
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1">
                <InfoRow icon={Layers}    label="Plan"         value={subscriber.plan} />
                <InfoRow icon={Calendar}  label="Started"      value={formatDate(subscriber.startedAt)} />
                <InfoRow icon={Calendar}  label="Next billing" value={formatDate(subscriber.nextBillingAt)} />
                <InfoRow icon={TrendingUp} label="MRR"         value={money(subscriber.mrr)} mono />
              </div>
            </div>
          </div>

          {/* Right — chosen plan snapshot */}
          <div className="space-y-3">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Chosen plan
            </p>

            {plan ? (
              <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-[#eafaf1] dark:bg-green-900/20 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-4 h-4 text-[#10b981] dark:text-green-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{plan.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{plan.code}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-[#10b981] dark:text-green-400 tabular-nums whitespace-nowrap">
                    {plan.billingCycle === "Usage-based" ? "Metered" : money(plan.price, plan.currency)}
                  </p>
                </div>

                <div className="px-4 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Interval</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{plan.interval}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Cycle</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{plan.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Trial</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {plan.trialDays ? `${plan.trialDays} days` : "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{plan.currency}</p>
                    </div>
                  </div>

                  {plan.features?.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Included features
                      </p>
                      <ul className="space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-700 dark:text-gray-200">
                            <CheckCircle2 className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center">
                <CreditCard className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Plan details not available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-[12.5px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
  document.body
  );
};

export default SubscriberDetailModal;