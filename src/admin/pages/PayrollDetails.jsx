// src/admin/pages/PayrollDetails.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import {
  ArrowLeft,
  Edit,
  FileDown,
  Trash2,
  Loader2,
  Mail,
} from "lucide-react";
import {
  fetchPayrollById,
  generatePayslip,
  clearPayrollError,
  clearPayrollSuccess,
  selectCurrentPayroll,
  selectPayrollLoading,
  selectPayrollActionLoading,
  selectPayrollError,
  selectPayrollSuccess,
  sendPayslip,
  deletePayroll,
} from "../store/slices/payrollSlice";
import ConfirmModal from "../components/common/ConfirmModal";

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
  12: "December",
};

// Helper function to get avatar URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;
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

const PayrollDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useSelector((state) => state.auth || {});
  const isAdmin =
    user?.type === "admin" ||
    user?.role?.name === "admin" ||
    user?.role?.name === "Admin";
  const basePath = isAdmin ? "/admin" : "/employee";

  const currentPayroll = useSelector(selectCurrentPayroll);
  const isLoading = useSelector(selectPayrollLoading);
  const actionLoading = useSelector(selectPayrollActionLoading);
  const error = useSelector(selectPayrollError);
  const successMessage = useSelector(selectPayrollSuccess);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPayrollById(id));
    }
    return () => {
      dispatch(clearPayrollSuccess());
      dispatch(clearPayrollError());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      dispatch(clearPayrollSuccess());
    }
    if (error) {
      showToast(error, "error");
      dispatch(clearPayrollError());
    }
  }, [successMessage, error, dispatch]);

  const formatCurrency = (amount, currency = "INR") => {
    if (!amount && amount !== 0) return `${currency} 0.00`;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `${currency} 0.00`;
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch {
      return `${currency} ${numAmount.toFixed(2)}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date;
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formatNumber = (num, decimals = 0) => {
    if (!num && num !== 0) return "0";
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return "0";
    return numValue.toFixed(decimals);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
      draft:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600",
      failed:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
      completed:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
      generated:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    };
    return statusMap[status?.toLowerCase()] || statusMap.draft;
  };

  const handleGeneratePayslip = async () => {
    if (!id) return;
    try {
      await dispatch(generatePayslip(id)).unwrap();
      showToast("Payslip downloaded successfully!", "success");
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSendPayslip = async () => {
    if (!id) return;
    try {
      const result = await dispatch(sendPayslip(id)).unwrap();
      showToast(result.message || "Payslip sent successfully!", "success");
    } catch (error) {
      showToast(error || "Failed to send payslip", "error");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await dispatch(deletePayroll(id)).unwrap();
      showToast("Payroll deleted successfully!", "success");
      setShowDeleteModal(false);
      navigate("/admin/payroll");
    } catch (error) {
      showToast(error || "Failed to delete payroll", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading payroll details...</p>
        </div>
      </div>
    );
  }

  if (!currentPayroll) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">Payroll not found</p>
          <button
            onClick={() => navigate("/admin/payroll")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Payroll
          </button>
        </div>
      </div>
    );
  }

  const payroll = currentPayroll;
  const stepData = payroll.step_data || {};
  const targetCurrency = payroll.currency || "INR";

  // Get data from the API response structure
  const employee = payroll.employee || {};
  const disbursement = payroll.disbursement || {};
  const earnings = payroll.earnings || {};
  const deductions = payroll.deductions || {};
  const leaveSummary = payroll.leave_summary || {};
  
  // Get step data
  const step2 = stepData.step_2 || {};
  const step3 = stepData.step_3 || {};
  const step4 = stepData.step_4 || {};
  const step5 = stepData.step_5 || {};

  // Get salary components from step2 or step5
  const salaryComponents = step5.salary_components || step2.salary_components || [];

  // Get overtime details from step3 or earnings
  const overtimeDetails = step3.overtime_data?.overtime_details || earnings.overtime_detail || [];

  // Get leave deductions from step4
  const leaveDeductions = step4.leave_deductions || null;

  // Get manual deductions from step4
  const manualDeductions = step4.manual_deductions || [];

  // Calculate totals with proper number parsing
  const totalEarnings = parseFloat(payroll.gross_salary) || 
    salaryComponents.reduce((sum, comp) => sum + (parseFloat(comp.value) || 0), 0) || 0;

  const totalOvertime = parseFloat(payroll.overtime) || 
    parseFloat(earnings.overtime_amount) || 
    parseFloat(step3.total_overtime_amount) || 
    parseFloat(step3.overtime_data?.total_overtime_amount) || 0;

  const totalLeaveDeduction = parseFloat(leaveDeductions?.lop_deduction_amount) || 0;
  const totalManualDeduction = manualDeductions.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0
  );
  const totalDeductions = parseFloat(payroll.deductions) || 
    parseFloat(deductions.total) || 
    (totalManualDeduction + totalLeaveDeduction) || 0;
  const netPay = parseFloat(payroll.net_pay) || 
    (totalEarnings + totalOvertime - totalDeductions) || 0;

  const monthDisplay = monthNumberToName[payroll.pay_period_month || payroll.month] || payroll.pay_period || "";
  const yearDisplay = payroll.pay_period_year || payroll.year || 2026;

  // Get employee details
  const employeeName = employee.name || payroll.employee_name || "Unknown Employee";
  const employeeId = employee.employee_code || payroll.employee_id || "-";
  const designation = employee.designation?.name || payroll.designation?.name || payroll.designation || "-";
  const department = employee.department?.name || payroll.department?.name || payroll.department || "-";
  const joiningDate = employee.joining_date || payroll.joining_date || "-";
  const avatarUrl = employee.avatar || payroll.avatar ? getAvatarUrl(employee.avatar || payroll.avatar) : null;

  // Get bank details from disbursement
  const bankName = disbursement.bank_name || "-";
  const accountNumber = disbursement.account_number || "-";
  const ifscBranch = disbursement.ifsc_branch || "-";
  const ibanNumber = disbursement.iban_number || "-";
  const swiftCode = disbursement.swift_code || "-";
  const paymentMode = disbursement.payment_mode || payroll.payment_mode || "-";

  const payslipRef = `#PS${yearDisplay}${String(payroll.pay_period_month || payroll.month || 6).padStart(2, "0")}${String(payroll.payroll_id || "").padStart(4, "0")}`;
  
  // ✅ FIX: Properly format worked days
  const workedDays = parseFloat(payroll.days_present) || parseFloat(payroll.working_days) || 0;
  const totalDays = parseFloat(payroll.total_days) || parseFloat(payroll.working_days) || 30;
  const paymentDate = payroll.payment_date || "-";

  // Get leave details from leave_summary or step4
  const leaveDetails = leaveSummary.details || leaveDeductions?.leaves || [];

  // Logo URL
  const logoUrl = "/favicon-light.png";
  const logoUrlAlt = "/favicon.ico";

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/admin/payroll")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Payroll
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2 mb-6">
          {(payroll.status === "completed" || payroll.status === "generated") && (
            <>
              <button
                onClick={handleSendPayslip}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
              >
                <Mail size={14} />
                {actionLoading ? "Sending..." : "Send"}
              </button>
              <button
                onClick={handleGeneratePayslip}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
              >
                <FileDown size={14} />
                Download PDF
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/admin/payroll/edit/${payroll.payroll_id}`)}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 text-xs"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-xs"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        {/* Payslip Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          {/* Top Stripe */}
          <div className="h-1.5 bg-gradient-to-r from-gray-900 to-green-600"></div>

          {/* Header */}
          <div className="px-5 md:px-8 py-5 md:py-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <img 
                src={logoUrl} 
                alt="Mostech Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = logoUrlAlt;
                  e.target.onerror = () => {
                    e.target.style.display = "none";
                    e.target.parentElement.querySelector(".logo-fallback").style.display = "flex";
                  };
                }}
              />
              <div className="logo-fallback w-10 h-10 bg-gray-900 dark:bg-gray-700 border border-gray-700 dark:border-gray-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm" style={{ display: 'none' }}>
                M
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  MOSTECH
                </h1>
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Business Solutions
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-gray-200 tracking-wide">
                PAYSLIP
              </h2>
              <div className="inline-block mt-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                {payslipRef}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 md:px-8 py-5 md:py-7">
            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payroll.status)}`}
              >
                Status: {payroll.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : "Draft"}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5 bg-gray-50 dark:bg-gray-700/30 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  Pay Period
                </span>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                  {monthDisplay} {yearDisplay}
                </div>
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  Payment Date
                </span>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                  {formatDate(paymentDate)}
                </div>
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  Worked Days
                </span>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                  {Math.round(workedDays)} / {Math.round(totalDays)} Days
                </div>
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  Net Pay
                </span>
                <div className="text-sm md:text-base font-bold text-green-600 dark:text-green-400 mt-0.5">
                  {formatCurrency(netPay, targetCurrency)}
                </div>
              </div>
            </div>

            {/* Employee & Banking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-5">
              {/* Employee Info */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-4">
                <div className="text-[9px] md:text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-100 dark:border-gray-700">
                  Employee Profile
                </div>

                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={employeeName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.querySelector(".avatar-fallback").style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br from-gray-700 to-gray-900 avatar-fallback ${avatarUrl ? "hidden" : ""}`}
                  >
                    {employeeName?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {employeeName}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {employeeId}
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Designation</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {designation}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Department</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {department}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Date of Joining</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {formatDate(joiningDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Banking Info */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-4">
                <div className="text-[9px] md:text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-100 dark:border-gray-700">
                  Disbursement Info
                </div>
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Bank Name</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {bankName}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Account Number</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {accountNumber}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">IFSC / Branch</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {ifscBranch}
                      </td>
                    </tr>
                    {ibanNumber && ibanNumber !== "-" && (
                      <tr>
                        <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">IBAN</td>
                        <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right text-[10px]">
                          {ibanNumber}
                        </td>
                      </tr>
                    )}
                    {swiftCode && swiftCode !== "-" && (
                      <tr>
                        <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">SWIFT</td>
                        <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                          {swiftCode}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1 text-gray-500 dark:text-gray-400 font-medium">Payment Mode</td>
                      <td className="py-1 text-gray-800 dark:text-gray-200 font-semibold text-right">
                        {paymentMode}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Details */}
            {leaveDetails && leaveDetails.length > 0 && (
              <div className="mb-4">
                <div className="text-[9px] md:text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Leave Details
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-900 dark:bg-gray-700">
                        <th className="px-3 py-1.5 text-left text-white font-semibold text-[10px]">Leave Type</th>
                        <th className="px-3 py-1.5 text-left text-white font-semibold text-[10px]">Start Date</th>
                        <th className="px-3 py-1.5 text-left text-white font-semibold text-[10px]">End Date</th>
                        <th className="px-3 py-1.5 text-center text-white font-semibold text-[10px]">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveDetails.map((leave, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                            {leave.leave_type || "Leave"}
                          </td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                            {formatDate(leave.start_date)}
                          </td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                            {formatDate(leave.end_date)}
                          </td>
                          <td className="px-3 py-1.5 text-center text-gray-800 dark:text-gray-200 font-semibold">
                            {leave.days || 0}
                          </td>
                        </tr>
                      ))}
                      {leaveSummary.total_leave_days && (
                        <tr className="bg-gray-50 dark:bg-gray-700/30 font-bold">
                          <td colSpan="3" className="px-3 py-1.5 text-gray-700 dark:text-gray-300 text-right text-xs">
                            Total Leave Days
                          </td>
                          <td className="px-3 py-1.5 text-center text-red-600 dark:text-red-400 text-xs">
                            {leaveSummary.total_leave_days || 0} days
                          </td>
                        </tr>
                      )}
                      {leaveDeductions?.lop_days > 0 && (
                        <tr className="bg-red-50 dark:bg-red-900/10 font-bold">
                          <td colSpan="3" className="px-3 py-1.5 text-gray-700 dark:text-gray-300 text-right text-xs">
                            LOP Days: {leaveDeductions.lop_days} / {leaveDeductions.lop_threshold_days} days
                          </td>
                          <td className="px-3 py-1.5 text-center text-red-600 dark:text-red-400 text-xs">
                            {formatCurrency(leaveDeductions.lop_deduction_amount, targetCurrency)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-5">
              {/* Earnings */}
              <div>
                <div className="text-[9px] md:text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Earnings Breakdown
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-900 dark:bg-gray-700">
                        <th className="px-3 py-1.5 text-left text-white font-semibold text-[10px]">Component</th>
                        <th className="px-3 py-1.5 text-right text-white font-semibold text-[10px]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryComponents.length > 0 ? (
                        salaryComponents.map((comp, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                              {comp.component_name}
                            </td>
                            <td className="px-3 py-1.5 text-right text-gray-800 dark:text-gray-200 font-semibold">
                              {formatCurrency(comp.value, targetCurrency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-3 py-3 text-center text-gray-400 dark:text-gray-500 text-xs">
                            No earnings data available
                          </td>
                        </tr>
                      )}
                      {totalOvertime > 0 && (
                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">Overtime</td>
                          <td className="px-3 py-1.5 text-right text-orange-600 dark:text-orange-400 font-semibold">
                            {formatCurrency(totalOvertime, targetCurrency)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-50 dark:bg-gray-700/30 font-bold">
                        <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">Total Earnings</td>
                        <td className="px-3 py-1.5 text-right text-gray-900 dark:text-white">
                          {formatCurrency(totalEarnings + totalOvertime, targetCurrency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="text-[9px] md:text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Deductions
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-900 dark:bg-gray-700">
                        <th className="px-3 py-1.5 text-left text-white font-semibold text-[10px]">Component</th>
                        <th className="px-3 py-1.5 text-right text-white font-semibold text-[10px]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualDeductions.length > 0 ? (
                        manualDeductions.map((d, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                              {d.type || "Deduction"}
                            </td>
                            <td className="px-3 py-1.5 text-right text-red-600 dark:text-red-400 font-semibold">
                              {formatCurrency(d.amount, d.currency || targetCurrency)}
                            </td>
                          </tr>
                        ))
                      ) : null}
                      {leaveDeductions?.lop_deduction_amount > 0 && (
                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                            Leave (LOP)
                          </td>
                          <td className="px-3 py-1.5 text-right text-red-600 dark:text-red-400 font-semibold">
                            {formatCurrency(leaveDeductions.lop_deduction_amount, targetCurrency)}
                          </td>
                        </tr>
                      )}
                      {manualDeductions.length === 0 && !leaveDeductions?.lop_deduction_amount && (
                        <tr>
                          <td colSpan="2" className="px-3 py-3 text-center text-gray-400 dark:text-gray-500 text-xs">
                            No deductions available
                          </td>
                        </tr>
                      )}
                      {(manualDeductions.length > 0 || leaveDeductions?.lop_deduction_amount > 0) && (
                        <tr className="bg-gray-50 dark:bg-gray-700/30 font-bold">
                          <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">Total Deductions</td>
                          <td className="px-3 py-1.5 text-right text-red-600 dark:text-red-400">
                            {formatCurrency(totalDeductions, targetCurrency)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Net Pay Hero Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-lg">
              <div>
                <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/80 font-bold">
                  Final Net Payable Amount
                </div>
                <div className="text-[10px] text-white/60 mt-0.5">
                  Disbursed to {bankName !== "-" ? bankName : "registered bank"}
                </div>
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(netPay, targetCurrency)}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                System Generated Document
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">
                This is an official digital payslip
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payroll"
        message={`Are you sure you want to delete payroll record for ${employeeName} for ${monthDisplay} ${yearDisplay}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default PayrollDetails;