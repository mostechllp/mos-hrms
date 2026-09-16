// src/admin/pages/crm/CustomerDetail.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreVertical,
  Phone,
  Mail,
  CalendarPlus,
  FileText,
  Briefcase,
  UserPlus,
  Upload,
  Repeat,
  Trash2,
  Building2,
  Users,
  TrendingUp,
  Clock,
  IndianRupee,
  Award,
  CheckCircle2,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import AddContactModal from "../../components/crm/AddContactModal";

// ------------------------------------------------------------
// STATIC data keyed by id
// ------------------------------------------------------------

const CUSTOMER_DETAILS = {
  "CUS-0001": {
    id: "CUS-0001",
    company: "Acme Corp",
    type: "Company",
    industry: "Manufacturing",
    status: "Active",
    customerSince: "2025-04-12",
    assignedTo: "Riya Roy",
    primaryContact: {
      name: "Ramesh Kumar",
      designation: "Procurement Manager",
      email: "ramesh@acmecorp.com",
      phone: "+91 98765 43210",
    },
    openOpportunities: 3,
    openValue: 750000,
    wonDeals: 2,
    lastContacted: "2026-09-12",
    nextFollowUp: "2026-09-18 10:30",
    notes: "Long-standing customer. On Net 30 terms. Prefers email communication.",
    contacts: [
      { id: 1, name: "Ramesh Kumar", designation: "Procurement Manager", dept: "Procurement", email: "ramesh@acmecorp.com", phone: "+91 98765 43210", primary: true, preferred: "Email" },
      { id: 2, name: "Sneha Rao", designation: "Finance Manager", dept: "Finance", email: "sneha@acmecorp.com", phone: "+91 98765 43211", primary: false, preferred: "Call" },
      { id: 3, name: "Vivek Joshi", designation: "IT Manager", dept: "IT", email: "vivek@acmecorp.com", phone: "+91 98765 43212", primary: false, preferred: "Email" },
    ],
  },
};

const DEFAULT = {
  id: "CUS-0000",
  company: "Unknown Customer",
  type: "Company",
  industry: "—",
  status: "Active",
  customerSince: "—",
  assignedTo: "—",
  primaryContact: { name: "—", designation: "—", email: "—", phone: "—" },
  openOpportunities: 0,
  openValue: 0,
  wonDeals: 0,
  lastContacted: "—",
  nextFollowUp: "—",
  notes: "",
  contacts: [],
};

const RECENT_ACTIVITIES = [
  { id: 1, type: "Call", summary: "Called Ramesh re: new ERP proposal", user: "Riya Roy", when: "2026-09-12 14:00" },
  { id: 2, type: "Email", summary: "Sent revised quotation #Q-2026-0142", user: "Riya Roy", when: "2026-09-10 11:20" },
  { id: 3, type: "Meeting", summary: "Onsite demo at Acme HQ", user: "Riya Roy", when: "2026-09-05 15:00" },
];

const RECENT_QUOTATIONS = [
  { id: "Q-2026-0142", amount: 450000, status: "Sent", date: "2026-09-10" },
  { id: "Q-2026-0125", amount: 200000, status: "Accepted", date: "2026-08-22" },
];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "activities", label: "Activities" },
  { key: "opportunities", label: "Opportunities" },
  { key: "quotations", label: "Quotations" },
  { key: "documents", label: "Documents" },
  { key: "notes", label: "Notes" },
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const formatDate = (d) => {
  if (!d || d === "—") return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d || d === "—") return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Active;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const customer = CUSTOMER_DETAILS[customerId] || DEFAULT;

  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleDelete = () => {
    showToast(`Customer ${customer.company} deleted`, "success");
    setConfirmDelete(false);
    navigate("/admin/crm/customers");
  };

  return (
    <div className="w-full space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/crm/customers")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {customer.company}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(
                customer.status,
              )}`}
            >
              {customer.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{customer.id}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {customer.industry}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {customer.primaryContact.name}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              AM: {customer.assignedTo}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              navigate(`/admin/crm/customers/${customer.id}/edit`)
            }
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Pencil size={14} /> Edit
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <MenuItem icon={UserPlus} label="Add Contact" onClick={() => { setContactModalOpen(true); setMenuOpen(false); }} />
                  <MenuItem icon={Briefcase} label="Add Opportunity" onClick={() => { showToast("Add opportunity — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Phone} label="Schedule Call" onClick={() => { showToast("Schedule call — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={CalendarPlus} label="Schedule Meeting" onClick={() => { showToast("Schedule meeting — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={FileText} label="Add Note" onClick={() => { showToast("Add note — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Upload} label="Upload Document" onClick={() => { showToast("Upload document — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Repeat} label="Change Status" onClick={() => { showToast("Change status — later", "info"); setMenuOpen(false); }} />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <MenuItem icon={Trash2} label="Delete Customer" danger onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Quick action chips ---------- */}
      <div className="flex flex-wrap gap-2">
        <QuickChip icon={Pencil} label="Edit Customer" onClick={() => navigate(`/admin/crm/customers/${customer.id}/edit`)} />
        <QuickChip icon={UserPlus} label="Add Contact" onClick={() => setContactModalOpen(true)} />
        <QuickChip icon={Briefcase} label="Add Opportunity" onClick={() => showToast("Add opportunity", "info")} />
        <QuickChip icon={Phone} label="Schedule Call" onClick={() => showToast("Schedule call", "info")} />
        <QuickChip icon={CalendarPlus} label="Schedule Meeting" onClick={() => showToast("Schedule meeting", "info")} />
        <QuickChip icon={FileText} label="Add Note" onClick={() => showToast("Add note", "info")} />
        <QuickChip icon={Upload} label="Upload Document" onClick={() => showToast("Upload document", "info")} />
      </div>

      {/* ---------- KPI grid ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Briefcase} color="purple" label="Total Opportunities" value={customer.openOpportunities} />
        <KpiCard icon={IndianRupee} color="blue" label="Open Value" value={formatCurrency(customer.openValue)} />
        <KpiCard icon={Award} color="green" label="Won Deals" value={customer.wonDeals} />
        <KpiCard icon={Clock} color="amber" label="Last Contacted" value={formatDate(customer.lastContacted)} small />
      </div>

      {/* ---------- Info card ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock icon={Building2} label="Industry" value={customer.industry} />
          <InfoBlock icon={CheckCircle2} label="Status" value={customer.status} />
          <InfoBlock icon={Clock} label="Customer Since" value={formatDate(customer.customerSince)} />
          <InfoBlock icon={Users} label="Account Manager" value={customer.assignedTo} />
          <InfoBlock icon={Users} label="Primary Contact" value={customer.primaryContact.name} />
          <InfoBlock icon={Mail} label="Email" value={customer.primaryContact.email} />
          <InfoBlock icon={Phone} label="Phone" value={customer.primaryContact.phone} />
          <InfoBlock icon={CalendarPlus} label="Next Follow-up" value={formatDateTime(customer.nextFollowUp)} />
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Tab content ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        {activeTab === "overview" && <OverviewTab customer={customer} />}
        {activeTab === "contacts" && (
          <ContactsTab
            contacts={customer.contacts}
            onAdd={() => setContactModalOpen(true)}
          />
        )}
        {activeTab === "activities" && <ActivitiesTab />}
        {activeTab === "opportunities" && (
          <EmptyTab label="No opportunities yet. Click “Add Opportunity” to create one." />
        )}
        {activeTab === "quotations" && <QuotationsTab />}
        {activeTab === "documents" && (
          <EmptyTab label="No documents uploaded yet." />
        )}
        {activeTab === "notes" && <NotesTab customer={customer} />}
      </div>

      {/* ---------- Delete confirm ---------- */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.company}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ---------- Add Contact modal ---------- */}
      <AddContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSubmit={(data) => {
          console.log("New contact:", data);
          showToast("Contact added successfully", "success");
          setContactModalOpen(false);
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
      danger
        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  >
    <Icon size={15} />
    {label}
  </button>
);

const QuickChip = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
  >
    <Icon size={13} />
    {label}
  </button>
);

const InfoBlock = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
      {value}
    </p>
  </div>
);

const KpiCard = ({ icon: Icon, color, label, value, small }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${map[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}>
        {value}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

// ---------- Tabs ----------

const OverviewTab = ({ customer }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Summary
        </h3>
        <div className="space-y-2 text-sm">
          <Row label="Industry" value={customer.industry} />
          <Row label="Status" value={customer.status} />
          <Row label="Customer Since" value={formatDate(customer.customerSince)} />
          <Row label="Account Manager" value={customer.assignedTo} />
          <Row label="Next Follow-up" value={formatDateTime(customer.nextFollowUp)} />
          <Row label="Last Contacted" value={formatDate(customer.lastContacted)} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Notes
        </h3>
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {customer.notes || "No notes yet."}
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Recent Activities
        </h3>
        <div className="space-y-2">
          {RECENT_ACTIVITIES.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <CalendarPlus size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {a.type}: {a.summary}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {a.user} · {formatDateTime(a.when)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Recent Quotations
        </h3>
        <div className="space-y-2">
          {RECENT_QUOTATIONS.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 text-sm"
            >
              <div>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {q.id}
                </p>
                <p className="text-gray-800 dark:text-gray-200 font-semibold">
                  {formatCurrency(q.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(q.date)}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
                  {q.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ContactsTab = ({ contacts, onAdd }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
      </h3>
      <button
        onClick={onAdd}
        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
      >
        <UserPlus size={13} /> Add Contact
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {contacts.map((c) => (
        <div
          key={c.id}
          className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                {c.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {c.designation} · {c.dept}
              </p>
            </div>
            {c.primary && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                Primary
              </span>
            )}
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail size={12} /> {c.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone size={12} /> {c.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
              Prefers {c.preferred}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActivitiesTab = () => (
  <div className="space-y-3">
    {RECENT_ACTIVITIES.map((a) => (
      <div
        key={a.id}
        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <CalendarPlus size={14} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {a.type}: {a.summary}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {a.user} · {formatDateTime(a.when)}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const QuotationsTab = () => (
  <div className="space-y-3">
    {RECENT_QUOTATIONS.map((q) => (
      <div
        key={q.id}
        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700/60"
      >
        <div>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {q.id}
          </p>
          <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(q.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(q.date)}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
            {q.status}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const NotesTab = ({ customer }) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
      {customer.notes || "No notes yet."}
    </p>
  </div>
);

const EmptyTab = ({ label }) => (
  <div className="text-center py-8">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 dark:border-gray-700/40 last:border-b-0">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <span className="text-sm text-gray-800 dark:text-gray-200 text-right">
      {value}
    </span>
  </div>
);

export default CustomerDetail;