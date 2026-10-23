// src/admin/pages/Meetings.jsx
import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Users, Clock, Link2, Trash2, Pencil, X, Briefcase, Mail,
  LayoutGrid, List as ListIcon, CalendarDays, CalendarRange, Sun
} from "lucide-react";
import { showToast } from "../../components/common/Toast";
import AddMeetingModal from "../components/meetings/AddMeetingModal";

// --- Static Data (Keep as is) ---
export const EMPLOYEES = [
  { id: 1, name: "Aarav Mehta",     designation: "Sales Manager",     avatar: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Priya Sharma",    designation: "Account Executive", avatar: "https://i.pravatar.cc/150?img=5"  },
  { id: 3, name: "Rohan Kapoor",    designation: "Salesperson",       avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 4, name: "Neha Verma",      designation: "Support Lead",      avatar: "https://i.pravatar.cc/150?img=9"  },
  { id: 5, name: "Vikram Singh",    designation: "Sales Director",    avatar: "https://i.pravatar.cc/150?img=15" },
  { id: 6, name: "Ananya Iyer",     designation: "Product Specialist", avatar: "https://i.pravatar.cc/150?img=20" },
  { id: 7, name: "Karan Malhotra",  designation: "Business Dev",      avatar: "https://i.pravatar.cc/150?img=33" },
  { id: 8, name: "Sneha Rao",       designation: "CRM Admin",         avatar: "https://i.pravatar.cc/150?img=27" },
];

export const RELATED_TO_OPTIONS = [
  { value: "lead:LED-0005",       label: "Lead — LED-0005 · Somethings",  type: "lead" },
  { value: "lead:LED-0001",       label: "Lead — LED-0001 · R. Sharma",   type: "lead" },
  { value: "lead:LED-0012",       label: "Lead — LED-0012 · Acme Corp",   type: "lead" },
  { value: "contact:CT-001",      label: "Contact — CT-001 · Jane Doe",   type: "contact" },
  { value: "contact:CT-004",      label: "Contact — CT-004 · Ravi Nair",  type: "contact" },
  { value: "internal:sales-review", label: "Internal — Sales review",      type: "internal" },
  { value: "internal:standup",     label: "Internal — Weekly standup",     type: "internal" },
  { value: "other:vendor-call",    label: "Other — Vendor call",           type: "other" },
];

export const MEETINGS = [
  { id: 1, title: "Quarterly pipeline review", date: "2026-03-04", startTime: "10:00", endTime: "11:00", hostId: 1, hostName: "Aarav Mehta", participantIds: [1, 2, 5, 7], relatedTo: "internal:sales-review", clientName: "", clientEmail: "", description: "Review Q1 pipeline and align on Q2 targets.", meetingLink: "https://meet.google.com/abc-defg-hij" },
  { id: 2, title: "Demo with Acme Corp", date: "2026-03-06", startTime: "14:30", endTime: "15:30", hostId: 2, hostName: "Priya Sharma", participantIds: [2, 3, 6], relatedTo: "lead:LED-0012", clientName: "Acme Corp HR", clientEmail: "hr@acme.com", description: "Walkthrough of the enterprise tier.", meetingLink: "https://zoom.us/j/1234567890" },
  { id: 3, title: "Kickoff — Ravi Nair", date: "2026-03-06", startTime: "16:00", endTime: "16:45", hostId: 3, hostName: "Rohan Kapoor", participantIds: [3, 4], relatedTo: "contact:CT-004", clientName: "Ravi Nair", clientEmail: "ravi@example.com", description: "Onboarding kickoff for newly signed customer.", meetingLink: "" },
  { id: 4, title: "Weekly standup", date: "2026-03-09", startTime: "09:30", endTime: "10:00", hostId: 1, hostName: "Aarav Mehta", participantIds: [1, 2, 3, 4, 5], relatedTo: "internal:standup", clientName: "", clientEmail: "", description: "", meetingLink: "https://meet.google.com/xyz-abcd-efg" },
  { id: 5, title: "Vendor sync", date: "2026-03-17", startTime: "11:00", endTime: "12:00", hostId: 5, hostName: "Vikram Singh", participantIds: [5, 8], relatedTo: "other:vendor-call", clientName: "Vendor Tech", clientEmail: "billing@vendortech.com", description: "Discuss renewal terms.", meetingLink: "" },
];

export const describeRelatedTo = (value) => {
  const found = RELATED_TO_OPTIONS.find((o) => o.value === value);
  if (!found) return value || "—";
  return found.label;
};

// --- Helpers ---
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = Number(h);
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${h12}:${m} ${suffix}`;
};

// Generates grid for Month View
const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
    if (cells.length >= 42) break;
  }
  return cells;
};

// Generates dates for Week View (7 days starting from Sunday)
const getWeekDates = (cursor) => {
  const baseDate = new Date(cursor.year, cursor.month, cursor.day || 1);
  const dayOfWeek = baseDate.getDay();
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - dayOfWeek);
  
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
};

// ==========================================
// 1. Day Meetings Modal
// ==========================================
const DayMeetingsModal = ({ isOpen, onClose, dateStr, meetings, onSelectMeeting, onAddClick }) => {
  if (!isOpen || !dateStr) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {new Date(dateStr).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{meetings.length} meeting{meetings.length === 1 ? "" : "s"} scheduled</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {meetings.length === 0 ? (
             <p className="text-sm text-gray-500 text-center py-6">No meetings on this day.</p>
          ) : (
            meetings.map(m => (
              <div key={m.id} onClick={() => onSelectMeeting(m)} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/50 dark:bg-gray-900/20 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">{m.title}</h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">{formatTime(m.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Users size={12} /> {m.hostName}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button onClick={() => onAddClick(dateStr)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Add Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. View Meeting Modal (Details)
// ==========================================
const MeetingDetailsModal = ({ isOpen, onClose, meeting, onDelete, onEditClick }) => {
  if (!isOpen || !meeting) return null;
  const participantNames = EMPLOYEES.filter((e) => meeting.participantIds?.includes(e.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">Meeting Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{meeting.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1"><CalendarIcon size={14} className="text-gray-400" />{new Date(meeting.date).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" />{formatTime(meeting.startTime)} {meeting.endTime ? ` – ${formatTime(meeting.endTime)}` : ""}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <div>
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Host</span>
              <div className="flex items-center gap-2">
                <img src={EMPLOYEES.find(e => e.id === meeting.hostId)?.avatar || "https://i.pravatar.cc/150?img=1"} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{meeting.hostName}</span>
              </div>
            </div>
            {meeting.relatedTo && (
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Related To</span>
                <div className="flex items-center gap-1.5 text-sm text-indigo-700 dark:text-indigo-400 font-semibold"><Briefcase size={14} />{describeRelatedTo(meeting.relatedTo)}</div>
              </div>
            )}
            {(meeting.clientName || meeting.clientEmail) && (
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Client Info</span>
                <div className="flex flex-col gap-1 text-sm text-gray-800 dark:text-gray-200">
                  {meeting.clientName && <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {meeting.clientName}</span>}
                  {meeting.clientEmail && <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {meeting.clientEmail}</span>}
                </div>
              </div>
            )}
            {participantNames.length > 0 && (
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Participants ({participantNames.length})</span>
                <div className="flex flex-wrap gap-2">
                  {participantNames.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                      <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />{p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {meeting.description && (
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Description</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{meeting.description}</p>
              </div>
            )}
          </div>
        </div>
        <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button onClick={() => onDelete(meeting.id)} className="px-3 py-2 rounded-lg text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5"><Trash2 size={14} /> Delete</button>
          <div className="flex items-center gap-2">
            <button onClick={() => onEditClick(meeting)} className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5"><Pencil size={14} /> Edit</button>
            {meeting.meetingLink && (
              <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"><Link2 size={14} /> Join</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================
const Meetings = () => {
  const { user } = useSelector((s) => s.auth) || {};
  const today = new Date();
  
  // State
  const [viewMode, setViewMode] = useState("month"); // "month" | "week" | "list" | "today"
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
  const [meetings, setMeetings] = useState(MEETINGS);

  // Modals
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState("");
  const [editingMeeting, setEditingMeeting] = useState(null);

  // Data grouping
  const byDate = useMemo(() => {
    const map = {};
    meetings.forEach((m) => { (map[m.date] ||= []).push(m); });
    Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [meetings]);

  const todayISO = toISO(today);
  
  // View calculations
  const monthGrid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const weekDates = useMemo(() => getWeekDates(cursor), [cursor]);
  const listMeetings = useMemo(() => [...meetings].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)), [meetings]);
  const todayMeetings = byDate[todayISO] || [];

  // Handlers
  const handlePrev = () => {
    if (viewMode === "month") setCursor(c => c.month === 0 ? { ...c, year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
    else if (viewMode === "week") {
      const d = new Date(cursor.year, cursor.month, cursor.day - 7);
      setCursor({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    }
  };
  
  const handleNext = () => {
    if (viewMode === "month") setCursor(c => c.month === 11 ? { ...c, year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
    else if (viewMode === "week") {
      const d = new Date(cursor.year, cursor.month, cursor.day + 7);
      setCursor({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    }
  };

  const goToday = () => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    setViewMode("today");
  };

  const openAdd = (date) => {
    setEditingMeeting(null);
    setAddModalDate(date || todayISO);
    setAddModalOpen(true);
  };

  const openEdit = (meeting) => {
    setSelectedMeeting(null);
    setEditingMeeting(meeting);
    setAddModalOpen(true);
  };

  const handleSaveMeeting = async (form) => {
    if (editingMeeting) {
      setMeetings((prev) => prev.map((m) => (m.id === form.id ? form : m)));
      showToast("Meeting updated", "success");
    } else {
      const host = EMPLOYEES.find((e) => e.id === form.hostId) || { id: form.hostId, name: form.hostName };
      setMeetings((prev) => [...prev, { id: Date.now(), ...form, hostName: host.name }]);
      showToast("Meeting scheduled", "success");
    }
  };

  const handleDeleteMeeting = (id) => {
    if(!window.confirm("Delete this meeting?")) return;
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setSelectedMeeting(null);
    showToast("Meeting deleted", "success");
  };

  const selectedDayMeetings = selectedDay ? byDate[selectedDay] || [] : [];

  // --- Render Helpers ---
  const renderMeetingPill = (m, isMonthView = false) => (
    <div
      key={m.id}
      onClick={(e) => { e.stopPropagation(); setSelectedMeeting(m); }}
      className={`flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
        isMonthView 
          ? "bg-blue-50 border-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-800/50" 
          : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 shadow-sm"
      }`}
      title={`${m.title} — ${formatTime(m.startTime)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isMonthView ? "bg-blue-500" : "bg-indigo-500"}`} />
      <span className="font-semibold whitespace-nowrap">{formatTime(m.startTime)}</span>
      <span className="truncate">{m.title}</span>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Meetings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your calendar and schedule</p>
          </div>
        </div>
        <button onClick={() => openAdd()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {/* ── Toolbar (Views + Navigation) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button onClick={() => setViewMode("month")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${viewMode === "month" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
            <LayoutGrid size={16} /> Month
          </button>
          <button onClick={() => setViewMode("week")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${viewMode === "week" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
            <CalendarRange size={16} /> Week
          </button>
          <button onClick={() => setViewMode("list")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${viewMode === "list" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
            <ListIcon size={16} /> List
          </button>
          <button onClick={goToday} className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${viewMode === "today" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
            <Sun size={16} /> Today
          </button>
        </div>

        {viewMode !== "list" && viewMode !== "today" && (
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
              {viewMode === "month" && `${MONTH_NAMES[cursor.month]} ${cursor.year}`}
              {viewMode === "week" && `${MONTH_NAMES[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"><ChevronLeft size={16} /></button>
              <button onClick={handleNext} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Render Area ── */}

      {/* 1. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wide">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map(({ date, inMonth }) => {
              const iso = toISO(date);
              const dayMeetings = byDate[iso] || [];
              const isToday = iso === todayISO;
              return (
                <div key={iso} onClick={() => setSelectedDay(iso)} className={`group relative min-h-[100px] rounded-lg border p-1.5 flex flex-col transition-colors cursor-pointer ${!inMonth ? "opacity-40 border-transparent" : "border-gray-100 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isToday ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"}`}>{date.getDate()}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); openAdd(iso); }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-blue-600 hover:bg-blue-100 transition-opacity"><Plus size={14} /></button>
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayMeetings.slice(0, 2).map((m) => renderMeetingPill(m, true))}
                    {dayMeetings.length > 2 && (
                      <div onClick={(e) => { e.stopPropagation(); setSelectedDay(iso); }} className="text-[10px] text-blue-600 font-semibold px-1 hover:underline">
                        +{dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === "week" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDates.map((d, i) => {
                const iso = toISO(d);
                const isToday = iso === todayISO;
                return (
                  <div key={iso} className={`text-center pb-2 border-b-2 ${isToday ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}`}>
                    <div className="text-xs font-semibold text-gray-500 uppercase">{DAY_NAMES[d.getDay()]}</div>
                    <div className={`text-xl font-bold mt-1 ${isToday ? "text-blue-600" : "text-gray-900 dark:text-white"}`}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[400px]">
              {weekDates.map(d => {
                const iso = toISO(d);
                const dayMeetings = byDate[iso] || [];
                return (
                  <div key={iso} className="bg-gray-50/50 dark:bg-gray-900/20 rounded-lg p-2 border border-gray-100 dark:border-gray-700/50 space-y-2" onClick={() => setSelectedDay(iso)}>
                    {dayMeetings.map(m => renderMeetingPill(m))}
                    {dayMeetings.length === 0 && <div className="text-xs text-gray-400 text-center mt-4">No meetings</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date & Time</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Meeting Title</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Host</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Related To</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {listMeetings.map(m => (
                  <tr key={m.id} onClick={() => setSelectedMeeting(m)} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{new Date(m.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                      <div className="text-xs text-gray-500">{formatTime(m.startTime)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={EMPLOYEES.find(e => e.id === m.hostId)?.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{m.hostName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">{describeRelatedTo(m.relatedTo)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedMeeting(m); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><EyeIcon size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TODAY VIEW */}
      {viewMode === "today" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sun className="text-amber-500" /> Today's Schedule
              <span className="text-sm font-normal text-gray-500 ml-2">({new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })})</span>
            </h2>
            <button onClick={() => openAdd(todayISO)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={16} /> Add</button>
          </div>
          
          {todayMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No meetings scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
              {todayMeetings.map(m => (
                <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active" onClick={() => setSelectedMeeting(m)}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 cursor-pointer z-10">
                    <Clock size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatTime(m.startTime)}</span>
                      <span className="text-xs font-semibold text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{describeRelatedTo(m.relatedTo)}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{m.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <img src={EMPLOYEES.find(e => e.id === m.hostId)?.avatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-xs text-gray-500">Host: {m.hostName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DayMeetingsModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dateStr={selectedDay}
        meetings={selectedDayMeetings}
        onSelectMeeting={(m) => setSelectedMeeting(m)}
        onAddClick={(date) => { setSelectedDay(null); openAdd(date); }}
      />

      <MeetingDetailsModal
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        meeting={selectedMeeting}
        onDelete={handleDeleteMeeting}
        onEditClick={openEdit}
      />

      <AddMeetingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveMeeting}
        defaultDate={addModalDate}
        initialData={editingMeeting}
        host={{
          id: user?.id || 1,
          name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.name || "You",
        }}
      />
    </div>
  );
};

// Simple Eye icon for the list view
const EyeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default Meetings;