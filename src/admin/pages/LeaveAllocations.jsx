import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import Pagination from "@admin/components/common/Paginations";
import { fetchEmployees } from "@admin/store/slices/employeeSlice";
import {
  fetchLeaveTypes,
  fetchLeaveBalances,
} from "@admin/store/slices/LeaveSlice";

const LeaveAllocations = () => {
  const dispatch = useDispatch();
  const { employees = [] } = useSelector((state) => state.employees || {});
  const { leaveTypes = [] } = useSelector((state) => state.leaves || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(fetchEmployees());
      await dispatch(fetchLeaveTypes());
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  // Fetch leave balances for each employee
  useEffect(() => {
    const fetchAllBalances = async () => {
      if (employees.length > 0 && leaveTypes.length > 0) {
        setLoading(true);
        const balances = {};
        for (const employee of employees) {
          try {
            const result = await dispatch(fetchLeaveBalances({ employee_id: employee.id })).unwrap();
            console.log(`Balances for employee ${employee.id}:`, result);
            
            if (result && result.allocations) {
              const allocationsArray = Object.values(result.allocations);
              balances[employee.id] = allocationsArray;
            } else if (result && Array.isArray(result)) {
              balances[employee.id] = result;
            } else if (result && result.data && Array.isArray(result.data)) {
              balances[employee.id] = result.data;
            } else {
              balances[employee.id] = [];
            }
          } catch (error) {
            console.error(`Failed to fetch balances for employee ${employee.id}:`, error);
            balances[employee.id] = [];
          }
        }
        setLeaveBalances(balances);
        setLoading(false);
      }
    };
    fetchAllBalances();
  }, [dispatch, employees, leaveTypes]);

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

  const getLeaveTypeId = (leaveTypeName) => {
    const leaveType = leaveTypes.find(type => type.name === leaveTypeName);
    return leaveType?.id;
  };

  const getAllocationValue = (employeeId, leaveTypeName, field) => {
    const leaveTypeId = getLeaveTypeId(leaveTypeName);
    const balances = leaveBalances[employeeId];
    
    if (!balances || !Array.isArray(balances) || !leaveTypeId) return 0;
    
    const allocation = balances.find(a => a.leave_type_id === leaveTypeId);
    
    if (!allocation) return 0;
    
    const allocatedDays = parseFloat(allocation.allocated_days) || 0;
    const usedDays = parseFloat(allocation.used) || 0;
    
    if (field === "alloc") return allocatedDays;
    if (field === "used") return usedDays;
    if (field === "bal") return allocatedDays - usedDays;
    return 0;
  };

  const formatNumber = (value) => {
    return value || 0;
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
            placeholder="Search by employee..."
          />
        </div>
      </div>

      {/* Leave Allocations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[800px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap w-12">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Employee
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-amber-50 dark:bg-amber-900/20">
                  <div>Annual Leave</div>
                  <div className="flex justify-center gap-1.5 mt-0.5 text-[9px] text-gray-400">
                    <span>Alloc</span>
                    <span className="text-gray-300">|</span>
                    <span>Used</span>
                    <span className="text-gray-300">|</span>
                    <span>Bal</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap w-12">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageEmployees.length > 0 ? (
                pageEmployees.map((employee, idx) => {
                  const getEmployeePhoto = () => {
                    const photoValue =
                      employee.avatar ||
                      employee.avatar_path ||
                      employee.passport_size_photo ||
                      employee.profile_photo ||
                      employee.photo ||
                      employee.user?.avatar;

                    if (!photoValue) return null;

                    if (typeof photoValue === "object" && photoValue.path) {
                      const baseUrl =
                        import.meta.env.VITE_API_URL?.replace("/api", "") || "";
                      return `${baseUrl}/storage/${photoValue.path}`;
                    }

                    if (typeof photoValue === "string") {
                      if (photoValue.startsWith("/tmp/")) {
                        const baseUrl =
                          import.meta.env.VITE_API_URL?.replace("/api", "") ||
                          "";
                        return `${baseUrl}/storage/temp/${photoValue.replace("/tmp/", "")}`;
                      }
                      if (photoValue.startsWith("data:")) return photoValue;
                      if (photoValue.startsWith("http")) return photoValue;

                      const baseUrl =
                        import.meta.env.VITE_API_URL?.replace("/api", "") || "";
                      if (photoValue.startsWith("/storage/"))
                        return `${baseUrl}${photoValue}`;
                      return `${baseUrl}/storage/${photoValue}`;
                    }

                    return null;
                  };

                  const photoUrl = getEmployeePhoto();

                  const annualAlloc = getAllocationValue(
                    employee.id,
                    "Annual Leave",
                    "alloc",
                  );
                  const annualUsed = getAllocationValue(
                    employee.id,
                    "Annual Leave",
                    "used",
                  );
                  const annualBal = annualAlloc - annualUsed;

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
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                            {employee.name}
                          </span>
                        </div>
                      </td>

                      {/* Annual Leave Values */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400 min-w-[28px] text-center">
                            {formatNumber(annualAlloc)}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[28px] text-center">
                            {formatNumber(annualUsed)}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <span
                            className={`text-sm font-semibold min-w-[28px] text-center ${
                              annualBal < 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {formatNumber(annualBal)}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Link
                          to={`/admin/leaves/allocations/${employee.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors inline-block"
                          title="Edit Allocations"
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
                    colSpan="4"
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