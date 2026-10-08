// src/admin/components/crm/ActivityModal.jsx
import { useEffect, useState } from "react";
import { X, Save, Loader, Check, CalendarClock } from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import DateInput from "../common/DateInput";
import { TimeInput } from "../common/TimeInput";

const FALLBACK = {
  types: ["Call", "Email", "Meeting", "Task", "Site Visit"],
  related_types: ["Lead", "Customer", "Opportunity", "Internal"],
  priorities: ["Low", "Medium", "High"],
  reminders: ["None", "15 min", "1 hour", "1 day"],
  statuses: ["Planned", "In Progress", "Completed", "Cancelled"],
};

const EMPTY_LOOKUP = [];

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, "0");

const splitDateTime = (iso) => {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const combineDateTime = (date, time) => {
  if (!date) return "";
  const t = time || "00:00";
  return `${date} ${t}:00`;
};

const defaultStart = (prefillDate) => {
  const d = prefillDate ? new Date(prefillDate) : new Date();
  d.setMinutes(0, 0, 0);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const addHour = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const nh = (h + 1) % 24;
  return `${pad(nh)}:${pad(m)}`;
};

const strOptions = (arr) => (arr || []).map((v) => ({ value: v, label: v }));

// ---------- component ----------
const ActivityModal = ({
  isOpen,
  onClose,
  activity,
  prefillDate,
  options = FALLBACK,
  onSubmit,
  submitting = false,
   employees = [],
  leads = [],
  customers = [],
  opportunities = [],
  employeesLoading = false,
  leadsLoading = false,
  customersLoading = false,
  opportunitiesLoading = false,
}) => {
  const isEdit = Boolean(activity?.id);

  const [form, setForm] = useState({
    title: "",
    type: "Call",
    relatedToType: "Lead",
    relatedToId: "",
    assignedTo: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    priority: "Medium",
    reminder: "None",
    description: "",
    status: "Planned",
  });

  // Hydrate
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      const start = splitDateTime(activity.startAt);
      const end = splitDateTime(activity.endAt);
      setForm({
        title: activity.title || "",
        type: activity.type || "Call",
        relatedToType: activity.relatedToType || "Lead",
        relatedToId: activity.relatedToId || "",
        assignedTo: activity.assignedToId
          ? String(activity.assignedToId)
          : activity.assignedTo || "",
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        priority: activity.priority || "Medium",
        reminder: activity.reminder || "None",
        description: activity.description || "",
        status: activity.status || "Planned",
      });
    } else {
      const s = defaultStart(prefillDate);
      setForm({
        title: "",
        type: "Call",
        relatedToType: "Lead",
        relatedToId: "",
        assignedTo: "",
        startDate: s.date,
        startTime: s.time,
        endDate: s.date,
        endTime: addHour(s.time),
        priority: "Medium",
        reminder: "None",
        description: "",
        status: "Planned",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activity, prefillDate, isEdit]);

  // Esc to close
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // Static enum options
  const typeOptions = strOptions(FALLBACK.types);
  const relatedTypeOptions = strOptions(FALLBACK.related_types);
  const priorityOptions = strOptions(FALLBACK.priorities);
  const reminderOptions = strOptions(FALLBACK.reminders);
  const statusOptions = strOptions(FALLBACK.statuses);

  // Employee options — from /admin/crm/activities/employees
  const assigneeOptions = (employees || []).map((e) => {
  const first = e.first_name || "";
  const last = e.last_name || "";
  const full = `${first} ${last}`.trim() || e.name || "";

  // designation and department come back as nested objects
  const designationName =
    typeof e.designation === "string"
      ? e.designation
      : e.designation?.name || "";

  const departmentName =
    typeof e.department === "string" ? e.department : e.department?.name || "";

  // Build a nice label. If we have designation use it; else fall back to
  // department; else just the name.
  const meta = designationName || departmentName;
  const suffix = meta ? ` — ${meta}` : "";

  return {
    value: String(e.id),
    label: full ? `${full}${suffix}` : `#${e.id}`,
  };
});

  // Related records — one source per type, "Internal" is a no-op
  const relatedOptions = (() => {
    if (form.relatedToType === "Lead") {
      return (leads || []).map((l) => ({
        value: String(l.id),
        label:
          l.lead_name || l.lead_id
            ? `${l.lead_name || ""}${
                l.company_name ? ` · ${l.company_name}` : ""
              }`.trim() || `#${l.id}`
            : `#${l.id}`,
      }));
    }
    if (form.relatedToType === "Customer") {
      return (customers || []).map((c) => ({
        value: String(c.id),
        label: c.company_name || `#${c.id}`,
      }));
    }
    if (form.relatedToType === "Opportunity") {
      return (opportunities || []).map((o) => ({
        value: String(o.id),
        label:
          o.opportunity_name ||
          o.name ||
          o.title ||
          o.company_name ||
          `#${o.id}`,
      }));
    }
    return [{ value: "—", label: "Internal" }];
  })();

  const relatedLoading =
    form.relatedToType === "Lead"
      ? leadsLoading
      : form.relatedToType === "Customer"
        ? customersLoading
        : form.relatedToType === "Opportunity"
          ? opportunitiesLoading
          : false;

  const validate = () => {
    if (!form.title.trim()) {
      showToast("Activity title is required", "error");
      return false;
    }
    if (!form.assignedTo) {
      showToast("Please assign an employee", "error");
      return false;
    }
    if (!form.startDate || !form.startTime) {
      showToast("Please pick a start date and time", "error");
      return false;
    }
    if (
      form.endDate &&
      form.endTime &&
      combineDateTime(form.endDate, form.endTime) <
        combineDateTime(form.startDate, form.startTime)
    ) {
      showToast("End time cannot be before start time", "error");
      return false;
    }
    if (form.relatedToType !== "Internal" && !form.relatedToId) {
      showToast(
        `Please select a ${form.relatedToType.toLowerCase()}`,
        "error",
      );
      return false;
    }
    return true;
  };

  const buildPayload = (statusOverride) => ({
    title: form.title.trim(),
    type: form.type,
    relatedToType: form.relatedToType,
    relatedToId: form.relatedToId,
    assignedTo: form.assignedTo,
    startAt: combineDateTime(form.startDate, form.startTime),
    endAt: combineDateTime(form.endDate, form.endTime),
    priority: form.priority,
    reminder: form.reminder,
    description: form.description,
    status: statusOverride || form.status,
  });

  const submit = (statusOverride) => {
    if (!validate()) return;
    const payload = buildPayload(statusOverride);
    onSubmit?.(payload, isEdit);
  };

  const handleSave = () => submit();
  const handleSaveAndAddAnother = () => {
    if (!validate()) return;
    onSubmit?.(buildPayload(), false);
    const s = defaultStart(prefillDate);
    setForm((f) => ({
      ...f,
      title: "",
      relatedToId: "",
      startDate: s.date,
      startTime: s.time,
      endDate: s.date,
      endTime: addHour(s.time),
      description: "",
    }));
  };
  const handleMarkCompleted = () => submit("Completed");
  const handleCancelActivity = () => submit("Cancelled");

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
            <Field label="Activity Type">
              <SearchableSelect
                value={form.type}
                onChange={(v) => update("type", v)}
                options={typeOptions}
                placeholder="Select type..."
              />
            </Field>

            <Field label="Priority">
              <SearchableSelect
                value={form.priority}
                onChange={(v) => update("priority", v)}
                options={priorityOptions}
                placeholder="Select priority..."
              />
            </Field>

            <Field label="Related Record Type">
              <SearchableSelect
                value={form.relatedToType}
                onChange={(v) => {
                  update("relatedToType", v);
                  update("relatedToId", "");
                }}
                options={relatedTypeOptions}
                placeholder="Select relation..."
              />
            </Field>

            <Field
  label={`Related ${form.relatedToType}`}
  required={form.relatedToType !== "Internal"}
>
  <SearchableSelect
    value={form.relatedToId}
    onChange={(v) => update("relatedToId", v)}
    options={relatedOptions}
    placeholder={
      form.relatedToType === "Internal"
        ? "—"
        : `Select ${form.relatedToType.toLowerCase()}...`
    }
    disabled={form.relatedToType === "Internal"}
    loading={relatedLoading}
  />
</Field>

            <Field label="Assigned Employee" required>
  <SearchableSelect
    value={form.assignedTo}
    onChange={(v) => update("assignedTo", v)}
    options={assigneeOptions}
    placeholder="Select employee..."
    searchPlaceholder="Search..."
    loading={employeesLoading}
  />
</Field>

            <Field label="Status">
              <SearchableSelect
                value={form.status}
                onChange={(v) => update("status", v)}
                options={statusOptions}
                placeholder="Select status..."
              />
            </Field>

            <Field label="Start Date" required>
              <DateInput
                value={form.startDate}
                onChange={(val) => {
                  update("startDate", val);
                  if (!form.endDate) update("endDate", val);
                }}
                type="general"
                placeholder="dd/mm/yyyy"
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2"
              />
            </Field>

            <Field label="Start Time" required>
              <TimeInput
                value={form.startTime}
                onChange={(e) => {
                  const t = e.target.value;
                  update("startTime", t);
                  if (!form.endTime) update("endTime", addHour(t));
                }}
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !py-2"
              />
            </Field>

            <Field label="End Date">
              <DateInput
                value={form.endDate}
                onChange={(val) => update("endDate", val)}
                type="general"
                placeholder="dd/mm/yyyy"
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2"
              />
            </Field>

            <Field label="End Time">
              <TimeInput
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !py-2"
              />
            </Field>

            <Field label="Reminder">
              <SearchableSelect
                value={form.reminder}
                onChange={(v) => update("reminder", v)}
                options={reminderOptions}
                placeholder="Select reminder..."
              />
            </Field>
          </div>

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

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default ActivityModal;