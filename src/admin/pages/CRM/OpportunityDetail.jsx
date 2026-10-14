// src/admin/pages/crm/OpportunityDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  Download,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  fetchOpportunityById,
  updateOpportunityStageApi,
  deleteOpportunityApi,
  uploadOpportunityAttachmentsApi,
  deleteOpportunityAttachmentApi,
  downloadOpportunityAttachmentApi,
  clearCurrentOpportunity,
  fromOpportunityApi,
  fetchOpportunityFormOptions,
} from "../../store/slices/opportunitySlice";
import ChangeStageModal from "../../components/crm/ChangeStageModal";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const formatCurrency = (n, currency = "INR") => {
  const sym =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "AED"
          ? "AED "
          : currency === "EUR"
            ? "€"
            : currency === "GBP"
              ? "£"
              : currency === "SGD"
                ? "S$"
                : "";
  return `${sym}${Number(n || 0).toLocaleString()}`;
};
const stageBadge = (stage) => {
  const map = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Qualified:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "Proposal Sent":
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Negotiation:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[stage] || map.New;
};

const OpportunityDetail = () => {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentOpportunity,
    currentOpportunityLoading,
    currentOpportunityError,
    submitting,
    uploadingAttachments,
    options,
  } = useSelector((s) => s.opportunities);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attachInput, setAttachInput] = useState(null);

  const [pendingAttachment, setPendingAttachment] = useState(null);

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stagePreset, setStagePreset] = useState(null);

  useEffect(() => {
    dispatch(fetchOpportunityById(opportunityId));
    dispatch(fetchOpportunityFormOptions());
    return () => dispatch(clearCurrentOpportunity());
  }, [dispatch, opportunityId]);

  const opp = currentOpportunity
    ? fromOpportunityApi(currentOpportunity)
    : null;
  const isClosed = opp && (opp.stage === "Won" || opp.stage === "Lost");

  const handleDelete = async () => {
    try {
      await dispatch(deleteOpportunityApi(opportunityId)).unwrap();
      showToast(`Opportunity "${opp.name}" deleted`, "success");
      navigate("/admin/crm/opportunities");
    } catch (err) {
      showToast(err || "Failed to delete", "error");
    }
  };

  const handleChangeStageSubmit = async (payload) => {
  try {
    await dispatch(
      updateOpportunityStageApi({ id: opportunityId, ...payload }),
    ).unwrap();
    showToast(`Stage changed to ${payload.stage}`, "success");
    setStageModalOpen(false);
    setStagePreset(null);
    dispatch(fetchOpportunityById(opportunityId));
  } catch (err) {
    showToast(err || "Failed to change stage", "error");
  }
};

  const handleStageChange = async (stage, extra = {}) => {
    try {
      await dispatch(
        updateOpportunityStageApi({ id: opportunityId, stage, ...extra }),
      ).unwrap();
      showToast(`Opportunity marked as ${stage}`, "success");
      setWonModalOpen(false);
      setLostModalOpen(false);
      dispatch(fetchOpportunityById(opportunityId));
    } catch (err) {
      showToast(err || "Failed to update stage", "error");
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      await dispatch(
        uploadOpportunityAttachmentsApi({ id: opportunityId, files }),
      ).unwrap();
      showToast("Attachments uploaded", "success");
      dispatch(fetchOpportunityById(opportunityId));
    } catch (err) {
      showToast(err || "Failed to upload attachments", "error");
    } finally {
      e.target.value = "";
    }
  };

  // 👇 open confirm modal instead of deleting immediately
  const handleDeleteAttachmentClick = (att) => {
    setPendingAttachment(att);
  };

  // 👇 the real deleter runs when user confirms
  const handleConfirmDeleteAttachment = async () => {
    if (!pendingAttachment) return;
    try {
      await dispatch(
        deleteOpportunityAttachmentApi({
          id: opportunityId,
          attId: pendingAttachment.id,
        }),
      ).unwrap();
      showToast("Attachment deleted", "success");
      setPendingAttachment(null);
      dispatch(fetchOpportunityById(opportunityId));
    } catch (err) {
      showToast(err || "Failed to delete attachment", "error");
    }
  };

  const handleDownloadAttachment = async (att) => {
    try {
      await dispatch(
        downloadOpportunityAttachmentApi({
          id: opportunityId,
          attId: att.id,
          filename: att.file_name || att.name || "attachment",
        }),
      ).unwrap();
    } catch (err) {
      showToast(err || "Failed to download", "error");
    }
  };

  if (currentOpportunityLoading) {
    return (
      <div className="w-full py-16 text-center text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  }
  if (currentOpportunityError || !opp) {
    return (
      <div className="w-full py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {currentOpportunityError || "Opportunity not found"}
        </p>
        <button
          onClick={() => navigate("/admin/crm/opportunities")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Opportunities
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/crm/opportunities")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {opp.name}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageBadge(opp.stage)}`}
            >
              {opp.stage}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{opp.opportunityId}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {opp.customerName}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <IndianRupee size={13} />{" "}
              {formatCurrency(opp.estimatedValue, opp.currency)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
  {/* Change Stage — always visible */}
  <button
    onClick={() => {
      setStagePreset(null);
      setStageModalOpen(true);
    }}
    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2"
  >
    <Repeat size={14} /> Change Stage
  </button>

  <button
    onClick={() => navigate(`/admin/crm/opportunities/${opp.id}/edit`)}
    className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
  >
    <Pencil size={14} /> Edit
  </button>

  {/* Kebab — now only secondary/rare actions */}
  <div className="relative">
    <button
      onClick={() => setMenuOpen((v) => !v)}
      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500"
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
            icon={Upload}
            label="Upload Document"
            onClick={() => {
              attachInput?.click();
              setMenuOpen(false);
            }}
          />
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <MenuItem
            icon={Trash2}
            label="Delete"
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

      {/* hidden file input for menu upload */}
      <input
        ref={setAttachInput}
        type="file"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Target}
          color="blue"
          label="Estimated Value"
          value={formatCurrency(opp.estimatedValue, opp.currency)}
        />
        <KpiCard
          icon={Briefcase}
          color="purple"
          label="Stage"
          value={opp.stage}
          small
        />
        <KpiCard
          icon={Users}
          color="green"
          label="Probability"
          value={`${opp.probability}%`}
        />
        <KpiCard
          icon={Clock}
          color="amber"
          label="Expected Close"
          value={formatDate(opp.expectedClose)}
          small
        />
      </div>

      {/* Info grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock
            icon={Building2}
            label="Customer"
            value={opp.customerName}
          />
          <InfoBlock icon={User} label="Contact" value={opp.contactPerson} />
          <InfoBlock
            icon={Briefcase}
            label="Product"
            value={opp.productNames?.join(", ") || "—"}
          />
          <InfoBlock icon={User} label="Assigned To" value={opp.assignedTo} />
          <InfoBlock icon={Target} label="Priority" value={opp.priority} />
          <InfoBlock
            icon={FileText}
            label="Lead Source"
            value={opp.leadSource || "—"}
          />
          <InfoBlock
            icon={User}
            label="Decision Maker"
            value={opp.decisionMaker || "—"}
          />
          <InfoBlock
            icon={FileText}
            label="Competitor"
            value={opp.competitor || "—"}
          />
        </div>
      </div>

      {/* Timeline + Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Activity Timeline
          </h2>
          {opp.activities.length > 0 ? (
            <div className="space-y-3">
              {opp.activities.map((t) => (
  <div
    key={t.id}
    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
  >
    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
      <CalendarClock size={14} className="text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {t.title || "—"}
        </p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            t.status === "Completed"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : t.status === "Overdue"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {t.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {t.type ? `${t.type} · ` : ""}
        {t.assignedTo || "—"} · {formatDateTime(t.startAt || t.createdAt)}
      </p>
      {t.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {t.description}
        </p>
      )}
    </div>
  </div>
))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No activities yet.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Quotation History
          </h2>
          {opp.quotations.length > 0 ? (
            <div className="space-y-3">
              {opp.quotations.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  onClick={() => navigate(`/admin/crm/quotations/${q.id}`)}
                >
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {q.quotation_number || q.number}
                  </p>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {formatCurrency(q.grand_total || q.total, opp.currency)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(q.quotation_date)}
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

      {/* Requirements / Notes */}
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

      {/* Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Documents
          </h2>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30">
            <Upload size={13} />{" "}
            {uploadingAttachments ? "Uploading…" : "Upload"}
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploadingAttachments}
            />
          </label>
        </div>
        {opp.attachments.length > 0 ? (
          <div className="space-y-2">
            {opp.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {att.file_name || att.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadAttachment(att)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAttachmentClick(att)} // 👈 open confirm
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No documents uploaded yet.
          </p>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${opp.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      {/* 👇 new: confirm attachment deletion */}
      <ConfirmModal
        isOpen={Boolean(pendingAttachment)}
        onClose={() => setPendingAttachment(null)}
        onConfirm={handleConfirmDeleteAttachment}
        title="Delete Attachment"
        message={`Are you sure you want to delete "${pendingAttachment?.file_name || pendingAttachment?.name || "this file"}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <ChangeStageModal
  isOpen={stageModalOpen}
  onClose={() => {
    setStageModalOpen(false);
    setStagePreset(null);
  }}
  opportunity={opp}
  stages={options.stages || []}
  presetStage={stagePreset}
  onSubmit={handleChangeStageSubmit}
  submitting={submitting}
/>
    </div>
  );
};

// ---------- building blocks ----------
const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${danger ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
  >
    <Icon size={15} /> {label}
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
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${map[color]}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div
        className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}
      >
        {value}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

export default OpportunityDetail;
