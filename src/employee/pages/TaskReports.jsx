import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  setTaskReportsPagination,
  setTaskReportsSearch,
} from "../store/slices/taskReportsSlice";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
} from "react-icons/fi";

const TaskReports = () => {
  const dispatch = useAppDispatch();
  const { taskReports, pagination, search } = useAppSelector(
    (state) => state.taskReports,
  );
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    let filtered = [...taskReports];

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.tasksCompleted.toLowerCase().includes(search.toLowerCase()) ||
          r.planTomorrow.toLowerCase().includes(search.toLowerCase()) ||
          r.remarks.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredReports(filtered);
  }, [taskReports, search]);

  const totalPages = Math.ceil(filteredReports.length / pagination.perPage);
  const start = (pagination.currentPage - 1) * pagination.perPage;
  const currentReports = filteredReports.slice(
    start,
    start + pagination.perPage,
  );

  const stats = {
    total: taskReports.length,
    thisWeek: taskReports.filter((r) => {
      const reportDate = new Date(r.date);
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return reportDate >= weekAgo;
    }).length,
  };

  const handleSearch = (e) => {
    dispatch(setTaskReportsSearch(e.target.value));
  };

  const handlePageChange = (page) => {
    dispatch(
      setTaskReportsPagination({
        currentPage: page,
        perPage: pagination.perPage,
      }),
    );
  };

  const handleEntriesChange = (e) => {
    dispatch(
      setTaskReportsPagination({
        currentPage: 1,
        perPage: parseInt(e.target.value),
      }),
    );
  };

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-2 gap-5 mb-7">
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="stat-icon w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl mx-auto mb-3">
            <FiClipboard />
          </div>
          <div className="stat-number text-3xl font-extrabold text-green-600">
            {stats.total}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Total Reports
          </div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="stat-icon w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl mx-auto mb-3">
            <FiClipboard />
          </div>
          <div className="stat-number text-3xl font-extrabold text-blue-500">
            {stats.thisWeek}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Reports (Last 7 Days)
          </div>
        </div>
      </div>

      <div className="task-reports-header flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-7">
        <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-[var(--text)] to-green-600 bg-clip-text text-transparent">
          Task Reports
        </h2>
      </div>

      {/* Action Bar */}
      <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-xs text-[var(--text-secondary)]">
          <span>Show entries</span>
          <select
            value={pagination.perPage}
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
              onChange={handleSearch}
              placeholder="Search records..."
              className="border-none outline-none bg-transparent text-xs text-[var(--text)] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="task-reports-table-wrapper bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
        <table className="task-reports-table w-full border-collapse text-xs min-w-[900px]">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] bg-[var(--surface2)] border-b border-[var(--border)]">
                #
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] bg-[var(--surface2)] border-b border-[var(--border)]">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] bg-[var(--surface2)] border-b border-[var(--border)]">
                Tasks Completed
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] bg-[var(--surface2)] border-b border-[var(--border)]">
                Plan for Tomorrow
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] bg-[var(--surface2)] border-b border-[var(--border)]">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-[var(--muted)]"
                >
                  No task reports found.
                </td>
              </tr>
            ) : (
              currentReports.map((report, idx) => (
                <tr
                  key={report.id}
                  className="hover:bg-[var(--surface2)] transition-colors"
                >
                  <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)]">
                    {start + idx + 1}
                  </td>
                  <td className="py-3.5 px-4 border-b border-[var(--border)] font-medium text-[var(--text)]">
                    {report.date}
                  </td>
                  <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)] max-w-[300px] break-words">
                    {report.tasksCompleted}
                  </td>
                  <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)] max-w-[300px] break-words">
                    {report.planTomorrow}
                  </td>
                  <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)] max-w-[200px] break-words">
                    {report.remarks}
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
            {Math.min(start + pagination.perPage, filteredReports.length)} of{" "}
            {filteredReports.length} entries
          </div>
          <div className="page-buttons flex gap-1.5 flex-wrap">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
            >
              <FiChevronLeft className="mx-auto" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-9 h-9 rounded-lg border text-xs transition-all ${
                  pagination.currentPage === i + 1
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
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

export default TaskReports;
