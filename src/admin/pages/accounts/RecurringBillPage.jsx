import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRecurringBill } from "../../store/slices/accounts/recurringBillsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, CheckCircle2, FileText,
  Edit2, X, ArrowRight, RefreshCw, Eye, Trash2,
  Search, Filter, ArrowUpDown, Repeat,
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

const StatusPill = ({ status }) => {
  const styles = {
    Active:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Stopped: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Draft:   "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const Metric = ({ label, value, accent }) => (
  <Surface className="p-4">
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
    <p className={`text-lg font-semibold tabular-nums ${accent ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-50"}`}>
      {value}
    </p>
  </Surface>
);

/* ---------- page ---------- */

const RecurringBillsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bills = useSelector((s) => s.recurringBills.recurringBills) || [];

  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredBills = bills.filter(
    (b) =>
      b.profileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteRecurringBill(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteError(null);
      if (selectedBill?.id === idToDelete) setSelectedBill(null);
    } catch (err) {
      console.error("Failed to delete recurring bill:", err);
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete. Please try again.");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Recurring bills
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {bills.length === 0
                ? "No recurring profiles yet"
                : `${bills.length} ${bills.length === 1 ? "profile" : "profiles"} configured`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/recurring-bills/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={ArrowUpDown} label="Sort by" />
                  <MenuItem icon={RefreshCw}  label="Refresh list" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {bills.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/recurring-bills/new")} />
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
                  placeholder="Search profiles…"
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
                    <th className="px-4 py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Profile name <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-left font-medium">Next bill date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Recurring period</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No profiles match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredBills.map((bill) => (
                    <tr
                      key={bill.id}
                      onClick={() => { setSelectedBill(bill); setActiveTab("Overview"); }}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${bill.profileName}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {bill.profileName}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{bill.vendor}</td>
                      <td className="px-4 py-3"><StatusPill status={bill.status} /></td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {bill.nextBillDate || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{bill.repeatEvery}ly</td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(bill.total).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedBill(bill); setActiveTab("Overview"); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/recurring-bills/edit/${bill.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(bill)} />
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
      {selectedBill && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedBill(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[55%] lg:w-1/2 bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Recurring profile</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {selectedBill.profileName}
                  </h2>
                  <StatusPill status={selectedBill.status} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/recurring-bills/edit/${selectedBill.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  <FileText size={13} /> Create bill
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "Next bill", "Recent activities"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors border-b-2 ${
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">

              {activeTab === "Overview" && (
                <>
                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Metric label="Bill amount"    value={`₹${Number(selectedBill.total).toFixed(2)}`} />
                    <Metric label="Next bill date" value={selectedBill.nextBillDate || "—"} accent />
                    <Metric label="Recurring"      value={`${selectedBill.repeatEvery}ly`} />
                  </div>

                  {/* Profile details */}
                  <Surface className="p-4">
                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{selectedBill.vendor}</p>
                        <p className="text-[11.5px] text-slate-500">Vendor</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailItem label="Status"         value={selectedBill.status} />
                      <DetailItem label="Payment terms"  value={selectedBill.paymentTerms} />
                      <DetailItem label="Start date"     value={selectedBill.startOn} />
                      <DetailItem label="End date"       value={selectedBill.neverExpires ? "Never expires" : selectedBill.endsOn} />
                    </div>
                  </Surface>

                  {/* Child bills */}
                  <Surface>
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <SectionLabel>Child bills</SectionLabel>
                      <ChevronDown size={12} className="text-slate-400" />
                    </div>
                    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
                      <div className="w-9 h-9 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <RefreshCw size={14} className="text-slate-400" />
                      </div>
                      <p className="text-[12.5px] text-slate-500 leading-relaxed">
                        Child bills for this profile will begin on{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">{selectedBill.nextBillDate}</span>.
                      </p>
                    </div>
                  </Surface>
                </>
              )}

              {activeTab !== "Overview" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">No data</p>
                  <p className="text-[12px] text-slate-500">Nothing to show under {activeTab} yet.</p>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete recurring bill"
        message={
          deleteError
            ? deleteError
            : isDeleting
              ? "Deleting recurring bill, please wait…"
              : `Are you sure you want to delete "${deleteTarget?.profileName}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{value || "—"}</p>
  </div>
);

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: Repeat,       label: "Routine purchase" },
    { icon: FileText,     label: "Create profile" },
    { icon: FileText,     label: "Generated bill" },
    { icon: CheckCircle2, label: "Record payment", tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Repeat size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Create. Set. Repeat.
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Pay your vendors on time by creating recurring bills.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create recurring bill
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <ArrowRight size={12} className="text-slate-300 dark:text-slate-700" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Automatically generate bills from a schedule",
          "Track when each bill is generated",
          "Manually add a bill within a profile",
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
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default RecurringBillsPage;