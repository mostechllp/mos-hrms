// src/admin/pages/crm/Activities.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Pencil,
  Trash2,
  Check,
  CalendarClock,
  List,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Flag,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Users,
  FileText,
  Building2,
  Briefcase,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActivityModal from "../../components/crm/ActivityModal";

// ------------------------------------------------------------
// STATIC DATA
// ------------------------------------------------------------

const ACTIVITIES = [
  {
    id: "ACT-0001",
    title: "HRMS demo",
    type: "Meeting",
    relatedToType: "Opportunity",
    relatedToId: "OPP-0001",
    relatedToLabel: "ABC Traders HRMS Rollout",
    assignedTo: "Rahul Verma",
    startAt: "2026-09-16T10:00:00",
    endAt: "2026-09-16T11:00:00",
    priority: "High",
    status: "Planned",
    reminder: "1 hour",
    description: "Demo HRMS modules for the procurement and HR teams.",
  },
  {
    id: "ACT-0002",
    title: "Follow-up call with Ramesh",
    type: "Call",
    relatedToType: "Lead",
    relatedToId: "LED-0001",
    relatedToLabel: "Ramesh Kumar · Acme Corp",
    assignedTo: "Riya Roy",
    startAt: "2026-09-16T14:30:00",
    endAt: "2026-09-16T15:00:00",
    priority: "High",
    status: "Planned",
    reminder: "15 min",
    description: "Discuss revised pricing options.",
  },
  {
    id: "ACT-0003",
    title: "Send quotation Q-2026-0142",
    type: "Task",
    relatedToType: "Customer",
    relatedToId: "CUS-0001",
    relatedToLabel: "Acme Corp",
    assignedTo: "Riya Roy",
    startAt: "2026-09-17T09:00:00",
    endAt: "2026-09-17T09:30:00",
    priority: "Medium",
    status: "In Progress",
    reminder: "1 day",
    description: "Revised quotation to reflect new implementation scope.",
  },
  {
    id: "ACT-0004",
    title: "Product demo for Globex",
    type: "Meeting",
    relatedToType: "Opportunity",
    relatedToId: "OPP-0002",
    relatedToLabel: "XYZ Pvt Ltd ERP Migration",
    assignedTo: "Amina Khan",
    startAt: "2026-09-18T15:00:00",
    endAt: "2026-09-18T16:30:00",
    priority: "High",
    status: "Planned",
    reminder: "1 hour",
    description: "Deep dive into ERP migration workflow.",
  },
  {
    id: "ACT-0005",
    title: "Site visit — Initech",
    type: "Site Visit",
    relatedToType: "Customer",
    relatedToId: "CUS-0003",
    relatedToLabel: "Initech Solutions",
    assignedTo: "Karthik Raj",
    startAt: "2026-09-14T11:00:00",
    endAt: "2026-09-14T13:00:00",
    priority: "Medium",
    status: "Completed",
    reminder: "None",
    description: "Assess on-site infrastructure requirements.",
  },
  {
    id: "ACT-0006",
    title: "Contract review with legal",
    type: "Task",
    relatedToType: "Opportunity",
    relatedToId: "OPP-0004",
    relatedToLabel: "LMN Group HRMS Upgrade",
    assignedTo: "Riya Roy",
    startAt: "2026-09-15T10:00:00",
    endAt: "2026-09-15T11:00:00",
    priority: "High",
    status: "Overdue",
    reminder: "1 hour",
    description: "Legal team to review the revised MSA clauses.",
  },
  {
    id: "ACT-0007",
    title: "Email proposal draft",
    type: "Email",
    relatedToType: "Lead",
    relatedToId: "LED-0002",
    relatedToLabel: "Priya Sharma · Globex Ltd",
    assignedTo: "Karthik Raj",
    startAt: "2026-09-20T09:00:00",
    endAt: "2026-09-20T09:30:00",
    priority: "Medium",
    status: "Planned",
    reminder: "1 day",
    description: "Draft and send proposal after pricing approval.",
  },
  {
    id: "ACT-0008",
    title: "Team sync — weekly",
    type: "Task",
    relatedToType: "Internal",
    relatedToId: "—",
    relatedToLabel: "Internal",
    assignedTo: "Aarav Mehta",
    startAt: "2026-09-19T16:00:00",
    endAt: "2026-09-19T16:30:00",
    priority: "Low",
    status: "Planned",
    reminder: "15 min",
    description: "Weekly pipeline review with the sales team.",
  },
];

const TYPES = ["Call", "Email", "Meeting", "Task", "Site Visit"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Planned", "In Progress", "Completed", "Overdue", "Cancelled"];
const ASSIGNEES = ["Rahul Verma", "Amina Khan", "Karthik Raj", "Riya Roy", "Aarav Mehta"];

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const parseDate = (s) => new Date(s);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDate = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return `${formatDate(d)} · ${formatTime(d)}`;
};

const priorityBadge = (priority) => {
  const map = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return map[priority] || map.Medium;
};

const statusBadge = (status) => {
  const map = {
    Planned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
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
    Meeting: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    Task: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    "Site Visit": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
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

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const Activities = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState(ACTIVITIES);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    assignedTo: "",
    priority: "",
    status: "",
  });
  const [view, setView] = useState("list"); // list | calendar

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [prefillDate, setPrefillDate] = useState(null);

  // ---- Calendar state ----
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [calendarMode, setCalendarMode] = useState("month"); // day | week | month

  // ------------------------------------------------------------
  // Filtered list
  // ------------------------------------------------------------
  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filters.type && a.type !== filters.type) return false;
      if (filters.assignedTo && a.assignedTo !== filters.assignedTo) return false;
      if (filters.priority && a.priority !== filters.priority) return false;
      if (filters.status && a.status !== filters.status) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.relatedToLabel.toLowerCase().includes(q) ||
          a.assignedTo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, filters, search]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const pageActivities = filtered.slice(start, start + perPage);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  const summary = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todays = activities.filter((a) => isSameDay(parseDate(a.startAt), now));
    const upcoming = activities.filter(
      (a) => parseDate(a.startAt) > todayEnd && a.status === "Planned",
    );
    const completed = activities.filter((a) => a.status === "Completed");
    const overdue = activities.filter((a) => a.status === "Overdue");
    const highPriority = activities.filter(
      (a) => a.priority === "High" && a.status !== "Completed",
    );

    return {
      today: todays.length,
      upcoming: upcoming.length,
      completed: completed.length,
      overdue: overdue.length,
      highPriority: highPriority.length,
    };
  }, [activities]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const openCreate = (date = null) => {
    setEditingActivity(null);
    setPrefillDate(date);
    setModalOpen(true);
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);
    setPrefillDate(null);
    setModalOpen(true);
  };

  const handleDeleteClick = (activity) => {
    setPendingDelete(activity);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setActivities((prev) => prev.filter((a) => a.id !== pendingDelete.id));
    showToast(`Activity "${pendingDelete.title}" deleted`, "success");
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleComplete = (activity) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id ? { ...a, status: "Completed" } : a,
      ),
    );
    showToast(`Marked "${activity.title}" as completed`, "success");
  };

  const handleModalSubmit = (data, isEdit) => {
    if (isEdit && editingActivity) {
      setActivities((prev) =>
        prev.map((a) => (a.id === editingActivity.id ? { ...a, ...data } : a)),
      );
      showToast("Activity updated successfully", "success");
    } else {
      const newActivity = {
        ...data,
        id: `ACT-${String(activities.length + 1).padStart(4, "0")}`,
        relatedToLabel: data.relatedToLabel || data.relatedToId || "—",
      };
      setActivities((prev) => [newActivity, ...prev]);
      showToast("Activity created successfully", "success");
    }
    setModalOpen(false);
    setEditingActivity(null);
    setPrefillDate(null);
  };

  const clearFilters = () => {
    setFilters({ type: "", assignedTo: "", priority: "", status: "" });
    setSearch("");
    setCurrentPage(1);
  };

  const resetToFirstPage = () => setCurrentPage(1);

  // ------------------------------------------------------------
  // Calendar helpers
  // ------------------------------------------------------------
  const navigateCalendar = (dir) => {
    const d = new Date(calendarDate);
    if (calendarMode === "day") d.setDate(d.getDate() + dir);
    else if (calendarMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCalendarDate(d);
  };

  const goToday = () => {
    const now = new Date();
    setCalendarDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const calendarTitle = useMemo(() => {
    if (calendarMode === "day") {
      return calendarDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    if (calendarMode === "week") {
      const startOfWeek = new Date(calendarDate);
      startOfWeek.setDate(calendarDate.getDate() - calendarDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${endOfWeek.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
    }
    return calendarDate.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }, [calendarDate, calendarMode]);

  // Month grid days
  const monthGrid = useMemo(() => {
    if (calendarMode !== "month") return [];
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    // Padding from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const d = new Date(year, month, i - startDayOfWeek + 1);
      cells.push({ date: d, inMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(year, month, i), inMonth: true });
    }
    // Padding to next month
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      cells.push({ date: d, inMonth: false });
    }
    return cells;
  }, [calendarDate, calendarMode]);

  // Week grid
  const weekDays = useMemo(() => {
    if (calendarMode !== "week") return [];
    const startOfWeek = new Date(calendarDate);
    startOfWeek.setDate(calendarDate.getDate() - calendarDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [calendarDate, calendarMode]);

  const dayActivities = (date) =>
    filtered.filter((a) => isSameDay(parseDate(a.startAt), date));

  const todayIsVisible =
    calendarMode === "month" &&
    monthGrid.some(
      (c) => c.inMonth && isSameDay(c.date, new Date()),
    );

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Activities
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all calls, meetings, follow-ups, and tasks
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => showToast("Export started", "success")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => openCreate()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Activity
          </button>
        </div>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Today's Activities"
          value={summary.today}
          icon={CalendarDays}
          color="blue"
        />
        <SummaryCard
          label="Upcoming"
          value={summary.upcoming}
          icon={TrendingUp}
          color="indigo"
        />
        <SummaryCard
          label="Completed"
          value={summary.completed}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Overdue"
          value={summary.overdue}
          icon={AlertCircle}
          color="red"
        />
        <SummaryCard
          label="High Priority"
          value={summary.highPriority}
          icon={Flag}
          color="amber"
        />
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Search by title, related record, or assignee..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
            activeFilterCount > 0
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title="List view"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              view === "calendar"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title="Calendar view"
          >
            <CalendarDays size={15} />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterSelect
              label="Type"
              value={filters.type}
              onChange={(v) => {
                setFilters((f) => ({ ...f, type: v }));
                resetToFirstPage();
              }}
              options={TYPES}
            />
            <FilterSelect
              label="Assigned To"
              value={filters.assignedTo}
              onChange={(v) => {
                setFilters((f) => ({ ...f, assignedTo: v }));
                resetToFirstPage();
              }}
              options={ASSIGNEES}
            />
            <FilterSelect
              label="Priority"
              value={filters.priority}
              onChange={(v) => {
                setFilters((f) => ({ ...f, priority: v }));
                resetToFirstPage();
              }}
              options={PRIORITIES}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(v) => {
                setFilters((f) => ({ ...f, status: v }));
                resetToFirstPage();
              }}
              options={STATUSES}
            />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- LIST VIEW ---------- */}
      {view === "list" && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[1000px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {[
                      "ACTIVITY",
                      "TYPE",
                      "RELATED TO",
                      "ASSIGNED",
                      "DUE",
                      "PRIORITY",
                      "STATUS",
                      "ACTIONS",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageActivities.length > 0 ? (
                    pageActivities.map((a) => {
                      const TypeIcon = typeIcon(a.type);
                      const RelatedIcon = relatedIcon(a.relatedToType);
                      return (
                        <tr
                          key={a.id}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[200px] truncate">
                            {a.title}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColor(
                                a.type,
                              )}`}
                            >
                              <TypeIcon size={11} />
                              {a.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <RelatedIcon size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {a.relatedToLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {a.assignedTo}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDateTime(a.startAt)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge(
                                a.priority,
                              )}`}
                            >
                              {a.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(
                                a.status,
                              )}`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1">
                              <IconBtn
                                icon={Eye}
                                color="text-blue-500"
                                title="View"
                                onClick={() =>
                                  showToast(`Open ${a.id} detail — later`, "info")
                                }
                              />
                              <IconBtn
                                icon={Pencil}
                                color="text-amber-500"
                                title="Edit"
                                onClick={() => openEdit(a)}
                              />
                              {a.status !== "Completed" && (
                                <IconBtn
                                  icon={Check}
                                  color="text-green-600"
                                  title="Mark as Completed"
                                  onClick={() => handleComplete(a)}
                                />
                              )}
                              <IconBtn
                                icon={Trash2}
                                color="text-red-500"
                                title="Delete"
                                onClick={() => handleDeleteClick(a)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No activities found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalFiltered > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalFiltered}
              itemsPerPage={perPage}
            />
          )}
        </>
      )}

      {/* ---------- CALENDAR VIEW ---------- */}
      {view === "calendar" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateCalendar(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white ml-2">
                {calendarTitle}
              </h3>
            </div>

            <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              {["day", "week", "month"].map((m) => (
                <button
                  key={m}
                  onClick={() => setCalendarMode(m)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    calendarMode === m
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* --- Month view --- */}
          {calendarMode === "month" && (
            <div>
              {/* Weekday header */}
              <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="px-2 py-2 text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-center"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7">
                {monthGrid.map((cell, i) => {
                  const evts = dayActivities(cell.date);
                  const isToday = isSameDay(cell.date, new Date());
                  return (
                    <div
                      key={i}
                      onClick={() => openCreate(cell.date)}
                      className={`min-h-[100px] border-r border-b border-gray-100 dark:border-gray-700/40 p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${
                        !cell.inMonth ? "bg-gray-50/50 dark:bg-gray-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? "bg-blue-600 text-white"
                              : cell.inMonth
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {evts.length > 0 && (
                          <span className="text-[9px] font-bold text-gray-400">
                            {evts.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {evts.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEdit(e);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${typeColor(
                              e.type,
                            )} hover:opacity-80`}
                          >
                            {formatTime(e.startAt)} {e.title}
                          </div>
                        ))}
                        {evts.length > 3 && (
                          <div className="text-[9px] text-gray-400 pl-1">
                            +{evts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- Week view --- */}
          {calendarMode === "week" && (
            <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-700/40">
              {weekDays.map((d, i) => {
                const evts = dayActivities(d);
                const isToday = isSameDay(d, new Date());
                return (
                  <div key={i} className="min-h-[400px] flex flex-col">
                    <div
                      className={`px-2 py-3 text-center border-b border-gray-100 dark:border-gray-700/40 ${
                        isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                        {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      </div>
                      <div
                        className={`text-sm font-bold mt-0.5 ${
                          isToday
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                    <div
                      onClick={() => openCreate(d)}
                      className="p-2 space-y-1 flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      {evts.map((e) => (
                        <div
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openEdit(e);
                          }}
                          className={`text-[11px] px-2 py-1.5 rounded cursor-pointer ${typeColor(
                            e.type,
                          )} hover:opacity-80`}
                        >
                          <div className="font-semibold truncate">
                            {e.title}
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">
                            {formatTime(e.startAt)} · {e.assignedTo}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- Day view --- */}
          {calendarMode === "day" && (
            <div className="p-4">
              <div className="max-w-3xl mx-auto">
                {dayActivities(calendarDate).length > 0 ? (
                  <div className="space-y-2">
                    {dayActivities(calendarDate)
                      .sort(
                        (a, b) =>
                          new Date(a.startAt) - new Date(b.startAt),
                      )
                      .map((e) => {
                        const TypeIcon = typeIcon(e.type);
                        return (
                          <div
                            key={e.id}
                            onClick={() => openEdit(e)}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor(
                                e.type,
                              )}`}
                            >
                              <TypeIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {e.title}
                                </p>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge(
                                    e.priority,
                                  )}`}
                                >
                                  {e.priority}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(
                                    e.status,
                                  )}`}
                                >
                                  {e.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTime(e.startAt)} – {formatTime(e.endAt)} ·{" "}
                                {e.assignedTo}
                              </p>
                              {e.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {e.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarDays
                      size={40}
                      className="mx-auto text-gray-300 dark:text-gray-600"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      No activities on {formatDate(calendarDate)}
                    </p>
                    <button
                      onClick={() => openCreate(calendarDate)}
                      className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                    >
                      Add Activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- Delete confirm ---------- */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Activity"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ---------- Add / Edit modal ---------- */}
      <ActivityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
          setPrefillDate(null);
        }}
        activity={editingActivity}
        prefillDate={prefillDate}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------

const SummaryCard = ({ label, value, icon: Icon, color }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

const IconBtn = ({ icon: Icon, color, title, onClick }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color}`}
  >
    <Icon size={14} />
  </button>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default Activities;