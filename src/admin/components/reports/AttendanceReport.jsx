import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../common/Toast";
import Pagination from "../common/Paginations";
import { fetchAttendanceRecords } from "../../store/slices/attendanceSlice";

const AttendanceReport = () => {
  const dispatch = useDispatch();
  const {
    records = [],
    loading,
    totalCount,
    lastPage,
  } = useSelector((state) => state.attendance || {});

  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch attendance data with filters
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchAttendanceRecords({
          page: currentPage,
          per_page: perPage,
          company: companyFilter !== "all" ? companyFilter : undefined,
          search: searchTerm || undefined,
          start_date: startDate,
          end_date: endDate,
        }),
      );
    };
    fetchData();
  }, [
    dispatch,
    currentPage,
    perPage,
    companyFilter,
    searchTerm,
    startDate,
    endDate,
  ]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    showToast("Filters applied successfully", "success");
  };

  const handleResetFilters = () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setCompanyFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
    showToast("Filters reset successfully", "success");
  };

  const handleExport = () => {
    if (!records || records.length === 0) {
      showToast("No data to export", "warning");
      return;
    }

    try {
      const headers = [
        "Date",
        "Employee",
        "Department",
        "Punch In",
        "Punch Out",
        "Duration",
        "Status",
        "Late By",
      ];

      const rows = records.map((record) => [
        record.date || "-",
        record.employeeName || "-",
        record.department || "-",
        record.punchIn || "-",
        record.punchOut || "-",
        record.duration || "-",
        record.status || "Present",
        record.lateBy ? `${record.lateBy} mins` : "-",
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
        `attendance_report_${startDate}_to_${endDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Attendance report exported successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export data", "error");
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return time;
  };

  const getStatusBadge = (status, lateBy) => {
    if (lateBy && lateBy > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <i className="fas fa-clock text-amber-500 text-[10px]"></i>
          Late
        </span>
      );
    }
    if (status === "Absent") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <i className="fas fa-user-slash text-red-500 text-[10px]"></i>
          Absent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <i className="fas fa-check-circle text-green-500 text-[10px]"></i>
        Present
      </span>
    );
  };

  const filteredRecords = records || [];
  const totalFiltered = totalCount || filteredRecords.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;

  // Get unique companies for filter
  const uniqueCompanies = [
    ...new Set((records || []).map((record) => record.company).filter(Boolean)),
  ];

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
              <span className="text-gray-500">Attendance Report</span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
              Attendance Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detailed attendance logs with punch in/out times and duration
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  <i className="fas fa-calendar-alt mr-1"></i> START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  <i className="fas fa-calendar-alt mr-1"></i> END DATE
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                />
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

          {/* Additional Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
            >
              <option value="all">All Companies</option>
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
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
                placeholder="Search by employee name..."
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
                <div className="min-w-[800px] md:min-w-0">
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
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                          DURATION
                        </th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                          STATUS
                        </th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                          LATECOMER
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, idx) => (
                          <tr
                            key={record.id || idx}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {start + idx + 1}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {record.date || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {record.employeeName || record.name || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {record.department || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {formatTime(record.punchIn)}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {record.punchOut ? (
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {formatTime(record.punchOut)}
                                </span>
                              ) : (
                                <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Not Punched Out
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {record.duration || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              {getStatusBadge(record.status, record.lateBy)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {record.lateBy ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {record.lateBy} min
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
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
      </div>
    </div>
  );
};

export default AttendanceReport;
