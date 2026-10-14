// src/admin/components/crm/ChangeStageModal.jsx
import { useEffect, useState } from "react";
import { X, Repeat, Loader } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

const LOST_REASONS = [
  "Price too high",
  "Lost to competitor",
  "No budget",
  "Timing not right",
  "No decision",
  "Product fit",
  "Other",
];

const ChangeStageModal = ({
  isOpen,
  onClose,
  opportunity,
  stages = [],
  onSubmit,
  submitting = false,
}) => {
  const [form, setForm] = useState({
    stage: "",
    probability: "",
    notes: "",
    lostReason: "",
    competitor: "",
  });

  // Hydrate on open / opportunity change
  useEffect(() => {
    if (!isOpen || !opportunity) return;
    setForm({
      stage: opportunity.stage || "New",
      probability: String(opportunity.probability ?? ""),
      notes: "",
      lostReason: "Price too high",
      competitor: opportunity.competitor || "",
    });
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-fill probability when the user picks a stage
  const handleStageChange = (stageValue) => {
    const found = stages.find((s) => {
      const val = typeof s === "string" ? s : s.name || s.stage || s.value;
      return val === stageValue;
    });
    const prob =
      typeof found === "object"
        ? found.default_probability ?? found.probability ?? null
        : null;

    setForm((f) => ({
      ...f,
      stage: stageValue,
      probability:
        prob !== null && prob !== undefined ? String(prob) : f.probability,
    }));
  };

  const isLost = String(form.stage).toLowerCase() === "lost";

  const handleSubmit = async () => {
    if (!form.stage) {
      showToast("Please select a stage", "error");
      return;
    }

    const payload = {
      stage: form.stage,
      probability:
        form.probability === "" ? undefined : Number(form.probability),
      notes: form.notes || undefined,
    };

    if (isLost) {
      payload.lost_reason = form.lostReason || undefined;
      if (form.competitor) payload.competitor = form.competitor;
    }

    await onSubmit?.(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Change Stage
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[280px]">
                {opportunity.name} · {opportunity.customerName || opportunity.customer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="New Stage" required>
            <select
              value={form.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select stage...</option>
              {stages.map((s) => {
                const value = typeof s === "string" ? s : s.name || s.stage || s.value;
                const label = typeof s === "string" ? s : s.name || s.stage || s.label;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Probability (%)">
            <input
              type="number"
              min="0"
              max="100"
              value={form.probability}
              onChange={(e) => update("probability", e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          {isLost && (
            <>
              <Field label="Lost Reason" required>
                <select
                  value={form.lostReason}
                  onChange={(e) => update("lostReason", e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  {LOST_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Competitor (if applicable)">
                <input
                  value={form.competitor}
                  onChange={(e) => update("competitor", e.target.value)}
                  disabled={submitting}
                  placeholder="e.g. Oracle, SAP"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>
            </>
          )}

          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              disabled={submitting}
              placeholder="Why is this stage changing? (optional)"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader className="w-4 h-4 animate-spin" /> Updating...</>
            ) : (
              <><Repeat className="w-4 h-4" /> Change Stage</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default ChangeStageModal;