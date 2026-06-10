import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearTaskReportsError,
  fetchTaskReports,
  setTaskReportsPagination,
  setTaskReportsSearch,
  deleteTaskReport,
  updateTaskReport,
} from "../../store/slices/taskReportsSlice";
import { useEffect, useState } from "react";
import { showToast } from "../common/Toast";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiAlertCircle,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";

export const TaskReportsList = () => {
  const dispatch = useDispatch();
  const taskReportsState = useSelector((state) => state.EmpTaskReports) || {};
  const {
    taskReports = [],
    loading = false,
    pagination = { currentPage: 1, perPage: 10 },
    search = "",
    error = null,
  } = taskReportsState;

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [editFormData, setEditFormData] = useState({
    tasks_completed: "",
    plan_tomorrow: "",
    pending_tasks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshTaskReports = () => {
    dispatch(fetchTaskReports());
  };

  useEffect(() => {
    refreshTaskReports();
  }, [dispatch]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshTaskReports();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearTaskReportsError());
    }
  }, [error, dispatch]);

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  // This Month Reports (current month)
  const thisMonthReports = taskReports.filter((report) => {
    const reportDate = new Date(report.date);
    return reportDate.getMonth() === new Date().getMonth() && 
           reportDate.getFullYear() === currentYear;
  }).length;
  
  // Reports with pending tasks
  const withPendingTasks = taskReports.filter((report) => 
    report.pending_tasks && report.pending_tasks.trim()
  ).length;
  
  // Weekly trend (reports in last 7 days vs previous 7 days)
  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 7);
  const prev7Days = new Date();
  prev7Days.setDate(today.getDate() - 14);
  
  const recentWeekReports = taskReports.filter(r => new Date(r.date) >= last7Days).length;
  const prevWeekReports = taskReports.filter(r => new Date(r.date) >= prev7Days && new Date(r.date) < last7Days).length;
  const weeklyTrend = prevWeekReports > 0 
    ? Math.round(((recentWeekReports - prevWeekReports) / prevWeekReports) * 100)
    : recentWeekReports > 0 ? 100 : 0;

  // Performance Overview calculations
  const totalReports = taskReports.length;
  
  // Reports with admin feedback
  const withRemarks = taskReports.filter((report) => report.remarks && report.remarks.trim()).length;
  
  // Quality reports (detailed tasks completed - more than 30 chars)
  const qualityReports = taskReports.filter((report) => 
    report.tasks_completed && report.tasks_completed.trim().length > 30
  ).length;
  const qualityRate = totalReports > 0 ? Math.round((qualityReports / totalReports) * 100) : 0;

  // Calculate consistency streak (consecutive days with reports)
  const calculateStreak = () => {
    if (taskReports.length === 0) return 0;
    const sortedDates = [...taskReports]
      .map(r => new Date(r.date).toDateString())
      .sort((a, b) => new Date(b) - new Date(a));
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else break;
    }
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  // Calculate completion rate based on report frequency
  const getFirstReportDate = () => {
    if (taskReports.length === 0) return null;
    const dates = taskReports.map(r => new Date(r.date));
    return new Date(Math.min(...dates));
  };
  
  const firstReportDate = getFirstReportDate();
  let completionRate = 0;
  if (firstReportDate && totalReports > 0) {
    const todayDate = new Date();
    const totalDays = Math.ceil((todayDate - firstReportDate) / (1000 * 60 * 60 * 24)) + 1;
    completionRate = Math.min(100, Math.round((totalReports / totalDays) * 100));
  }

  // Get last 30 days reports count
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentReports = taskReports.filter((report) => new Date(report.date) >= last30Days).length;

  // SVG Chart Calculations
  const safeTotal = totalReports || 1;
  const pctQuality = (qualityReports / safeTotal) * 100;
  const pctWithRemarks = (withRemarks / safeTotal) * 100;
  const pctRecent = (recentReports / safeTotal) * 100;

  // Filter and paginate reports
  const filteredReports = Array.isArray(taskReports)
    ? taskReports.filter((report) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          (report.tasks_completed || "").toLowerCase().includes(searchLower) ||
          (report.plan_tomorrow || "").toLowerCase().includes(searchLower) ||
          (report.pending_tasks || "").toLowerCase().includes(searchLower) ||
          (report.remarks || "").toLowerCase().includes(searchLower)
        );
      })
    : [];

  const perPage = pagination?.perPage || 10;
  const currentPage = pagination?.currentPage || 1;
  const totalPages = Math.ceil(filteredReports.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentReports = filteredReports.slice(start, start + perPage);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setTaskReportsPagination({ currentPage: page, perPage: perPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setTaskReportsSearch(e.target.value));
  };

  const handleEntriesChange = (e) => {
    dispatch(setTaskReportsPagination({ currentPage: 1, perPage: parseInt(e.target.value) }));
  };

  const toggleRowExpand = (reportId) => {
    setExpandedRows((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditFormData({
      tasks_completed: report.tasks_completed || "",
      plan_tomorrow: report.plan_tomorrow || "",
      pending_tasks: report.pending_tasks || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editFormData.tasks_completed.trim()) {
      showToast("Tasks completed is required", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(updateTaskReport({ id: selectedReport.id, data: editFormData })).unwrap();
      showToast("Task report updated successfully!", "success");
      setEditModalOpen(false);
      setSelectedReport(null);
      setEditFormData({ tasks_completed: "", plan_tomorrow: "", pending_tasks: "" });
      refreshTaskReports();
    } catch (error) {
      showToast(error || "Failed to update task report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteTaskReport(selectedReport.id)).unwrap();
      showToast("Task report deleted successfully!", "success");
      setDeleteConfirmOpen(false);
      setSelectedReport(null);
      refreshTaskReports();
    } catch (error) {
      showToast(error || "Failed to delete task report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && taskReports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-base">Loading task reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-reports-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-green-600 bg-clip-text text-transparent">
          My Task Reports
        </h2>
      </div>

      {/* Stats Cards + Performance Overview - Side by Side */}
      <div className="flex flex-col lg:flex-row gap-5 mb-6">
        {/* Left: Stats Cards - 2x2 Grid */}
        <div className="lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            {/* Card 1: This Month Reports */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiCalendar className="text-blue-600 dark:text-blue-400 text-lg" />
                </div>
                <span className="text-xs text-[var(--muted)] font-medium">Current Month</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text)] mb-1">{thisMonthReports}</div>
              <div className="text-xs text-[var(--muted)]">
                Reports in {currentMonth}
              </div>
            </div>

            {/* Card 2: Pending Tasks */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FiAlertCircle className="text-amber-600 dark:text-amber-400 text-lg" />
                </div>
                <span className="text-xs text-[var(--muted)] font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text)] mb-1">{withPendingTasks}</div>
              <div className="text-xs text-[var(--muted)]">
                Reports with pending tasks
              </div>
            </div>

            {/* Card 3: Weekly Activity */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FiTrendingUp className="text-emerald-600 dark:text-emerald-400 text-lg" />
                </div>
                <span className="text-xs text-[var(--muted)] font-medium">Last 7 Days</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text)] mb-1">{recentWeekReports}</div>
              <div className="text-xs">
                <span className={`font-semibold ${weeklyTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {weeklyTrend >= 0 ? `+${weeklyTrend}%` : `${weeklyTrend}%`}
                </span>
                <span className="text-[var(--muted)]"> vs prev week</span>
              </div>
            </div>

            {/* Card 4: Current Streak */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <FiStar className="text-orange-600 dark:text-orange-400 text-lg" />
                </div>
                <span className="text-xs text-[var(--muted)] font-medium">Streak</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text)] mb-1">{currentStreak}</div>
              <div className="text-xs text-[var(--muted)]">
                {currentStreak === 1 ? 'day' : 'days'} consecutive
              </div>
            </div>
          </div>
        </div>

        {/* Right: Performance Overview Card */}
        <div className="lg:w-1/2 bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-[#10B981] text-base" />
            <h3 className="font-bold text-[var(--text)] text-base">My Performance Overview</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Donut Chart with Total in Center */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100 dark:text-gray-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${pctQuality}, 100`}
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  strokeDasharray={`${pctWithRemarks}, 100`}
                  strokeDashoffset={-pctQuality}
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${pctRecent}, 100`}
                  strokeDashoffset={-(pctQuality + pctWithRemarks)}
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[var(--muted)] text-[9px] uppercase font-bold tracking-wider">
                  TOTAL
                </span>
                <span className="text-2xl font-extrabold text-[#10B981]">
                  {totalReports}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-sm text-[var(--text-secondary)] w-28">Quality Reports</span>
                <span className="font-bold text-[var(--text)] text-base">{qualityReports}</span>
                <span className="text-xs text-[var(--muted)]">({qualityRate}%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-sm text-[var(--text-secondary)] w-28">With Feedback</span>
                <span className="font-bold text-[var(--text)] text-base">{withRemarks}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-[var(--text-secondary)] w-28">Last 30 Days</span>
                <span className="font-bold text-[var(--text)] text-base">{recentReports}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 pt-1 border-t border-[var(--border)]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-sm text-[var(--text-secondary)] w-28">Completion Rate</span>
                <span className="font-bold text-base text-green-600">{completionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-sm text-[var(--text-secondary)]">
          <span>Show entries</span>
          <select
            value={perPage}
            onChange={handleEntriesChange}
            className="border-none outline-none bg-transparent font-semibold text-[var(--text)] cursor-pointer text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="search-wrapper flex items-center gap-3 flex-wrap">
          <div className="search-box flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-2">
            <FiSearch className="text-[var(--muted)] text-sm" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search reports..."
              className="border-none outline-none bg-transparent text-sm text-[var(--text)] w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Task Reports Table */}
      <div className="task-reports-table-wrapper bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
        <table className="task-reports-table w-full border-collapse text-sm min-w-[900px]">
          <thead>
            <tr className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)] w-10">#</th>
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Date</th>
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Tasks Completed</th>
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Pending Works</th>
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Plan for Tomorrow</th>
              <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Remarks (Admin)</th>
              <th className="text-center py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Actions</th>
              <th className="text-center py-3.5 px-4 text-sm font-semibold text-[var(--muted)] w-10">Expand</th>
                          </tr>
          </thead>
          <tbody>
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-[var(--muted)]">
                  <div className="flex flex-col items-center gap-3">
                    <FiClock className="text-5xl text-[var(--muted)]" />
                    <p className="text-base">No task reports found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentReports.map((report, idx) => (
                <React.Fragment key={report.id}>
                  <tr className="hover:bg-[var(--surface2)] transition-colors border-b border-[var(--border)]">
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] text-sm">{start + idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-[var(--muted)] text-sm" />
                        <span className="text-[var(--text)] text-sm whitespace-nowrap">{formatDate(report.date)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate cursor-pointer hover:text-green-500 text-sm" onClick={() => toggleRowExpand(report.id)}>
                      {report.tasks_completed?.substring(0, 60) || "-"}
                      {report.tasks_completed?.length > 60 && "..."}
                    </td>
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 max-w-[200px] truncate cursor-pointer text-sm" onClick={() => toggleRowExpand(report.id)}>
                      {report.pending_tasks ? (
                        <div className="flex items-center gap-1">
                          <FiClock className="text-sm" />
                          {report.pending_tasks.substring(0, 50)}
                          {report.pending_tasks.length > 50 && "..."}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate cursor-pointer text-sm" onClick={() => toggleRowExpand(report.id)}>
                      {report.plan_tomorrow?.substring(0, 50) || "-"}
                      {report.plan_tomorrow?.length > 50 && "..."}
                    </td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 max-w-[150px] truncate text-sm" title={report.remarks}>
                      {report.remarks ? (
                        <div className="flex items-center gap-1">
                          <FiClock className="text-sm" />
                          <span className="italic">{report.remarks.substring(0, 35)}</span>
                          {report.remarks.length > 35 && "..."}
                        </div>
                      ) : (
                        <span className="text-[var(--muted)] italic">No remarks</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleView(report)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="View Details">
                          <FiEye className="text-sm" />
                        </button>
                        <button onClick={() => handleEdit(report)} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors" title="Edit Report">
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button onClick={() => handleDeleteClick(report)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete Report">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => toggleRowExpand(report.id)} className="p-1 rounded-lg hover:bg-[var(--surface2)] transition-colors">
                        {expandedRows[report.id] ? <FiChevronUp className="text-[var(--muted)]" /> : <FiChevronDown className="text-[var(--muted)]" />}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[report.id] && (
                    <tr className="bg-[var(--surface2)] border-b border-[var(--border)]">
                      <td colSpan="8" className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <FiFileText className="text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-[var(--text)] mb-1">Tasks Completed</h4>
                              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{report.tasks_completed || "-"}</p>
                            </div>
                          </div>
                          
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredReports.length > 0 && (
        <div className="pagination-container flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
          <div className="text-sm text-[var(--muted)]">
            Showing {start + 1} to {Math.min(start + perPage, filteredReports.length)} of {filteredReports.length} entries
          </div>
          <div className="page-buttons flex gap-1.5 flex-wrap">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]">
              <FiChevronLeft className="mx-auto" />
            </button>
            {[...Array(Math.min(totalPages, 10))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button key={i} onClick={() => handlePageChange(pageNum)} className={`w-9 h-9 rounded-lg border text-sm transition-all ${currentPage === pageNum ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]">
              <FiChevronRight className="mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--surface)] rounded-2xl max-w-2xl w-full shadow-soft-lg border border-[var(--border)] flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--border)] bg-[var(--surface)] rounded-t-2xl">
              <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm"><FiEye /></span>
                Task Report Details
              </h3>
              <button onClick={() => setViewModalOpen(false)} className="text-[var(--muted)] hover:text-red-500 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface2)]">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">DATE</label><span className="text-sm font-bold text-[var(--text)]">{formatDate(selectedReport.date)}</span></div>
                <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">SUBMITTED AT</label><span className="text-sm font-bold text-[var(--text)]">{formatDateTime(selectedReport.created_at)}</span></div>
              </div>
              <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">TASKS COMPLETED</label><div className="px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl"><p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{selectedReport.tasks_completed || "-"}</p></div></div>
              <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">PENDING WORKS</label><div className="px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl"><p className="text-sm text-amber-600 dark:text-amber-400 whitespace-pre-wrap leading-relaxed">{selectedReport.pending_tasks || "-"}</p></div></div>
              <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">PLAN FOR TOMORROW</label><div className="px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl"><p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{selectedReport.plan_tomorrow || "-"}</p></div></div>
              <div><label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"><FiClock className="text-[var(--muted)]" />ADMIN REMARKS</label><div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"><p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{selectedReport.remarks || "No remarks added by admin"}</p></div></div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-2xl">
              <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 rounded-full font-semibold bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors text-sm shadow-sm">Close</button>
              <button onClick={() => { setViewModalOpen(false); handleEdit(selectedReport); }} className="px-5 py-2 rounded-full font-semibold bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm"><FiEdit2 />Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--surface)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[var(--border)]">
            <div className="sticky top-0 bg-[var(--surface)] px-6 py-4 flex justify-between items-center border-b border-[var(--border)] rounded-t-2xl">
              <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2.5"><span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm"><FiEdit2 /></span>Edit Task Report</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-[var(--muted)] hover:text-red-500 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface2)]">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-[var(--text)] mb-1 block">Date</label><div className="px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)]">{formatDate(selectedReport.date)}</div></div>
                <div><label className="text-xs font-semibold text-[var(--text)] mb-1 block">Submitted At</label><div className="px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)]">{formatDateTime(selectedReport.created_at)}</div></div>
              </div>
              <div><label className="text-xs font-semibold text-[var(--text)] mb-2 block">Tasks Completed <span className="text-red-500">*</span></label><textarea value={editFormData.tasks_completed} onChange={(e) => setEditFormData({ ...editFormData, tasks_completed: e.target.value })} rows="3" placeholder="List the tasks completed..." className="w-full px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical" /></div>
              <div><label className="text-xs font-semibold text-[var(--text)] mb-2 block">Pending Works</label><textarea value={editFormData.pending_tasks} onChange={(e) => setEditFormData({ ...editFormData, pending_tasks: e.target.value })} rows="2" placeholder="List any pending works..." className="w-full px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical" /></div>
              <div><label className="text-xs font-semibold text-[var(--text)] mb-2 block">Plan for Tomorrow</label><textarea value={editFormData.plan_tomorrow} onChange={(e) => setEditFormData({ ...editFormData, plan_tomorrow: e.target.value })} rows="2" placeholder="What are your plans for tomorrow? (Optional)" className="w-full px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical" /></div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"><p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2"><FiClock />Remarks can only be added by admin. You cannot edit remarks.</p></div>
            </div>
            <div className="sticky bottom-0 bg-[var(--surface)] px-6 py-4 flex justify-end gap-3 border-t border-[var(--border)] rounded-b-2xl">
              <button onClick={() => setEditModalOpen(false)} className="px-5 py-2 rounded-full font-semibold bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors text-sm shadow-sm">Cancel</button>
              <button onClick={handleEditSubmit} disabled={isSubmitting || !editFormData.tasks_completed.trim()} className="px-5 py-2 rounded-full font-semibold bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : <><FiSave /> Save Changes</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--surface)] rounded-2xl max-w-md w-full shadow-soft-lg border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)]"><h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2"><FiTrash2 className="text-red-500" />Delete Task Report</h3></div>
            <div className="p-6"><p className="text-sm text-[var(--text)] mb-2">Are you sure you want to delete this task report?</p><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3"><p className="text-xs text-red-600 dark:text-red-400"><strong>Date:</strong> {formatDate(selectedReport.date)}</p><p className="text-xs text-red-600 dark:text-red-400 mt-1"><strong>Tasks:</strong> {selectedReport.tasks_completed?.substring(0, 50)}...</p></div><p className="text-xs text-[var(--muted)] mt-3">This action cannot be undone.</p></div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-2xl">
              <button onClick={() => setDeleteConfirmOpen(false)} className="px-5 py-2 rounded-full font-semibold bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors text-sm">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="px-5 py-2 rounded-full font-semibold bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-all text-sm disabled:opacity-50">{isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deleting...</> : <><FiTrash2 /> Delete</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};