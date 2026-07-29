import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../common/Paginations";
import {
  fetchLeavesReport,
  exportLeavesReport,
  clearLeavesError,
  selectLeaveRecords,
  selectLeavesLoading,
  selectLeavesError,
  selectLeavesPagination,
} from "../../store/slices/reportSlice";
import ExportModal from "../../../components/common/ExportModal";
import { formatDate } from "../../../utils/reportUtils";

const LeaveRequestReports = () => {
  const dispatch = useDispatch();

  // Use selectors from reportSlice
  const leaves = useSelector(selectLeaveRecords);
  const loading = useSelector(selectLeavesLoading);
  const error = useSelector(selectLeavesError);
  const pagination = useSelector(selectLeavesPagination);
  const exportLoading = useSelector((state) => state.reports.exportLoading);

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [dateRange, setDateRange] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper function to get full employee name
  const getEmployeeFullName = (leave) => {
    if (leave.employee) {
      const firstName = leave.employee.first_name || "";
      const lastName = leave.employee.last_name || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    if (leave.employee_name) return leave.employee_name;
    if (leave.employee?.name) return leave.employee.name;
    if (leave.employee?.first_name) return leave.employee.first_name;
    return "-";
  };

  // Helper function to get reason with fallback
  const getReason = (leave) => {
    return leave.reason || leave.remarks || leave.admin_remark || "-";
  };

  // Fetch leaves report with filters
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: perPage,
      date_range: dateRange,
    };

    // Add custom date range params if selected
    if (dateRange === "custom") {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }

    // Add optional filters
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    if (selectedLeaveType !== "all") {
      params.leave_type = selectedLeaveType;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    dispatch(fetchLeavesReport(params));
  }, [
    dispatch,
    currentPage,
    perPage,
    dateRange,
    startDate,
    endDate,
    selectedStatus,
    selectedLeaveType,
    searchTerm,
  ]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearLeavesError());
    }
  }, [error, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedStatus,
    selectedLeaveType,
    dateRange,
    startDate,
    endDate,
    perPage,
  ]);

  // Get unique leave types for filter
  const leavesArray = Array.isArray(leaves) ? leaves : [];
  const uniqueLeaveTypes = [
    ...new Set(
      leavesArray
        .map(
          (leave) => leave.leave_type?.name || leave.type || leave.leave_type,
        )
        .filter(Boolean),
    ),
  ];

  // Client-side filtering for display only
  const getFilteredLeaves = () => {
    let filtered = [...leavesArray];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (leave) =>
          (leave.status || "").toLowerCase() === selectedStatus.toLowerCase(),
      );
    }

    if (selectedLeaveType !== "all") {
      filtered = filtered.filter((leave) => {
        const type = leave.leave_type?.name || leave.type || leave.leave_type;
        return type === selectedLeaveType;
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((leave) => {
        const fullName = getEmployeeFullName(leave).toLowerCase();
        const leaveType = (
          leave.leave_type?.name ||
          leave.type ||
          leave.leave_type ||
          ""
        ).toLowerCase();
        const status = (leave.status || "").toLowerCase();
        const reason = getReason(leave).toLowerCase();

        return (
          fullName.includes(searchLower) ||
          leaveType.includes(searchLower) ||
          status.includes(searchLower) ||
          reason.includes(searchLower)
        );
      });
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();
  const totalRecords = pagination?.total || 0;
  const totalPages = pagination?.lastPage || 1;
  const pageLeaves = leavesArray;

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setSelectedLeaveType("all");
    setDateRange("this_month");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setCurrentPage(1);
    showToast("Filters reset successfully", "success");
  };

  // Updated handleExport using the exportLeavesReport thunk
  const handleExport = async (format) => {
    // Build export parameters as query params
    const params = {
      format: format,
      date_range: dateRange,
    };

    // Add custom date range params if selected
    if (dateRange === "custom") {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }

    // Add optional filters
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    if (selectedLeaveType !== "all") {
      params.leave_type = selectedLeaveType;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    // Dispatch the export thunk
    const result = await dispatch(exportLeavesReport(params));
    
    if (exportLeavesReport.fulfilled.match(result)) {
      const { url, filename } = result.payload;
      
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL after download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showToast(`Leave requests exported successfully!`, "success");
    } else {
      showToast(result.payload || "Failed to export report", "error");
    }
  };

  const getStatusBadge = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    switch (lowerStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <i className="fas fa-check-circle text-green-500 text-[10px]"></i>
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <i className="fas fa-clock text-amber-500 text-[10px]"></i>
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <i className="fas fa-times-circle text-red-500 text-[10px]"></i>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            {status || "-"}
          </span>
        );
    }
  };

  // Calculate stats
  const total = leavesArray.length;
  const pending = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "pending",
  ).length;
  const approved = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "approved",
  ).length;
  const rejected = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "rejected",
  ).length;

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header with Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
            <Link
              to="/admin/reports"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Reports
            </Link>
            <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
            <span className="text-gray-500">Leave Request Report</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
            Employee Leave Request Report
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage all employee leave requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalRecords || total}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-alt text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {pending}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-amber-600 dark:text-amber-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {approved}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 dark:text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {rejected}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-times-circle text-red-600 dark:text-red-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-circle mr-1"></i> Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-calendar-alt mr-1"></i> Request Date
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Leave Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-briefcase mr-1"></i> Leave Type
              </label>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Types</option>
                {uniqueLeaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <i className="fas fa-undo-alt"></i> Reset
              </button>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}
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
              placeholder="Search by employee name, leave type, status or reason..."
            />
            <button
              onClick={() => setShowExportModal(true)}
              disabled={exportLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i> Export Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && leavesArray.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400">
              Loading leave requests...
            </p>
          </div>
        ) : (
          <>
            {/* Leave Requests Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
              <div className="min-w-[1000px] md:min-w-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        S.No
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        REQUEST DATE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        EMPLOYEE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        LEAVE TYPE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        FROM
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        TO
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        DAYS
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        REASON
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageLeaves.length > 0 ? (
                      pageLeaves.map((leave, idx) => {
                        const serialNumber =
                          (pagination?.currentPage - 1) *
                            (pagination?.perPage || 10) +
                          idx +
                          1;
                        return (
                          <tr
                            key={leave.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {serialNumber}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(
                                leave.created_at ||
                                  leave.request_date ||
                                  leave.date,
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {getEmployeeFullName(leave)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {leave.leave_type?.name ||
                                leave.type ||
                                leave.leave_type ||
                                "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(
                                leave.from_date ||
                                  leave.fromDate ||
                                  leave.start_date,
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(
                                leave.to_date || leave.toDate || leave.end_date,
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {leave.number_of_days ||
                                leave.days ||
                                leave.duration_days ||
                                "-"}
                            </td>
                            <td
                              className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate"
                              title={getReason(leave)}
                            >
                              {getReason(leave)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              {getStatusBadge(leave.status)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <i className="fas fa-calendar-times text-4xl text-gray-300 dark:text-gray-600"></i>
                            <p>No leave requests found</p>
                            <p className="text-xs">
                              Try changing the filters or search term
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
            {totalRecords > 0 && (
              <Pagination
                currentPage={pagination?.currentPage || 1}
                totalPages={pagination?.lastPage || 1}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                totalItems={pagination?.total || 0}
                itemsPerPage={pagination?.perPage || 10}
              />
            )}
          </>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          if (!exportLoading) {
            setShowExportModal(false);
          }
        }}
        onExport={handleExport}
        title="Export Leave Requests"
        totalRecords={pagination?.total || leavesArray.length}
        formats={["csv", "pdf"]}
        defaultFormat="csv"
        loading={exportLoading}
        subtitle={`Exporting all ${pagination?.total || leavesArray.length} records matching current filters`}
      />
    </div>
  );
};

export default LeaveRequestReports;