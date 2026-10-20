// src/admin/components/crm/ViewActivityModal.jsx
import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Check,
  Calendar,
  Clock,
  Flag,
  Users,
  Building2,
  Briefcase,
  FileText,
  Phone,
  Mail,
  User,
  Tag,
  Bell,
  AlignLeft,
} from "lucide-react";

// ---------- helpers (keep consistent with Activities.jsx) ----------
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const priorityBadge = (priority) => {
  const map = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Medium:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return map[priority] || map.Medium;
};

const statusBadge = (status) => {
  const map = {
    Planned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "In Progress":
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Planned;
};

const typeIcon = (type) => {
  const map = {
    Call: Phone,
    Email: Mail,
    Meeting: Users,
    Task: FileText,
    "Site Visit": Building2,
  };
  return map[type] || FileText;
};

const typeColor = (type) => {
  const map = {
    Call: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    Email: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    Meeting:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    Task: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    "Site Visit":
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };
  return map[type] || map.Task;
};

const relatedIcon = (relatedToType) => {
  const map = {
    Lead: Users,
    Customer: Building2,
    Opportunity: Briefcase,
    Internal: FileText,
  };
  return map[relatedToType] || FileText;
};

// ---------- component ----------
const ViewActivityModal = ({
  isOpen,
  onClose,
  activity,
  onEdit,
  onComplete,
  loading = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setVisible(true);
    else setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !activity) return null;

  const TypeIcon = typeIcon(activity.type);
  const RelatedIcon = relatedIcon(activity.relatedToType);
  const canComplete =
    activity.status !== "Completed" && activity.status !== "Cancelled";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor(
                activity.type,
              )}`}
            >
              <TypeIcon size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {activity.title || "Untitled activity"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColor(
                    activity.type,
                  )}`}
                >
                  <TypeIcon size={10} />
                  {activity.type}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge(
                    activity.priority,
                  )}`}
                >
                  <Flag size={10} className="mr-1" />
                  {activity.priority}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(
                    activity.status,
                  )}`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Loading activity…
            </div>
          ) : (
            <>
              {/* Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Calendar}
                  label="Start"
                  value={formatDate(activity.startAt)}
                  sub={formatTime(activity.startAt)}
                />
                <InfoCard
                  icon={Clock}
                  label="End"
                  value={formatDate(activity.endAt)}
                  sub={formatTime(activity.endAt)}
                />
              </div>

              {/* Assignment + Related */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={User}
                  label="Assigned To"
                  value={activity.assignedTo || "Unassigned"}
                />
                <InfoCard
                  icon={RelatedIcon}
                  label={`Related ${activity.relatedToType || "Record"}`}
                  value={
                    activity.relatedToLabel ||
                    activity.relatedToId ||
                    "—"
                  }
                />
              </div>

              {/* Reminder */}
              {activity.reminder && activity.reminder !== "None" && (
                <InfoCard
                  icon={Bell}
                  label="Reminder"
                  value={activity.reminder}
                />
              )}

              {/* Description */}
              {activity.description && (
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    <AlignLeft size={11} /> Description
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {activity.description}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <InfoCard
                  icon={Tag}
                  label="Activity ID"
                  value={activity.activityId || activity.id}
                />
                {activity.createdAt && (
                  <InfoCard
                    icon={Calendar}
                    label="Created"
                    value={formatDate(activity.createdAt)}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Close
          </button>
          {canComplete && onComplete && (
            <button
              onClick={() => onComplete(activity)}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Check size={14} /> Mark Completed
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(activity)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- building blocks ----------
const InfoCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/60">
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      <Icon size={11} /> {label}
    </div>
    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
      {value || "—"}
    </div>
    {sub && (
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {sub}
      </div>
    )}
  </div>
);

export default ViewActivityModal;