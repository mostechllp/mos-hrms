// src/admin/components/crm/MarkWonLostModal.jsx

import { useEffect, useState } from "react";
import { X, Trophy, XCircle, Loader } from "lucide-react";
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

const DEPARTMENTS = ["Sales", "Implementation", "Support", "Finance"];

const MarkWonLostModal = ({ isOpen, onClose, opportunity, mode = "won", onSubmit }) => {
  const isWon = mode === "won";

  const [form, setForm] = useState({
    finalValue: "",
    wonDate: "",
    product: "",
    quotationId: "",
    handoverTo: "",
    notes: "",
    lostReason: "Price too high",
    competitor: "",
    lostDate: "",
    reengagementDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && opportunity) {
      setForm({
        finalValue: String(opportunity.value || ""),
        wonDate: new Date().toISOString().split("T")[0],
        product: opportunity.product || "",
        quotationId: "",
        handoverTo: "",
        notes: "",
        lostReason: "Price too high",
        competitor: "",
        lostDate: new Date().toISOString().split("T")[0],
        reengagementDate: "",
      });
      setSubmitting(false);
    }
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (isWon) {
      if (!form.finalValue || Number(form.finalValue) <= 0) {
        showToast("Please enter a valid final deal value", "error");
        return;
      }
      if (!form.wonDate) {
        showToast("Please select the won date", "error");
        return;
      }
    } else {
      if (!form.lostReason) {
        showToast("Please select a lost reason", "error");
        return;
      }
      if (!form.lostDate) {
        showToast("Please select the lost date", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      // TODO: dispatch(markOpportunity({ id, mode, ...form }))
      console.log(`Mark ${mode}:`, { id: opportunity.id, ...form });
      onSubmit?.(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isWon
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {isWon ? (
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isWon ? "Mark as Won" : "Mark as Lost"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[280px]">
                {opportunity.name} · {opportunity.customer}
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
          {isWon ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Final Deal Value" required>
                  <Input
                    type="number"
                    value={form.finalValue}
                    onChange={(e) => update("finalValue", e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label="Won Date" required>
                  <Input
                    type="date"
                    value={form.wonDate}
                    onChange={(e) => update("wonDate", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Winning Product / Service">
                <Input
                  value={form.product}
                  onChange={(e) => update("product", e.target.value)}
                />
              </Field>
              <Field label="Final Quotation Reference">
                <Input
                  value={form.quotationId}
                  onChange={(e) => update("quotationId", e.target.value)}
                  placeholder="e.g. Q-2026-0150"
                />
              </Field>
              <Field label="Handover To (Employee or Department)">
                <select
                  value={form.handoverTo}
                  onChange={(e) => update("handoverTo", e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lost Reason" required>
                  <select
                    value={form.lostReason}
                    onChange={(e) => update("lostReason", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  >
                    {LOST_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Lost Date" required>
                  <Input
                    type="date"
                    value={form.lostDate}
                    onChange={(e) => update("lostDate", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Competitor (if applicable)">
                <Input
                  value={form.competitor}
                  onChange={(e) => update("competitor", e.target.value)}
                  placeholder="e.g. Oracle, SAP"
                />
              </Field>
              <Field label="Re-engagement Date (optional)">
                <Input
                  type="date"
                  value={form.reengagementDate}
                  onChange={(e) => update("reengagementDate", e.target.value)}
                />
              </Field>
            </>
          )}

          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder={
                isWon
                  ? "Any notes about the win..."
                  : "Any notes about why we lost..."
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
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
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              isWon
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : isWon ? (
              <>
                <Trophy className="w-4 h-4" /> Mark as Won
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Mark as Lost
              </>
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

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
  />
);

export default MarkWonLostModal;