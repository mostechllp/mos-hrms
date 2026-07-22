/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import UploadAttendanceModal from "../components/attendance/UploadAttendanceModal";
import ManualAttendanceModal from "../components/attendance/ManualAttendanceModal";
import EditAttendanceModal from "../components/attendance/EditAttendanceModal";
import ConfirmModal from "../components/common/ConfirmModal";
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
  clearUploadStatus,
  createManualAttendance,
  updateAttendance,
  deleteAttendance,
} from "../store/slices/attendanceSlice";
import LocationViewModal from "../components/attendance/LocationViewModal";
import BreakDetailsModal from "../components/attendance/BreakDetailsModal";

const Attendances = () => {
  const dispatch = useDispatch();
  const {
    records,
    uploadStatus,
    uploadStatusId,
    uploadLoading,
    punchInToday,
    lateComers,
    absentees,
    loading,
    stats,
    totalCount,
    lastPage,
  } = useSelector((state) => state.attendance);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBreakRecord, setSelectedBreakRecord] = useState(null);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const pollingRef = useRef(null);
  const filtersRef = useRef({
    currentPage,
    perPage,
    companyFilter,
    searchTerm,
    nameFilter,
  });

  useEffect(() => {
    filtersRef.current = {
      currentPage,
      perPage,
      companyFilter,
      searchTerm,
      nameFilter,
    };
  });

  const fetchAll = useCallback(() => {
    const f = filtersRef.current;
    return Promise.all([
      dispatch(
        fetchAttendanceRecords({
          page: f.currentPage,
          per_page: f.perPage,
          company: f.companyFilter !== "all" ? f.companyFilter : undefined,
          search: f.searchTerm || undefined,
          name: f.nameFilter || undefined,
        }),
      ),
      dispatch(fetchPunchInToday()),
      dispatch(fetchPunchInYesterday()),
      dispatch(fetchPunchOutToday()),
      dispatch(fetchLateComers()),
      dispatch(fetchAbsentees()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [currentPage, perPage, companyFilter, searchTerm, nameFilter]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (uploadStatusId && uploadStatus === "processing") {
      stopPolling();
      pollingRef.current = setInterval(() => {
        dispatch(fetchUploadStatus(uploadStatusId));
      }, 5000);
    }
    return stopPolling;
  }, [uploadStatusId, uploadStatus]);

  const handledUploadRef = useRef(null);

  useEffect(() => {
    if (!uploadStatusId) return;
    if (handledUploadRef.current === uploadStatusId) return;

    if (uploadStatus === "completed") {
      handledUploadRef.current = uploadStatusId;
      stopPolling();
      showToast("Attendance file processed successfully!", "success");
      setCurrentPage(1);
      dispatch(clearUploadStatus());
    } else if (uploadStatus === "failed") {
      handledUploadRef.current = uploadStatusId;
      stopPolling();
      showToast(
        "Failed to process attendance file. Please try again.",
        "error",
      );
      dispatch(clearUploadStatus());
    }
  }, [uploadStatus, uploadStatusId]);

  const refreshAllData = async () => {
    setRefreshLoading(true);
    try {
      await fetchAll();
      showToast("Data refreshed successfully!", "success");
    } catch {
      showToast("Some data failed to load", "error");
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleUploadComplete = async ({ file }) => {
    try {
      const result = await dispatch(uploadAttendanceFile({ file })).unwrap();
      setShowUploadModal(false);
      if (result.status === "completed") {
        showToast("Attendance file uploaded successfully!", "success");
        setCurrentPage(1);
      } else {
        showToast("File uploaded! Processing in background…", "info");
      }
    } catch (error) {
      showToast(
        typeof error === "string" ? error : error?.message || "Upload failed",
        "error",
      );
    }
  };

  const handleManualSubmit = async (formData) => {
    setManualSubmitting(true);
    try {
      const submissionData = {
        employee_id: formData.employee_id,
        date: formData.date,
        punch_in: formData.punch_in,
        punch_out: formData.punch_out,
      };

      await dispatch(createManualAttendance(submissionData)).unwrap();
      showToast("Attendance created successfully!", "success");
      setShowManualModal(false);
      setCurrentPage(1);

      const f = filtersRef.current;
      await Promise.all([
        dispatch(
          fetchAttendanceRecords({
            page: 1,
            per_page: f.perPage,
            company: f.companyFilter !== "all" ? f.companyFilter : undefined,
            search: f.searchTerm || undefined,
            name: f.nameFilter || undefined,
          }),
        ),
        dispatch(fetchPunchInToday()),
        dispatch(fetchPunchInYesterday()),
        dispatch(fetchPunchOutToday()),
        dispatch(fetchLateComers()),
        dispatch(fetchAbsentees()),
      ]);
    } catch (error) {
      console.error("Manual submission error:", error);
      showToast(
        typeof error === "string" ? error : error?.message || "Creation failed",
        "error",
      );
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleEditClick = (record) => {
    console.log("Record being edited:", record);
    setSelectedAttendance(record);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (id, data) => {
    setEditSubmitting(true);
    try {
      console.log("=== UPDATE DEBUG ===");
      console.log("Attendance ID:", id);
      console.log("Data being sent:", data);
      console.log("Employee ID from data:", data.userid);
      console.log(
        "Selected attendance employee_id:",
        selectedAttendance?.employee_id,
      );

      await dispatch(updateAttendance({ id, data })).unwrap();
      showToast("Attendance updated successfully!", "success");
      setShowEditModal(false);
      setSelectedAttendance(null);
      await fetchAll();
    } catch (error) {
      console.error("Edit submission error:", error);
      showToast(
        typeof error === "string" ? error : error?.message || "Update failed",
        "error",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteClick = (record) => {
    setSelectedAttendance(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAttendance) return;

    setDeleteSubmitting(true);
    try {
      await dispatch(deleteAttendance(selectedAttendance.id)).unwrap();
      showToast("Attendance deleted successfully!", "success");
      setShowDeleteModal(false);
      setSelectedAttendance(null);
      await fetchAll();
    } catch (error) {
      console.error("Delete error:", error);
      showToast(
        typeof error === "string" ? error : error?.message || "Delete failed",
        "error",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle location view
  const handleViewLocation = (record) => {
    const locationData = {
      punch_in: {
        latitude: record.punch_in_latitude,
        longitude: record.punch_in_longitude,
        address: record.punch_in_address,
        time: record.punchIn,
      },
      punch_out: {
        latitude: record.punch_out_latitude,
        longitude: record.punch_out_longitude,
        address: record.punch_out_address,
        time: record.punchOut,
      },
      employeeName: record.employeeName,
      date: record.date,
    };
    setSelectedLocation(locationData);
    setShowLocationModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const totalFiltered = totalCount || records.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const isUploading = uploadLoading || uploadStatus === "processing";

  const totalEmployees = stats?.totalActiveEmployees || 0;
  const punchedInCount = stats?.presentToday || 0;
  const lateTodayCount = stats?.punchedLate || 0;
  const absentTodayCount = stats?.absentToday || 0;
  const punchOutCount = stats?.punchedOutToday || 0;

  const getSafeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const renderEmployeeList = (employees, title) => {
    const arr = getSafeArray(employees);
    if (!arr.length) return null;

    const getEmployeeName = (emp) => {
      if (typeof emp === "string") return emp;
      if (emp.user?.employee?.first_name) {
        return `${emp.user.employee.first_name} ${emp.user.employee.last_name || ""}`.trim();
      }
      if (emp.first_name) {
        return `${emp.first_name} ${emp.last_name || ""}`.trim();
      }
      return "Unknown";
    };

    return (
      <div className="absolute hidden group-hover:block z-20 mt-2 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl min-w-[200px] top-full left-0">
        <p className="font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-1">
          {title}:
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {arr.slice(0, 10).map((emp, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-700 px-2 py-1 rounded-full"
            >
              {getEmployeeName(emp)}
            </span>
          ))}
          {arr.length > 10 && (
            <span className="text-xs text-gray-400 mt-1 block">
              +{arr.length - 10} more
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {/* ... existing stats cards ... */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
            <i className="fas fa-users text-green-600 dark:text-green-400 text-sm md:text-lg"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
            {totalEmployees}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Total Employees
          </div>
        </div>

        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
            <i className="fas fa-fingerprint text-blue-600 dark:text-blue-400 text-sm md:text-lg"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {punchedInCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Punched In Today
          </div>
          {renderEmployeeList(punchInToday, "Punched In")}
        </div>

        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
            <i className="fas fa-clock text-amber-600 dark:text-amber-400 text-sm md:text-lg"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lateTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Late Today
          </div>
          {renderEmployeeList(lateComers, "Late Comers")}
        </div>

        <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
            <i className="fas fa-user-slash text-red-600 dark:text-red-400 text-sm md:text-lg"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
            {absentTodayCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Absent Today
          </div>
        </div>

        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
            <i className="fas fa-sign-out-alt text-purple-600 dark:text-purple-400 text-sm md:text-lg"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {punchOutCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
            Punch Out Today
          </div>
        </div>
      </div>

      {/* Upload processing banner */}
      {uploadStatus === "processing" && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
          <i className="fas fa-spinner fa-spin text-blue-500"></i>
          <div className="flex-1">
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Processing attendance file…
            </span>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
              The table will refresh automatically when complete.
            </p>
          </div>
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

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={handlePerPageChange} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search records..."
          />
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <i className="fas fa-keyboard"></i> Add attendance
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing…
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle"></i> Upload Logs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && records.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">
            Loading attendance records…
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[1100px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {[
                      "Sl.No.",
                      "Date",
                      "Employee Name",
                      "Department",
                      "Punch In",
                      "Punch Out",
                      "Breaks",
                      "Working Hours",
                      "Status",
                      "Location",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => {
                    const hasLocation =
                      record.punch_in_latitude && record.punch_in_longitude;
                    return (
                      <tr
                        key={`${record.employee_id}-${record.date}-${idx}`}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                          {start + idx + 1}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {record.date || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {record.employeeName || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap">
                            <i className="fas fa-building text-gray-500 text-[8px] md:text-xs"></i>
                            {record.department || "-"}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                          {record.punchIn}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          {record.hasPunchOut ? (
                            <span className="font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                              {record.punchOut}
                            </span>
                          ) : (
                            <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                              Not Punched Out
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBreakRecord(record)}
                              className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-xs flex-shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {record.working_hours === "--" &&
                          record.punchIn !== "--" &&
                          !record.hasPunchOut ? (
                            <span className="text-amber-500">In Progress</span>
                          ) : (
                            record.working_hours || "--"
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] md:text-xs font-medium ${
                              record.status === "Present"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          {hasLocation ? (
                            <button
                              onClick={() => handleViewLocation(record)}
                              className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                              title="View Location"
                            >
                              <i className="fas fa-map-marker-alt"></i>
                              <span className="hidden sm:inline">View</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No location
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(record)}
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(record)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {records.length === 0 && (
                    <tr>
                      <td
                        colSpan="10"
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

      <UploadAttendanceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadComplete}
      />

      <ManualAttendanceModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={handleManualSubmit}
        submitting={manualSubmitting}
      />

      <EditAttendanceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAttendance(null);
        }}
        onSubmit={handleEditSubmit}
        submitting={editSubmitting}
        attendance={selectedAttendance}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAttendance(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Record"
        message={`Are you sure you want to delete attendance record for ${selectedAttendance?.employeeName || "this employee"} on ${selectedAttendance?.date || "this date"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteSubmitting}
        variant="danger"
      />

      {/* Break Details Modal */}
      <BreakDetailsModal
        isOpen={!!selectedBreakRecord}
        onClose={() => setSelectedBreakRecord(null)}
        onRefresh={refreshAllData}
        initialBreaks={selectedBreakRecord?.breaks}
        employeeName={selectedBreakRecord?.employeeName}
        date={selectedBreakRecord?.date}
        attendanceId={selectedBreakRecord?.id} // Pass the attendance record ID
      />

      {/* Location View Modal */}
      <LocationViewModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setSelectedLocation(null);
        }}
        locationData={selectedLocation}
      />
    </div>
  );
};

export default Attendances;
