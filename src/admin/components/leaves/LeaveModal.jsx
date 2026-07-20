import React from "react";
import { FiX, FiCalendar, FiUser, FiClock, FiInfo, FiFileText, FiDownload, FiCheckCircle, FiXCircle } from "react-icons/fi";

const LeaveModal = ({ isOpen, leave, onClose, onViewDocument }) => {
  if (!isOpen || !leave) return null;

  console.log("Leave data in modal:", leave); // Debug log

  const getStatusClass = (status) => {
    const lowerStatus = (status || '').toLowerCase();
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // If it's already in YYYY-MM-DD format
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      }
      // Try to parse as date
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
      return dateString || '-';
    }
  };

  const getSessionLabel = (session) => {
    if (!session) return '-';
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  const getClaimSalaryBadge = (claimSalary) => {
    const isClaiming = claimSalary === 1 || claimSalary === "1" || claimSalary === true || claimSalary === "Yes";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        isClaiming 
          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
      }`}>
        {isClaiming ? "Yes" : "No"}
      </span>
    );
  };

  // Get employee name
  const getEmployeeName = () => {
    if (leave.employee_name) return leave.employee_name;
    if (leave.employee?.first_name && leave.employee?.last_name) {
      return `${leave.employee.first_name} ${leave.employee.last_name}`;
    }
    if (leave.employee?.name) return leave.employee.name;
    return '-';
  };

  // Get leave type name
  const getLeaveTypeName = () => {
    if (leave.leave_type?.name) return leave.leave_type.name;
    if (leave.type) return leave.type;
    return '-';
  };

  // Get document path
  const getDocumentPath = () => {
    return leave.document_path || leave.document || null;
  };

  const documentPath = getDocumentPath();
  const hasDocument = !!documentPath;

  // Calculate days if duration_days is not available
  const getTotalDays = () => {
    if (leave.duration_days) return leave.duration_days;
    if (leave.number_of_days) return leave.number_of_days;
    if (leave.days) return leave.days;
    if (leave.start_date && leave.end_date) {
      try {
        const from = new Date(leave.start_date);
        const to = new Date(leave.end_date);
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        return days;
      } catch (error) {
        return '-';
      }
    }
    return '-';
  };

  const totalDays = getTotalDays();

  // Get session values - TRY BOTH FIELD NAMES
  const startSession = leave.session1 || leave.start_session || null;
  const endSession = leave.session2 || leave.end_session || null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-eye text-green-500"></i>
            Leave Request Details
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mb-5 p-3 rounded-lg flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(leave.status)}`}>
              {leave.status || 'pending'}
            </span>
          </div>
          {leave.status === "approved" && leave.approver && (
            <div className="flex items-center gap-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
              <FiCheckCircle className="text-green-500" />
              <span>Approved by: {leave.approver.username || leave.approver.name || leave.approver.email}</span>
            </div>
          )}
          {leave.status === "rejected" && (
            <div className="flex items-center gap-2 ml-4 text-sm text-red-600 dark:text-red-400">
              <FiXCircle className="text-red-500" />
              <span>Rejected</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiUser className="text-green-500" />
                Employee Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getEmployeeName()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Employee ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {leave.employee?.employee_id || leave.employee_id || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {leave.employee?.company_email || leave.employee?.personal_email || leave.email || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Leave Type */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiCalendar className="text-green-500" />
                Leave Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Leave Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getLeaveTypeName()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Claim Salary</span>
                  {getClaimSalaryBadge(leave.claim_salary)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Date & Session Info */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiClock className="text-green-500" />
                Date & Session
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(leave.start_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Start Session</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getSessionLabel(startSession)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">End Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(leave.end_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">End Session</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getSessionLabel(endSession)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiInfo className="text-green-500" />
                Reason
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {leave.reason || "No reason provided"}
              </p>
            </div>

            {/* Document */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiFileText className="text-green-500" />
                Supporting Document
              </h4>
              {hasDocument ? (
                <button
                  onClick={() => onViewDocument(documentPath)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  View Document
                </button>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No document attached</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Remark (if any) */}
        {leave.admin_remark && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Admin Remark
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{leave.admin_remark}</p>
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {leave.status === "rejected" && leave.admin_remark && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              <FiXCircle className="inline mr-1" />
              Rejection Reason
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">{leave.admin_remark}</p>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;