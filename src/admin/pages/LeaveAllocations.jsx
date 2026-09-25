import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import Pagination from "@admin/components/common/Paginations";
import {
  fetchLeaveTypes,
  fetchAllLeaveAllocations,
} from "@admin/store/slices/LeaveSlice";

// ── Helpers (outside the component — stable, no deps) ──

// Decide the tint and which sub-columns each leave type shows.
//   Annual Leave (and most types) → Alloc / Used / Bal   (amber tint)
//   Loss Of Pay / Unpaid         → Used only              (light red tint)
const getLeaveTypeConfig = (leaveTypeName = "") => {
  const key = String(leaveTypeName).toLowerCase();

  if (key.includes("loss") || key.includes("unpaid")) {
    return {
      columns: ["used"],
      header: "bg-red-50 dark:bg-red-900/20",
      cell: "bg-red-50/40 dark:bg-red-900/10",
      border: "border-l border-red-100 dark:border-red-900/40",
    };
  }

  return {
    columns: ["alloc", "used", "bal"],
    header: "bg-amber-50 dark:bg-amber-900/20",
    cell: "",
    border: "border-l border-gray-200 dark:border-gray-700",
  };
};

const LeaveAllocations = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const basePath = location.pathname.split("/")[1] || "admin";

  const { allAllocations = [] } = useSelector((state) => state.leaves || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchLeaveTypes()),
        dispatch(fetchAllLeaveAllocations()),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  // ── Build the employee list from allocations ──
  const allocationEmployees = useMemo(() => {
    if (!Array.isArray(allAllocations)) return [];

    return allAllocations
      .map((item, idx) => ({
        id: item.employee_id ?? item.id ?? idx,
        name: (item.employee_name || "").trim() || "Unnamed",
        avatar: item.avatar || null,
        leave_types: Array.isArray(item.leave_types) ? item.leave_types : [],
      }))
      .filter((e) => e.name);
  }, [allAllocations]);

  // ── Collect all distinct leave-type names (preserving API order) ──
  const leaveTypeColumns = useMemo(() => {
    const seen = new Set();
    const cols = [];
    allocationEmployees.forEach((emp) => {
      emp.leave_types.forEach((lt) => {
        const key = lt.leave_type;
        if (key && !seen.has(key)) {
          seen.add(key);
          cols.push(key);
        }
      });
    });
    return cols;
  }, [allocationEmployees]);

  // ── Per-type config (tint + which sub-columns to render) ──
  const leaveTypeConfigs = useMemo(
    () =>
      leaveTypeColumns.map((lt) => ({
        name: lt,
        ...getLeaveTypeConfig(lt),
      })),
    [leaveTypeColumns],
  );

  const getFilteredEmployees = () => {
    let filtered = [...allocationEmployees];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(s));
    }
    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();
  const totalFiltered = filteredEmployees.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const pageEmployees = filteredEmployees.slice(start, start + perPage);

  // ── Read a specific leave-type's value for an employee ──
  const getLeaveTypeValue = (employee, leaveTypeName, field) => {
    const entry = employee.leave_types.find(
      (lt) => lt.leave_type === leaveTypeName,
    );
    if (!entry) return 0;

    const allocated = parseFloat(entry.allocated) || 0;
    const used = parseFloat(entry.used) || 0;
    const balance =
      entry.balance != null ? parseFloat(entry.balance) : allocated - used;

    if (field === "alloc") return allocated;
    if (field === "used") return used;
    if (field === "bal") return balance;
    return 0;
  };

  const formatNumber = (value) => value ?? 0;

  const getEmployeePhoto = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http") || avatarPath.startsWith("data:")) {
      return avatarPath;
    }
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      window.location.origin;
    if (avatarPath.startsWith("/storage/")) return `${baseUrl}${avatarPath}`;
    return `${baseUrl}/storage/${avatarPath.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Total number of table columns:
  //   # + Employee + (dynamic count per leave type) + Action
  const totalCols =
    3 + leaveTypeConfigs.reduce((sum, cfg) => sum + cfg.columns.length, 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/admin/leaves"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Leaves
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">
          Leave Allocations
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Leave Allocations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Employee Leave Balances ({new Date().getFullYear()})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/${basePath}/leaves/leave-policies`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <i className="fas fa-shield-halved"></i>
            Leave Policy
          </Link>

          <Link
            to={`/${basePath}/leaves`}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Requests
          </Link>
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
        </div>
      </div>

      {/* Leave Allocations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[800px]">
          <table className="w-full table-fixed border-collapse">
            {/* Colgroup matches the dynamic column count per type */}
            <colgroup>
              <col className="w-[5%]" /> {/* # */}
              <col className="w-[35%]" /> {/* Employee */}
              {leaveTypeConfigs.map((cfg) => (
                <React.Fragment key={cfg.name}>
                  {cfg.columns.includes("alloc") && <col className="w-[10%]" />}
                  {cfg.columns.includes("used") && <col className="w-[8%]" />}
                  {cfg.columns.includes("bal") && <col className="w-[8%]" />}
                </React.Fragment>
              ))}
              <col className="w-[5%]" /> {/* Action */}
            </colgroup>

            <thead>
              {/* Row 1 — leave type names (colspan = columns.length) */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-12"></th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400"></th>

                {leaveTypeConfigs.map((cfg) => (
                  <th
                    key={cfg.name}
                    colSpan={cfg.columns.length}
                    className={`px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 ${cfg.header} ${cfg.border}`}
                  >
                    {cfg.name}
                  </th>
                ))}

                <th className="px-3 py-2 w-12"></th>
              </tr>

              {/* Row 2 — dynamic sub-headers per type */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap w-12">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Employee
                </th>

                {leaveTypeConfigs.map((cfg) => (
                  <React.Fragment key={cfg.name}>
                    {cfg.columns.includes("alloc") && (
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${cfg.header} ${cfg.border} w-16`}
                      >
                        Alloc
                      </th>
                    )}
                    {cfg.columns.includes("used") && (
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${cfg.header} w-16`}
                      >
                        Used
                      </th>
                    )}
                    {cfg.columns.includes("bal") && (
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${cfg.header} w-16`}
                      >
                        Bal
                      </th>
                    )}
                  </React.Fragment>
                ))}

                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap w-12">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {pageEmployees.length > 0 ? (
                pageEmployees.map((employee, idx) => {
                  const photoUrl = getEmployeePhoto(employee.avatar);

                  return (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                        {start + idx + 1}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={employee.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.querySelector(
                                  ".fallback-avatar",
                                ).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="fallback-avatar w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ display: photoUrl ? "none" : "flex" }}
                          >
                            {employee.name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {employee.name}
                          </span>
                        </div>
                      </td>

                      {/* Dynamic cell group per leave type */}
                      {leaveTypeConfigs.map((cfg) => {
                        const alloc = getLeaveTypeValue(
                          employee,
                          cfg.name,
                          "alloc",
                        );
                        const used = getLeaveTypeValue(
                          employee,
                          cfg.name,
                          "used",
                        );
                        const bal = getLeaveTypeValue(
                          employee,
                          cfg.name,
                          "bal",
                        );

                        return (
                          <React.Fragment key={cfg.name}>
                            {cfg.columns.includes("alloc") && (
                              <td
                                className={`px-2 py-2 text-center ${cfg.cell} ${cfg.border}`}
                              >
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatNumber(alloc)}
                                </span>
                              </td>
                            )}
                            {cfg.columns.includes("used") && (
                              <td
                                className={`px-2 py-2 text-center ${cfg.cell}`}
                              >
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatNumber(used)}
                                </span>
                              </td>
                            )}
                            {cfg.columns.includes("bal") && (
                              <td
                                className={`px-2 py-2 text-center ${cfg.cell}`}
                              >
                                <span
                                  className={`text-sm font-semibold ${
                                    bal < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {formatNumber(bal)}
                                </span>
                              </td>
                            )}
                          </React.Fragment>
                        );
                      })}

                      <td className="px-3 py-2 text-center">
                        <Link
                          to={`/${basePath}/leaves/allocations/${employee.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors inline-block"
                          title="View Allocations"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={totalCols}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No employees found
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
    </div>
  );
};

export default LeaveAllocations;