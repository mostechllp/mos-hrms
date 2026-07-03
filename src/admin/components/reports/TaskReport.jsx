/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../common/Paginations";
import ExportModal from "../../../components/common/ExportModal";
import { 
  fetchTaskReports,
  exportTaskReports 
} from "../../store/slices/reportSlice";

const TaskReports = () => {
  const dispatch = useDispatch();
  const {
    taskReports: records = [],
    taskReportsLoading: loading = false,
    taskReportsTotalCount: totalCount = 0,
    taskReportsLastPage: lastPage = 1,
  } = useSelector((state) => state.reports || {});

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [datePreset, setDatePreset] = useState("custom");
  const [expandedRow, setExpandedRow] = useState(null);

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Get unique employees for filters
  const uniqueEmployees = [
    ...new Set(
      records
        .map((record) => ({
          id: record.employeeId || record.employee_id || record.id,
          name: record.employee || record.employee_name,
        }))
        .filter((emp) => emp.id && emp.name)
    ),
  ];

  // Fetch task reports data with filters
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchTaskReports({
          page: currentPage,
          per_page: perPage,
          employee_id: employeeFilter !== "all" ? employeeFilter : undefined,
          search: searchTerm || undefined,
          date_range: datePreset,
          from_date: datePreset === "custom" ? startDate : undefined,
          to_date: datePreset === "custom" ? endDate : undefined,
        }),
      );
    };
    fetchData();
  }, [
    dispatch,
    currentPage,
    perPage,
    employeeFilter,
    searchTerm,
    datePreset,
    startDate,
    endDate,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [employeeFilter, searchTerm, perPage, datePreset, startDate, endDate]);

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);

    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        start = yesterday;
        end = yesterday;
        break;
      case "this_week":
        const weekStart = new Date(today);
        const day = today.getDay() || 7;
        weekStart.setDate(today.getDate() - day + 1);
        start = weekStart;
        end = today;
        break;
      case "this_month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        start = monthStart;
        end = today;
        break;
      case "custom":
      default:
        return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    showToast("Filters applied successfully", "success");
  };

  const handleResetFilters = () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setDatePreset("custom");
    setEmployeeFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
    showToast("Filters reset successfully", "success");
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleExport = async (format) => {
    try {
      // Map format for API
      const apiFormat = format === 'xlsx' ? 'excel' : format;
      
      // Build export params
      const params = {
        format: apiFormat,
        date_range: datePreset,
      };

      // Add from_date and to_date only for custom range
      if (datePreset === "custom") {
        params.from_date = startDate;
        params.to_date = endDate;
      }

      // Add optional filters
      if (employeeFilter !== "all") {
        params.employee_id = employeeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Call the export API
      const result = await dispatch(exportTaskReports(params)).unwrap();

      // Handle file download
      const link = document.createElement("a");
      link.href = result.url || result;
      
      // Set appropriate file extension
      const ext = format === 'xlsx' ? 'xlsx' : format;
      link.download = `task_report_${datePreset}_${format}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const formatLabel = format === 'xlsx' ? 'Excel' : format.toUpperCase();
      showToast(`Task report exported successfully as ${formatLabel}`, "success");
      setShowExportModal(false);
    } catch (error) {
      showToast("Failed to export report: " + (error.message || "Unknown error"), "error");
    }
  };

  // Calculate stats for summary
  const allRecords = records || [];
  const totalFiltered = totalCount || allRecords.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;

  // Calculate statistics
  const totalEmployees = [...new Set(allRecords.map(r => r.employee || r.employee_name))].length;
  const today = new Date().toISOString().split("T")[0];
  const todayReports = allRecords.filter(r => r.report_date === today || r.date === today).length;
  const withRemarks = allRecords.filter(r => r.remarks && r.remarks.trim()).length;

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header with Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
            <Link
              to="/admin/reports"
              className="text-indigo-500 hover:text-indigo-600 font-medium"
            >
              Reports
            </Link>
            <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
            <span className="text-gray-500">Task Report</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent">
            Task Report
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed task reports with employee tasks, plans, and remarks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {totalFiltered}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Employees
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalEmployees}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-green-600 dark:text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Today's Reports
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {todayReports}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-day text-emerald-600 dark:text-emerald-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  With Remarks
                </p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {withRemarks}
                </p>
              </div>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-comment text-teal-600 dark:text-teal-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-clock mr-1"></i> DATE RANGE
              </label>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="custom">Custom Range</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-calendar-alt mr-1"></i> START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={datePreset !== "custom"}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-calendar-alt mr-1"></i> END DATE
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={datePreset !== "custom"}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all"
              >
                <i className="fas fa-filter"></i> Apply
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <i className="fas fa-undo-alt"></i> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Additional Filters - Employee */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
          <select
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 min-w-[150px]"
          >
            <option value="all">All Employees</option>
            {uniqueEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
          <EntriesSelector
            value={perPage}
            onChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SearchBar
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by employee name..."
            />
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <i className="fas fa-download"></i> Export Report
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && records.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-indigo-500 mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400">
              Loading task reports...
            </p>
          </div>
        ) : (
          <>
            {/* Task Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
              <div className="min-w-[900px] md:min-w-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 w-12">
                        S.No
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        DATE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        EMPLOYEE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        TASKS COMPLETED
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        PENDING TASKS
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        PLAN FOR TOMORROW
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        REMARKS
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 w-16">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((record, idx) => {
                        const hasRemarks = record.remarks && record.remarks.trim();
                        const isExpanded = expandedRow === record.id;
                        
                        return (
                          <>
                            <tr
                              key={record.id || idx}
                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                                {start + idx + 1}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {record.report_date || record.date || "-"}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {record.employee || record.employee_name || "-"}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                {record.tasksCompleted || record.tasks_completed || "-"}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                                {record.pendingTasks || record.pending_tasks ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    {record.pendingTasks || record.pending_tasks}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                {record.planForTomorrow || record.plan_for_tomorrow || "-"}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                                {hasRemarks ? (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                    <i className="fas fa-comment text-gray-400 dark:text-gray-500 text-xs"></i>
                                    <span className="truncate max-w-[120px]">
                                      {record.remarks}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">None</span>
                                )}
                              </td>
                              <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                                <button
                                  onClick={() => toggleExpand(record.id)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-500 transition-colors"
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs md:text-sm`}></i>
                                </button>
                              </td>
                            </tr>
                            {/* Expanded Row */}
                            {isExpanded && (
                              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <td colSpan="8" className="px-4 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        <i className="fas fa-tasks mr-2"></i>Tasks Completed
                                      </h4>
                                      <div className="bg-white dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                          {record.tasksCompleted || record.tasks_completed || "No tasks completed"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        <i className="fas fa-clock mr-2"></i>Pending Tasks
                                      </h4>
                                      <div className="bg-white dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                          {record.pendingTasks || record.pending_tasks || "No pending tasks"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        <i className="fas fa-calendar-day mr-2"></i>Plan for Tomorrow
                                      </h4>
                                      <div className="bg-white dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                          {record.planForTomorrow || record.plan_for_tomorrow || "No plan"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        <i className="fas fa-comment mr-2"></i>Remarks
                                      </h4>
                                      <div className="bg-white dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                          {record.remarks || "No remarks added"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <i className="fas fa-tasks text-4xl text-gray-300 dark:text-gray-600"></i>
                            <p>No task reports found</p>
                            <p className="text-xs">
                              Try changing the date range or filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
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
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title="Export Task Report"
        totalRecords={totalFiltered}
        formats={["csv", "pdf", "xlsx"]}
        defaultFormat="csv"
        subtitle={`Exporting ${totalFiltered} records with current filters`}
      />
    </div>
  );
};

export default TaskReports;