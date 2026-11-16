import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, Info } from "lucide-react";
import { createPlan, updatePlan, clearSubmittingError } from "../../store/slices/subscriptionSlice";

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const empty = {
  name: "",
  code: "",
  description: "",
  price: 0,
  currency: "INR",
  interval: "Monthly",
  billingCycle: "Recurring",
  trialDays: 14,
  status: "Draft",
  features: [],
};

const SubscriptionPlanModal = ({ open, initial, onClose }) => {
  const dispatch = useDispatch();
  const { options, submitting, submittingError } = useSelector((s) => s.subscriptions);

  const [form, setForm] = useState(empty);
  const [featureDraft, setFeatureDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        ...empty,
        ...initial,
        features: Array.isArray(initial.features) ? initial.features : [],
      });
    } else {
      setForm(empty);
    }
    setFeatureDraft("");
    dispatch(clearSubmittingError());
  }, [open, initial, dispatch]);

  if (!open) return null;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, v] }));
    setFeatureDraft("");
  };

  const removeFeature = (idx) =>
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return;

    try {
      if (initial?.id) {
        await dispatch(updatePlan({ id: initial.id, data: form })).unwrap();
      } else {
        await dispatch(createPlan(form)).unwrap();
      }
      onClose();
    } catch {
      // error surfaced via submittingError
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-[1px] flex items-start sm:items-center justify-center overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {initial?.id ? "Edit plan" : "New plan"}
            </p>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
              {initial?.id ? initial.name : "Create subscription plan"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {submittingError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-[12px] text-rose-700 dark:text-rose-300">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>{submittingError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Plan name" required>
              <input
                type="text"
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Growth"
              />
            </Field>

            <Field label="Plan code">
              <input
                type="text"
                className={inputCls}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="GROWTH"
              />
            </Field>

            <Field label="Description" className="sm:col-span-2">
              <textarea
                rows={2}
                className={inputCls}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What this plan is for…"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Price">
              <input
                type="number"
                className={`${inputCls} tabular-nums`}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Currency">
              <select className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {options.currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Trial (days)">
              <input
                type="number"
                className={`${inputCls} tabular-nums`}
                value={form.trialDays}
                onChange={(e) => set("trialDays", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Interval">
              <select className={inputCls} value={form.interval} onChange={(e) => set("interval", e.target.value)}>
                {options.intervals.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Billing cycle">
              <select className={inputCls} value={form.billingCycle} onChange={(e) => set("billingCycle", e.target.value)}>
                {options.billing_cycles.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {options.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Features">
            <div className="space-y-2">
              {form.features.length === 0 ? (
                <p className="text-[11.5px] text-slate-500">No features yet — add at least one.</p>
              ) : (
                <ul className="space-y-1">
                  {form.features.map((f, i) => (
                    <li
                      key={`${f}-${i}`}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 text-[12px] bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-md"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{f}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        aria-label="Remove feature"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureDraft}
                  onChange={(e) => setFeatureDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder="Add a feature and press Enter"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center gap-1 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : initial?.id ? "Save changes" : "Create plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionPlanModal;