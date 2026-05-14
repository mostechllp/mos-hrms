/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import UploadAttendanceModal from "../components/attendance/UploadAttendanceModal";
import { showToast } from "../../components/common/Toast";
import Pagination from "../components/common/Paginations";
import {
  fetchAttendanceRecords,
  uploadAttendanceFile,
  fetchUploadStatus,
  fetchPunchInToday,
  fetchPunchInYesterday,
  fetchPunchOutToday,
  fetchLateComers,
  fetchAbsentees,
} from "../store/slices/attendanceSlice";

const Attendances = () => {
  const dispatch = useDispatch();
  const {
    records,
    uploadStatus,
    uploadStatusId,
    punchInToday,
    lateComers,
    absentees,
    loading,
    stats,
    totalCount,
    lastPage,
  } = useSelector((state) => state.attendance);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);


  // Fetch all initial data with server-side pagination
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchAttendanceRecords({ 
          page: currentPage, 
          per_page: perPage,
          company: companyFilter !== 'all' ? companyFilter : undefined,
          search: searchTerm || undefined
        })
      );
      await dispatch(fetchPunchInToday());
      await dispatch(fetchPunchInYesterday());
      await dispatch(fetchPunchOutToday());
      await dispatch(fetchLateComers());
      await dispatch(fetchAbsentees());
    };
    fetchData();
  }, [dispatch, currentPage, perPage, companyFilter, searchTerm]);

  // Poll for upload status - persists across navigation
  useEffect(() => {
    let interval = null;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      
      interval = setInterval(() => {
        if (uploadStatusId && uploadStatus === 'processing') {
          dispatch(fetchUploadStatus(uploadStatusId));
        }
      }, 5000);
    };
    
    // Store interval in state for cleanup
    if (uploadStatusId && uploadStatus === 'processing') {
      startPolling();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPollingInterval(interval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [uploadStatusId, uploadStatus, dispatch]);

  // Handle upload completion
  useEffect(() => {
    if (uploadStatus === 'completed') {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      showToast("Attendance file processed successfully!", "success");
      // Refresh all data
      // eslint-disable-next-line react-hooks/immutability
      refreshAllData();
    } else if (uploadStatus === 'failed') {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      showToast("Failed to process attendance file", "error");
    }
  }, [uploadStatus]);

  const refreshAllData = async () => {
    setRefreshLoading(true);
    try {
      await Promise.all([
        dispatch(
          fetchAttendanceRecords({ 
            page: currentPage, 
            per_page: perPage,
            company: companyFilter !== 'all' ? companyFilter : undefined,
            search: searchTerm || undefined
          })
        ),
        dispatch(fetchPunchInToday()),
        dispatch(fetchPunchInYesterday()),
        dispatch(fetchPunchOutToday()),
        dispatch(fetchLateComers()),
        dispatch(fetchAbsentees()),
      ]);
      showToast("Data refreshed successfully!", "success");
    } catch (error) {
      showToast("Some data failed to load", error);
    } finally {
      setRefreshLoading(false);
    }
  };

  // Get filtered records - now just returns the records from API
  const getFilteredRecords = () => {
    return records;
  };

  const filteredRecords = getFilteredRecords();
  const totalFiltered = totalCount || filteredRecords.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageRecords = filteredRecords;

  // Safe array getter - handles API errors gracefully
  const getSafeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  // Calculate stats from real API data
  const totalEmployees = stats?.totalActiveEmployees || 0;
  const punchedInTodayCount = stats?.presentToday || 0;
  const lateTodayCount = stats?.punchedLate || 0;
  const absentTodayCount = stats?.absentToday || 0;
  const punchOutTodayCount = stats?.punchedOutToday || 0;

  const handleUploadComplete = async ({ company_id, file }) => {
    try {
      const result = await dispatch(uploadAttendanceFile({ company_id, file })).unwrap();
      if (result?.id) {
        showToast("File uploaded! Processing in background...", "info");
        setShowUploadModal(false);
      }
    } catch (error) {
      showToast(error || "Upload failed", "error");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (value) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const handleCompanyFilterChange = (e) => {
    setCompanyFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleNameFilterChange = (e) => {
    setNameFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Helper function to render employee list
  const renderEmployeeList = (employees, title) => {
    const employeesArray = getSafeArray(employees);
    if (!employeesArray || employeesArray.length === 0) return null;

    return (
      <div className="absolute hidden group-hover:block z-20 mt-2 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl min-w-[200px] top-full left-0">
        <p className="font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-1">
          {title}:
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {employeesArray.slice(0, 10).map((emp, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-700 px-2 py-1 rounded-full"
            >
              {typeof emp === "string"
                ? emp
                : emp.employeeName ||
                  emp.name ||
                  emp.employee_name ||
                  "Unknown"}
            </span>
          ))}
          {employeesArray.length > 10 && (
            <span className="text-xs text-gray-400 mt-1 block">
              +{employeesArray.length - 10} more
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    // Remove the outer div with Sidebar and flex layout
    // Just return the main content directly
    <div className="w-full overflow-x-hidden">
      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {/* Total Employees Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-users text-green-600 dark:text-green-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
            {totalEmployees}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Total Employees
          </div>
        </div>

        {/* Punched In Today Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-fingerprint text-blue-600 dark:text-blue-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {punchedInTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Punched In Today
          </div>
          {renderEmployeeList(punchInToday, "Punched In")}
        </div>

        {/* Late Today Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 dark:text-amber-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lateTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Late Today
          </div>
          {renderEmployeeList(lateComers, "Late Comers")}
        </div>

        {/* Absent Today Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-slash text-red-600 dark:text-red-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
            {absentTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Absent Today
          </div>
          {renderEmployeeList(absentees, "Absentees")}
        </div>

        {/* Punch Out Today Card */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-sign-out-alt text-purple-600 dark:text-purple-400 text-sm md:text-lg"></i>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {punchOutTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Punch Out Today
          </div>
        </div>
      </div>

      {/* Upload Status Banner */}
      {uploadStatus === "processing" && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
          <i className="fas fa-spinner fa-spin text-blue-500"></i>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Processing attendance file... This will continue in the background.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex flex-wrap items-center gap-2">
          Attendance Records
          <span className="text-[10px] md:text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
            <i className="fas fa-calendar-check mr-1"></i> Daily Log
          </span>
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
        <select
          value={companyFilter}
          onChange={handleCompanyFilterChange}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
        >
          <option value="all">All Companies</option>
          <option value="THESAY">THESAY</option>
          <option value="SAYGEN">SAYGEN</option>
          <option value="warehouse">Warehouse</option>
          <option value="farmassay">Farmassay</option>
        </select>

        <input
          type="text"
          value={nameFilter}
          onChange={handleNameFilterChange}
          placeholder="Employee Name..."
          className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500 w-full sm:w-48"
        />

        <button
          onClick={refreshAllData}
          disabled={refreshLoading}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <i
            className={`fas fa-sync-alt text-xs md:text-sm ${refreshLoading ? "fa-spin" : ""}`}
          ></i>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={handlePerPageChange} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search records..."
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            disabled={uploadStatus === "processing"}
          >
            <i className="fas fa-plus-circle"></i> Upload Logs
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && records.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">
            Loading attendance records...
          </p>
        </div>
      ) : (
        <>
          {/* Attendance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[800px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Sl.No.
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Company
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Employee Name
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Punch In
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Punch Out
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                        {start + idx + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap">
                          <i className="fas fa-building text-gray-500 text-[8px] md:text-xs"></i>
                          {record.company || "-"}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {record.employeeName || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {record.date || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {record.punchIn || "-"}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        {record.hasPunchOut ? (
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {record.punchOut}
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                            Not Punched Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pageRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalFiltered}
            itemsPerPage={perPage}
          />
        </>
      )}

      {/* Upload Modal */}
      <UploadAttendanceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadComplete}
      />
    </div>
  );
};

export default Attendances;