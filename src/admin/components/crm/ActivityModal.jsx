// src/admin/components/crm/ActivityModal.jsx

import { useEffect, useState } from "react";
import { X, Save, Loader, Check, CalendarClock } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

// ------------------------------------------------------------
// Static option lists
// ------------------------------------------------------------

const TYPES = ["Call", "Email", "Meeting", "Task", "Site Visit"];
const RELATED_TYPES = ["Lead", "Customer", "Opportunity", "Internal"];
const PRIORITIES = ["Low", "Medium", "High"];
const REMINDERS = ["None", "15 min", "1 hour", "1 day"];
const STATUSES = ["Planned", "In Progress", "Completed", "Cancelled"];

const ASSIGNEES = [
  { value: "rahul", label: "Rahul Verma" },
  { value: "amina", label: "Amina Khan" },
  { value: "karthik", label: "Karthik Raj" },
  { value: "riya", label: "Riya Roy" },
  { value: "aarav", label: "Aarav Mehta" },
];

// Sample related records, keyed by type — replace with API lookups
const RELATED_RECORDS = {
  Lead: [
    { value: "LED-0001", label: "Ramesh Kumar · Acme Corp" },
    { value: "LED-0002", label: "Priya Sharma · Globex Ltd" },
    { value: "LED-0003", label: "Amit Patel · Initech Solutions" },
  ],
  Customer: [
    { value: "CUS-0001", label: "Acme Corp" },
    { value: "CUS-0002", label: "Globex Ltd" },
    { value: "CUS-0003", label: "Initech Solutions" },
  ],
  Opportunity: [
    { value: "OPP-0001", label: "ABC Traders HRMS Rollout" },
    { value: "OPP-0002", label: "XYZ Pvt Ltd ERP Migration" },
    { value: "OPP-0003", label: "PQR Solutions CRM Setup" },
  ],
  Internal: [{ value: "—", label: "Internal" }],
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (v) => (v ? new Date(v).toISOString() : "");

const defaultStart = (prefillDate) => {
  const d = prefillDate ? new Date(prefillDate) : new Date();
  d.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const addHours = (localInput, hours) => {
  if (!localInput) return "";
  const d = new Date(localInput);
  d.setHours(d.getHours() + hours);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const ActivityModal = ({ isOpen, onClose, activity, prefillDate, onSubmit }) => {
  const isEdit = Boolean(activity?.id);

  const [form, setForm] = useState({
    title: "",
    type: "Call",
    relatedToType: "Lead",
    relatedToId: "",
    assignedTo: "",
    startAt: "",
    endAt: "",
    priority: "Medium",
    reminder: "None",
    description: "",
    status: "Planned",
  });
  const [submitting, setSubmitting] = useState(false);

  // Hydrate
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setForm({
        title: activity.title || "",
        type: activity.type || "Call",
        relatedToType: activity.relatedToType || "Lead",
        relatedToId: activity.relatedToId || "",
        assignedTo: activity.assignedTo || "",
        startAt: toLocalInput(activity.startAt),
        endAt: toLocalInput(activity.endAt),
        priority: activity.priority || "Medium",
        reminder: activity.reminder || "None",
        description: activity.description || "",
        status: activity.status || "Planned",
      });
    } else {
      const start = defaultStart(prefillDate);
      setForm({
        title: "",
        type: "Call",
        relatedToType: "Lead",
        relatedToId: "",
        assignedTo: "",
        startAt: start,
        endAt: addHours(start, 1),
        priority: "Medium",
        reminder: "None",
        description: "",
        status: "Planned",
      });
    }
    setSubmitting(false);
  }, [isOpen, activity, prefillDate, isEdit]);

  // Esc close
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const relatedOptions = RELATED_RECORDS[form.relatedToType] || [];

  const validate = () => {
    if (!form.title.trim()) {
      showToast("Activity title is required", "error");
      return false;
    }
    if (!form.assignedTo) {
      showToast("Please assign an employee", "error");
      return false;
    }
    if (!form.startAt) {
      showToast("Please pick a start date and time", "error");
      return false;
    }
    if (form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      showToast("End time cannot be before start time", "error");
      return false;
    }
    if (form.relatedToType !== "Internal" && !form.relatedToId) {
      showToast(`Please select a ${form.relatedToType.toLowerCase()}`, "error");
      return false;
    }
    return true;
  };

  const buildPayload = (statusOverride) => {
    const related = relatedOptions.find((r) => r.value === form.relatedToId);
    return {
      ...form,
      startAt: fromLocalInput(form.startAt),
      endAt: fromLocalInput(form.endAt),
      status: statusOverride || form.status,
      relatedToLabel:
        related?.label ||
        (form.relatedToType === "Internal" ? "Internal" : form.relatedToId),
    };
  };

  const submit = async (afterSubmit, statusOverride) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload(statusOverride);
      onSubmit?.(payload, isEdit);
      if (afterSubmit) afterSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => submit(() => onClose());
  const handleSaveAndAddAnother = () =>
    submit(() => {
      const start = defaultStart(prefillDate);
      setForm((f) => ({
        ...f,
        title: "",
        relatedToId: "",
        startAt: start,
        endAt: addHours(start, 1),
        description: "",
      }));
    });
  const handleMarkCompleted = () =>
    submit(() => onClose(), "Completed");
  const handleReschedule = () => {
    showToast("Reschedule mode: pick a new date and save.", "info");
  };
  const handleCancelActivity = () =>
    submit(() => onClose(), "Cancelled");

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Activity" : "Add Activity"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Update this activity's details"
                  : "Schedule a call, meeting, or task"}
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
          {/* Title */}
          <Field label="Activity Title" required>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. HRMS demo"
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activity type */}
            <Field label="Activity Type">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            {/* Priority */}
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>

            {/* Related type */}
            <Field label="Related Record Type">
              <select
                value={form.relatedToType}
                onChange={(e) => {
                  update("relatedToType", e.target.value);
                  update("relatedToId", "");
                }}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {RELATED_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            {/* Related record */}
            <Field
              label={`Related ${form.relatedToType}`}
              required={form.relatedToType !== "Internal"}
            >
              <select
                value={form.relatedToId}
                onChange={(e) => update("relatedToId", e.target.value)}
                disabled={submitting || form.relatedToType === "Internal"}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              >
                <option value="">
                  {form.relatedToType === "Internal"
                    ? "—"
                    : `Select ${form.relatedToType.toLowerCase()}...`}
                </option>
                {relatedOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Assigned employee */}
            <Field label="Assigned Employee" required>
              <select
                value={form.assignedTo}
                onChange={(e) => update("assignedTo", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select employee...</option>
                {ASSIGNEES.map((a) => (
                  <option key={a.value} value={a.label}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Status */}
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            {/* Start */}
            <Field label="Start Date & Time" required>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => {
                  const start = e.target.value;
                  update("startAt", start);
                  // Auto-bump end if it's now before start
                  if (!form.endAt || new Date(form.endAt) < new Date(start)) {
                    update("endAt", addHours(start, 1));
                  }
                }}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>

            {/* End */}
            <Field label="End Date & Time">
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => update("endAt", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>

            {/* Reminder */}
            <Field label="Reminder">
              <select
                value={form.reminder}
                onChange={(e) => update("reminder", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {REMINDERS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Any details to keep in mind..."
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          {isEdit && (
            <>
              <button
                onClick={handleReschedule}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50"
              >
                Reschedule
              </button>
              <button
                onClick={handleCancelActivity}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
              >
                Cancel Activity
              </button>
              <button
                onClick={handleMarkCompleted}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={14} /> Mark Completed
              </button>
            </>
          )}

          {!isEdit && (
            <button
              onClick={handleSaveAndAddAnother}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              Save & Add Another
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update" : "Save Activity"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Field wrapper
// ------------------------------------------------------------
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default ActivityModal;