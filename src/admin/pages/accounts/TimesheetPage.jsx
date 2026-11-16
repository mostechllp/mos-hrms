// src/admin/pages/accounts/TimesheetPage.jsx
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
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
    <Icon size={14} className="text-gray-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    primary:
      "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
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

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between gap-3 text-xs md:text-[12px]">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-100 text-right">{value || "—"}</span>
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

  const totalEntries = timesheets.length;
  const billableEntries = timesheets.filter((t) => t.billable).length;
  const unbilledEntries = timesheets.filter((t) => !t.billable).length;
  const totalHours = timesheets.reduce((s, t) => {
    const [h = 0, m = 0] = (t.hours || "0:0").split(":").map(Number);
    return s + h + m / 60;
  }, 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Entries" value={totalEntries} icon="fas fa-clock" color="green" />
        <MiniStat label="Billable" value={billableEntries} icon="fas fa-circle-check" color="blue" />
        <MiniStat label="Non-billable" value={unbilledEntries} icon="fas fa-circle-minus" color="violet" />
        <MiniStat
          label="Total Hours"
          value={`${totalHours.toFixed(1)}h`}
          icon="fas fa-hourglass-half"
          color="amber"
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Timesheets
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalEntries === 0
              ? "No time entries yet"
              : `${totalEntries} ${totalEntries === 1 ? "entry" : "entries"} logged`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn title="Filter" className="border border-gray-200 dark:border-gray-700 !px-2">
            <Filter size={15} />
          </GhostBtn>

          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Clock size={13} /> Start timer
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Entry
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                <MenuItem icon={Filter}   label="Filter" />
                <MenuItem icon={FileText} label="Export" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Empty state ---- */}
      {totalEntries === 0 ? (
        <EmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        /* ---- Table surface ---- */
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <GhostBtn title="Filter" className="!px-2">
              <Filter size={15} />
            </GhostBtn>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
              aria-label="Select all"
            />

            <div className="relative ml-auto w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Project</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Task</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">User</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Time</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-xs md:text-[13px] text-gray-500">
                        No entries match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select entry ${entry.id}`}
                          />
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.date}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(entry);
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {entry.projectName}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.customerName}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.taskName}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.userName}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          {entry.hours}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <IconAction icon={Search} label="View" tone="primary" onClick={() => setSelectedEntry(entry)} />
                            <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(entry)} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ---- Slide-over detail ---- */}
      {selectedEntry && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedEntry(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Log entry</p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedEntry.userName}
                </h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconAction icon={Edit2}  label="Edit"   onClick={() => {}} />
                <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(selectedEntry)} />
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="px-5 py-5">
              <Card className="p-5 text-center relative">
                <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {selectedEntry.status || "Unbilled"}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-gray-500 mb-2">
                  <Calendar size={13} /> {selectedEntry.date}
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                  {selectedEntry.hours.split(":")[0]}h <span className="text-gray-400">:</span> {selectedEntry.hours.split(":")[1]}m
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="px-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 -mb-px">
                <button className="px-3 py-2.5 text-xs md:text-[12.5px] font-medium text-green-600 dark:text-green-400 border-b-2 border-green-500">
                  Other details
                </button>
                <button className="px-3 py-2.5 text-xs md:text-[12.5px] font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors border-b-2 border-transparent">
                  Comments
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <Card className="p-4 space-y-2.5">
                <DetailItem label="Project"  value={selectedEntry.projectName} />
                <DetailItem label="Customer" value={selectedEntry.customerName} />
                <DetailItem label="Task"     value={selectedEntry.taskName} />
                <DetailItem label="User"     value={selectedEntry.userName} />
              </Card>

              {selectedEntry.notes && (
                <Card className="p-4">
                  <SectionLabel>Notes</SectionLabel>
                  <p className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.notes}
                  </p>
                </Card>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ---- New log entry modal ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">New log entry</p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Log time
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                  />
                </Field>

                <Field label="Time spent" required>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formData.timeSpent}
                    onChange={(e) => handleFormChange("timeSpent", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition tabular-nums"
                  />
                </Field>
              </div>

              <Field label="Project" required>
                <select
                  value={formData.projectName}
                  onChange={(e) => handleFormChange("projectName", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                  >
                    <option value="">Select user…</option>
                    <option value="Joe Doe">Joe Doe</option>
                  </select>
                </Field>
              </div>

              <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => handleFormChange("billable", e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                />
                Billable
              </label>

              <Field label="Notes">
                <textarea
                  rows={3}
                  placeholder="Add notes…"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                Start timer
              </button>
              <button
                onClick={handleSaveLog}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Project" },
    { icon: FileText,     label: "Timesheet" },
    { icon: Clock,        label: "Log time", tone: "accent" },
    { icon: CheckCircle2, label: "Get paid", tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Clock size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Create your first time entry
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Log time spent on project tasks and charge your customers accordingly.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Log time
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-gray-300 dark:text-gray-600 text-xs">→</span>}
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
          <div key={b} className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300">
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    pos:     "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/40",
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default TimesheetPage;