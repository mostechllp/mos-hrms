import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../common/Paginations";
import {
  fetchAllAttendanceReport,
  fetchAttendanceReport,
  exportAttendanceReport,
  fetchEmployeesForFilter,
} from "../../store/slices/reportSlice";
import ExportModal from "../../../components/common/ExportModal";
import DateInput from "../common/DateInput";
import { debounce } from "lodash";

/* ───────────────────────────────────────────────
   Inline read-only break viewer for this page.
   Renders breaks straight from `record.breaks` —
   no API calls, no dispatch, no shared modal.
   ─────────────────────────────────────────────── */
const BreakViewerModal = ({ isOpen, onClose, breaks, employeeName, date }) => {
  if (!isOpen) return null;

  const list = Array.isArray(breaks) ? breaks : [];

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Break History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {employeeName || "Employee"}
              {date ? ` • ${formatDateLabel(date)}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {list.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-coffee text-2xl"></i>
              </div>
              <p>No breaks recorded for this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((item, index) => {
                const b = item?.break || item;
                return (
                  <div
                    key={b?.id || index}
                    className="flex flex-wrap justify-between items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {formatTime(b?.start_time)}
                        <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                        {b?.end_time ? formatTime(b.end_time) : "Ongoing"}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {b?.duration_minutes ? `${b.duration_minutes} mins` : "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AttendanceReport = () => {
  const dispatch = useDispatch();
  const {
    attendanceRecords: records = [],
    attendanceLoading: loading = false,
    attendanceTotalCount: totalCount = 0,
    attendanceLastPage: lastPage = 1,
    exportLoading = false,
    employeesList = [],
  } = useSelector((state) => state.reports || {});

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [datePreset, setDatePreset] = useState("this_month");
  const [exportType, setExportType] = useState("current");

  // State for break viewer
  const [selectedBreakRecord, setSelectedBreakRecord] = useState(null);

  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedEmployeeFilter, setAppliedEmployeeFilter] = useState("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [tableKey, setTableKey] = useState(0);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    dispatch(fetchEmployeesForFilter());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        page: currentPage,
        per_page: perPage,
        company: companyFilter !== "all" ? companyFilter : undefined,
        employee_id:
          appliedEmployeeFilter !== "all" ? appliedEmployeeFilter : undefined,
        search: appliedSearchTerm || undefined,
        start_date: appliedStartDate || startDate,
        end_date: appliedEndDate || endDate,
      };

      await dispatch(fetchAttendanceReport(params));
    };
    fetchData();
  }, [
    dispatch,
    currentPage,
    perPage,
    companyFilter,
    appliedEmployeeFilter,
    appliedSearchTerm,
    appliedStartDate,
    appliedEndDate,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    appliedEmployeeFilter,
    appliedSearchTerm,
    perPage,
    appliedStartDate,
    appliedEndDate,
  ]);

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

  const hasOvertime = (record) => {
    if (
      record.is_overtime === "Yes" ||
      record.is_overtime === true ||
      record.is_overtime === 1
    ) {
      return true;
    }
    if (
      record.overtime &&
      record.overtime !== "-" &&
      record.overtime !== "0" &&
      record.overtime !== 0
    ) {
      return true;
    }
    return false;
  };

  const getOvertimeDisplay = (record) => {
    if (
      record.is_overtime === "Yes" ||
      record.is_overtime === true ||
      record.is_overtime === 1
    ) {
      if (
        record.overtime &&
        record.overtime !== "-" &&
        record.overtime !== "0"
      ) {
        return record.overtime;
      }
      return "Yes";
    }
    if (
      record.overtime &&
      record.overtime !== "-" &&
      record.overtime !== "0" &&
      record.overtime !== 0
    ) {
      return record.overtime;
    }
    return "-";
  };

  const getIsOvertimeDisplay = (record) => {
    if (
      record.is_overtime === "Yes" ||
      record.is_overtime === true ||
      record.is_overtime === 1
    ) {
      return "Yes";
    }
    return "No";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }
      }

      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const date = new Date(parts[2], parts[1] - 1, parts[0]);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }
      }

      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (time) => {
    if (!time || time === "-") return "-";
    return time;
  };

  const formatWorkedHours = (hours) => {
    if (!hours || hours === 0 || hours === "0" || hours === "-") return "-";
    const numHours = typeof hours === "string" ? parseFloat(hours) : hours;
    if (isNaN(numHours) || numHours === 0) return "-";
    const h = Math.floor(numHours);
    const m = Math.round((numHours - h) * 60);
    if (h === 0) return `${m} mins`;
    if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
    return `${h} hr${h > 1 ? "s" : ""} ${m} min${m > 1 ? "s" : ""}`;
  };

  const getStatusBadge = (status, hasOT) => {
    const statusLower = String(status || "").toLowerCase();

    const statusConfigs = {
      present: {
        bg: hasOT
          ? "bg-emerald-100 dark:bg-emerald-900/30"
          : "bg-green-100 dark:bg-green-900/30",
        text: hasOT
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-green-700 dark:text-green-400",
        icon: hasOT ? "fa-star" : "fa-check-circle",
        label: hasOT ? "Present + OT" : "Present",
      },
      absent: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: "fa-user-slash",
        label: "Absent",
      },
      late: {
        bg: hasOT
          ? "bg-amber-100 dark:bg-amber-900/30"
          : "bg-yellow-100 dark:bg-yellow-900/30",
        text: hasOT
          ? "text-amber-700 dark:text-amber-400"
          : "text-yellow-700 dark:text-yellow-400",
        icon: hasOT ? "fa-star" : "fa-clock",
        label: hasOT ? "Late + OT" : "Late",
      },
      "half day": {
        bg: hasOT
          ? "bg-indigo-100 dark:bg-indigo-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
        text: hasOT
          ? "text-indigo-700 dark:text-indigo-400"
          : "text-blue-700 dark:text-blue-400",
        icon: hasOT ? "fa-star" : "fa-hourglass-half",
        label: hasOT ? "Half Day + OT" : "Half Day",
      },
      halfday: {
        bg: hasOT
          ? "bg-indigo-100 dark:bg-indigo-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
        text: hasOT
          ? "text-indigo-700 dark:text-indigo-400"
          : "text-blue-700 dark:text-blue-400",
        icon: hasOT ? "fa-star" : "fa-hourglass-half",
        label: hasOT ? "Half Day + OT" : "Half Day",
      },
      "full day": {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: "fa-check-double",
        label: hasOT ? "Full Day + OT" : "Full Day",
      },
      fullday: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: hasOT ? "fa-star" : "fa-check-double",
        label: hasOT ? "Full Day + OT" : "Full Day",
      },
      holiday: {
        bg: "bg-pink-100 dark:bg-pink-900/30",
        text: "text-pink-700 dark:text-pink-400",
        icon: "fa-calendar-day",
        label: "Holiday",
      },
      leave: {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-700 dark:text-indigo-400",
        icon: "fa-umbrella-beach",
        label: "Leave",
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: "fa-spinner",
        label: "Pending",
      },
    };

    const config = statusConfigs[statusLower] || {
      bg: "bg-gray-100 dark:bg-gray-700/30",
      text: "text-gray-700 dark:text-gray-400",
      icon: "fa-circle",
      label: status || "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <i className={`fas ${config.icon} text-[10px]`}></i>
        {config.label}
      </span>
    );
  };

  const allRecords = records || [];
  const totalPresent = allRecords.filter(
    (r) => r.status !== "Absent" && r.status !== "absent",
  ).length;
  const totalHalfDay = allRecords.filter((r) => {
    const status = String(r.status || "").toLowerCase();
    return status === "half day" || status === "halfday";
  }).length;
  const totalAbsent = allRecords.filter(
    (r) => r.status === "Absent" || r.status === "absent",
  ).length;
  const totalOvertime = allRecords.filter((r) => hasOvertime(r)).length;

  const filteredRecords = records || [];
  const totalFiltered = totalCount || filteredRecords.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;

  const handleApplyFilters = () => {
    setAppliedEmployeeFilter(employeeFilter);
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
    setTableKey((prev) => prev + 1);
    showToast("Filters applied successfully", "success");
  };

  const handleResetFilters = () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const newStartDate = firstDayOfMonth.toISOString().split("T")[0];
    const newEndDate = new Date().toISOString().split("T")[0];

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setCompanyFilter("all");
    setEmployeeFilter("all");
    setSearchTerm("");
    setDatePreset("this_month");
    setCurrentPage(1);
    setTableKey((prev) => prev + 1);

    setAppliedEmployeeFilter("all");
    setAppliedSearchTerm("");
    setAppliedStartDate(newStartDate);
    setAppliedEndDate(newEndDate);

    showToast("Filters reset successfully", "success");
  };

  const handleExport = async (format) => {
    const params = {
      format: format,
      date_range: datePreset,
    };

    if (datePreset === "custom") {
      params.from_date = appliedStartDate || startDate;
      params.to_date = appliedEndDate || endDate;
    }

    if (companyFilter && companyFilter !== "all") {
      params.company_id = companyFilter;
    }
    if (appliedEmployeeFilter && appliedEmployeeFilter !== "all") {
      params.employee_id = appliedEmployeeFilter;
    }
    if (appliedSearchTerm) {
      params.search = appliedSearchTerm;
    }

    const result = await dispatch(exportAttendanceReport(params));

    if (exportAttendanceReport.fulfilled.match(result)) {
      const { url, filename } = result.payload;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      showToast(`Attendance report exported successfully!`, "success");
    } else {
      showToast(result.payload || "Failed to export report", "error");
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
            <Link
              to="/admin/reports"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Reports
            </Link>
            <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
            <span className="text-gray-500">Attendance Report</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
            Attendance Report
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed attendance logs with punch in/out times, duration, and
            overtime
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            key={tableKey}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalFiltered}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-check text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Present
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalPresent}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-check text-green-600 dark:text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Half Day
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {totalHalfDay}
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
                  Absent
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {totalAbsent}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-slash text-red-600 dark:text-red-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Overtime
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalOvertime}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-emerald-600 dark:text-emerald-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-clock mr-1"></i> DATE RANGE
              </label>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="custom">Custom Range</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>

            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-calendar-alt mr-1"></i> START
              </label>
              <DateInput
                value={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="dd/mm/yyyy"
                type="general"
              />
            </div>

            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-calendar-alt mr-1"></i> END
              </label>
              <DateInput
                value={endDate}
                onChange={(date) => setEndDate(date)}
                placeholder="dd/mm/yyyy"
                type="general"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-user mr-1"></i> EMPLOYEE
              </label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Employees</option>
                {Array.isArray(employeesList) &&
                  employeesList.map((employee) => (
                    <option key={employee.id} value={String(employee.id)}>
                      {employee.name || `Employee ${employee.id}`}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
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
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
            >
              <option value="current">Export Current Page</option>
              <option value="all">Export All Data</option>
            </select>

            <button
              onClick={() => setShowExportModal(true)}
              disabled={exportLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Exporting...
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
        {loading && filteredRecords.length === 0 ? (
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
              <div className="min-w-[1000px] md:min-w-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        S.No
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        DATE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        EMPLOYEE
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        DEPARTMENT
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        PUNCH IN
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        PUNCH OUT
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-amber-600 dark:text-amber-400">
                        BREAKS
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        WORKED HOURS
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        OVERTIME
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        IS OVERTIME
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, idx) => {
                        const hasOT = hasOvertime(record);
                        const isLate = record.lateBy && record.lateBy > 0;
                        const overtimeDisplay = getOvertimeDisplay(record);
                        const isOvertimeDisplay = getIsOvertimeDisplay(record);

                        const breaks = Array.isArray(record.breaks)
                          ? record.breaks
                          : [];

                        return (
                          <tr
                            key={record.id || idx}
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                              hasOT
                                ? "bg-emerald-50/30 dark:bg-emerald-900/10"
                                : ""
                            }`}
                          >
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {start + idx + 1}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {record.employeeName || record.name || "-"}
                              {hasOT && (
                                <span className="ml-1 text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                                  OT
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {record.department || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              <span
                                className={`font-semibold ${
                                  isLate
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {formatTime(record.punch_in || record.punchIn)}
                              </span>
                              {isLate && (
                                <span className="ml-1 text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                  Late
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {record.punch_out || record.punchOut ? (
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {formatTime(
                                    record.punch_out || record.punchOut,
                                  )}
                                </span>
                              ) : (
                                <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Not Punched Out
                                </span>
                              )}
                            </td>

                            {/* Breaks cell — only interactive if there are breaks */}
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {breaks.length > 0 ? (
                                <button
                                  onClick={() => setSelectedBreakRecord(record)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-[10px] md:text-xs font-semibold"
                                  title="View break details"
                                >
                                  <i className="fas fa-coffee text-[10px]"></i>
                                  View
                                  <span className="bg-amber-500 text-white text-[9px] rounded-full min-w-[14px] h-[14px] px-1 flex items-center justify-center">
                                    {breaks.length}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                                  —
                                </span>
                              )}
                            </td>

                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {record.worked_hours !== undefined &&
                              record.worked_hours !== null &&
                              record.worked_hours !== 0 &&
                              record.worked_hours !== "0" &&
                              record.worked_hours !== "-" ? (
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {formatWorkedHours(record.worked_hours)}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {overtimeDisplay !== "-" ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  {overtimeDisplay}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {isOvertimeDisplay === "Yes" ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  <i className="fas fa-check-circle text-[10px]"></i>
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              {getStatusBadge(
                                record.attendance_status || record.status,
                                hasOT,
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="11"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <i className="fas fa-calendar-times text-4xl text-gray-300 dark:text-gray-600"></i>
                            <p>No attendance records found</p>
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
        onClose={() => {
          if (!exportLoading) {
            setShowExportModal(false);
          }
        }}
        onExport={handleExport}
        title="Export Attendance Report"
        totalRecords={exportType === "all" ? totalCount : records.length}
        formats={["csv", "pdf"]}
        defaultFormat="csv"
        loading={exportLoading}
        subtitle={
          exportType === "all"
            ? `Exporting all ${totalCount} records across all pages`
            : `Exporting ${records.length} records from current page`
        }
      />

      {/* Inline Break Viewer */}
      <BreakViewerModal
        isOpen={!!selectedBreakRecord}
        onClose={() => setSelectedBreakRecord(null)}
        breaks={selectedBreakRecord?.breaks || []}
        employeeName={
          selectedBreakRecord?.employeeName || selectedBreakRecord?.name
        }
        date={selectedBreakRecord?.date}
      />
    </div>
  );
};

export default AttendanceReport;
