import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  Plus,
  Search,
  ListChecks,
  Users,
  Eye,
  Edit,
  FileDown,
  Trash2,
  Loader2,
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
import { showToast } from "../components/common/Toast";
import ConfirmModal from "../components/common/ConfirmModal";
import apiClient from "../../utils/apiClient";

// Helper function to get avatar URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    window.location.origin;

  if (avatarPath.startsWith("avatars/")) {
    return `${baseUrl}/storage/${avatarPath}`;
  }
  if (avatarPath.startsWith("storage/")) {
    return `${baseUrl}/${avatarPath}`;
  }
  if (avatarPath.startsWith("/storage/")) {
    return `${baseUrl}${avatarPath}`;
  }

  return `${baseUrl}/storage/${avatarPath}`;
};

// Month number to name mapping
const monthNumberToName = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

const PayrollList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { year, month } = useParams();

  // Get month name from number
  const monthName = month ? monthNumberToName[parseInt(month)] : "";
  const displayTitle = monthName && year ? `${monthName} ${year}` : "All Payrolls";

  const [entries, setEntries] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      dispatch(fetchPayrollEntries({ year, month: parseInt(month) }));
    } else if (year) {
      dispatch(fetchPayrollEntries({ year }));
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
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.employee_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.employee_code?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "paid" && (item.status === "paid" || item.status === "completed")) ||
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
    const salary = item.gross_salary || item.salary || 0;
    return acc + Number(salary);
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Handle View
  const handleView = (item) => {
    navigate(`/admin/payroll/details/${item.id}`);
  };

  // Handle Edit
  const handleEdit = (item) => {
    navigate(`/admin/payroll/edit/${item.id}`);
  };

  // Handle Generate Payslip
  const handleGeneratePayslip = async (item) => {
    try {
      showToast("Generating payslip...", "info");
      const response = await apiClient.post(`/admin/payroll/generate-payslip/${item.id}`);
      if (response.data?.success) {
        if (response.data?.data?.url) {
          window.open(response.data.data.url, "_blank");
        } else if (response.data?.data?.pdf) {
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${response.data.data.pdf}`;
          link.download = `payslip_${item.employee_name || item.employee_id}_${item.month}_${item.year}.pdf`;
          link.click();
        }
        showToast("Payslip generated successfully!", "success");
      } else {
        showToast(response.data?.message || "Failed to generate payslip", "error");
      }
    } catch (error) {
      console.error("Error generating payslip:", error);
      showToast(
        error.response?.data?.message || "Failed to generate payslip",
        "error"
      );
    }
  };

  // Handle Delete Click
  const handleDeleteClick = (item) => {
    setSelectedPayroll(item);
    setShowDeleteModal(true);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedPayroll) return;
    
    setDeleteLoading(true);
    try {
      const response = await apiClient.delete(`/admin/payroll/${selectedPayroll.id}`);
      if (response.data?.success) {
        showToast("Payroll deleted successfully!", "success");
        setShowDeleteModal(false);
        setSelectedPayroll(null);
        if (year && month) {
          dispatch(fetchPayrollEntries({ year, month: parseInt(month) }));
        } else if (year) {
          dispatch(fetchPayrollEntries({ year }));
        }
      } else {
        showToast(response.data?.message || "Failed to delete payroll", "error");
      }
    } catch (error) {
      console.error("Error deleting payroll:", error);
      showToast(
        error.response?.data?.message || "Failed to delete payroll",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
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
              if (year && month) dispatch(fetchPayrollEntries({ year, month: parseInt(month) }));
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
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-3 sm:p-4 lg:p-5">
      <div className="max-w-[1400px] mx-auto space-y-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Payrolls</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalPayrolls}</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</p>
            <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">INR Total</p>
            <h3 className="text-xl font-black text-blue-500">{formatCurrency(totalAmount)}</h3>
          </div>
        </div>

        {/* List Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <ListChecks className="text-green-500 w-6 h-6" strokeWidth={3} />
              Payroll List
            </h2>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              {displayTitle}
            </span>
          </div>
          <button
            onClick={() => navigate("/admin/payroll/add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold shadow-sm transition-all text-sm"
          >
            <Plus size={16} strokeWidth={3} />
            Add Payroll
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              Show entries
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full text-xs px-3 py-1.5 text-gray-600 dark:text-gray-300 w-full sm:w-auto focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-medium"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid / Completed</option>
                <option value="pending">Pending</option>
              </select>

              <div className="relative w-full sm:w-[220px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5"
                  strokeWidth={2.5}
                />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/80"></div>

          {/* Table */}
          <div className="overflow-x-auto">
            {paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
                  <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                  No Payroll Records Found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No payroll records available for {displayTitle}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#fafbfc] dark:bg-gray-800/50 text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap">SL NO</th>
                    <th className="px-3 py-2 whitespace-nowrap">EMPLOYEE</th>
                    <th className="px-3 py-2 whitespace-nowrap">MONTH / YEAR</th>
                    <th className="px-3 py-2 whitespace-nowrap text-right">GROSS SALARY</th>
                    <th className="px-3 py-2 whitespace-nowrap text-right">OVERTIME</th>
                    <th className="px-3 py-2 whitespace-nowrap text-right">DEDUCTIONS</th>
                    <th className="px-3 py-2 whitespace-nowrap text-right">NET PAY</th>
                    <th className="px-3 py-2 whitespace-nowrap">CURRENCY</th>
                    <th className="px-3 py-2 whitespace-nowrap">STATUS</th>
                    <th className="px-3 py-2 whitespace-nowrap">PAYMENT DATE</th>
                    <th className="px-3 py-2 whitespace-nowrap text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => {
                    const employeeName = item.employee_name || 
                      (item.first_name && item.last_name 
                        ? `${item.first_name} ${item.last_name}`.trim()
                        : item.name || "Unnamed Employee");
                    
                    const employeeId = item.employee_id || item.employee_code || "N/A";
                    const status = item.status || "pending";
                    const grossSalary = item.gross_salary || item.salary || 0;
                    const overtime = item.overtime || 0;
                    const deductions = item.deductions || 0;
                    const netPay = grossSalary + overtime - deductions || 0;
                    const currency = item.currency || "INR";
                    const paymentDate = item.payment_date || "N/A";
                    
                    const avatarUrl = item.avatar ? getAvatarUrl(item.avatar) : null;

                    return (
                      <tr
                        key={item.id || index}
                        className="border-t border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white text-center">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={employeeName}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentElement.querySelector(".avatar-fallback").style.display = "flex";
                                }}
                              />
                            ) : (
                              <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold avatar-fallback flex-shrink-0">
                                {employeeName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-800 dark:text-white text-sm truncate max-w-[120px]">
                                {employeeName}
                              </span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                {employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                          {displayTitle}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300 text-right text-sm">
                          {formatCurrency(grossSalary)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300 text-right text-sm">
                          {formatCurrency(overtime)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300 text-right text-sm">
                          {formatCurrency(deductions)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white text-right text-sm">
                          {formatCurrency(netPay)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700 dark:text-gray-300 text-sm">
                          {currency}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                              status === "paid" || status === "completed"
                                ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : status === "generated"
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {status === "completed" ? "Completed" : 
                             status === "generated" ? "Generated" : 
                             status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                          {formatDate(paymentDate)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(item)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="View"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleGeneratePayslip(item)}
                              className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                              title="Generate Payslip"
                            >
                              <FileDown size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + entries, filteredData.length)} of{" "}
                {filteredData.length} entries
              </p>
              <div className="flex gap-1">
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPayroll(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payroll"
        message={`Are you sure you want to delete payroll record for ${selectedPayroll?.employee_name || selectedPayroll?.first_name || "this employee"} for ${selectedPayroll?.month ? `${monthNumberToName[selectedPayroll.month] || selectedPayroll.month}/${selectedPayroll.year}` : ""}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default PayrollList;