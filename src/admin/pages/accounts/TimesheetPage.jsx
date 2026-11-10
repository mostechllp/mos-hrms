import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTimesheet, deleteTimesheet } from "../../store/slices/accounts/timesheetsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, PlayCircle, Box, FileText,
  Clock, RefreshCw, CheckCircle2, X, Search, Filter,
  ArrowLeft, Trash2, Edit2, Calendar, User, Briefcase
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const TimesheetPage = () => {
  const dispatch = useDispatch();
  const timesheets = useSelector((state) => state.timesheets.timesheets);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Shared modal input style
  const inputCls =
    "w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500";

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

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen relative overflow-hidden flex flex-col text-gray-900 dark:text-gray-100">

      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Timesheets</h1>
          <ChevronDown size={16} className="text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
            <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l border-gray-300 dark:border-gray-600">
              <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
            <Clock size={16} /> Start
          </button>

          <div className="flex items-center rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> New Log Entry
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 border-l border-blue-400">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {timesheets.length === 0 ? (
        /* EMPTY STATE LAYOUT */
        <div className="flex flex-col items-center pt-16 pb-20 px-6">
          <h2 className="text-2xl font-normal text-gray-800 dark:text-gray-100 mb-2">
            Create your first time entry
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-lg text-center">
            Log the time spent on project tasks and charge your customers accordingly.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold"
          >
            LOG TIME
          </button>

          {/* Life Cycle Section */}
          <div className="w-full max-w-5xl mt-20 text-center border-t border-gray-200 dark:border-gray-700 pt-12">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-12">
              Life cycle of a Timesheet
            </h3>

            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <div className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                <FileText size={16} className="text-blue-500 dark:text-blue-400" /> PROJECT
              </div>
              <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
              <div className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                <FileText size={16} className="text-blue-500 dark:text-blue-400" /> TIME SHEET
              </div>
              <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
              <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                <Clock size={16} className="text-blue-500 dark:text-blue-400" /> LOG TIME FOR TASKS
              </div>

              <div className="flex flex-col gap-2 relative ml-2">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <div className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700 dark:text-blue-300">
                    <FileText size={16} className="text-blue-500 dark:text-blue-400" /> BILLABLE
                  </div>
                  <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <div className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700 dark:text-blue-300">
                    <FileText size={16} className="text-blue-500 dark:text-blue-400" /> INCLUDE TIME ENTRIES IN INVOICE
                  </div>
                  <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                    <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" /> GET PAID
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                    <FileText size={16} className="text-red-500 dark:text-red-400" /> NON-BILLABLE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN TABLE */
        <>
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Filter size={16} />
              </button>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-900"
              />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search timesheets..."
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">PROJECT</th>
                  <th className="px-4 py-3">CUSTOMER</th>
                  <th className="px-4 py-3">TASK</th>
                  <th className="px-4 py-3">USER</th>
                  <th className="px-4 py-3 text-right">TIME</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {timesheets.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors group"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.date}</td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {entry.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.customerName}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.taskName}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.userName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 text-right">{entry.hours}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                        >
                          <Search size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(entry)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* NEW LOG ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 z-50 flex justify-center items-start pt-10 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">New Log Entry</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Log time instantly using shortcut keys c + t</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              <div className="space-y-1.5">
                <label className="text-sm text-red-500 dark:text-red-400 font-medium">Date*</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-red-500 dark:text-red-400 font-medium">Project Name*</label>
                <select
                  value={formData.projectName}
                  onChange={(e) => handleFormChange("projectName", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-red-500 dark:text-red-400 font-medium">Task Name*</label>
                <select
                  value={formData.taskName}
                  onChange={(e) => handleFormChange("taskName", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select task</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                  Time Spent*{" "}
                  <span className="text-gray-400 dark:text-gray-500 text-xs rounded-full bg-gray-200 dark:bg-gray-700 w-4 h-4 flex items-center justify-center cursor-help">?</span>
                </label>
                <input
                  type="text"
                  placeholder="HH:MM"
                  value={formData.timeSpent}
                  onChange={(e) => handleFormChange("timeSpent", e.target.value)}
                  className={inputCls}
                />
                <button className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1 font-medium hover:underline mt-1">
                  <Clock size={12} /> Set start and end time instead
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => handleFormChange("billable", e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-900"
                />
                Billable
              </label>

              <div className="space-y-1.5">
                <label className="text-sm text-red-500 dark:text-red-400 font-medium">User*</label>
                <select
                  value={formData.userName}
                  onChange={(e) => handleFormChange("userName", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select user</option>
                  <option value="Joe Doe">Joe Doe</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  placeholder="Add notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  className={`${inputCls} resize-none h-20`}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <button
                onClick={handleSaveLog}
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Start Timer
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDING DETAIL PANEL */}
      {selectedEntry && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/60 z-40 backdrop-blur-[1px]" onClick={() => setSelectedEntry(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200 dark:border-gray-700">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedEntry.userName}'s Log Entry
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedEntry)}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded border border-gray-300 dark:border-gray-600"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Summary Card — the cream panel becomes a subtle amber wash on dark */}
            <div className="px-6 py-6">
              <div className="bg-[#FFF4EB] dark:bg-orange-900/20 rounded-lg p-6 text-center relative">
                <div className="absolute top-0 right-0 bg-orange-500 dark:bg-orange-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                  {selectedEntry.status || "Unbilled"}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Calendar size={16} /> {selectedEntry.date}
                </div>
                <div className="text-3xl text-gray-900 dark:text-gray-100">
                  {selectedEntry.hours.split(":")[0]} hrs : {selectedEntry.hours.split(":")[1]} mins
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
              <button className="py-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 mr-6">
                Other Details
              </button>
              <button className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                Comments
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm flex-1 overflow-y-auto">
              <div className="flex">
                <span className="w-1/3 text-gray-500 dark:text-gray-400">Project Name :</span>
                <span className="w-2/3 text-gray-800 dark:text-gray-200 font-medium">{selectedEntry.projectName}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-500 dark:text-gray-400">Customer Name :</span>
                <span className="w-2/3 text-gray-800 dark:text-gray-200 font-medium">{selectedEntry.customerName}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-500 dark:text-gray-400">Task Name :</span>
                <span className="w-2/3 text-gray-800 dark:text-gray-200 font-medium">{selectedEntry.taskName}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-500 dark:text-gray-400">User Name :</span>
                <span className="w-2/3 text-gray-800 dark:text-gray-200 font-medium">{selectedEntry.userName}</span>
              </div>
              {selectedEntry.notes && (
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 mb-1">Notes :</span>
                  <span className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    {selectedEntry.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Log Entry"
        message="Are you sure you want to delete this time log entry? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
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
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TimesheetPage;