/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import Pagination from "../components/common/Paginations";
import { 
  fetchTaskReports, 
  deleteTaskReport, 
  updateTaskReportRemarks 
} from "../store/slices/taskReportSlice";

const TaskReports = () => {
  const dispatch = useDispatch();
  const { 
    taskReports = [], 
    loading, 
    totalCount,
    currentPage: currentPageState,
    perPage: perPageState
  } = useSelector((state) => state.taskReports || {});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarksText, setRemarksText] = useState("");
  const [selectedReportForRemarks, setSelectedReportForRemarks] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Fetch reports when page, perPage, or search changes
  useEffect(() => {
    dispatch(fetchTaskReports({ 
      page: currentPage, 
      perPage: perPage,
      search: searchTerm 
    }));
  }, [dispatch, currentPage, perPage, searchTerm]);

  const handleView = (report) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedReport(null);
  };

  const handleAddRemarks = (report) => {
    setSelectedReportForRemarks(report);
    setRemarksText(report.remarks || "");
    setRemarksModalOpen(true);
  };

  const handleSaveRemarks = async () => {
    await dispatch(updateTaskReportRemarks({
      id: selectedReportForRemarks.id,
      remarks: remarksText
    }));
    setRemarksModalOpen(false);
    setSelectedReportForRemarks(null);
    setRemarksText("");
    // Refresh the list
    dispatch(fetchTaskReports({ 
      page: currentPage, 
      perPage: perPage,
      search: searchTerm 
    }));
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    await dispatch(deleteTaskReport(reportToDelete.id));
    setDeleteConfirmOpen(false);
    setReportToDelete(null);
    // Refresh the list
    dispatch(fetchTaskReports({ 
      page: currentPage, 
      perPage: perPage,
      search: searchTerm 
    }));
  };

  const handleRemarksModalClose = () => {
    setRemarksModalOpen(false);
    setSelectedReportForRemarks(null);
    setRemarksText("");
  };

  // Calculate stats from fetched data
  const totalReports = totalCount || taskReports.length;
  const uniqueEmployees = [...new Set(taskReports.map((r) => r.employee))].length;
  const today = new Date().toISOString().split("T")[0];
  const todayReports = taskReports.filter((r) => r.date === today).length;

  // Get paginated data (if API doesn't handle pagination)
  const start = (currentPage - 1) * perPage;
  const paginatedReports = taskReports.slice(start, start + perPage);
  const totalPages = Math.ceil(totalReports / perPage);

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Stats Cards */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-5 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-alt text-green-600 dark:text-green-400 text-base md:text-xl"></i>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-green-600 dark:text-green-400">
              {totalReports}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              Total Reports
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-600 dark:text-blue-400 text-base md:text-xl"></i>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {uniqueEmployees}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              Employees Reported
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar-day text-amber-600 dark:text-amber-400 text-base md:text-xl"></i>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {todayReports}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              Today's Reports
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-comment text-purple-600 dark:text-purple-400 text-base md:text-xl"></i>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {taskReports.filter(r => r.remarks && r.remarks.trim()).length}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              With Remarks
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Task Reports
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalReports} total reports found
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
          <EntriesSelector 
            value={perPage} 
            onChange={(value) => {
              setPerPage(value);
              setCurrentPage(1);
            }} 
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search by employee, tasks..."
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Task Reports Table */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[800px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Sl.No.
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Employee
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Tasks Completed
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Plan for Tomorrow
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Remarks
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        <i className="fas fa-inbox text-4xl mb-2 block"></i>
                        No task reports found
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report, idx) => (
                      <tr
                        key={report.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {start + idx + 1}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {report.date}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {report.employee}
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate"
                          title={report.tasksCompleted}
                        >
                          {report.tasksCompleted.length > 40
                            ? report.tasksCompleted.substring(0, 40) + "..."
                            : report.tasksCompleted}
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate"
                          title={report.planForTomorrow}
                        >
                          {report.planForTomorrow.length > 40
                            ? report.planForTomorrow.substring(0, 40) + "..."
                            : report.planForTomorrow}
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate"
                          title={report.remarks}
                        >
                          <div className="flex items-center gap-1">
                            {report.remarks && report.remarks.trim() ? (
                              <>
                                <i className="fas fa-comment-dots text-purple-400 text-xs"></i>
                                <span className="text-purple-600 dark:text-purple-400">
                                  {report.remarks.length > 25
                                    ? report.remarks.substring(0, 25) + "..."
                                    : report.remarks}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">No remarks</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div className="flex gap-1 md:gap-2">
                            <button
                              onClick={() => handleView(report)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                              title="View Details"
                            >
                              <i className="fas fa-eye text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleAddRemarks(report)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500 transition-colors"
                              title={report.remarks ? "Edit Remarks" : "Add Remarks"}
                            >
                              <i className="fas fa-comment text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(report)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                              title="Delete Report"
                            >
                              <i className="fas fa-trash text-xs md:text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalReports}
          itemsPerPage={perPage}
        />
      </main>

      {/* View Task Report Modal */}
      {viewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <i className="fas fa-eye text-green-500"></i>
                Task Report Details
              </h3>
              <button
                onClick={handleViewModalClose}
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </label>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {selectedReport.date}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </label>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {selectedReport.employee}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tasks Completed
                </label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedReport.tasksCompleted}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan for Tomorrow
                </label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedReport.planForTomorrow}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-comment text-purple-500"></i>
                  Admin Remarks
                </label>
                <div className="mt-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedReport.remarks && selectedReport.remarks.trim() ? (
                      selectedReport.remarks
                    ) : (
                      <span className="text-gray-400 italic">No remarks added yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleViewModalClose}
                className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleViewModalClose();
                  handleAddRemarks(selectedReport);
                }}
                className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 text-sm"
              >
                <i className="fas fa-comment"></i>
                {selectedReport.remarks ? "Edit Remarks" : "Add Remarks"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Remarks Modal */}
      {remarksModalOpen && selectedReportForRemarks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <i className="fas fa-comment text-green-500"></i>
                {selectedReportForRemarks.remarks ? "Edit" : "Add"} Remarks
              </h3>
              <button
                onClick={handleRemarksModalClose}
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Employee:</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedReportForRemarks.employee}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedReportForRemarks.date}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Admin Remarks
                </label>
                <textarea
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="Add your remarks about this task report..."
                  rows="5"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  <i className="fas fa-info-circle"></i> Remarks are visible to the employee
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleRemarksModalClose}
                className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemarks}
                className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 text-sm"
              >
                <i className="fas fa-save"></i>
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && reportToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <i className="fas fa-trash text-red-500"></i>
                Confirm Delete
              </h3>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the task report for?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {reportToDelete.employee}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Date: {reportToDelete.date}
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                <i className="fas fa-exclamation-triangle"></i> This action cannot be undone!
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full font-semibold bg-red-500 text-white hover:bg-red-600 transition-all flex items-center gap-2 text-sm"
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReports;