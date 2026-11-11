import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileStatus, deleteProfile } from "../../store/slices/accounts/recurringExpensesSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  ArrowRight, RefreshCw, Wallet, Calendar, Receipt,
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

/* ---------- page ---------- */

const RecurringExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((s) => s.recurringExpenses.profiles) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredProfiles = profiles.filter(
    (p) =>
      p.profileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.expenseAccount?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteProfile(deleteTarget.id));
      if (selectedProfile?.id === deleteTarget.id) setSelectedProfile(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Recurring expenses
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {profiles.length === 0
                ? "No recurring profiles yet"
                : `${profiles.length} ${profiles.length === 1 ? "profile" : "profiles"} configured`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/recurring-expenses/new")}
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
                  <MenuItem icon={Download}   label="Import" />
                  <MenuItem icon={Upload}     label="Export" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings}   label="Preferences" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {profiles.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/recurring-expenses/new")} />
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
                    <th className="px-4 py-2.5 text-left font-medium">Expense account</th>
                    <th className="px-4 py-2.5 text-left font-medium">Frequency</th>
                    <th className="px-4 py-2.5 text-left font-medium">Next date</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No profiles match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredProfiles.map((profile) => (
                    <tr
                      key={profile.id}
                      onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${profile.profileName}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {profile.profileName}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{profile.expenseAccount}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{profile.repeatEvery}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{profile.startDate}</td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{profile.amount.toFixed(2)}
                      </td>

                      <td className="px-4 py-3"><StatusPill status={profile.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/recurring-expenses/edit/${profile.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(profile)} />
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
      {selectedProfile && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedProfile(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Recurring profile</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {selectedProfile.profileName}
                  </h2>
                  <StatusPill status={selectedProfile.status} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/recurring-expenses/edit/${selectedProfile.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setSelectedProfile(null)}
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
                {["Overview", "All expenses"].map((tab) => (
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
                    <Metric icon={Wallet}   label="Amount"    value={`₹${selectedProfile.amount.toFixed(2)}`} />
                    <Metric icon={RefreshCw} label="Repeats"  value={selectedProfile.repeatEvery} />
                    <Metric icon={Calendar}  label="Next date" value={selectedProfile.startDate} />
                  </div>

                  {/* Details */}
                  <Surface className="p-4">
                    <SectionLabel>Details</SectionLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label="Expense account" value={selectedProfile.expenseAccount} />
                      <DetailItem label="Paid through"    value={selectedProfile.paidThrough} />
                      <DetailItem label="Start on"        value={selectedProfile.startDate} />
                      <DetailItem label="Ends on"         value={selectedProfile.neverExpires ? "Never expires" : selectedProfile.endDate} />
                    </div>
                  </Surface>

                  {/* Notes */}
                  {selectedProfile.notes && (
                    <Surface className="p-4">
                      <SectionLabel>Notes</SectionLabel>
                      <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedProfile.notes}
                      </p>
                    </Surface>
                  )}

                  {/* History */}
                  <Surface className="p-4">
                    <SectionLabel>History</SectionLabel>
                    <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-4 mt-2">
                      {[
                        { icon: FileText, title: "Recurring expense created", detail: `For ₹${selectedProfile.amount.toFixed(2)} by Joe Doe`, tone: "pos" },
                        { icon: FileText, title: "Expense generated",         detail: `For ₹${selectedProfile.amount.toFixed(2)} by Joe Doe`, tone: "warn" },
                      ].map((item, i) => (
                        <li key={i} className="pl-4 relative">
                          <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 rounded-full" />
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.tone === "pos" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            }`}>
                              <item.icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                              <p className="text-[11.5px] text-slate-500 mt-0.5">{item.detail}</p>
                              <p className="text-[10.5px] text-slate-400 mt-0.5">30 Oct 2026 · 11:03 AM</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Surface>
                </>
              )}

              {activeTab === "All expenses" && (
                <Surface className="overflow-hidden">
                  <div className="px-4 pt-4 pb-2"><SectionLabel>Generated expenses</SectionLabel></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px]">
                      <thead>
                        <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                          <th className="text-left  font-medium px-4 py-2">Date</th>
                          <th className="text-left  font-medium px-4 py-2">Account</th>
                          <th className="text-left  font-medium px-4 py-2">Status</th>
                          <th className="text-left  font-medium px-4 py-2">Paid through</th>
                          <th className="text-right font-medium px-4 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedProfile.childExpenses?.length ? selectedProfile.childExpenses.map((exp, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{exp.date}</td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{exp.expenseAccount}</td>
                            <td className="px-4 py-2.5"><StatusPill status={exp.status} /></td>
                            <td className="px-4 py-2.5 text-slate-500">{exp.paidThrough}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                              ₹{exp.amount.toFixed(2)}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-slate-500">
                              No expenses generated yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Surface>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete recurring profile"
        message={`Are you sure you want to delete profile "${deleteTarget?.profileName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const Metric = ({ icon: Icon, label, value }) => (
  <Surface className="p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon size={12} className="text-slate-500 dark:text-slate-400" />
      </div>
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-base font-semibold text-slate-900 dark:text-slate-50 tabular-nums">{value}</p>
  </Surface>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{value || "—"}</p>
  </div>
);

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Create profile" },
    { icon: RefreshCw,    label: "Auto-generate" },
    { icon: CheckCircle2, label: "Billable → Invoice", tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Create. Set. Repeat.
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Automate recurring expenses for periodic operating costs.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> New recurring expense
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
          "Routinely auto-generate expenses",
          "Track when each expense is created",
          "Add manual entries within a profile",
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

export default RecurringExpensesPage;