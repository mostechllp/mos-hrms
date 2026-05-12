import React from "react";

const LeaveModal = ({ isOpen, leave, onClose, onViewDocument }) => {
  if (!isOpen || !leave) return null;

  const getStatusClass = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case "pending":
        return "bg-amber-100 text-amber-600";
      case "approved":
        return "bg-green-100 text-green-600";
      case "rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to get field value from different possible field names
  const getField = (fieldName) => {
    const mappings = {
      employee: leave.employee_name || leave.employee?.name || leave.employee || '-',
      type: leave.leave_type?.name || leave.type || '-',
      fromDate: formatDate(leave.from_date || leave.fromDate),
      toDate: formatDate(leave.to_date || leave.toDate),
      days: leave.number_of_days || leave.days || '-',
      claimSalary: leave.claim_salary === 1 || leave.claimSalary === 'Yes' ? 'Yes' : 'No',
      doc: leave.document_path || leave.doc,
      reason: leave.reason || '-',
      status: leave.status || 'pending',
      processedBy: leave.processed_by || leave.processedBy || '-',
      rejectionReason: leave.rejection_reason || leave.rejectionReason,
    };
    return mappings[fieldName] || '-';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[90%] p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <i className="fas fa-eye text-green-500"></i>
          Leave Request Details
        </h3>

        <div className="space-y-3">
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Employee:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('employee')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Leave Type:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('type')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              From Date:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('fromDate')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              To Date:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('toDate')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Days:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('days')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Claim Salary:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('claimSalary')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Document:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('doc') ? (
                <button
                  onClick={() => onViewDocument(getField('doc'))}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <i className="fas fa-file-pdf mr-1"></i> View Document
                </button>
              ) : (
                "-"
              )}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Reason:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('reason')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Status:
            </span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(getField('status'))}`}
            >
              {getField('status')}
            </span>
          </div>
          <div className="flex py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
              Processed By:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getField('processedBy')}
            </span>
          </div>
          {getField('rejectionReason') !== '-' && (
            <div className="flex py-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300 w-28">
                Rejection Reason:
              </span>
              <span className="text-red-600 dark:text-red-400">
                {getField('rejectionReason')}
              </span>
            </div>
          )}
        </div>

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
