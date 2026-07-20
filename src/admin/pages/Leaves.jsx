import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import LeaveModal from "@admin/components/leaves/LeaveModal";
import { showToast } from "../../components/common/Toast";
import {
  fetchLeaves,
  fetchLeaveById,
  updateLeaveStatus,
  clearError,
} from "@admin/store/slices/LeaveSlice";
import Pagination from "@admin/components/common/Paginations";
import ConfirmModal from "@admin/components/common/ConfirmModal";

const Leaves = () => {
  const dispatch = useDispatch();
  const { leaves = [], error = null, currentLeave = null } = useSelector((state) => {
    return state.leaves || { leaves: [], currentLeave: null };
  });
  console.log(leaves);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Confirm modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Get base URL from environment
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

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

  // Get full document URL
  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    
    // If it's already a full URL
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
      return documentPath;
    }
    
    // If it starts with storage/ or /storage/
    if (documentPath.startsWith('storage/')) {
      return `${baseUrl}/${documentPath}`;
    }
    if (documentPath.startsWith('/storage/')) {
      return `${baseUrl}${documentPath}`;
    }
    
    // If it's a path like "leaves/documents/filename.pdf"
    return `${baseUrl}/storage/${documentPath}`;
  };

  // Helper to get employee name from different possible structures
  const getEmployeeName = (leave) => {
    if (leave.employee_name) return leave.employee_name;
    if (leave.employee?.name) return leave.employee.name;
    if (leave.employee?.first_name && leave.employee?.last_name) {
      return `${leave.employee.first_name} ${leave.employee.last_name}`;
    }
    if (leave.employee?.first_name) return leave.employee.first_name;
    return "-";
  };

  const getFilteredLeaves = () => {
    const leavesArray = Array.isArray(leaves) ? leaves : [];
    let filtered = leavesArray;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (leave) =>
          (leave.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (leave) =>
          (leave.employee?.first_name || "")
            .toLowerCase()
            .includes(searchLower) ||
          (leave.employee?.name || "")
            .toLowerCase()
            .includes(searchLower) ||
          (leave.leave_type?.name || leave.type || "")
            .toLowerCase()
            .includes(searchLower) ||
          (leave.reason || "").toLowerCase().includes(searchLower),
      );
    }
    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();
  const totalFiltered = filteredLeaves.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageLeaves = filteredLeaves.slice(start, start + perPage);

  const handleApproveClick = (id) => {
    setSelectedLeaveId(id);
    setActionType("approve");
    setConfirmOpen(true);
  };

  const handleRejectClick = (id) => {
    setSelectedLeaveId(id);
    setActionType("reject");
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedLeaveId) return;

    setActionLoading(true);

    const result = await dispatch(
      updateLeaveStatus({
        id: selectedLeaveId,
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
      setSelectedLeaveId(null);
      setRejectionReason("");
      setActionType(null);
      dispatch(fetchLeaves());
    } else {
      showToast(
        result.payload || `Failed to ${actionType} leave request`,
        "error",
      );
    }

    setActionLoading(false);
  };

  const handleView = async (leave) => {
    setLoading(true);
    try {
      // Fetch the full leave details by ID using the thunk
      const result = await dispatch(fetchLeaveById(leave.id));
      
      if (fetchLeaveById.fulfilled.match(result)) {
        setSelectedLeave(result.payload);
        setShowModal(true);
      } else {
        showToast(result.payload || "Failed to load leave details", "error");
      }
    } catch (error) {
      showToast("Failed to load leave details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (docUrl) => {
    if (!docUrl) {
      showToast("No document available", "info");
      return;
    }
    
    const fullUrl = getDocumentUrl(docUrl);
    console.log("Opening document:", fullUrl);
    window.open(fullUrl, "_blank");
  };

  // Calculate stats
  const leavesArray = Array.isArray(leaves) ? leaves : [];
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

  const getStatusClass = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    switch (lowerStatus) {
      case "pending":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "approved":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  // Format date - handles YYYY-MM-DD format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // If it's in YYYY-MM-DD format
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch (error) {
      return dateString || "-";
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-calendar-alt text-green-600 dark:text-green-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
            {total}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Total Requests
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 dark:text-amber-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pending}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Pending
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
            {approved}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Approved
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 dark:text-red-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
            {rejected}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Rejected
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
          Leave Requests
        </h2>
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto pb-2 mb-4 md:mb-5 -mx-4 px-4">
        <div className="flex gap-2 min-w-max border-b border-gray-200 dark:border-gray-700 pb-3">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap capitalize ${
                statusFilter === status
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {status === "all" ? "All Requests" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={setPerPage} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by employee..."
          />
          <Link
            to="/admin/leaves/allocations"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <i className="fas fa-chart-line"></i>
            <span className="hidden sm:inline">Manage Leave Allocations</span>
            <span className="sm:hidden">Allocations</span>
          </Link>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[1000px] lg:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Sl.No.
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Employee
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  From
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  To
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Days
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Claim Salary
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Doc
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Reason
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Processed By
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Action
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
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {getEmployeeName(leave)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {leave.leave_type?.name || leave.type || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(leave.start_date || leave.from_date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(leave.end_date || leave.to_date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                      {leave.duration_days || leave.number_of_days || leave.days || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span
                        className={`inline-block px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-xs font-semibold whitespace-nowrap ${
                          leave.claim_salary === 1 ||
                          leave.claim_salary === "1" ||
                          leave.claimSalary === "Yes"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {leave.claim_salary === 1 || leave.claim_salary === "1" || leave.claimSalary === "Yes"
                          ? "Yes"
                          : "No"}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {leave.document_path || leave.document || leave.doc ? (
                        <button
                          onClick={() =>
                            handleViewDocument(leave.document_path || leave.document || leave.doc)
                          }
                          className="text-blue-500 hover:text-blue-600 text-xs md:text-sm flex items-center gap-1"
                        >
                          <i className="fas fa-file-pdf text-xs md:text-sm"></i>
                          <span className="hidden sm:inline">View</span>
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td
                      className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[120px] md:max-w-[150px] truncate"
                      title={leave.reason}
                    >
                      {leave.reason || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span
                        className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-semibold whitespace-nowrap capitalize ${getStatusClass(leave.status)}`}
                      >
                        {leave.status || "pending"}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {leave.processed_by || leave.processedBy || leave.approver?.username || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleView(leave)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                          title="View Details"
                          disabled={loading}
                        >
                          <i className={`fas fa-eye text-xs md:text-sm ${loading ? 'fa-spin' : ''}`}></i>
                        </button>
                        {(leave.status === "pending" ||
                          leave.status === "Pending") && (
                          <>
                            <button
                              onClick={() => handleApproveClick(leave.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500 transition-colors"
                              title="Approve"
                            >
                              <i className="fas fa-check-circle text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleRejectClick(leave.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                              title="Reject"
                            >
                              <i className="fas fa-times-circle text-xs md:text-sm"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No leave requests found
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

      {/* Leave Details Modal */}
      <LeaveModal
        isOpen={showModal}
        leave={selectedLeave}
        onClose={() => {
          setShowModal(false);
          setSelectedLeave(null);
        }}
        onViewDocument={handleViewDocument}
      />

      {/* Confirm Modal for Approve/Reject */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedLeaveId(null);
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
            ? "Are you sure you want to approve this leave request?"
            : "Are you sure you want to reject this leave request?"
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        loading={actionLoading}
        variant={
          actionType === "approve"
          ? "success"
          : "danger"
        }
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

export default Leaves;