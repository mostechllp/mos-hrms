// src/admin/pages/CRM/LeadDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Pencil, UserCheck, MoreVertical, Phone, Mail,
  CalendarPlus, FileText, Briefcase, Repeat, Trash2, UserCog,
  Building2, Globe, Tag, Clock, Loader, User, Award, MapPin,
  Hash, Briefcase as BriefcaseIcon, Layers, Percent, Info,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import ConvertLeadModal from "../../components/crm/ConvertLeadModal";
import {
  fetchLeadById,
  fetchLeadFollowUps,
  deleteLeadApi,
  convertLeadApi,
  updateLeadStatusApi,
  fromLeadApi,
  clearCurrentLead,
} from "../../store/slices/leadSlice";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contact", label: "Contact Information" },
  { key: "assignment", label: "Assignment" },
  { key: "activities", label: "Follow-ups" },
  { key: "notes", label: "Notes" },
  { key: "system", label: "System" },
];

// ---------- helpers ----------
const formatDate = (d) => {
  if (!d || d === "—") return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d || d === "—") return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const formatMoney = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  })}`;
};

const statusBadge = (status) => {
  const map = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Working: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Qualified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Unqualified: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    Converted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] || map.New;
};

const priorityBadge = (priority) => {
  const map = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return map[priority] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
};

const getSalespersonName = (sp) => {
  if (!sp) return "—";
  const full = `${sp.first_name || ""} ${sp.last_name || ""}`.trim();
  return full || sp.name || "—";
};

const getSalespersonAvatar = (sp) => {
  if (!sp?.avatar) return null;
  if (String(sp.avatar).startsWith("http")) return sp.avatar;
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${base}/storage/${sp.avatar}`;
};

// ---------- component ----------
const LeadDetail = () => {
  const { leadId } = useParams(); // numeric id
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentLead, currentLeadLoading, currentLeadError,
    followUps, followUpsLoading,
    submitting,
  } = useSelector((state) => state.leads);

  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadById(leadId));
      dispatch(fetchLeadFollowUps(leadId));
    }
    return () => dispatch(clearCurrentLead());
  }, [dispatch, leadId]);

  const lead = currentLead ? fromLeadApi(currentLead) : null;

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await dispatch(deleteLeadApi(lead.id)).unwrap();
      showToast(`Lead ${lead.leadName} deleted`, "success");
      setConfirmDelete(false);
      navigate("/admin/crm/leads");
    } catch (err) {
      showToast(err || "Failed to delete lead", "error");
    }
  };

  const handleConvertSubmit = async ({ converted_value, conversion_note }) => {
    if (!lead) return;
    try {
      await dispatch(
        convertLeadApi({ id: lead.id, converted_value, conversion_note }),
      ).unwrap();
      showToast(`${lead.leadName} converted`, "success");
      setConvertOpen(false);
      dispatch(fetchLeadById(leadId));
    } catch (err) {
      showToast(err || "Failed to convert lead", "error");
    }
  };

  const handleQuickStatus = async (status) => {
    if (!lead) return;
    try {
      await dispatch(
        updateLeadStatusApi({ id: lead.id, lead_status: status, note: "" }),
      ).unwrap();
      showToast(`Status updated to ${status}`, "success");
      setMenuOpen(false);
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  if (currentLeadLoading && !lead) {
    return (
      <div className="w-full py-16 flex justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (currentLeadError && !lead) {
    return (
      <div className="w-full py-16 text-center">
        <p className="text-red-500 mb-4">{currentLeadError}</p>
        <button
          onClick={() => navigate("/admin/crm/leads")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  if (!lead) return null;

  const assignedSp = currentLead?.assigned_salesperson;
  const creator = currentLead?.creator;
  const updater = currentLead?.updater;

  // Follow-ups may live either in the redux list or inside the lead object itself
  const inlineFollowUps = Array.isArray(currentLead?.follow_ups)
    ? currentLead.follow_ups
    : [];
  const allFollowUps =
    followUps && followUps.length > 0 ? followUps : inlineFollowUps;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
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
              {lead.leadName || "—"}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(lead.leadStatus)}`}>
              {lead.leadStatus}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityBadge(lead.priority)}`}>
              {lead.priority}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {lead.leadId}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            {lead.companyName && (
              <span className="flex items-center gap-1">
                <Building2 size={13} /> {lead.companyName}
              </span>
            )}
            {lead.designation && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>{lead.designation}</span>
              </>
            )}
            {assignedSp && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>Assigned to {getSalespersonName(assignedSp)}</span>
              </>
            )}
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
            disabled={lead.leadStatus === "Converted"}
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
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <MenuItem icon={Phone} label="Call"
                    onClick={() => { showToast("Call — implement later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Mail} label="Email"
                    onClick={() => { showToast("Email — implement later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={CalendarPlus} label="Schedule Meeting"
                    onClick={() => { showToast("Schedule — implement later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={FileText} label="Add Note"
                    onClick={() => { showToast("Add note — implement later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Briefcase} label="Create Opportunity"
                    onClick={() => { showToast("Create opportunity — implement later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Repeat} label="Mark as Qualified"
                    onClick={() => handleQuickStatus("Qualified")} />
                  <MenuItem icon={Repeat} label="Mark as Lost"
                    onClick={() => handleQuickStatus("Lost")} />
                  <MenuItem icon={UserCog} label="Reassign Lead"
                    onClick={() => { showToast("Reassign — implement later", "info"); setMenuOpen(false); }} />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <MenuItem icon={Trash2} label="Delete Lead" danger
                    onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info card — all key attributes at a glance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock icon={Hash} label="Lead ID" value={lead.leadId} mono />
          <InfoBlock icon={Layers} label="Lead Type" value={lead.leadType} />
          <InfoBlock icon={Tag} label="Source" value={lead.leadSource} />
          <InfoBlock icon={Tag} label="Industry" value={lead.industry} />
          <InfoBlock icon={Tag} label="Priority" value={lead.priority} />
          <InfoBlock icon={Info} label="Designation" value={lead.designation} />
          <InfoBlock icon={Clock} label="Next Follow-up" value={formatDateTime(lead.nextFollowUpAt)} />
          <InfoBlock icon={Clock} label="Follow-up Type" value={lead.followUpType} />
          <InfoBlock icon={Percent} label="Expected Value" value={formatMoney(lead.expectedValue)} />
          <InfoBlock icon={Clock} label="Expected Close" value={formatDate(lead.expectedClosingDate)} />
          <InfoBlock icon={User} label="Assigned To" value={getSalespersonName(assignedSp)} />
          <InfoBlock icon={BriefcaseIcon} label="Sales Team" value={lead.salesTeam} />
        </div>
      </div>

      {/* Tabs */}
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        {activeTab === "overview" && <OverviewTab lead={lead} assignedSp={assignedSp} />}
        {activeTab === "contact" && <ContactTab lead={lead} />}
        {activeTab === "assignment" && (
          <AssignmentTab lead={lead} assignedSp={assignedSp} />
        )}
        {activeTab === "activities" && (
          <FollowUpsTab followUps={allFollowUps} loading={followUpsLoading} />
        )}
        {activeTab === "notes" && <NotesTab lead={lead} />}
        {activeTab === "system" && (
          <SystemTab
            lead={lead}
            creator={creator}
            updater={updater}
            raw={currentLead}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.leadName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <ConvertLeadModal
        isOpen={convertOpen}
        onClose={() => setConvertOpen(false)}
        lead={{ id: lead.id, name: lead.leadName }}
        onSubmit={handleConvertSubmit}
      />
    </div>
  );
};

// ---------- building blocks ----------

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

const InfoBlock = ({ icon: Icon, label, value, mono }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p className={`text-sm text-gray-800 dark:text-gray-200 ${mono ? "font-mono" : "font-medium"} truncate`}>
      {value || "—"}
    </p>
  </div>
);

const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 dark:border-gray-700/40 last:border-b-0">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
      {label}
    </span>
    <span className={`text-sm text-gray-800 dark:text-gray-200 text-right ${mono ? "font-mono" : ""}`}>
      {value || "—"}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
    {children}
  </h3>
);

// ---------- tabs ----------

const OverviewTab = ({ lead, assignedSp }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <SectionTitle>Lead Summary</SectionTitle>
      <div className="space-y-0">
        <Row label="Lead Type" value={lead.leadType} />
        <Row label="Company" value={lead.companyName} />
        <Row label="Designation" value={lead.designation} />
        <Row label="Industry" value={lead.industry} />
        <Row label="Source" value={lead.leadSource} />
        <Row label="Priority" value={lead.priority} />
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
      </div>
    </div>
    <div>
      <SectionTitle>Assignment & Value</SectionTitle>
      <div className="space-y-0">
        <Row label="Assigned Salesperson" value={getSalespersonName(assignedSp)} />
        <Row label="Sales Team" value={lead.salesTeam} />
        <Row label="Expected Value" value={formatMoney(lead.expectedValue)} />
        <Row label="Expected Closing" value={formatDate(lead.expectedClosingDate)} />
        <Row
          label="Interested Products"
          value={
            lead.interestedProducts.length > 0
              ? lead.interestedProducts.join(", ")
              : "—"
          }
        />
        <Row label="Next Follow-up" value={formatDateTime(lead.nextFollowUpAt)} />
        <Row label="Follow-up Type" value={lead.followUpType} />
      </div>
    </div>
  </div>
);

const ContactTab = ({ lead }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <SectionTitle>Reach</SectionTitle>
      <div className="space-y-0">
        <Row
          label="Email"
          value={
            lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lead.email}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row
          label="Primary Phone"
          value={
            lead.primaryPhone ? (
              <a
                href={`tel:${lead.primaryPhone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lead.primaryPhone}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row
          label="Alternate Phone"
          value={
            lead.alternatePhone ? (
              <a
                href={`tel:${lead.alternatePhone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lead.alternatePhone}
              </a>
            ) : (
              "—"
            )
          }
        />
      </div>
    </div>
    <div>
      <SectionTitle>Address</SectionTitle>
      <div className="space-y-0">
        <Row label="Street" value={lead.address} />
        <Row label="City" value={lead.city} />
        <Row label="State" value={lead.state} />
        <Row label="Country" value={lead.country} />
        <Row label="Postal Code" value={lead.postalCode} />
      </div>
    </div>
  </div>
);

const AssignmentTab = ({ lead, assignedSp }) => {
  const avatar = getSalespersonAvatar(assignedSp);
  const fullName = getSalespersonName(assignedSp);

  return (
    <div className="space-y-6">
      {/* Salesperson card */}
      <div>
        <SectionTitle>Assigned Salesperson</SectionTitle>
        {assignedSp ? (
          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex items-start gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow"
                style={{ display: avatar ? "none" : "flex" }}
              >
                {(fullName || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {assignedSp.employee_id || "—"}
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {assignedSp.company_email || assignedSp.personal_email ? (
                    <a
                      href={`mailto:${assignedSp.company_email || assignedSp.personal_email}`}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Mail size={13} />
                      {assignedSp.company_email || assignedSp.personal_email}
                    </a>
                  ) : null}
                  {assignedSp.personal_number || assignedSp.company_mobile_number ? (
                    <a
                      href={`tel:${assignedSp.personal_number || assignedSp.company_mobile_number}`}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Phone size={13} />
                      {assignedSp.personal_number || assignedSp.company_mobile_number}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No salesperson assigned yet.
          </p>
        )}
      </div>

      {/* Assignment details */}
      <div>
        <SectionTitle>Assignment Details</SectionTitle>
        <div className="space-y-0">
          <Row label="Sales Team" value={lead.salesTeam} />
          <Row label="Expected Value" value={formatMoney(lead.expectedValue)} />
          <Row label="Expected Closing" value={formatDate(lead.expectedClosingDate)} />
          <Row
            label="Interested Products"
            value={
              lead.interestedProducts.length > 0
                ? lead.interestedProducts.join(", ")
                : "—"
            }
          />
        </div>
      </div>

      {/* Interested products as pills */}
      {lead.interestedProducts.length > 0 && (
        <div>
          <SectionTitle>Products</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {lead.interestedProducts.map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FollowUpsTab = ({ followUps, loading }) => {
  if (loading) {
    return (
      <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        Loading follow-ups...
      </p>
    );
  }
  if (!followUps.length) {
    return (
      <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No follow-ups scheduled yet.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {followUps.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <CalendarPlus size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {a.follow_up_type || a.type || "Follow-up"}
              {a.notes || a.summary ? `: ${a.notes || a.summary}` : ""}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {a.performed_by?.name ||
                a.performed_by?.first_name ||
                a.user ||
                "—"}{" "}
              · {formatDateTime(a.follow_up_date || a.when || a.scheduled_at)} ·{" "}
              <span className="capitalize">
                {a.status || a.follow_up_status || "scheduled"}
              </span>
            </p>
            {a.outcome && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                Outcome: {a.outcome}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const NotesTab = ({ lead }) => (
  <div className="space-y-4">
    {lead.notes ? (
      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {lead.notes}
        </p>
      </div>
    ) : (
      <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No notes yet.
      </p>
    )}
    {lead.followUpNotes && (
      <div>
        <SectionTitle>Follow-up Notes</SectionTitle>
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {lead.followUpNotes}
          </p>
        </div>
      </div>
    )}
  </div>
);

const SystemTab = ({ lead, creator, updater, raw }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <SectionTitle>Created By</SectionTitle>
      <div className="space-y-0">
        <Row label="User" value={creator?.username || "—"} />
        <Row label="Email" value={creator?.email || "—"} />
        <Row label="Type" value={creator?.type || "—"} />
        <Row label="Created At" value={formatDateTime(lead.createdAt)} />
      </div>
    </div>
  </div>
);

export default LeadDetail;