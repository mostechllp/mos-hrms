// src/admin/components/meetings/AddMeetingModal.jsx
import { useEffect, useMemo, useState } from "react";
import { X, Loader, Link2 } from "lucide-react";
import SearchableSelect from "../../../components/common/SearchableSelect";
import DateInput from "../../components/common/DateInput";
import { TimeInput } from "../../components/common/TimeInput";
import { EMPLOYEES, RELATED_TO_OPTIONS } from "../../pages/Meetings";

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${props.className || ""}`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
  />
);

const ParticipantPicker = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMPLOYEES;
    return EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.designation || "").toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (emp) =>
    onChange(
      selected.includes(emp.id)
        ? selected.filter((id) => id !== emp.id)
        : [...selected, emp.id],
    );

  const selectedEmployees = EMPLOYEES.filter((e) => selected.includes(e.id));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-sm focus:outline-none focus:border-blue-500"
      >
        {selectedEmployees.length === 0 ? (
          <span className="text-gray-400">Select participants…</span>
        ) : (
          selectedEmployees.map((emp) => (
            <span
              key={emp.id}
              className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold"
            >
              <img src={emp.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              {emp.name.split(" ")[0]}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(emp);
                }}
                className="ml-0.5 text-blue-500 hover:text-blue-700"
              >
                <X size={10} />
              </button>
            </span>
          ))
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees…"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-gray-500 text-center">
                No employees found
              </p>
            )}
            {filtered.map((emp) => {
              const checked = selected.includes(emp.id);
              return (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => toggle(emp)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                    checked ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <input type="checkbox" checked={checked} readOnly className="accent-blue-500" />
                  <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {emp.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {emp.designation}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const emptyForm = (host) => ({
  title: "",
  date: "",
  startTime: "10:00",
  endTime: "11:00",
  hostId: host?.id || 1,
  hostName: host?.name || "You",
  participantIds: [],
  relatedTo: "",
  clientName: "",
  clientEmail: "",
  description: "",
  meetingLink: "",
});

// 👇 Added initialData prop
const AddMeetingModal = ({ isOpen, onClose, onSave, defaultDate, host, initialData }) => {
  const [form, setForm] = useState(emptyForm(host));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData); // Pre-fill for edit
      } else {
        setForm({ ...emptyForm(host), date: defaultDate || "" }); // Blank for add
      }
      setErrors({});
    }
  }, [isOpen, defaultDate, host, initialData]);

  if (!isOpen) return null;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.date) next.date = "Date is required";
    if (!form.startTime) next.startTime = "Start time is required";
    if (form.endTime && form.endTime <= form.startTime)
      next.endTime = "End time must be after start time";
    if (!form.relatedTo) next.relatedTo = "Select what this relates to";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave?.(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Meeting" : "Schedule Meeting"}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <Field label="Meeting Title" required>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Demo with Acme Corp"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Date" required>
              <DateInput
                value={form.date}
                onChange={(val) => update("date", val)}
                type="general"
                placeholder="dd/mm/yyyy"
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2"
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </Field>
            <Field label="Start Time" required>
              <TimeInput
                value={form.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !py-2"
                required
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
            </Field>
            <Field label="End Time">
              <TimeInput
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !py-2"
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
            </Field>
          </div>

          <Field label="Host" hint="Defaults to you (current user)">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg">
              <img
                src={EMPLOYEES.find((e) => e.id === form.hostId)?.avatar || "https://i.pravatar.cc/150?img=1"}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">{form.hostName}</span>
            </div>
          </Field>

          <Field label="Participants">
            <ParticipantPicker
              selected={form.participantIds}
              onChange={(ids) => update("participantIds", ids)}
            />
          </Field>

          {/* ── Client Info Fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Client Name">
              <Input
                value={form.clientName}
                onChange={(e) => update("clientName", e.target.value)}
                placeholder="e.g. Jane Doe"
              />
            </Field>
            <Field label="Client Email">
              <Input
                type="email"
                value={form.clientEmail}
                onChange={(e) => update("clientEmail", e.target.value)}
                placeholder="jane@company.com"
              />
            </Field>
          </div>

          <Field label="Related To" required>
            <SearchableSelect
              value={form.relatedTo}
              onChange={(v) => update("relatedTo", v)}
              options={RELATED_TO_OPTIONS}
              placeholder="Lead, Contact, Internal, Other…"
              searchPlaceholder="Search leads, contacts, internal…"
            />
            {errors.relatedTo && <p className="text-xs text-red-500 mt-1">{errors.relatedTo}</p>}
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Agenda, context, notes…"
            />
          </Field>

          <Field label="Meeting Link">
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={form.meetingLink}
                onChange={(e) => update("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/…"
                className="!pl-9"
              />
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting && <Loader size={14} className="animate-spin" />}
            {isEditing ? "Update Meeting" : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMeetingModal;