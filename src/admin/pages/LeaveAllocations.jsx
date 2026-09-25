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

  // ── Collect all distinct leave-type names from the allocations ──
  // Preserves the order they first appear in the API response (e.g. Annual Leave, Loss Of Pay)
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

  // Pick the tint color per leave type. Falls back to a neutral tint.
  const getLeaveTypeTint = (leaveTypeName = "") => {
    const key = leaveTypeName.toLowerCase();

    // Loss of pay / unpaid → light red
    if (key.includes("loss") || key.includes("unpaid")) {
      return {
        header: "bg-red-50 dark:bg-red-900/20",
        cell: "bg-red-50/40 dark:bg-red-900/10",
        border: "border-l border-red-100 dark:border-red-900/40",
      };
    }

    // Annual leave (and any other "regular" leave) → amber
    return {
      header: "bg-amber-50 dark:bg-amber-900/20",
      cell: "",
      border: "border-l border-gray-200 dark:border-gray-700",
    };
  };

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
  //   # + Employee + (3 per leave type) + Action
  const totalCols = 3 + leaveTypeColumns.length * 3;

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
            <colgroup>
              <col className="w-[5%]" /> {/* # */}
              <col className="w-[35%]" /> {/* Employee */}
              {leaveTypeColumns.map((lt) => (
                <React.Fragment key={lt}>
                  <col className="w-[10%]" /> {/* Alloc */}
                  <col className="w-[8%]" /> {/* Used */}
                  <col className="w-[8%]" /> {/* Bal */}
                </React.Fragment>
              ))}
              <col className="w-[5%]" /> {/* Action */}
            </colgroup>
            <thead>
              {/* Row 1 — leave type names (colspan 3 each) */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-12"></th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400"></th>

                {leaveTypeColumns.map((lt) => {
                  const tint = getLeaveTypeTint(lt);
                  return (
                    <th
                      key={lt}
                      colSpan={3}
                      className={`px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 ${tint.header} ${tint.border}`}
                    >
                      {lt}
                    </th>
                  );
                })}

                <th className="px-3 py-2 w-12"></th>
              </tr>

              {/* Row 2 — Alloc | Used | Bal sub-headers */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap w-12">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Employee
                </th>

                {leaveTypeColumns.map((lt) => {
                  const tint = getLeaveTypeTint(lt);
                  return (
                    <React.Fragment key={lt}>
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${tint.header} ${tint.border} w-16`}
                      >
                        Alloc
                      </th>
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${tint.header} w-16`}
                      >
                        Used
                      </th>
                      <th
                        className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 ${tint.header} w-16`}
                      >
                        Bal
                      </th>
                    </React.Fragment>
                  );
                })}

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
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {employee.name}
                          </span>
                        </div>
                      </td>

                      {/* One 3-cell group per leave type */}
                      {leaveTypeColumns.map((lt) => {
                        const tint = getLeaveTypeTint(lt);
                        const alloc = getLeaveTypeValue(employee, lt, "alloc");
                        const used = getLeaveTypeValue(employee, lt, "used");
                        const bal = getLeaveTypeValue(employee, lt, "bal");

                        return (
                          <React.Fragment key={lt}>
                            <td
                              className={`px-2 py-2 text-center ${tint.cell} ${tint.border}`}
                            >
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatNumber(alloc)}
                              </span>
                            </td>
                            <td
                              className={`px-2 py-2 text-center ${tint.cell}`}
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatNumber(used)}
                              </span>
                            </td>
                            <td
                              className={`px-2 py-2 text-center ${tint.cell}`}
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
                          </React.Fragment>
                        );
                      })}

                      <td className="px-3 py-2 text-center">
                        <Link
                          to={`/admin/leaves/allocations/${employee.id}`}
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
