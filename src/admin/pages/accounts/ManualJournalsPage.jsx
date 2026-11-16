// src/admin/pages/accounts/ManualJournalsPage.jsx
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
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const StatusPill = ({ status }) => {
  const isPublished = status === "Published";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
        isPublished
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {status}
    </span>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-xs md:text-[13px] text-gray-900 dark:text-gray-100 font-medium">
      {value || "—"}
    </p>
  </div>
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

  const totalJournals = journals.length;
  const publishedCount = journals.filter((j) => j.status === "Published").length;
  const draftCount = journals.filter((j) => j.status !== "Published").length;
  const totalAmount = journals.reduce((s, j) => s + (Number(j.total) || 0), 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Journals" value={totalJournals} icon="fas fa-book" color="green" />
        <MiniStat label="Published" value={publishedCount} icon="fas fa-circle-check" color="blue" />
        <MiniStat label="Drafts" value={draftCount} icon="fas fa-file-lines" color="violet" />
        <MiniStat
          label="Total Amount"
          value={`₹${totalAmount.toFixed(2)}`}
          icon="fas fa-indian-rupee-sign"
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Manual journals
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalJournals === 0
              ? "No journal entries yet"
              : `${totalJournals} ${totalJournals === 1 ? "entry" : "entries"}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn className="border border-gray-200 dark:border-gray-700">
            Find accountants
          </GhostBtn>
          <button
            onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Journal
          </button>
          <button
            className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ---- Empty state ---- */}
      {totalJournals === 0 ? (
        <Card className="py-16 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <BookOpen size={22} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              Start making journal entries
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 mb-6">
              Transfer and adjust money between accounts with double-entry journals.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={14} /> Create journal
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
              <div key={b} className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300">
                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* ---- Table ---- */
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
                placeholder="Search journals…"
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1000px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Journal #</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Reference #</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Notes</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map((journal) => (
                    <tr
                      key={journal.id}
                      className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }}
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                          aria-label={`Select journal ${journal.journalNumber}`}
                        />
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {journal.date}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJournal(journal);
                            setViewMode("Details");
                          }}
                          className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                        >
                          {journal.journalNumber}
                        </button>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {journal.referenceNumber || "—"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
                        {journal.notes || "—"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                        ₹{Number(journal.total).toFixed(2)}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <StatusPill status={journal.status} />
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <IconAction
                            icon={Search}
                            label="View"
                            tone="primary"
                            onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }}
                          />
                          <IconAction
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => setDeleteTarget(journal)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ---- Drawer ---- */}
      {selectedJournal && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedJournal(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[65%] lg:w-[60%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">

            {/* Drawer header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Journal</p>
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                    {selectedJournal.journalNumber}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <IconAction icon={FileText} label="Export" onClick={() => {}} />
                  <button
                    onClick={() => setSelectedJournal(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                    className={`px-3 py-2.5 text-xs md:text-[12.5px] font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
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
                <Card>
                  {/* Section header with view toggle */}
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-semibold text-gray-500 tabular-nums">
                        #{selectedJournal.journalNumber}
                      </span>
                      <StatusPill status={selectedJournal.status} />
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-0.5">
                      {["Details", "PDF"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setViewMode(m)}
                          className={`px-3 py-1 text-[11.5px] font-medium rounded-full transition-colors ${
                            viewMode === m
                              ? "bg-white dark:bg-gray-800 shadow-sm text-green-600 dark:text-green-400"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                        <table className="w-full text-xs md:text-[12.5px] whitespace-nowrap border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                              <th className="px-2 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Item</th>
                              <th className="px-2 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Contact</th>
                              <th className="px-2 py-2 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Debit</th>
                              <th className="px-2 py-2 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedJournal.lines.map((line, idx) => (
                              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="px-2 py-3">
                                  <p className="text-gray-800 dark:text-gray-100 font-semibold">{line.account}</p>
                                  {line.description && (
                                    <p className="text-[11px] text-gray-500 mt-0.5">{line.description}</p>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{line.contact || "—"}</td>
                                <td className="px-2 py-3 text-right text-gray-600 dark:text-gray-300 tabular-nums">
                                  {line.debit ? Number(line.debit).toFixed(2) : ""}
                                </td>
                                <td className="px-2 py-3 text-right text-gray-600 dark:text-gray-300 tabular-nums">
                                  {line.credit ? Number(line.credit).toFixed(2) : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end mt-4">
                        <div className="w-full sm:w-1/2 space-y-2 text-xs md:text-[12.5px]">
                          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-gray-500">Subtotal</span>
                            <div className="flex gap-10">
                              <span className="font-medium text-gray-800 dark:text-gray-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                            <span className="text-gray-900 dark:text-gray-100 font-semibold">Total amount</span>
                            <div className="flex gap-10">
                              <span className="font-semibold text-gray-900 dark:text-gray-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100 w-20 text-right tabular-nums">
                                {Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === "PDF" && (
                    <div className="px-5 py-6 flex justify-center bg-gray-100 dark:bg-gray-900/60">
                      <div className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 relative p-8 min-h-[640px] flex flex-col rounded-lg">
                        <div className="flex justify-end mb-4">
                          <button className="inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium">
                            <Settings size={11} /> Customize
                          </button>
                        </div>

                        <div className="text-center mb-10">
                          <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-50 tracking-widest mb-3">
                            JOURNAL
                          </h1>
                          <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">
                            #{selectedJournal.journalNumber}
                          </p>
                        </div>

                        <div className="flex justify-between items-start mb-8 text-[12px]">
                          <div className="space-y-1.5 max-w-[55%]">
                            <p className="text-gray-500">Notes</p>
                            <p className="text-gray-900 dark:text-gray-100">{selectedJournal.notes}</p>
                          </div>
                          <div className="space-y-1.5 text-right">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="inline-block w-24 text-left">Date:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedJournal.date}</span>
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="inline-block w-24 text-left">Amount:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                ₹{Number(selectedJournal.total).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="inline-block w-24 text-left">Reference:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {selectedJournal.referenceNumber || "—"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mb-6 flex-1">
                          <table className="w-full text-left text-[12px] border-collapse">
                            <thead>
                              <tr className="bg-gray-800 dark:bg-gray-700 text-white">
                                <th className="px-3 py-2 font-medium">Account</th>
                                <th className="px-3 py-2 font-medium">Contact</th>
                                <th className="px-3 py-2 font-medium text-right">Debits</th>
                                <th className="px-3 py-2 font-medium text-right">Credits</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {selectedJournal.lines.map((line, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2.5">
                                    <p className="text-gray-900 dark:text-gray-100 font-medium">{line.account}</p>
                                    {line.description && (
                                      <p className="text-[10.5px] text-gray-500">{line.description}</p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{line.contact || "—"}</td>
                                  <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-200 tabular-nums">
                                    {line.debit ? Number(line.debit).toFixed(2) : ""}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-200 tabular-nums">
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
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <div className="flex gap-8">
                                <span className="font-medium text-gray-900 dark:text-gray-100 w-16 text-right tabular-nums">
                                  {Number(selectedJournal.total).toFixed(2)}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 w-16 text-right tabular-nums">
                                  {Number(selectedJournal.total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded-md font-semibold">
                              <span className="text-gray-900 dark:text-gray-100">Total</span>
                              <div className="flex gap-8">
                                <span className="text-gray-900 dark:text-gray-100 w-16 text-right tabular-nums">
                                  ₹{Number(selectedJournal.total).toFixed(2)}
                                </span>
                                <span className="text-gray-900 dark:text-gray-100 w-16 text-right tabular-nums">
                                  ₹{Number(selectedJournal.total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="py-16">
                  <div className="text-center text-xs md:text-[13px] text-gray-500">
                    No data available for {activeTab}
                  </div>
                </Card>
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

export default ManualJournalsPage;