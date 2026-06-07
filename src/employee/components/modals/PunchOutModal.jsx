import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiX,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  fetchTaskReports,
  setTaskReportsPagination,
  setTaskReportsSearch,
  clearTaskReportsError,
} from "../../store/slices/taskReportsSlice";
import { showToast } from "../common/Toast";

// Punch Out Modal Component
const PunchOutModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [pendingWorks, setPendingWorks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only validate tasks completed
    if (!tasksCompleted.trim()) {
      showToast("Please fill in Tasks Completed Today", "error");
      return;
    }
    
    console.group("🔍 PUNCH OUT MODAL DEBUG");
    console.log("📤 Submitting with data:", {
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null
    });
    console.groupEnd();
    
    onSubmit({
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null,
    });
    
    // Clear form after submit
    setTasksCompleted("");
    setPlanTomorrow("");
    setPendingWorks("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] rounded-xl w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--text)]">Punch Out</h3>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Tasks Completed Today <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="What tasks did you complete today?"
              rows="4"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Pending Works <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={pendingWorks}
              onChange={(e) => setPendingWorks(e.target.value)}
              placeholder="What tasks are still pending? (Optional)"
              rows="3"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              List any incomplete tasks that need to be carried forward
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Plan for Tomorrow <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              placeholder="What are your plans for tomorrow? (Optional)"
              rows="4"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] font-semibold hover:bg-[var(--surface3)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !tasksCompleted.trim()}
              className="flex-1 py-2.5 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Confirm Punch Out
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Reports List Component
const TaskReportsList = () => {
  const dispatch = useDispatch();
  const taskReportsState = useSelector((state) => state.EmpTaskReports) || {};
  const {
    taskReports = [],
    loading = false,
    pagination = { currentPage: 1, perPage: 10 },
    search = "",
    error = null,
  } = taskReportsState;

  const refreshTaskReports = () => {
    console.log("🔄 Manually refreshing task reports...");
    dispatch(fetchTaskReports());
  };

  useEffect(() => {
    refreshTaskReports();
  }, [dispatch]);

  // Fetch task reports on component mount
  useEffect(() => {
    dispatch(fetchTaskReports());
  }, [dispatch]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("📱 Tab became visible, refreshing task reports...");
        refreshTaskReports();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearTaskReportsError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const fetchReports = async () => {
      console.group("🔍 TASK REPORTS DEBUG");
      console.log("📤 Request URL: GET /employee/task-reports");
      console.log("📤 Request Params:", {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        search: search
      });
      
      try {
        const result = await dispatch(fetchTaskReports());
        console.log("📥 Response:", result);
        if (result.payload) {
          console.log("📥 Response Data:", result.payload);
          if (result.payload.data) {
            console.log("📥 Reports Count:", result.payload.data.length);
            console.log("📥 First Report:", result.payload.data[0]);
          }
          if (result.payload.pagination) {
            console.log("📥 Pagination:", result.payload.pagination);
          }
        }
        if (result.error) {
          console.log("❌ Error:", result.error);
        }
      } catch (error) {
        console.log("❌ Exception:", error);
      }
      console.groupEnd();
    };
    
    fetchReports();
  }, [dispatch, pagination.currentPage, pagination.perPage, search]);

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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(
        setTaskReportsPagination({ currentPage: page, perPage: perPage }),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setTaskReportsSearch(e.target.value));
  };

  const handleEntriesChange = (e) => {
    dispatch(
      setTaskReportsPagination({
        currentPage: 1,
        perPage: parseInt(e.target.value),
      }),
    );
  };

  // Debug log
  useEffect(() => {
    console.log("TaskReportsList State:", {
      taskReports,
      loading,
      pagination,
      search,
    });
  }, [taskReports, loading, pagination, search]);

  if (loading && taskReports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading task reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-reports-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-7">
        <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-[var(--text)] to-green-600 bg-clip-text text-transparent">
          My Task Reports
        </h2>
      </div>

      {/* Action Bar */}
      <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-xs text-[var(--text-secondary)]">
          <span>Show entries</span>
          <select
            value={perPage}
            onChange={handleEntriesChange}
            className="border-none outline-none bg-transparent font-semibold text-[var(--text)] cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="search-wrapper flex items-center gap-3 flex-wrap">
          <div className="search-box flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-2">
            <FiSearch className="text-[var(--muted)] text-xs" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search reports..."
              className="border-none outline-none bg-transparent text-xs text-[var(--text)] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Task Reports Table */}
      <div className="task-reports-table-wrapper bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
        <table className="task-reports-table w-full border-collapse text-xs min-w-[800px]">
          <thead>
            <tr className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                #
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                Tasks Completed
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                Pending Works
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                Plan for Tomorrow
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[var(--muted)]">
                  <div className="flex flex-col items-center gap-2">
                    <FiClock className="text-4xl text-[var(--muted)]" />
                    <p>No task reports found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentReports.map((report, idx) => (
                <tr
                  key={report.id}
                  className="hover:bg-[var(--surface2)] transition-colors border-b border-[var(--border)]"
                >
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    {start + idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-[var(--muted)] text-xs" />
                      <span className="text-[var(--text)] text-xs whitespace-nowrap">
                        {formatDate(report.date)}
                      </span>
                    </div>
                  </td>
                  <td
                    className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[250px] truncate"
                    title={report.tasks_completed}
                  >
                    {report.tasks_completed || "-"}
                  </td>
                  <td
                    className="py-3.5 px-4 text-amber-600 dark:text-amber-400 max-w-[250px] truncate"
                    title={report.pending_tasks}
                  >
                    {report.pending_tasks ? (
                      <div className="flex items-center gap-1">
                        <FiClock className="text-xs" />
                        {report.pending_tasks}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[250px] truncate"
                    title={report.plan_tomorrow}
                  >
                    {report.plan_tomorrow || "-"}
                  </td>
                  <td
                    className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[150px] truncate"
                    title={report.remarks}
                  >
                    {report.remarks || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredReports.length > 0 && (
        <div className="pagination-container flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
          <div className="text-xs text-[var(--muted)]">
            Showing {start + 1} to{" "}
            {Math.min(start + perPage, filteredReports.length)} of{" "}
            {filteredReports.length} entries
          </div>
          <div className="page-buttons flex gap-1.5 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
            >
              <FiChevronLeft className="mx-auto" />
            </button>
            {[...Array(Math.min(totalPages, 10))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg border text-xs transition-all ${
                    currentPage === pageNum
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
            >
              <FiChevronRight className="mx-auto" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { PunchOutModal, TaskReportsList };
export default PunchOutModal;