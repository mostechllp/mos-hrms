// src/admin/pages/crm/OpportunityDetail.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreVertical,
  Repeat,
  CalendarClock,
  FileText,
  Trophy,
  XCircle,
  Trash2,
  Building2,
  User,
  IndianRupee,
  Target,
  Clock,
  Briefcase,
  Upload,
  Users,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import MarkWonLostModal from "../../components/crm/MarkWonLostModal";

// ------------------------------------------------------------
// Static data keyed by id
// ------------------------------------------------------------

const OPPORTUNITY_DETAILS = {
  "OPP-0001": {
    id: "OPP-0001",
    name: "ABC Traders HRMS Rollout",
    customer: "ABC Traders",
    contact: "Ramesh Kumar",
    product: "HRMS",
    value: 200000,
    currency: "INR",
    stage: "New",
    probability: 20,
    expectedClose: "2026-10-15",
    assignedTo: "Rahul Verma",
    priority: "High",
    source: "Website",
    createdAt: "2026-09-10",
    description: "ABC Traders wants to roll out HRMS for ~100 employees.",
    requirements:
      "100+ employee records, payroll integration with Tally, leave & attendance module, mobile app for punch-in.",
    competitor: "Zoho People",
    decisionMaker: "Mr. Sharma (Managing Director)",
    nextAction: "Send HRMS proposal by 20-Sep-2026",
    notes: "Very responsive. Prefers weekly updates over email.",
  },
};

const DEFAULT = {
  id: "OPP-0000",
  name: "Unknown Opportunity",
  customer: "—",
  contact: "—",
  product: "—",
  value: 0,
  currency: "INR",
  stage: "New",
  probability: 0,
  expectedClose: "—",
  assignedTo: "—",
  priority: "Medium",
  source: "—",
  createdAt: "—",
  description: "",
  requirements: "",
  competitor: "",
  decisionMaker: "",
  nextAction: "",
  notes: "",
};

const TIMELINE = [
  { id: 1, type: "Stage", summary: "Created as New opportunity", user: "Rahul Verma", when: "2026-09-10 09:30" },
  { id: 2, type: "Call", summary: "Intro call with Ramesh", user: "Rahul Verma", when: "2026-09-11 14:00" },
  { id: 3, type: "Email", summary: "Sent HRMS brochure", user: "Rahul Verma", when: "2026-09-12 10:15" },
];

const QUOTATIONS = [
  { id: "Q-2026-0142", amount: 200000, status: "Sent", date: "2026-09-14" },
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

const formatCurrency = (n, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "";
  return `${symbol}${Number(n || 0).toLocaleString()}`;
};

const stageBadge = (stage) => {
  const map = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Qualified: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "Proposal Sent": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Negotiation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[stage] || map.New;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const OpportunityDetail = () => {
  const { opportunityId } = useParams();
  const navigate = useNavigate();

  const opp = OPPORTUNITY_DETAILS[opportunityId] || DEFAULT;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wonModalOpen, setWonModalOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);

  const isClosed = opp.stage === "Won" || opp.stage === "Lost";

  const handleDelete = () => {
    showToast(`Opportunity "${opp.name}" deleted`, "success");
    setConfirmDelete(false);
    navigate("/admin/crm/opportunities");
  };

  const handleWon = () => {
    showToast(`${opp.name} marked as Won`, "success");
    setWonModalOpen(false);
  };

  const handleLost = () => {
    showToast(`${opp.name} marked as Lost`, "success");
    setLostModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/crm/opportunities")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {opp.name}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageBadge(
                opp.stage,
              )}`}
            >
              {opp.stage}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{opp.id}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {opp.customer}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <IndianRupee size={13} /> {formatCurrency(opp.value, opp.currency)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <>
              <button
                onClick={() => setWonModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Trophy size={14} /> Won
              </button>
              <button
                onClick={() => setLostModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <XCircle size={14} /> Lost
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/admin/crm/opportunities/${opp.id}/edit`)}
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
                  <MenuItem icon={Repeat} label="Change Stage" onClick={() => { showToast("Change stage — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={CalendarClock} label="Schedule Follow-up" onClick={() => { showToast("Schedule follow-up — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={FileText} label="Create Quotation" onClick={() => { showToast("Create quotation — later", "info"); setMenuOpen(false); }} />
                  <MenuItem icon={Upload} label="Upload Document" onClick={() => { showToast("Upload — later", "info"); setMenuOpen(false); }} />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Target} color="blue" label="Estimated Value" value={formatCurrency(opp.value, opp.currency)} />
        <KpiCard icon={Briefcase} color="purple" label="Stage" value={opp.stage} small />
        <KpiCard icon={Users} color="green" label="Probability" value={`${opp.probability}%`} />
        <KpiCard icon={Clock} color="amber" label="Expected Close" value={formatDate(opp.expectedClose)} small />
      </div>

      {/* ---------- Info grid ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock icon={Building2} label="Customer" value={opp.customer} />
          <InfoBlock icon={User} label="Contact" value={opp.contact} />
          <InfoBlock icon={Briefcase} label="Product" value={opp.product} />
          <InfoBlock icon={User} label="Assigned To" value={opp.assignedTo} />
          <InfoBlock icon={Target} label="Priority" value={opp.priority} />
          <InfoBlock icon={FileText} label="Lead Source" value={opp.source} />
          <InfoBlock icon={User} label="Decision Maker" value={opp.decisionMaker || "—"} />
          <InfoBlock icon={FileText} label="Competitor" value={opp.competitor || "—"} />
        </div>
      </div>

      {/* ---------- Sections ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Activity Timeline
          </h2>
          <div className="space-y-3">
            {TIMELINE.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t.type}: {t.summary}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.user} · {formatDateTime(t.when)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotation history */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Quotation History
          </h2>
          {QUOTATIONS.length > 0 ? (
            <div className="space-y-3">
              {QUOTATIONS.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
                >
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {q.id}
                  </p>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {formatCurrency(q.amount, opp.currency)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(q.date)}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No quotations yet.
            </p>
          )}
        </div>
      </div>

      {/* ---------- Requirements / Notes ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Customer Requirements
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {opp.requirements || "No requirements documented yet."}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Notes
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {opp.notes || "No notes yet."}
          </p>
        </div>
      </div>

      {/* ---------- Documents placeholder ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
          Documents
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No documents uploaded yet.
        </p>
      </div>

      {/* ---------- Modals ---------- */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${opp.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <MarkWonLostModal
        isOpen={wonModalOpen}
        onClose={() => setWonModalOpen(false)}
        opportunity={opp}
        mode="won"
        onSubmit={handleWon}
      />

      <MarkWonLostModal
        isOpen={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        opportunity={opp}
        mode="lost"
        onSubmit={handleLost}
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
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
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

export default OpportunityDetail;