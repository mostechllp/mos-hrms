import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../common/Toast";
import Pagination from "../common/Paginations";
import ConfirmModal from "../common/ConfirmModal";
import {
  clearError,
  fetchLeaves,
  updateLeaveStatus,
} from "../../store/slices/LeaveSlice";

const PendingLeavesReport = () => {
  const dispatch = useDispatch();
  const {
    leaves = [],
    loading,
    error = null,
  } = useSelector((state) => state.leaves || { leaves: [] });

  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Action modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, selectedLeaveType, dateRange, startDate, endDate]);

  // Get unique leave types for filter
  const leavesArray = Array.isArray(leaves) ? leaves : [];
  const uniqueLeaveTypes = [
    ...new Set(
      leavesArray
        .filter((leave) => (leave.status || "").toLowerCase() === "pending")
        .map((leave) => leave.leave_type?.name || leave.type)
        .filter(Boolean),
    ),
  ];

  // Filter leaves (only pending)
  const getFilteredLeaves = () => {
    let filtered = leavesArray.filter(
      (leave) => (leave.status || "").toLowerCase() === "pending",
    );

    // Apply leave type filter
    if (selectedLeaveType !== "all") {
      filtered = filtered.filter(
        (leave) => (leave.leave_type?.name || leave.type) === selectedLeaveType,
      );
    }

    // Apply date range filter based on request date
    if (dateRange !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((leave) => {
        const requestDate = new Date(leave.created_at || leave.request_date);
        if (isNaN(requestDate.getTime())) return true;

        switch (dateRange) {
          case "today":
            return requestDate.toDateString() === today.toDateString();
          case "thisWeek": {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
            return requestDate >= startOfWeek && requestDate <= endOfWeek;
          }
          case "thisMonth": {
            const startOfMonth = new Date(
              today.getFullYear(),
              today.getMonth(),
              1,
            );
            const endOfMonth = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0,
            );
            return requestDate >= startOfMonth && requestDate <= endOfMonth;
          }
          case "custom":
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59);
              return requestDate >= start && requestDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (leave) =>
          (
            leave.employee_name ||
            leave.employee?.name ||
            leave.employee?.first_name ||
            ""
          )
            .toLowerCase()
            .includes(searchLower) ||
          (leave.leave_type?.name || leave.type || "")
            .toLowerCase()
            .includes(searchLower),
      );
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();
  const totalFiltered = filteredLeaves.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageLeaves = filteredLeaves.slice(start, start + perPage);

  const handleResetFilters = () => {
    setSelectedLeaveType("all");
    setDateRange("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setCurrentPage(1);
    showToast("Filters reset successfully", "success");
  };

  const handleApproveClick = (leave) => {
    setSelectedLeave(leave);
    setActionType("approve");
    setConfirmOpen(true);
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setActionType("reject");
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave) return;

    setActionLoading(true);

    const result = await dispatch(
      updateLeaveStatus({
        id: selectedLeave.id,
        status: actionType === "approve" ? "approved" : "rejected",
        processedBy: "HR Admin",
        rejection_reason: actionType === "reject" ? rejectionReason : null,
      }),
    );

    if (updateLeaveStatus.fulfilled.match(result)) {
      showToast(
        `Leave request ${actionType === "approve" ? "approved" : "rejected"} successfully`,
        "success",
      );
      setConfirmOpen(false);
      setSelectedLeave(null);
      setRejectionReason("");
      setActionType(null);
      // Refresh the list
      dispatch(fetchLeaves());
    } else {
      showToast(
        result.payload || `Failed to ${actionType} leave request`,
        "error",
      );
    }

    setActionLoading(false);
  };

  const handleExport = () => {
    try {
      const dataToExport = filteredLeaves;

      if (dataToExport.length === 0) {
        showToast("No data to export", "warning");
        return;
      }

      const headers = [
        "Request Date",
        "Employee",
        "Leave Type",
        "From",
        "To",
        "Days",
        "Status",
      ];

      const rows = dataToExport.map((leave) => [
        formatDate(leave.created_at || leave.request_date),
        leave.employee_name ||
          leave.employee?.name ||
          leave.employee?.first_name ||
          "-",
        leave.leave_type?.name || leave.type || "-",
        formatDate(leave.from_date || leave.fromDate),
        formatDate(leave.to_date || leave.toDate),
        leave.number_of_days || leave.days || "-",
        leave.status || "Pending",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `pending_leaves_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Pending leaves exported successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export data", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <i className="fas fa-clock text-amber-500 text-[10px]"></i>
        Pending
      </span>
    );
  };

  // Calculate stats
  const pendingCount = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "pending",
  ).length;
  const approvedCount = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "approved",
  ).length;
  const rejectedCount = leavesArray.filter(
    (l) => (l.status || "").toLowerCase() === "rejected",
  ).length;

  return (
    <div className="app flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div
        className={`flex-1 min-w-0 w-full overflow-x-hidden ${!isMobile ? "md:ml-[72px]" : ""}`}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
          {/* Page Header with Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
              <Link
                to="/reports"
                className="text-green-500 hover:text-green-600 font-medium"
              >
                Reports
              </Link>
              <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
              <span className="text-gray-500">
                Pending Leave Request Report
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
              Pending Leave Request Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage leave requests awaiting approval
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {pendingCount}
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
                    {approvedCount}
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
                    {rejectedCount}
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

              {/* Date Range Filter */}
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
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  <i className="fas fa-undo-alt"></i> Reset
                </button>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                placeholder="Search by employee or leave type..."
              />
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <i className="fas fa-download"></i> Export Report
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && filteredLeaves.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-amber-500 mb-3"></i>
              <p className="text-gray-500 dark:text-gray-400">
                Loading pending leaves...
              </p>
            </div>
          ) : (
            <>
              {/* Pending Leaves Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
                <div className="min-w-[800px] md:min-w-0">
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
                          STATUS
                        </th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageLeaves.length > 0 ? (
                        pageLeaves.map((leave, idx) => (
                          <tr
                            key={leave.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {start + idx + 1}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(
                                leave.created_at || leave.request_date,
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {leave.employee_name ||
                                leave.employee?.name ||
                                leave.employee?.first_name ||
                                "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {leave.leave_type?.name || leave.type || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(leave.from_date || leave.fromDate)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(leave.to_date || leave.toDate)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {leave.number_of_days || leave.days || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              {getStatusBadge()}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              <div className="flex gap-1 md:gap-2">
                                <button
                                  onClick={() => handleApproveClick(leave)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500 transition-colors"
                                  title="Approve"
                                >
                                  <i className="fas fa-check-circle text-xs md:text-sm"></i>
                                </button>
                                <button
                                  onClick={() => handleRejectClick(leave)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <i className="fas fa-times-circle text-xs md:text-sm"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <i className="fas fa-check-circle text-4xl text-gray-300 dark:text-gray-600"></i>
                              <p>No pending leave requests found</p>
                              <p className="text-xs">
                                All leave requests have been processed
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
      </div>

      {/* Confirm Modal for Approve/Reject */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedLeave(null);
          setRejectionReason("");
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          actionType === "approve"
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        message={
          actionType === "approve"
            ? `Are you sure you want to approve ${selectedLeave?.employee_name || selectedLeave?.employee?.name || "this"} leave request?`
            : `Are you sure you want to reject ${selectedLeave?.employee_name || selectedLeave?.employee?.name || "this"} leave request?`
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        confirmButtonClass={
          actionType === "approve"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        }
        loading={actionLoading}
      >
        {actionType === "reject" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              placeholder="Enter reason for rejection..."
            />
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default PendingLeavesReport;
