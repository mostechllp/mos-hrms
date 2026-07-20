import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  setLeaveFilter,
  setLeavePagination,
  fetchEmployeeLeaves,
  updateLeaveRequest,
  deleteLeaveRequest,
  fetchLeaveById,
} from "../store/slices/leavesSlice";
import {
  FiSearch,
  FiPlus,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiAlertCircle,
  FiDownload,
} from "react-icons/fi";
import StatusBadge from "../components/common/StatusBadge";
import DateInput from "../../admin/components/common/DateInput";

const Leaves = () => {
  const dispatch = useAppDispatch();
  const leavesState = useAppSelector((state) => state.EmpLeaves);

  // Add safety defaults
  const leaves = leavesState?.leaves || [];
  const filter = leavesState?.filter || { status: "all", search: "" };
  const pagination = leavesState?.pagination || { currentPage: 1, perPage: 10 };
  const loading = leavesState?.loading || false;
  const updating = leavesState?.updating || false;

  // State for edit modal
  const [editingLeave, setEditingLeave] = useState(null);
  const [editFormData, setEditFormData] = useState({
    start_date: "",
    end_date: "",
    reason: "",
    claim_salary: "0",
    start_session: "morning",
    end_session: "afternoon",
  });
  const [editError, setEditError] = useState("");
  const [editTotalDays, setEditTotalDays] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for delete confirmation
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get base URL from environment
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  // Get all leaves (no filtering by type)
  const allLeaves = useMemo(() => {
    return leaves;
  }, [leaves]);

  // Use useMemo for filtered leaves
  const filteredLeaves = useMemo(() => {
    let filtered = [...allLeaves];

    if (filter.status && filter.status !== "all") {
      filtered = filtered.filter((l) => {
        const leaveStatus =
          typeof l.status === "object"
            ? l.status?.name?.toLowerCase()
            : l.status?.toLowerCase();
        return leaveStatus === filter.status.toLowerCase();
      });
    }

    if (filter.search) {
      filtered = filtered.filter((l) => {
        const leaveType =
          typeof l.leave_type === "object" ? l.leave_type?.name : l.leave_type;
        const leaveStatus =
          typeof l.status === "object" ? l.status?.name : l.status;

        return (
          (leaveType?.toLowerCase() || "").includes(
            filter.search.toLowerCase(),
          ) ||
          (leaveStatus?.toLowerCase() || "").includes(
            filter.search.toLowerCase(),
          ) ||
          (l.reason?.toLowerCase() || "").includes(filter.search.toLowerCase())
        );
      });
    }

    return filtered;
  }, [allLeaves, filter.status, filter.search]);

  // Fetch leaves on component mount
  useEffect(() => {
    dispatch(fetchEmployeeLeaves());
  }, [dispatch]);

  // Calculate days for edit form - EXCLUDING SUNDAYS
  useEffect(() => {
    calculateEditDays(
      editFormData.start_date,
      editFormData.end_date,
      editFormData.start_session,
      editFormData.end_session
    );
  }, [
    editFormData.start_date,
    editFormData.end_date,
    editFormData.start_session,
    editFormData.end_session,
  ]);

  // Safety check for pagination
  const perPage = pagination?.perPage || 10;
  const currentPage = pagination?.currentPage || 1;

  const totalPages = Math.ceil(filteredLeaves.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentLeaves = filteredLeaves.slice(start, start + perPage);

  // Helper functions
  const getLeaveTypeName = (leaveType) => {
    if (!leaveType) return "Leave";
    if (typeof leaveType === "object") {
      return leaveType.name || "Leave";
    }
    return leaveType;
  };

  const getStatus = (status) => {
    if (!status) return "pending";
    if (typeof status === "object") {
      return status.name?.toLowerCase() || "pending";
    }
    return status.toLowerCase();
  };

  const getClaimSalary = (claimSalary) => {
    if (claimSalary === undefined || claimSalary === null) return "Yes";
    if (typeof claimSalary === "object") return "Yes";
    if (claimSalary === 1 || claimSalary === "1" || claimSalary === "Yes")
      return "Yes";
    return "No";
  };

  const hasDocument = (document) => {
    return document !== null && document !== undefined && document !== "";
  };

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

  const stats = useMemo(
    () => ({
      total: allLeaves.length,
      pending: allLeaves.filter((l) => getStatus(l.status) === "pending")
        .length,
      approved: allLeaves.filter((l) => getStatus(l.status) === "approved")
        .length,
      rejected: allLeaves.filter((l) => getStatus(l.status) === "rejected")
        .length,
    }),
    [allLeaves],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // If the date is in YYYY-MM-DD format, handle it directly
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        // Use UTC to prevent timezone offset
        return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC'
        });
      }
      
      // For other date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const from = new Date(startDate);
      const to = new Date(endDate);
      // Use UTC dates for calculation
      const utcFrom = Date.UTC(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
      );
      const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
      const days = Math.ceil((utcTo - utcFrom) / (1000 * 60 * 60 * 24)) + 1;
      return days;
    } catch (error) {
      return 0;
    }
  };

  // Helper function to calculate working days excluding Sundays
  const getWorkingDaysExcludingSundays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    try {
      // Parse dates directly from YYYY-MM-DD format to avoid timezone issues
      const parseDate = (dateStr) => {
        const parts = dateStr.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
      };
      
      const from = parseDate(startDate);
      const to = parseDate(endDate);
      
      // Set time to avoid any timezone issues
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);
      
      if (from > to) return 0;
      
      let count = 0;
      const current = new Date(from);
      
      while (current <= to) {
        // Sunday is 0, so exclude Sundays
        if (current.getDay() !== 0) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    } catch (error) {
      console.error("Error calculating working days:", error);
      return 0;
    }
  };

  // Helper function to calculate days for edit form (excluding Sundays)
  const calculateEditDays = (startDate, endDate, startSession, endSession) => {
    if (!startDate || !endDate) {
      setEditTotalDays(0);
      return;
    }

    try {
      // Get working days excluding Sundays
      let days = getWorkingDaysExcludingSundays(startDate, endDate);
      
      console.log(`Working days (excluding Sundays): ${days}`);
      
      // If no working days, set to 0
      if (days === 0) {
        setEditTotalDays(0);
        return;
      }

      // Adjust for sessions
      if (startSession === "afternoon") {
        days = days - 0.5;
      }
      if (endSession === "morning") {
        days = days - 0.5;
      }

      // Ensure minimum is 0.5 if there's any leave
      if (days < 0.5 && days > 0) {
        days = 0.5;
      }

      console.log(`Total days after session adjustment: ${days}`);
      setEditTotalDays(days);
    } catch (error) {
      console.error("Error calculating edit days:", error);
      setEditTotalDays(0);
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(
      setLeaveFilter({
        status: status === "all" ? "all" : status.toLowerCase(),
        search: filter.search || "",
      }),
    );
  };

  const handleSearch = (e) => {
    dispatch(
      setLeaveFilter({
        status: filter.status || "all",
        search: e.target.value,
      }),
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setLeavePagination({ currentPage: page, perPage: perPage }));
    }
  };

  const handleEntriesChange = (e) => {
    dispatch(
      setLeavePagination({ currentPage: 1, perPage: parseInt(e.target.value) }),
    );
  };

  const handleEditClick = async (leave) => {
    // Show loading state if needed
    setEditError("");

    try {
      // Fetch the full leave data by ID
      const result = await dispatch(fetchLeaveById(leave.id));

      if (fetchLeaveById.fulfilled.match(result)) {
        const leaveData = result.payload;

        // Extract dates and ensure they're in the correct format
        const startDate = leaveData.start_date
          ? new Date(leaveData.start_date).toISOString().split("T")[0]
          : "";
        const endDate = leaveData.end_date
          ? new Date(leaveData.end_date).toISOString().split("T")[0]
          : "";

        const startSession =
          leaveData.session1 || leaveData.start_session || "morning";
        const endSession =
          leaveData.session2 || leaveData.end_session || "afternoon";

        const claimSalary =
          leaveData.claim_salary === 1 ||
          leaveData.claim_salary === "1" ||
          leaveData.claim_salary === true
            ? "1"
            : "0";

        // Get the leave type ID
        const leaveTypeId =
          leaveData.leave_type_id || leaveData.leave_type?.id || "";

        setEditingLeave({
          ...leaveData,
          leave_type_id: leaveTypeId,
        });

        setEditFormData({
          start_date: startDate,
          end_date: endDate,
          reason: leaveData.reason || "",
          claim_salary: claimSalary,
          start_session: startSession,
          end_session: endSession,
        });

        // Calculate total days excluding Sundays
        calculateEditDays(startDate, endDate, startSession, endSession);

        setShowEditModal(true);
      } else {
        setEditError(result.payload || "Failed to load leave details");
      }
    } catch (error) {
      setEditError("Failed to load leave details. Please try again.");
      console.error("Error fetching leave:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editFormData.start_date) {
      setEditError("Please select start date");
      return;
    }
    if (!editFormData.end_date) {
      setEditError("Please select end date");
      return;
    }
    if (editTotalDays <= 0) {
      setEditError("Please select valid dates (excluding Sundays)");
      return;
    }
    if (editFormData.reason.length < 10) {
      setEditError("Please provide a reason (minimum 10 characters)");
      return;
    }

    // Get the leave type ID from the editingLeave object
    const leaveTypeId =
      editingLeave?.leave_type_id || editingLeave?.leave_type?.id || "";

    if (!leaveTypeId) {
      setEditError("Leave type ID is missing");
      return;
    }

    const formData = new FormData();
    formData.append("leave_type_id", leaveTypeId);
    formData.append("start_date", editFormData.start_date);
    formData.append("end_date", editFormData.end_date);
    formData.append("reason", editFormData.reason);
    formData.append("claim_salary", editFormData.claim_salary);
    // Use session1 and session2 (matching the API response)
    formData.append("session1", editFormData.start_session);
    formData.append("session2", editFormData.end_session);
    formData.append("_method", "PUT");

    // Log the form data for debugging
    console.log("Submitting edit with data:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const result = await dispatch(
        updateLeaveRequest({
          id: editingLeave.id,
          data: formData,
        }),
      );

      if (updateLeaveRequest.fulfilled.match(result)) {
        await dispatch(fetchEmployeeLeaves());
        setShowEditModal(false);
        setEditingLeave(null);
        // Reset form
        setEditFormData({
          start_date: "",
          end_date: "",
          reason: "",
          claim_salary: "0",
          start_session: "morning",
          end_session: "afternoon",
        });
      }
    } catch (error) {
      setEditError(error.message || "Failed to update leave request");
    }
  };

  // Delete handlers
  const handleDeleteClick = (leaveId) => {
    setDeleteLeaveId(leaveId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await dispatch(deleteLeaveRequest(deleteLeaveId));

      if (deleteLeaveRequest.fulfilled.match(result)) {
        await dispatch(fetchEmployeeLeaves());
        setShowDeleteModal(false);
        setDeleteLeaveId(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setShowDeleteModal(false);
    }
  };

  const getMinEndDate = () => {
    if (editFormData.start_date) {
      return editFormData.start_date;
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle document view
  const handleViewDocument = (documentPath) => {
    if (!documentPath) {
      alert("No document available");
      return;
    }
    
    const fullUrl = getDocumentUrl(documentPath);
    console.log("Opening document:", fullUrl);
    window.open(fullUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-7">
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl md:text-2xl">
              <FiFileText />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-green-600">
            {stats.total}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Total Leaves
          </div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl md:text-2xl">
              <FiClock />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-amber-500">
            {stats.pending}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Pending</div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl md:text-2xl">
              <FiCalendar />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-purple-500">
            {stats.approved}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Approved</div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl md:text-2xl">
              <FiFileText />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-red-500">
            {stats.rejected}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Rejected</div>
        </div>
      </div>

      <div className="leaves-header flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-7">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
            My Leave Requests
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your leave applications
          </p>
        </div>
        <Link
          to="/employee/request-leave"
          className="request-btn bg-green-500 text-white py-2.5 px-6 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-green-600 hover:-translate-y-0.5 transition-all shadow-md"
        >
          <FiPlus /> Request Leave
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs flex flex-wrap gap-2.5 mb-6 pb-3 border-b border-[var(--border)]">
        {["all", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter.status === status.toLowerCase() ||
              (status === "all" && filter.status === "all")
                ? "bg-green-500 text-white shadow-sm"
                : "bg-[var(--surface2)] text-[var(--text-secondary)] hover:bg-green-100 hover:text-green-600"
            }`}
          >
            {status === "all" ? "All Requests" : status}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-xs text-[var(--muted)]">
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
            <FiSearch className="text-gray-400 text-xs" />
            <input
              type="text"
              value={filter.search || ""}
              onChange={handleSearch}
              placeholder="Search by status or reason..."
              className="border-none outline-none bg-transparent text-xs text-[var(--text)] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="leave-table-wrapper bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
        <table className="leave-table w-full border-collapse text-xs min-w-[1000px]">
          <thead>
            <tr className="bg-[var(--surface2)]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)] w-16">
                #
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Leave Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                From
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                To
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Days
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Claim Salary
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Document
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                Reason
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentLeaves.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-8 text-[var(--muted)]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FiCalendar className="text-3xl text-[var(--muted)]" />
                    <p>No leave requests found</p>
                    <Link
                      to="/employee/request-leave"
                      className="text-green-500 hover:underline text-sm mt-2"
                    >
                      Request Leave →
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              currentLeaves.map((leave, idx) => {
                const leaveTypeName = getLeaveTypeName(leave.leave_type);
                const statusName = getStatus(leave.status);
                const claimSalary = getClaimSalary(leave.claim_salary);
                const hasDoc = hasDocument(leave.document);
                const days =
                  leave.duration_days ||
                  calculateDays(leave.start_date, leave.end_date);
                const isPending = statusName === "pending";

                return (
                  <tr
                    key={leave.id || idx}
                    className="hover:bg-[var(--surface2)] transition-colors"
                  >
                    <td className="py-3.5 px-4 border-b border-[var(--border)] text-center">
                      {start + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[11px] font-semibold">
                        <FiCalendar className="text-xs" />
                        {leaveTypeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)]">
                      {formatDate(leave.start_date)}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)]">
                      {formatDate(leave.end_date)}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold">
                      {days}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)]">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          claimSalary === "Yes"
                            ? "bg-green-500/15 text-green-600"
                            : "bg-gray-100 text-[var(--muted)]"
                        }`}
                      >
                        {claimSalary}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)]">
                      {hasDoc ? (
                        <button
                          onClick={() => handleViewDocument(leave.document)}
                          className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs"
                        >
                          <FiDownload className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)]">
                      <StatusBadge status={statusName} />
                    </td>
                    <td
                      className="py-3.5 px-4 border-b border-[var(--border)] text-[var(--text-secondary)] max-w-[200px] truncate"
                      title={leave.reason}
                    >
                      {leave.reason || "-"}
                    </td>
                    <td className="py-3.5 px-4 border-b border-[var(--border)] text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleEditClick(leave)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                              title="Edit"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(leave.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              title="Delete"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {!isPending && (
                          <span className="text-[10px] text-[var(--muted)]">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLeaves.length > 0 && totalPages > 1 && (
        <div className="pagination-container flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
          <div className="text-xs text-[var(--muted)]">
            Showing {start + 1} to{" "}
            {Math.min(start + perPage, filteredLeaves.length)} of{" "}
            {filteredLeaves.length} entries
          </div>
          <div className="page-buttons flex gap-1.5 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface2)] transition-colors"
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
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface2)] transition-colors"
            >
              <FiChevronRight className="mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                <FiEdit2 className="inline mr-2 text-blue-500" />
                Edit Leave Request
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <FiAlertCircle />
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <DateInput
                    value={editFormData.start_date}
                    onChange={(date) =>
                      setEditFormData({ ...editFormData, start_date: date })
                    }
                    type="general"
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Session <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.start_session}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        start_session: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <DateInput
                    value={editFormData.end_date}
                    onChange={(date) =>
                      setEditFormData({ ...editFormData, end_date: date })
                    }
                    type="general"
                    minDate={getMinEndDate()}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Session <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.end_session}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        end_session: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Total Days
                  </label>
                  <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <span className="text-2xl font-extrabold text-green-600">
                      {editTotalDays}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Days (Excluding Sundays)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Claim Salary
                  </label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="1"
                        checked={editFormData.claim_salary === "1"}
                        onChange={() =>
                          setEditFormData({
                            ...editFormData,
                            claim_salary: "1",
                          })
                        }
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="0"
                        checked={editFormData.claim_salary === "0"}
                        onChange={() =>
                          setEditFormData({
                            ...editFormData,
                            claim_salary: "0",
                          })
                        }
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editFormData.reason}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, reason: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
                  placeholder="Describe your reason for leave..."
                />
                <small
                  className={`text-[11px] ${editFormData.reason.length >= 10 ? "text-green-500" : "text-red-500"}`}
                >
                  {editFormData.reason.length}/10 characters minimum
                </small>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave /> Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Delete Leave Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this leave request? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;