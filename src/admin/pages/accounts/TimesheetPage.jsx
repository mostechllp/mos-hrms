import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTimesheet, deleteTimesheet } from "../../store/slices/accounts/timesheetsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, FileText,
  Clock, CheckCircle2, X, Search, Filter,
  Trash2, Edit2, Calendar,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}>
      <Icon size={15} />
    </button>
  );
};

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between gap-3 text-[12px]">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">{value || "—"}</span>
  </div>
);

/* ---------- page ---------- */

const TimesheetPage = () => {
  const dispatch = useDispatch();
  const timesheets = useSelector((s) => s.timesheets.timesheets) || [];

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectName: "",
    taskName: "",
    timeSpent: "",
    billable: true,
    userName: "",
    notes: "",
  });

  const projects = [
    { id: "p1", name: "ss", customer: "Mrs. sss www" },
    { id: "p2", name: "Acme Mobile App", customer: "Acme Corp" },
  ];

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredEntries = timesheets.filter(
    (t) =>
      t.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTimesheet(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedEntry?.id === deleteTarget.id) setSelectedEntry(null);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  const handleFormChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSaveLog = async () => {
    if (!formData.projectName || !formData.timeSpent) return;
    setIsSubmitting(true);
    const project = projects.find((p) => p.name === formData.projectName);

    const newEntry = {
      date: formData.date,
      projectName: formData.projectName,
      customerName: project ? project.customer : "",
      taskName: formData.taskName || "General Task",
      userName: formData.userName || "Joe Doe",
      hours: formData.timeSpent,
      billable: formData.billable,
      notes: formData.notes,
    };

    await dispatch(addTimesheet(newEntry)).unwrap();
    setIsSubmitting(false);
    setIsModalOpen(false);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      projectName: "",
      taskName: "",
      timeSpent: "",
      billable: true,
      userName: "",
      notes: "",
    });
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Time tracking</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Timesheets
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {timesheets.length === 0
                ? "No time entries yet"
                : `${timesheets.length} ${timesheets.length === 1 ? "entry" : "entries"} logged`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>

            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Clock size={13} /> Start timer
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New entry
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={Filter}   label="Filter" />
                  <MenuItem icon={FileText} label="Export" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {timesheets.length === 0 ? (
          <EmptyState onCreate={() => setIsModalOpen(true)} />
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label="Select all" />

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search entries…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Project</th>
                    <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-left font-medium">Task</th>
                    <th className="px-4 py-2.5 text-left font-medium">User</th>
                    <th className="px-4 py-2.5 text-right font-medium">Time</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No entries match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select entry ${entry.id}`} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{entry.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {entry.projectName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.customerName}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.taskName}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.userName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {entry.hours}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Search} label="View"   onClick={() => setSelectedEntry(entry)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(entry)} />
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

      {/* ---- Slide-over detail ---- */}
      {selectedEntry && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedEntry(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Log entry</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedEntry.userName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedEntry)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="px-5 py-5">
              <Surface className="p-5 text-center relative">
                <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                  {selectedEntry.status || "Unbilled"}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-500 mb-2">
                  <Calendar size={13} /> {selectedEntry.date}
                </div>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                  {selectedEntry.hours.split(":")[0]}h <span className="text-slate-400">:</span> {selectedEntry.hours.split(":")[1]}m
                </div>
              </Surface>
            </div>

            {/* Tabs */}
            <div className="px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 -mb-px">
                <button className="px-3 py-2.5 text-[12.5px] font-medium text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100">
                  Other details
                </button>
                <button className="px-3 py-2.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors border-b-2 border-transparent">
                  Comments
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <Surface className="p-4 space-y-2.5">
                <DetailItem label="Project"  value={selectedEntry.projectName} />
                <DetailItem label="Customer" value={selectedEntry.customerName} />
                <DetailItem label="Task"     value={selectedEntry.taskName} />
                <DetailItem label="User"     value={selectedEntry.userName} />
              </Surface>

              {selectedEntry.notes && (
                <Surface className="p-4">
                  <SectionLabel>Notes</SectionLabel>
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.notes}
                  </p>
                </Surface>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ---- New log entry modal ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">New log entry</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Log time
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Date" required>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                  />
                </Field>

                <Field label="Time spent" required>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formData.timeSpent}
                    onChange={(e) => handleFormChange("timeSpent", e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
                  />
                </Field>
              </div>

              <Field label="Project" required>
                <select
                  value={formData.projectName}
                  onChange={(e) => handleFormChange("projectName", e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                >
                  <option value="">Select a project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Task" required>
                  <select
                    value={formData.taskName}
                    onChange={(e) => handleFormChange("taskName", e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                  >
                    <option value="">Select task…</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                  </select>
                </Field>

                <Field label="User" required>
                  <select
                    value={formData.userName}
                    onChange={(e) => handleFormChange("userName", e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                  >
                    <option value="">Select user…</option>
                    <option value="Joe Doe">Joe Doe</option>
                  </select>
                </Field>
              </div>

              <label className="inline-flex items-center gap-2 text-[12.5px] text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => handleFormChange("billable", e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                Billable
              </label>

              <Field label="Notes">
                <textarea
                  rows={3}
                  placeholder="Add notes…"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Start timer
              </button>
              <button
                onClick={handleSaveLog}
                disabled={isSubmitting}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : "Save entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete log entry"
        message="Are you sure you want to delete this time log entry? This action cannot be undone."
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Project" },
    { icon: FileText,     label: "Timesheet" },
    { icon: Clock,        label: "Log time", tone: "accent" },
    { icon: CheckCircle2, label: "Get paid", tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Clock size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Create your first time entry
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Log time spent on project tasks and charge your customers accordingly.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Log time
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Log time against project tasks",
          "Mark entries as billable to include in invoices",
          "Track who logged time and when",
        ].map((b) => (
          <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800",
    pos:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default TimesheetPage;