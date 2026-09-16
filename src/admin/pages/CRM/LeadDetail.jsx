// src/admin/pages/crm/LeadDetail.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  UserCheck,
  MoreVertical,
  Phone,
  Mail,
  CalendarPlus,
  FileText,
  Briefcase,
  Repeat,
  Trash2,
  UserCog,
  Building2,
  MapPin,
  Globe,
  Tag,
  Clock,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import ConvertLeadModal from "../../components/crm/ConvertLeadModal";

// ------------------------------------------------------------
// Static data (keyed by id) — replace with API call
// ------------------------------------------------------------

const LEAD_DETAILS = {
  "LED-0001": {
    id: "LED-0001",
    name: "Ramesh Kumar",
    company: "Acme Corp",
    designation: "Procurement Manager",
    status: "New",
    priority: "High",
    source: "Website",
    industry: "Manufacturing",
    website: "https://acmecorp.com",
    assignedTo: "Riya Roy",
    salesTeam: "Field Sales",
    expectedValue: "250000",
    expectedClosingDate: "2026-10-15",
    interestedProducts: ["ERP", "CRM"],
    contact: {
      email: "ramesh@acmecorp.com",
      phone: "+91 98765 43210",
      altPhone: "+91 98765 00001",
      address: "Plot 42, MIDC Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
    },
    nextFollowUp: "2026-09-18 10:30",
    followUpType: "Call",
    createdAt: "2026-09-10",
    notes: "Interested in replacing their legacy ERP. Budget approved for Q4.",
  },
};

// Fallback so the page works even if id is unknown
const DEFAULT_LEAD = {
  id: "LED-0000",
  name: "Unknown Lead",
  company: "—",
  designation: "—",
  status: "New",
  priority: "Medium",
  source: "—",
  industry: "—",
  website: "",
  assignedTo: "—",
  salesTeam: "—",
  expectedValue: "0",
  expectedClosingDate: "—",
  interestedProducts: [],
  contact: {},
  nextFollowUp: "—",
  followUpType: "Call",
  createdAt: "—",
  notes: "",
};

const ACTIVITIES = [
  { id: 1, type: "Call", summary: "Introductory call with Ramesh", user: "Riya Roy", when: "2026-09-11 14:00" },
  { id: 2, type: "Email", summary: "Sent company profile + ERP brochure", user: "Riya Roy", when: "2026-09-12 10:15" },
  { id: 3, type: "Meeting", summary: "Discovery meeting scheduled", user: "Riya Roy", when: "2026-09-18 10:30" },
];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contact", label: "Contact Information" },
  { key: "activities", label: "Activities" },
  { key: "notes", label: "Notes" },
  { key: "opportunities", label: "Opportunities" },
  { key: "documents", label: "Documents" },
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

const statusBadge = (status) => {
  const map = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Qualified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Unqualified: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    Converted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return map[status] || map.New;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const lead = LEAD_DETAILS[leadId] || DEFAULT_LEAD;

  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const handleDelete = () => {
    showToast(`Lead ${lead.name} deleted`, "success");
    setConfirmDelete(false);
    navigate("/admin/crm/leads");
  };

  const handleConvertSubmit = ({ createOpportunity }) => {
    showToast(
      createOpportunity
        ? `${lead.name} converted with opportunity created`
        : `${lead.name} converted to customer`,
      "success",
    );
    setConvertOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/crm/leads")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {lead.name}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(
                lead.status,
              )}`}
            >
              {lead.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            {lead.company && (
              <span className="flex items-center gap-1">
                <Building2 size={13} /> {lead.company}
              </span>
            )}
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              Assigned to {lead.assignedTo}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/crm/leads/${lead.id}/edit`)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={() => setConvertOpen(true)}
            disabled={lead.status === "Converted"}
            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserCheck size={14} /> Convert
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
                  <MenuItem
                    icon={Phone}
                    label="Call"
                    onClick={() => {
                      showToast("Call — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Mail}
                    label="Email"
                    onClick={() => {
                      showToast("Email — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={CalendarPlus}
                    label="Schedule Meeting"
                    onClick={() => {
                      showToast("Schedule meeting — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={FileText}
                    label="Add Note"
                    onClick={() => {
                      showToast("Add note — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Briefcase}
                    label="Create Opportunity"
                    onClick={() => {
                      showToast(
                        "Create opportunity — implement later",
                        "info",
                      );
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Repeat}
                    label="Change Status"
                    onClick={() => {
                      showToast("Change status — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={UserCog}
                    label="Reassign Lead"
                    onClick={() => {
                      showToast("Reassign — implement later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <MenuItem
                    icon={Trash2}
                    label="Delete Lead"
                    danger
                    onClick={() => {
                      setConfirmDelete(true);
                      setMenuOpen(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Quick action chips ---------- */}
      <div className="flex flex-wrap gap-2">
        <QuickChip
          icon={Phone}
          label="Call"
          onClick={() => showToast("Call — implement later", "info")}
        />
        <QuickChip
          icon={Mail}
          label="Email"
          onClick={() => showToast("Email — implement later", "info")}
        />
        <QuickChip
          icon={CalendarPlus}
          label="Schedule Meeting"
          onClick={() => showToast("Schedule meeting", "info")}
        />
        <QuickChip
          icon={FileText}
          label="Add Note"
          onClick={() => showToast("Add note", "info")}
        />
        <QuickChip
          icon={Briefcase}
          label="Create Opportunity"
          onClick={() => showToast("Create opportunity", "info")}
        />
        <QuickChip
          icon={UserCheck}
          label="Convert Lead"
          onClick={() => setConvertOpen(true)}
          disabled={lead.status === "Converted"}
        />
      </div>

      {/* ---------- Info card ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock icon={Tag} label="Lead ID" value={lead.id} mono />
          <InfoBlock icon={Tag} label="Source" value={lead.source} />
          <InfoBlock icon={Tag} label="Priority" value={lead.priority} />
          <InfoBlock icon={Tag} label="Industry" value={lead.industry} />
          <InfoBlock icon={Clock} label="Next Follow-up" value={formatDateTime(lead.nextFollowUp)} />
          <InfoBlock icon={Clock} label="Follow-up Type" value={lead.followUpType} />
          <InfoBlock icon={Tag} label="Expected Value" value={`₹${Number(lead.expectedValue || 0).toLocaleString()}`} />
          <InfoBlock icon={Clock} label="Expected Close" value={formatDate(lead.expectedClosingDate)} />
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
        {activeTab === "overview" && <OverviewTab lead={lead} />}
        {activeTab === "contact" && <ContactTab lead={lead} />}
        {activeTab === "activities" && <ActivitiesTab />}
        {activeTab === "notes" && <NotesTab lead={lead} />}
        {activeTab === "opportunities" && <EmptyTab label="No opportunities linked to this lead yet." />}
        {activeTab === "documents" && <EmptyTab label="No documents uploaded for this lead yet." />}
      </div>

      {/* ---------- Delete confirm ---------- */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ---------- Convert Lead modal ---------- */}
      <ConvertLeadModal
        isOpen={convertOpen}
        onClose={() => setConvertOpen(false)}
        lead={lead}
        onSubmit={handleConvertSubmit}
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

const QuickChip = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Icon size={13} />
    {label}
  </button>
);

const InfoBlock = ({ icon: Icon, label, value, mono }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p
      className={`text-sm text-gray-800 dark:text-gray-200 ${
        mono ? "font-mono" : "font-medium"
      }`}
    >
      {value}
    </p>
  </div>
);

// ---------- Tabs ----------

const OverviewTab = ({ lead }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Lead Summary
      </h3>
      <div className="space-y-2 text-sm">
        <Row label="Company" value={lead.company} />
        <Row label="Designation" value={lead.designation} />
        <Row label="Industry" value={lead.industry} />
        <Row
          label="Website"
          value={
            lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <Globe size={12} /> {lead.website}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row label="Source" value={lead.source} />
      </div>
    </div>

    <div>
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Assignment
      </h3>
      <div className="space-y-2 text-sm">
        <Row label="Assigned To" value={lead.assignedTo} />
        <Row label="Sales Team" value={lead.salesTeam} />
        <Row
          label="Expected Value"
          value={`₹${Number(lead.expectedValue || 0).toLocaleString()}`}
        />
        <Row label="Expected Close" value={formatDate(lead.expectedClosingDate)} />
        <Row
          label="Products"
          value={
            lead.interestedProducts.length > 0
              ? lead.interestedProducts.join(", ")
              : "—"
          }
        />
      </div>
    </div>
  </div>
);

const ContactTab = ({ lead }) => {
  const c = lead.contact || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Reach
        </h3>
        <div className="space-y-2 text-sm">
          <Row
            label="Email"
            value={
              c.email ? (
                <a
                  href={`mailto:${c.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {c.email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row label="Primary Phone" value={c.phone || "—"} />
          <Row label="Alternate Phone" value={c.altPhone || "—"} />
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Address
        </h3>
        <div className="space-y-2 text-sm">
          <Row label="Address" value={c.address || "—"} />
          <Row label="City" value={c.city || "—"} />
          <Row label="State" value={c.state || "—"} />
          <Row label="Country" value={c.country || "—"} />
          <Row label="Postal Code" value={c.postalCode || "—"} />
        </div>
      </div>
    </div>
  );
};

const ActivitiesTab = () => (
  <div className="space-y-3">
    {ACTIVITIES.map((a) => (
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

const NotesTab = ({ lead }) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
      {lead.notes || "No notes yet."}
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

export default LeadDetail;