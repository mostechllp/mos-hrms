import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  Plus,
  Search,
  ListChecks,
  Archive,
  Loader2,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayrollEmployees,
  fetchPayrollEntries,
  selectEmployees,
  selectEmployeesLoading,
  selectPayrollEntries,
  selectEntriesLoading,
  selectPayrollError,
} from "../store/slices/payrollSlice";

const PayrollList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { year, month } = useParams();

  const monthName = month ? month.charAt(0).toUpperCase() + month.slice(1) : "";
  const displayTitle = `${monthName} ${year}`;

  const [entries, setEntries] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redux selectors
  const employees = useSelector(selectEmployees);
  const employeesLoading = useSelector(selectEmployeesLoading);
  const payrollEntries = useSelector(selectPayrollEntries);
  const entriesLoading = useSelector(selectEntriesLoading);
  const error = useSelector(selectPayrollError);

  // Fetch employees and payroll entries on component mount
  useEffect(() => {
    dispatch(fetchPayrollEmployees());
    if (year && month) {
      dispatch(fetchPayrollEntries({ year, month }));
    }
  }, [dispatch, year, month]);

  // ✅ FIX: Ensure we always have arrays
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safePayrollEntries = Array.isArray(payrollEntries) ? payrollEntries : [];

  // Prepare table data - combine employees with payroll entries or use employees as base
  const tableData = safePayrollEntries.length > 0 ? safePayrollEntries : safeEmployees;

  // ✅ FIX: Filter data with safe array check
  const filteredData = tableData.filter((item) => {
    if (!item) return false;
    const searchMatch =
      searchTerm === "" ||
      (item.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.employee_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "paid" && item.status === "paid") ||
      (statusFilter === "pending" &&
        (item.status === "pending" || !item.status));

    return searchMatch && statusMatch;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / entries) || 1;
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

  // Summary stats
  const totalPayrolls = filteredData.length;
  const pendingCount = filteredData.filter(
    (item) => item.status === "pending" || !item.status,
  ).length;

  // Calculate total amount
  const totalAmount = filteredData.reduce((acc, item) => {
    const salary = item.salary || item.gross_salary || 0;
    return acc + Number(salary);
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Render loading state
  if (employeesLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading payroll data...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">Error: {error}</p>
          <button
            onClick={() => {
              dispatch(fetchPayrollEmployees());
              if (year && month) dispatch(fetchPayrollEntries({ year, month }));
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate("/admin/payroll")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Calendar
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FileText className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">
              {totalPayrolls}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">
              Total Payrolls
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Clock className="text-gray-800 dark:text-gray-100 w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-none">
              {pendingCount}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">
              Pending
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                INR
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">
                INR Total Amount
              </p>
            </div>
          </div>
        </div>

        {/* List Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <ListChecks className="text-green-500 w-7 h-7" strokeWidth={3} />
              Payroll List
            </h2>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
              {displayTitle}
            </span>
          </div>
          <button
            onClick={() => navigate("/admin/payroll/add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-sm transition-all text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Add Payroll
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm overflow-hidden mt-4">
          {/* Toolbar */}
          <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              Show entries
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full text-sm px-4 py-2 text-gray-600 dark:text-gray-300 w-full sm:w-auto focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-medium"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <div className="relative w-full sm:w-[280px]">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  strokeWidth={2.5}
                />
                <input
                  type="text"
                  placeholder="Search employee or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/80"></div>

          {/* Table */}
          <div className="overflow-x-auto">
            {paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                  No Payroll Records Found
                </h3>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-[#fafbfc] dark:bg-gray-800/50 text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">SL NO</th>
                    <th className="px-6 py-4 whitespace-nowrap">EMPLOYEE</th>
                    <th className="px-6 py-4 whitespace-nowrap">DEPARTMENT</th>
                    <th className="px-6 py-4 whitespace-nowrap">DESIGNATION</th>
                    <th className="px-6 py-4 whitespace-nowrap">MONTH / YEAR</th>
                    <th className="px-6 py-4 whitespace-nowrap">GROSS SALARY</th>
                    <th className="px-6 py-4 whitespace-nowrap">OVERTIME</th>
                    <th className="px-6 py-4 whitespace-nowrap">DEDUCTIONS</th>
                    <th className="px-6 py-4 whitespace-nowrap">NET PAY</th>
                    <th className="px-6 py-4 whitespace-nowrap">CURRENCY</th>
                    <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                    <th className="px-6 py-4 whitespace-nowrap">PAYMENT DATE</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => {
                    // ✅ FIX: Safely get employee name
                    const employeeName =
                      item.first_name || item.last_name
                        ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
                        : item.name || "Unnamed Employee";
                    
                    const department = item.department?.name || item.department || "N/A";
                    const designation = item.designation?.name || item.designation || "N/A";
                    const employeeId = item.employee_id || "N/A";
                    const status = item.status || "pending";
                    const grossSalary = item.gross_salary || item.salary || 0;
                    const overtime = item.overtime || 0;
                    const deductions = item.deductions || 0;
                    const netPay = grossSalary + overtime - deductions || 0;
                    const currency = item.currency || "INR";
                    const paymentDate = item.payment_date || "N/A";

                    return (
                      <tr
                        key={item.id || index}
                        className="border-t border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {employeeName}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {displayTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
                          {formatCurrency(grossSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
                          {formatCurrency(overtime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
                          {formatCurrency(deductions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white">
                          {formatCurrency(netPay)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
                          {currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                              status === "paid"
                                ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {paymentDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/80 flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + entries, filteredData.length)} of{" "}
                {filteredData.length} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollList;