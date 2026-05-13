import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import Pagination from "@admin/components/common/Paginations";
import { showToast } from "../../components/common/Toast";
import { fetchEmployees } from "@admin/store/slices/employeeSlice";
import {
  fetchLeaveTypes,
  updateLeaveAllocation,
} from "@admin/store/slices/LeaveSlice";

const LeaveAllocations = () => {
  const dispatch = useDispatch();
  const { employees = [] } = useSelector((state) => state.employees || {});
  const { leaveTypes = [] } = useSelector((state) => state.leaves || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [, setLoading] = useState(false);
  const [, setEditingCell] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  const getFilteredEmployees = () => {
    let filtered = [...employees];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          (emp.name || "").toLowerCase().includes(searchLower) ||
          (emp.designation?.name || "").toLowerCase().includes(searchLower) ||
          (emp.company?.company_name || "").toLowerCase().includes(searchLower),
      );
    }
    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();
  const totalFiltered = filteredEmployees.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageEmployees = filteredEmployees.slice(start, start + perPage);

  // Get leave types for columns
  // eslint-disable-next-line no-unused-vars
  const leaveTypeColumns = leaveTypes.filter((type) =>
    ["Sick Leave", "Casual Leave", "Annual Leave"].includes(type.name),
  );

  const getAllocationValue = (employee, leaveTypeName, field) => {
    const allocation = employee.leave_allocations?.find(
      (a) =>
        a.leave_type?.name === leaveTypeName ||
        a.leave_type_name === leaveTypeName,
    );
    if (!allocation) return 0;
    if (field === "alloc") return allocation.allocated || 0;
    if (field === "used") return allocation.used || 0;
    if (field === "bal")
      return (allocation.allocated || 0) - (allocation.used || 0);
    return 0;
  };

  // eslint-disable-next-line no-unused-vars
  const handleAllocationChange = async (
    employeeId,
    leaveTypeName,
    field,
    value,
  ) => {
    const numericValue = parseInt(value) || 0;
    if (numericValue < 0) {
      showToast("Value cannot be negative", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        updateLeaveAllocation({
          employee_id: employeeId,
          leave_type: leaveTypeName,
          allocated: numericValue,
        }),
      );

      if (updateLeaveAllocation.fulfilled.match(result)) {
        showToast("Leave allocation updated successfully", "success");
        dispatch(fetchEmployees()); // Refresh data
      } else {
        showToast(result.payload || "Failed to update allocation", "error");
      }
    } catch (error) {
      showToast("An error occurred", error);
    } finally {
      setLoading(false);
      setEditingCell(null);
    }
  };

  const formatNumber = (value) => {
    return value || 0;
  };

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
        <Link
          to="/admin/leaves"
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Requests
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={setPerPage} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by employee, designation, company..."
          />
        </div>
      </div>

      {/* Leave Allocations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[1200px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Sl.No.
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Employee
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Designation
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Company
                </th>

                {/* Sick Leave Column */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-green-50 dark:bg-green-900/20">
                  Sick Leave
                </th>

                {/* Casual Leave Column */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-blue-50 dark:bg-blue-900/20">
                  Casual Leave
                </th>

                {/* Annual Leave Column */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-amber-50 dark:bg-amber-900/20">
                  Annual Leave
                </th>

                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Action
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th colSpan="4" className="px-3 md:px-4 py-1"></th>
                <th className="px-3 md:px-4 py-1 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center gap-2">
                    <span>Alloc</span>
                    <span>|</span>
                    <span>Used</span>
                    <span>|</span>
                    <span>Bal</span>
                  </div>
                </th>
                <th className="px-3 md:px-4 py-1 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center gap-2">
                    <span>Alloc</span>
                    <span>|</span>
                    <span>Used</span>
                    <span>|</span>
                    <span>Bal</span>
                  </div>
                </th>
                <th className="px-3 md:px-4 py-1 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center gap-2">
                    <span>Alloc</span>
                    <span>|</span>
                    <span>Used</span>
                    <span>|</span>
                    <span>Bal</span>
                  </div>
                </th>
                <th className="px-3 md:px-4 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {pageEmployees.length > 0 ? (
                pageEmployees.map((employee, idx) => {
                  const sickAlloc = getAllocationValue(
                    employee,
                    "Sick Leave",
                    "alloc",
                  );
                  const sickUsed = getAllocationValue(
                    employee,
                    "Sick Leave",
                    "used",
                  );
                  const sickBal = sickAlloc - sickUsed;

                  const casualAlloc = getAllocationValue(
                    employee,
                    "Casual Leave",
                    "alloc",
                  );
                  const casualUsed = getAllocationValue(
                    employee,
                    "Casual Leave",
                    "used",
                  );
                  const casualBal = casualAlloc - casualUsed;

                  const annualAlloc = getAllocationValue(
                    employee,
                    "Annual Leave",
                    "alloc",
                  );
                  const annualUsed = getAllocationValue(
                    employee,
                    "Annual Leave",
                    "used",
                  );
                  const annualBal = annualAlloc - annualUsed;

                  return (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                        {start + idx + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {employee.name}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {employee.designation?.name || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {employee.company?.company_name || "-"}
                      </td>

                      {/* Sick Leave Values */}
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 min-w-[30px] text-center">
                            {formatNumber(sickAlloc)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 min-w-[30px] text-center">
                            {formatNumber(sickUsed)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span
                            className={`text-xs md:text-sm font-semibold min-w-[30px] text-center ${sickBal < 0 ? "text-red-600" : "text-blue-600"}`}
                          >
                            {formatNumber(sickBal)}
                          </span>
                        </div>
                      </td>

                      {/* Casual Leave Values */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 min-w-[30px] text-center">
                            {formatNumber(casualAlloc)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 min-w-[30px] text-center">
                            {formatNumber(casualUsed)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span
                            className={`text-xs md:text-sm font-semibold min-w-[30px] text-center ${casualBal < 0 ? "text-red-600" : "text-blue-600"}`}
                          >
                            {formatNumber(casualBal)}
                          </span>
                        </div>
                      </td>

                      {/* Annual Leave Values */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 min-w-[30px] text-center">
                            {formatNumber(annualAlloc)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 min-w-[30px] text-center">
                            {formatNumber(annualUsed)}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span
                            className={`text-xs md:text-sm font-semibold min-w-[30px] text-center ${annualBal < 0 ? "text-red-600" : "text-blue-600"}`}
                          >
                            {formatNumber(annualBal)}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <Link
                          to={`/admin/leaves/allocations/${employee.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors inline-block"
                          title="Edit Allocations"
                        >
                          <i className="fas fa-edit text-xs md:text-sm"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
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
