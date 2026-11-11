import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileStatus, deleteProfile } from "../../store/slices/accounts/recurringInvoicesSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Mail, CreditCard, Info, RefreshCw, Repeat,
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

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{value || "—"}</p>
  </div>
);

/* ---------- page ---------- */

const RecurringInvoicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((s) => s.recurringInvoices.profiles) || [];

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
      p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profileName?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Recurring invoices
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {profiles.length === 0
                ? "No recurring profiles yet"
                : `${profiles.length} ${profiles.length === 1 ? "profile" : "profiles"} configured`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/sales/recurring/new")}
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
          <EmptyState onCreate={() => navigate("/admin/accounts/sales/recurring/new")} />
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
                    <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-left font-medium">Frequency</th>
                    <th className="px-4 py-2.5 text-left font-medium">Next invoice</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-slate-500">
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

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{profile.customerName}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{profile.repeatEvery}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{profile.startDate}</td>
                      <td className="px-4 py-3"><StatusPill status={profile.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/sales/recurring/edit/${profile.id}`)} />
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
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[60%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

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
                  onClick={() => navigate(`/admin/accounts/sales/recurring/edit/${selectedProfile.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Create invoice
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
                {["Overview", "Next invoice", "Recent activities"].map((tab) => (
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
            <div className="flex-1 overflow-y-auto">

              {activeTab === "Overview" && (
                <div className="flex flex-col lg:flex-row gap-4 p-5 sm:p-6">

                  {/* Left column: Details */}
                  <div className="lg:w-72 space-y-4 shrink-0">
                    <Surface className="p-4">
                      <SectionLabel>Profile</SectionLabel>
                      <div className="space-y-2.5">
                        <DetailItem label="Status"         value={selectedProfile.status} />
                        <DetailItem label="Start date"     value={selectedProfile.startDate} />
                        <DetailItem label="End date"       value={selectedProfile.neverExpires ? "Never expires" : selectedProfile.endDate} />
                        <DetailItem label="Payment terms"  value={selectedProfile.paymentTerms} />
                      </div>
                    </Surface>

                    <Surface className="p-4">
                      <div className="flex items-start gap-2">
                        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Recurring invoices are created as <span className="font-medium text-slate-800 dark:text-slate-100">drafts</span> per current preferences.
                        </p>
                      </div>
                    </Surface>

                    <Surface className="p-4">
                      <SectionLabel>Billing address</SectionLabel>
                      <p className="text-[12px] font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {selectedProfile.customerName}
                      </p>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                        {"v v\nbubvnv\nbvn\nnbvn bvnbv\nAland Islands"}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Shipping</p>
                        <p className="text-[11.5px] text-slate-500">vcbvc</p>
                      </div>
                    </Surface>

                    <Surface className="p-4">
                      <SectionLabel>Customer notes</SectionLabel>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">
                        Thanks for your business.
                      </p>
                    </Surface>
                  </div>

                  {/* Right column: Metrics + invoices */}
                  <div className="flex-1 min-w-0 space-y-4">

                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Surface className="p-4">
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Invoice amount</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">₹{selectedProfile.total.toFixed(2)}</p>
                      </Surface>
                      <Surface className="p-4">
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Next invoice date</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">{selectedProfile.startDate}</p>
                      </Surface>
                      <Surface className="p-4">
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Recurring period</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{selectedProfile.repeatEvery}</p>
                      </Surface>
                    </div>

                    {/* Child invoices */}
                    <Surface>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <SectionLabel>Child invoices</SectionLabel>
                        <p className="text-[11.5px] text-slate-500">
                          Unpaid <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">₹0.00</span>
                        </p>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedProfile.childInvoices.map((inv, idx) => (
                          <div key={idx} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">{inv.invoiceNumber}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11.5px] text-slate-500">{inv.date}</span>
                                <StatusPill status="Draft" />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                <RefreshCw size={10} /> Manually added
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[12.5px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">₹{inv.amount.toFixed(2)}</p>
                              <button className="mt-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Record payment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Surface>
                  </div>
                </div>
              )}

              {activeTab === "Next invoice" && (
                <div className="p-5 sm:p-6">
                  <InvoicePreview profile={selectedProfile} />
                </div>
              )}

              {activeTab === "Recent activities" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <RefreshCw size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">No recent activities</p>
                  <p className="text-[12px] text-slate-500">Activity for this profile will appear here.</p>
                </div>
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Profile" },
    { icon: FileText,     label: "Invoices" },
    { icon: Edit2,        label: "Drafts" },
    { icon: Mail,         label: "Sent" },
    { icon: CreditCard,   label: "Auto-charge" },
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
          Set up a profile to periodically create and send invoices to your customers.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create recurring invoice
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle of a recurring profile</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800">
                <s.icon size={13} />
                <span className="whitespace-nowrap">{s.label}</span>
              </div>
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Automate repeat invoices on a schedule of your choice",
          "Automatically or manually charge your customer's card",
          "Email customers on payment failure",
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

const InvoicePreview = ({ profile }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-2xl relative text-slate-800 dark:text-slate-200">
    <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
      Scheduled
    </div>

    <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
        <p className="text-slate-500">Keralam</p>
        <p className="text-slate-500">India</p>
        <p className="text-slate-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Tax invoice</h1>
        <p className="text-[11px] text-slate-500 mt-1">Will be generated automatically</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-[11.5px] mb-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bill to</p>
        <p className="font-medium text-slate-900 dark:text-slate-100">{profile.customerName}</p>
      </div>
      <div className="text-right space-y-0.5 text-slate-500">
        <p>Invoice date <span className="text-slate-900 dark:text-slate-100 ml-1">{profile.startDate}</span></p>
        <p>Terms <span className="text-slate-900 dark:text-slate-100 ml-1">{profile.paymentTerms}</span></p>
        <p>Due date <span className="text-slate-900 dark:text-slate-100 ml-1">{profile.startDate}</span></p>
      </div>
    </div>

    <table className="w-full text-[11.5px] mb-4">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
          <th className="text-left  font-medium py-2 w-6">#</th>
          <th className="text-left  font-medium py-2">Item</th>
          <th className="text-right font-medium py-2">Qty</th>
          <th className="text-right font-medium py-2">Rate</th>
          <th className="text-right font-medium py-2">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.items?.map((item, idx) => (
          <tr key={item.id ?? idx}>
            <td className="py-2 text-slate-400 tabular-nums">{idx + 1}</td>
            <td className="py-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              {item.description && <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>}
            </td>
            <td className="py-2 text-right tabular-nums">{item.qty.toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{item.rate.toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{(item.qty * item.rate).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 text-[11.5px]">
        <div className="flex justify-between py-1 text-slate-500">
          <span>Subtotal</span>
          <span className="text-slate-900 dark:text-slate-100 tabular-nums">{profile.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span className="tabular-nums">₹{profile.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1.5 bg-slate-50 dark:bg-slate-950/40 px-2 rounded mt-1 text-slate-700 dark:text-slate-300">
          <span className="font-medium">Balance due</span>
          <span className="font-semibold tabular-nums">₹{profile.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-10 flex justify-between items-end text-[10.5px] text-slate-500">
      <div className="max-w-[55%]">
        {profile.notes && (
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mb-0.5">Notes</p>
            <p className="whitespace-pre-wrap leading-relaxed">{profile.notes}</p>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="w-40 h-px bg-slate-300 dark:bg-slate-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>

    <div className="mt-4 text-right text-[10.5px] text-slate-500">
      PDF template <span className="text-slate-700 dark:text-slate-300">Spreadsheet</span> ·{" "}
      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Change</a>
    </div>
  </div>
);

export default RecurringInvoicesPage;