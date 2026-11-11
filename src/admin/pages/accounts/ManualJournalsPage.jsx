import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteJournal } from "../../store/slices/accounts/manualJournalsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, X, Search, Filter,
  Trash2, Edit2, CheckCircle2, FileText, Printer, Settings, BookOpen,
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

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const StatusPill = ({ status }) => {
  const isPublished = status === "Published";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
        isPublished
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      }`}
    >
      {status}
    </span>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-[13px] text-slate-900 dark:text-slate-100 font-medium">{value || "—"}</p>
  </div>
);

/* ---------- page ---------- */

const ManualJournalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const journals = useSelector((state) => state.manualJournals.journals);

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [viewMode, setViewMode] = useState("Details");

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;
    try {
      await dispatch(deleteJournal(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedJournal?.id === idToDelete) setSelectedJournal(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete journal.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accountant</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Manual journals
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {journals.length === 0
                ? "No journal entries yet"
                : `${journals.length} ${journals.length === 1 ? "entry" : "entries"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn className="border border-slate-200 dark:border-slate-800">
              Find accountants
            </GhostBtn>
            <button
              onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>
            <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800">
              <MoreHorizontal size={16} />
            </GhostBtn>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {journals.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BookOpen size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Start making journal entries
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Transfer and adjust money between accounts with double-entry journals.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Plus size={13} /> Create journal
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Import journals
                </button>
              </div>
            </div>

            <div className="mt-12 max-w-md mx-auto space-y-2">
              {[
                "Create journals from templates to save time",
                "Customize journals to suit your branding",
                "Control publishing with roles and permissions",
              ].map((b) => (
                <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </Surface>
        ) : (
          /* ---- Table ---- */
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input
                type="checkbox"
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                aria-label="Select all"
              />
              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search journals…"
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
                    <th className="px-4 py-2.5 text-left font-medium">Journal #</th>
                    <th className="px-4 py-2.5 text-left font-medium">Reference #</th>
                    <th className="px-4 py-2.5 text-left font-medium">Notes</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {journals.map((journal) => (
                    <tr
                      key={journal.id}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }}
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          aria-label={`Select journal ${journal.journalNumber}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{journal.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {journal.journalNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{journal.referenceNumber || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[220px]">{journal.notes || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(journal.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={journal.status} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="View"
                            aria-label="View"
                          >
                            <Search size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(journal)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* ---- Drawer ---- */}
      {selectedJournal && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedJournal(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[65%] lg:w-[60%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Journal</p>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                    {selectedJournal.journalNumber}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Export"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedJournal(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 px-5 pb-3">
                <GhostBtn
                  onClick={() => navigate(`/admin/accounts/accountant/manual-journals/edit/${selectedJournal.id}`)}
                >
                  <Edit2 size={13} /> Edit
                </GhostBtn>
                <GhostBtn>
                  <Printer size={13} /> PDF / Print <ChevronDown size={13} className="ml-0.5" />
                </GhostBtn>
                <GhostBtn className="!px-2">
                  <MoreHorizontal size={15} />
                </GhostBtn>
              </div>

              <div className="flex gap-1 px-5 -mb-px">
                {["Overview", "Activity Logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2.5 text-[12.5px] font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {activeTab === "Overview" ? (
                <Surface>
                  {/* Section header with view toggle */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-semibold text-slate-500 tabular-nums">
                        #{selectedJournal.journalNumber}
                      </span>
                      <StatusPill status={selectedJournal.status} />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                      {["Details", "PDF"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setViewMode(m)}
                          className={`px-2.5 py-1 text-[11.5px] font-medium rounded-md transition-colors ${
                            viewMode === m
                              ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {viewMode === "Details" && (
                    <div className="px-5 py-5">
                      <SectionLabel>Details</SectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        <DetailRow label="Journal #" value={selectedJournal.journalNumber} />
                        <DetailRow label="Reference #" value={selectedJournal.referenceNumber} />
                        <DetailRow label="Journal date" value={selectedJournal.date} />
                        <DetailRow label="Transaction type" value="Journal" />
                        <DetailRow label="Currency" value="INR" />
                        <DetailRow label="Reporting method" value={selectedJournal.reportingMethod} />
                        <div className="sm:col-span-2">
                          <DetailRow label="Notes" value={selectedJournal.notes} />
                        </div>
                      </div>

                      <SectionLabel>Journal lines</SectionLabel>
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-[12.5px] whitespace-nowrap">
                          <thead>
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                              <th className="px-2 py-2.5 text-left font-medium">Item</th>
                              <th className="px-2 py-2.5 text-left font-medium">Contact</th>
                              <th className="px-2 py-2.5 text-right font-medium">Debit</th>
                              <th className="px-2 py-2.5 text-right font-medium">Credit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {selectedJournal.lines.map((line, idx) => (
                              <tr key={idx}>
                                <td className="px-2 py-3">
                                  <p className="text-slate-900 dark:text-slate-100 font-medium">{line.account}</p>
                                  {line.description && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{line.description}</p>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-slate-700 dark:text-slate-200">{line.contact || "—"}</td>
                                <td className="px-2 py-3 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                                  {line.debit ? Number(line.debit).toFixed(2) : ""}
                                </td>
                                <td className="px-2 py-3 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                                  {line.credit ? Number(line.credit).toFixed(2) : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end mt-4">
                        <div className="w-full sm:w-1/2 space-y-2 text-[12.5px]">
                          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                            <span className="text-slate-500">Subtotal</span>
                            <div className="flex gap-10">
                              <span className="font-medium text-slate-800 dark:text-slate-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                              <span className="font-medium text-slate-800 dark:text-slate-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-slate-300 dark:border-slate-700 pt-2">
                            <span className="text-slate-900 dark:text-slate-100 font-semibold">Total amount</span>
                            <div className="flex gap-10">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === "PDF" && (
                    <div className="px-5 py-6 flex justify-center bg-slate-100 dark:bg-slate-900/60">
                      <div className="w-full max-w-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 relative p-8 min-h-[640px] flex flex-col">
                        <div className="flex justify-end mb-4">
                          <button className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md font-medium">
                            <Settings size={11} /> Customize
                          </button>
                        </div>

                        <div className="text-center mb-10">
                          <h1 className="text-2xl font-serif text-slate-900 dark:text-slate-50 tracking-widest mb-3">
                            JOURNAL
                          </h1>
                          <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                            #{selectedJournal.journalNumber}
                          </p>
                        </div>

                        <div className="flex justify-between items-start mb-8 text-[12px]">
                          <div className="space-y-1.5 max-w-[55%]">
                            <p className="text-slate-500">Notes</p>
                            <p className="text-slate-900 dark:text-slate-100">{selectedJournal.notes}</p>
                          </div>
                          <div className="space-y-1.5 text-right">
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="inline-block w-24 text-left">Date:</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">{selectedJournal.date}</span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="inline-block w-24 text-left">Amount:</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                ₹{Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="inline-block w-24 text-left">Reference:</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {selectedJournal.referenceNumber || "—"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mb-6 flex-1">
                          <table className="w-full text-left text-[12px] border-collapse">
                            <thead>
                              <tr className="bg-slate-800 dark:bg-slate-700 text-white">
                                <th className="px-3 py-2 font-medium">Account</th>
                                <th className="px-3 py-2 font-medium">Contact</th>
                                <th className="px-3 py-2 font-medium text-right">Debits</th>
                                <th className="px-3 py-2 font-medium text-right">Credits</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                              {selectedJournal.lines.map((line, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2.5">
                                    <p className="text-slate-900 dark:text-slate-100 font-medium">{line.account}</p>
                                    {line.description && (
                                      <p className="text-[10.5px] text-slate-500">{line.description}</p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{line.contact || "—"}</td>
                                  <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                                    {line.debit ? Number(line.debit).toFixed(2) : ""}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                                    {line.credit ? Number(line.credit).toFixed(2) : ""}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end mb-4">
                          <div className="w-1/2 space-y-1.5 text-[12px]">
                            <div className="flex justify-between py-1">
                              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                              <div className="flex gap-8">
                                <span className="font-medium text-slate-900 dark:text-slate-100 w-16 text-right tabular-nums">
                                  {Number(selectedJournal.total).toFixed(2)}
                                </span>
                                <span className="font-medium text-slate-900 dark:text-slate-100 w-16 text-right tabular-nums">
                                  {Number(selectedJournal.total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between bg-slate-100 dark:bg-slate-800 py-2 px-3 rounded-md font-semibold">
                              <span className="text-slate-900 dark:text-slate-100">Total</span>
                              <div className="flex gap-8">
                                <span className="text-slate-900 dark:text-slate-100 w-16 text-right tabular-nums">
                                  ₹{Number(selectedJournal.total).toFixed(2)}
                                </span>
                                <span className="text-slate-900 dark:text-slate-100 w-16 text-right tabular-nums">
                                  ₹{Number(selectedJournal.total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Surface>
              ) : (
                <Surface className="py-16">
                  <div className="text-center text-[13px] text-slate-500">
                    No data available for {activeTab}
                  </div>
                </Surface>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={handleDeleteConfirm}
        title="Delete journal"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting journal, please wait..."
            : `Are you sure you want to delete journal #${deleteTarget?.journalNumber}? This action cannot be undone.`
        }
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
      `}</style>
    </div>
  );
};

export default ManualJournalsPage;
