// src/admin/pages/AddPayroll.js - Simplified Version

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { showToast } from "../components/common/Toast";

import {
  savePayrollStep,
  submitPayroll,
  fetchDraftPayroll,
  setCurrentStep,
  updateStepData,
  markStepCompleted,
  clearPayrollError,
  clearPayrollSuccess,
  resetPayrollState,
  selectCurrentStep,
  selectStepData,
  selectPayrollLoading,
  selectPayrollIsSubmitting,
  selectPayrollSuccess,
  selectPayrollError,
  selectPayrollSaving,
} from "../store/slices/payrollSlice";

import {
  fetchEmployees,
  fetchEmployeeById,
} from "../store/slices/employeeSlice";

// Helper function to get organization name from employees list
const getOrganizationName = (employees, organizationId) => {
  if (!organizationId || !employees || employees.length === 0) return null;

  for (const emp of employees) {
    if (emp.raw && emp.raw.user) {
      if (emp.raw.user.organization_id === parseInt(organizationId)) {
        if (emp.raw.user.organization && emp.raw.user.organization.name) {
          return emp.raw.user.organization.name;
        }
        if (emp.raw.user.company && emp.raw.user.company.name) {
          return emp.raw.user.company.name;
        }
      }
    }
    if (emp.organization_name) {
      return emp.organization_name;
    }
    if (emp.company_name) {
      return emp.company_name;
    }
  }
  return null;
};

function AddPayroll() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const isAdmin =
    user?.type === "admin" ||
    user?.role?.name === "admin" ||
    user?.role?.name === "Admin";
  const basePath = isAdmin ? "/admin" : "/employee";

  // Redux state
  const reduxCurrentStep = useSelector(selectCurrentStep);
  const stepData = useSelector(selectStepData);
  const isLoading = useSelector(selectPayrollLoading);
  const isSubmitting = useSelector(selectPayrollIsSubmitting);
  const isSaving = useSelector(selectPayrollSaving);
  const successMessage = useSelector(selectPayrollSuccess);
  const error = useSelector(selectPayrollError);

  // Employee state
  const {
    employees,
    loading: employeesLoading,
    currentEmployee,
  } = useSelector((state) => state.employees);

  // Local state for form data
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [payPeriodMonth, setPayPeriodMonth] = useState("");
  const [payPeriodYear, setPayPeriodYear] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [totalWorkingDays, setTotalWorkingDays] = useState("");
  const [daysPresent, setDaysPresent] = useState("");

  // Step 2 - Salary Structure
  const [countries, setCountries] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [grossSalary, setGrossSalary] = useState(0);
  const [netSalary, setNetSalary] = useState(0);

  // Step 3 - Overtime
  const [overtimeRequests, setOvertimeRequests] = useState([
    {
      id: 1,
      project: "Dubai Mall Expansion",
      date: "2026-05-20",
      hours: 4,
      overtime_amount: 0,
      currency: "INR",
      status: "pending",
      reason: "Client requested emergency revisions",
    },
    {
      id: 2,
      project: "Airport Terminal 3",
      date: "2026-05-21",
      hours: 2.5,
      overtime_amount: 0,
      currency: "INR",
      status: "pending",
      reason: "Project deadline approaching",
    },
  ]);

  // Step 4 - Deductions
  const [deductions, setDeductions] = useState([
    {
      id: 1,
      type: "",
      currency: "INR",
      amount: "0",
      is_statutory: "no",
    },
  ]);

  // Step 5 - Summary
  const [localSummaryData, setLocalSummaryData] = useState({
    gross_earnings: 0,
    total_deductions: 0,
    combined: 0,
    net_pay: 0,
  });

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Salary Structure" },
    { id: 3, label: "Overtime" },
    { id: 4, label: "Deductions" },
    { id: 5, label: "Summary" },
  ];

  // Month name to number mapping
  const monthNames = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // Available currencies
  const currencies = ["AED", "INR", "USD", "EUR", "GBP", "PHP", "LKR"];

  // --- Clear current employee on mount ---
  useEffect(() => {
    clearEmployeeFields();
    setSelectedEmployee("");
    setSelectedUserId("");

    setPayPeriodMonth("");
    setPayPeriodYear("");
    setPeriodStart("");
    setPeriodEnd("");
    setPaymentDate("");
    setPaymentMode(null);
    setTotalWorkingDays("");
    setDaysPresent("");

    dispatch(fetchEmployees());
    dispatch(setCurrentStep(1));

    return () => {
      // Clean up
    };
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
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

  // Handle employee selection
  const handleEmployeeSelect = async (employeeId) => {
    setSelectedEmployee(employeeId);

    if (employeeId) {
      try {
        const result = await dispatch(fetchEmployeeById(employeeId)).unwrap();
        if (result && result.user_id) {
          setSelectedUserId(result.user_id.toString());
        }
      } catch (error) {
        showToast("Failed to fetch employee details", error);
      }
    } else {
      clearEmployeeFields();
      setSelectedUserId("");
      setCountries([]);
    }
  };

  // Clear employee fields
  const clearEmployeeFields = () => {
    setEmployeeId("");
    setEmployeeName("");
    setOrganizationId("");
    setOrganizationName("");
    setDepartment("");
    setDesignation("");
    setEmploymentType("");
  };

  // Auto-populate fields when employee data is loaded
  useEffect(() => {
    if (currentEmployee && selectedEmployee) {
      const user = currentEmployee.user || {};
      const fullName = [currentEmployee.first_name, currentEmployee.last_name]
        .filter(Boolean)
        .join(" ");

      if (currentEmployee.user_id) {
        setSelectedUserId(currentEmployee.user_id.toString());
      }

      setEmployeeId(currentEmployee.employee_id || "");
      setEmployeeName(fullName || "");

      let orgId = "";
      let orgName = "";

      if (user.organization_id) {
        orgId = user.organization_id.toString();
      }

      if (user.organization && user.organization.name) {
        orgName = user.organization.name;
      } else if (user.company && user.company.name) {
        orgName = user.company.name;
      } else if (orgId) {
        const orgNameFromList = getOrganizationName(employees, orgId);
        if (orgNameFromList) {
          orgName = orgNameFromList;
        } else {
          orgName = `Organization #${orgId}`;
        }
      }

      setOrganizationId(orgId);
      setOrganizationName(orgName || "N/A");

      const deptName =
        user.department?.name || user.department_id?.toString() || "N/A";
      setDepartment(deptName);

      const desigName =
        user.designation?.name || user.designation_id?.toString() || "N/A";
      setDesignation(desigName);

      setEmploymentType(user.type || user.employment_type || "employee");

      if (!payPeriodMonth) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthNum = String(currentMonth).padStart(2, "0");

        const monthNamesList = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        setPayPeriodMonth(monthNamesList[currentMonth - 1]);
        setPayPeriodYear(currentYear.toString());

        setPeriodStart(`${currentYear}-${monthNum}-01`);

        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        setPeriodEnd(
          `${currentYear}-${monthNum}-${String(lastDay).padStart(2, "0")}`,
        );

        setPaymentDate(`${currentYear}-${monthNum}-25`);
        setTotalWorkingDays("26");
        setDaysPresent("30");
        setPaymentMode(null);
      }
    }
  }, [currentEmployee, employees, payPeriodMonth, selectedEmployee, dispatch]);

  // Handle success/error messages from Redux
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

  // Get current step data based on form state
  const getCurrentStepData = () => {
    const step = reduxCurrentStep;
    let data = {};

    const monthNumber = monthNames[payPeriodMonth] || new Date().getMonth() + 1;
    const year = parseInt(payPeriodYear) || new Date().getFullYear();

    switch (step) {
      case 1:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          period_start: periodStart,
          period_end: periodEnd,
          payment_date: paymentDate,
          payment_mode: paymentMode,
          total_working_days: parseInt(totalWorkingDays) || 0,
          days_present: parseInt(daysPresent) || 0,
        };
        break;

      case 2:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          location_breakdown: countries.map((c) => ({
            location_name: c.name,
            package: {
              id: c.packageId,
              name: c.name,
              currency: c.currency,
            },
            worked_days: parseInt(c.daysWorked) || 0,
            currency: {
              code: c.currency,
              symbol: c.currency,
            },
            salary_components: c.salary_components || [],
            subtotal: c.subtotal || 0,
          })),
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          gross_salary: grossSalary,
          net_salary: netSalary,
        };
        break;

      case 3:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          overtime_details: overtimeRequests.map((req) => ({
            date: req.date,
            overtime_hours: parseFloat(req.hours) || 0,
            amount: parseFloat(req.overtime_amount) || 0,
            currency: req.currency || "INR",
            status: req.status || "pending",
            projects: req.projects || [],
          })),
          total_overtime_amount: overtimeRequests.reduce(
            (sum, req) => sum + parseFloat(req.overtime_amount || 0),
            0,
          ),
        };
        break;

      case 4:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          deductions: deductions.map((d) => ({
            type: d.type,
            currency: d.currency,
            amount: parseFloat(d.amount) || 0,
            is_statutory: d.is_statutory || "no",
          })),
          total_deductions: deductions.reduce(
            (sum, d) => sum + parseFloat(d.amount || 0),
            0,
          ),
        };
        break;

      case 5:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          summary: {
            gross_salary: grossSalary,
            overtime_amount: overtimeRequests.reduce(
              (sum, req) => sum + parseFloat(req.overtime_amount || 0),
              0,
            ),
            deductions: deductions.reduce(
              (sum, d) => sum + parseFloat(d.amount || 0),
              0,
            ),
            net_pay: netSalary,
          },
          gross_salary: grossSalary,
          overtime: overtimeRequests.reduce(
            (sum, req) => sum + parseFloat(req.overtime_amount || 0),
            0,
          ),
          deductions: deductions.reduce(
            (sum, d) => sum + parseFloat(d.amount || 0),
            0,
          ),
          net_pay: netSalary,
          currency: countries.length > 0 ? countries[0].currency : "INR",
          location_breakdown: countries.map((c) => ({
            location_name: c.name,
            currency: c.currency,
            subtotal: c.subtotal || 0,
            worked_days: c.daysWorked || 0,
            salary_components: c.salary_components || [],
          })),
          overtime_details: overtimeRequests.map((req) => ({
            date: req.date,
            overtime_hours: req.overtime_hours || 0,
            amount: parseFloat(req.overtime_amount) || 0,
            currency: req.currency || "INR",
            projects: req.projects || [],
          })),
          deductions_details: deductions.map((d) => ({
            type: d.type,
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || "INR",
            is_statutory: d.is_statutory || "no",
          })),
        };
        break;

      default:
        data = {};
    }

    return data;
  };

  // Handle next step
  const handleNextStep = async () => {
    if (!selectedUserId) {
      showToast("Please select an employee first", "error");
      return;
    }

    const currentData = getCurrentStepData();
    const saved = await handleSaveStep(reduxCurrentStep, currentData);

    if (saved || reduxCurrentStep === 1) {
      const nextStep = reduxCurrentStep + 1;
      if (nextStep <= 5) {
        dispatch(setCurrentStep(nextStep));
      }
    } else {
      showToast("Failed to save current step data", "error");
    }
  };

  // Handle final submission
  const handleSubmitPayroll = async () => {
    if (!selectedUserId) {
      showToast("Please select an employee first", "error");
      return;
    }

    try {
      const finalData = getCurrentStepData();
      const saved = await handleSaveStep(5, finalData);

      if (!saved) {
        showToast("Failed to save payroll data. Please try again.", "error");
        return;
      }

      const monthNumber =
        monthNames[payPeriodMonth] || new Date().getMonth() + 1;
      const year = parseInt(payPeriodYear) || new Date().getFullYear();

      const payload = {
        user_id: parseInt(selectedUserId),
        pay_period_month: parseInt(monthNumber),
        pay_period_year: parseInt(year),
        gross_salary: parseFloat(grossSalary),
        overtime: parseFloat(
          overtimeRequests.reduce(
            (sum, req) => sum + parseFloat(req.overtime_amount || 0),
            0,
          ),
        ),
        deductions: parseFloat(
          deductions.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0),
        ),
        net_pay: parseFloat(netSalary),
        currency: countries.length > 0 ? countries[0].currency : "INR",
        location_breakdown: countries.map((c) => ({
          location_name: c.name,
          currency: c.currency,
          subtotal: c.subtotal || 0,
          worked_days: c.daysWorked || 0,
          salary_components: c.salary_components || [],
        })),
        overtime_details: overtimeRequests.map((req) => ({
          date: req.date,
          overtime_hours: req.overtime_hours || 0,
          amount: parseFloat(req.overtime_amount) || 0,
          currency: req.currency || "INR",
          projects: req.projects || [],
        })),
        deductions_details: deductions.map((d) => ({
          type: d.type,
          amount: parseFloat(d.amount) || 0,
          currency: d.currency || "INR",
          is_statutory: d.is_statutory || "no",
        })),
      };

      console.log("Submitting payroll:", payload);

      const result = await dispatch(submitPayroll(payload)).unwrap();

      showToast(
        result.message || "Payroll submitted successfully! Payslip generated!",
        "success",
      );

      setTimeout(() => {
        window.location.href = `${basePath}/payroll`;
      }, 3000);
    } catch (error) {
      console.error("Submit payroll error:", error);
      showToast(
        typeof error === "string" ? error : "Failed to submit payroll",
        "error",
      );
    }
  };

  // Handle step change
  const handleStepChange = async (step) => {
    if (!selectedUserId) {
      showToast("Please select an employee first", "error");
      return;
    }

    if (step <= reduxCurrentStep) {
      dispatch(setCurrentStep(step));
      return;
    }

    const currentData = getCurrentStepData();
    const saved = await handleSaveStep(reduxCurrentStep, currentData);

    if (saved || reduxCurrentStep === 1) {
      dispatch(setCurrentStep(step));
    } else {
      showToast("Failed to save current step data", "error");
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (reduxCurrentStep > 1) {
      dispatch(setCurrentStep(reduxCurrentStep - 1));
    }
  };

  // Save current step data
  const handleSaveStep = async (step, data) => {
    if (!selectedUserId) {
      showToast("Please select an employee first", "error");
      return false;
    }

    try {
      const monthNumber =
        monthNames[payPeriodMonth] || new Date().getMonth() + 1;
      const year = parseInt(payPeriodYear) || new Date().getFullYear();

      const enrichedData = {
        ...data,
        pay_period_month: data.pay_period_month || monthNumber,
        pay_period_year: data.pay_period_year || year,
      };

      await dispatch(
        savePayrollStep({
          userId: selectedUserId,
          step: step,
          stepData: enrichedData,
        }),
      ).unwrap();

      dispatch(updateStepData({ step, data: enrichedData }));
      dispatch(markStepCompleted(step));

      showToast("Step data saved successfully", "success");
      return true;
    } catch (error) {
      console.error("Failed to save step:", error);
      showToast(
        typeof error === "string" ? error : "Failed to save step data",
        "error",
      );
      return false;
    }
  };

  // Overtime actions
  const handleOvertimeChange = (id, field, value) => {
    setOvertimeRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, [field]: value } : req)),
    );
  };

  // Country actions
  const handleCountryChange = (id, field, value) => {
    setCountries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleAddCountry = () => {
    const newId =
      countries.length > 0 ? Math.max(...countries.map((c) => c.id)) + 1 : 1;
    setCountries([
      ...countries,
      {
        id: newId,
        name: "",
        currency: "INR",
        dailyRate: "",
        daysWorked: "",
        fxRate: "",
        packageId: null,
        salary_components: [],
        subtotal: 0,
        is_saved: false,
      },
    ]);
  };

  const handleRemoveCountry = (id) => {
    if (countries.length <= 1) {
      showToast("At least one Salary Structure is required", "error");
      return;
    }
    setCountries(countries.filter((c) => c.id !== id));
  };

  // Deduction actions
  const handleDeductionChange = (id, field, value) => {
    setDeductions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };

  const handleAddDeduction = () => {
    const newId =
      deductions.length > 0 ? Math.max(...deductions.map((d) => d.id)) + 1 : 1;
    setDeductions([
      ...deductions,
      {
        id: newId,
        type: "",
        currency: "INR",
        amount: "",
        is_statutory: "no",
      },
    ]);
  };

  const handleRemoveDeduction = (id) => {
    setDeductions(deductions.filter((d) => d.id !== id));
  };

  // Calculate totals for summary
  const totalOvertimeAmount = overtimeRequests.reduce(
    (sum, req) => sum + parseFloat(req.overtime_amount || 0),
    0,
  );
  const totalDeductionsAmount = deductions.reduce(
    (sum, d) => sum + parseFloat(d.amount || 0),
    0,
  );
  const totalGrossSalary = grossSalary;
  const totalNetPay = totalGrossSalary + totalOvertimeAmount - totalDeductionsAmount;

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to={`${basePath}/payroll`}
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Payroll
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">Add Payroll</span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          <i className="fas fa-plus-circle mr-2"></i> Add New Payroll
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure employee salary, overtime, and deductions
        </p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepChange(step.id)}
            disabled={isLoading || isSubmitting || !selectedUserId}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
              reduxCurrentStep === step.id
                ? "bg-green-500 text-white shadow-md"
                : reduxCurrentStep > step.id
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            } ${isLoading || isSubmitting || !selectedUserId ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {step.id}. {step.label}
          </button>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 lg:p-8 shadow-soft">
        <div className="space-y-6">
          {/* Step 1 - Basic Info */}
          {reduxCurrentStep === 1 && (
            <>
              {/* Employee Information Card */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                    Employee Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-user text-green-500 mr-1"></i>
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      value={selectedEmployee}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      disabled={employeesLoading}
                    >
                      <option value="">
                        {employeesLoading
                          ? "Loading employees..."
                          : "Select Employee"}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-id-card text-green-500 mr-1"></i>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-user-tag text-green-500 mr-1"></i>
                      Employee Name
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-building text-green-500 mr-1"></i>
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-diagram-project text-green-500 mr-1"></i>
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-briefcase text-green-500 mr-1"></i>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-clock text-green-500 mr-1"></i>
                      Employment Type
                    </label>
                    <input
                      type="text"
                      value={employmentType}
                      readOnly
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Pay Period Card */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                    Pay Period
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-month text-green-500 mr-1"></i>
                      Pay Period Month <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      value={payPeriodMonth}
                      onChange={(e) => setPayPeriodMonth(e.target.value)}
                      disabled={!selectedUserId}
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-year text-green-500 mr-1"></i>
                      Pay Period Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      value={payPeriodYear}
                      onChange={(e) => setPayPeriodYear(e.target.value)}
                      disabled={!selectedUserId}
                    >
                      <option value="">Select Year</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-plus text-green-500 mr-1"></i>
                      Period Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        disabled={!selectedUserId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-times text-green-500 mr-1"></i>
                      Period End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        disabled={!selectedUserId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-money-bill-wave text-green-500 mr-1"></i>
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        disabled={!selectedUserId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-university text-green-500 mr-1"></i>
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      value={paymentMode || ""}
                      onChange={(e) => setPaymentMode(e.target.value || null)}
                      disabled={!selectedUserId}
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="NEFT">Bank Transfer (NEFT)</option>
                      <option value="RTGS">Bank Transfer (RTGS)</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-week text-green-500 mr-1"></i>
                      Total Working Days
                    </label>
                    <input
                      type="text"
                      value={totalWorkingDays}
                      onChange={(e) => setTotalWorkingDays(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      disabled={!selectedUserId}
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-check text-green-500 mr-1"></i>
                      Days Present
                    </label>
                    <input
                      type="text"
                      value={daysPresent}
                      onChange={(e) => setDaysPresent(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      disabled={!selectedUserId}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2 - Salary Structure */}
          {reduxCurrentStep === 2 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-globe text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Salary Packages
                </h3>
              </div>

              {/* Employee Summary Card */}
              {selectedEmployee && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 md:p-6 mb-6 border border-green-100 dark:border-green-800">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                        {employeeName?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {employeeName || "Employee"}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Employee #{employeeId || "N/A"} • {payPeriodMonth}{" "}
                          {payPeriodYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Structure Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countries.map((country) => (
                  <div
                    key={country.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {country.name || "Location"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{country.currency}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {country.daysWorked || 0}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                          Worked Days
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {country.salary_components &&
                      country.salary_components.length > 0 ? (
                        <div className="space-y-2">
                          {country.salary_components.map((comp, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">
                                {comp.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {country.currency}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={comp.amount}
                                onChange={(e) => {
                                  const newAmount =
                                    parseFloat(e.target.value) || 0;
                                  const updatedCountries = countries.map(
                                    (c) => {
                                      if (c.id === country.id) {
                                        const updatedComponents =
                                          c.salary_components.map((c2, i) =>
                                            i === idx
                                              ? { ...c2, amount: newAmount }
                                              : c2,
                                          );
                                        const newSubtotal =
                                          updatedComponents.reduce(
                                            (sum, c2) => sum + c2.amount,
                                            0,
                                          );
                                        return {
                                          ...c,
                                          salary_components: updatedComponents,
                                          subtotal: newSubtotal,
                                        };
                                      }
                                      return c;
                                    },
                                  );
                                  setCountries(updatedCountries);
                                }}
                                className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                              />
                            </div>
                          ))}
                          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-semibold">
                            <span className="text-gray-800 dark:text-gray-200">
                              Subtotal
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {country.currency} {country.subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-400 text-sm">
                          No salary components
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddCountry}
                  className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800 flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i> Add Location
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Overtime */}
          {reduxCurrentStep === 3 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Overtime
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold">Project</th>
                        <th className="py-3 px-4 font-semibold text-center">
                          Hours
                        </th>
                        <th className="py-3 px-4 font-semibold text-center">
                          Amount
                        </th>
                        <th className="py-3 px-4 font-semibold text-center">
                          Currency
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeRequests.length > 0 ? (
                        overtimeRequests.map((req) => (
                          <tr
                            key={req.id}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(req.date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {req.project || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-yellow-600 dark:text-yellow-400 text-center">
                              {req.hours || 0}h
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                step="0.01"
                                value={req.overtime_amount || ""}
                                onChange={(e) =>
                                  handleOvertimeChange(
                                    req.id,
                                    "overtime_amount",
                                    e.target.value,
                                  )
                                }
                                className="w-24 px-2 py-1 text-sm rounded border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <select
                                value={req.currency || "INR"}
                                onChange={(e) =>
                                  handleOvertimeChange(
                                    req.id,
                                    "currency",
                                    e.target.value,
                                  )
                                }
                                className="w-20 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                              >
                                {currencies.map((curr) => (
                                  <option key={curr} value={curr}>
                                    {curr}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            <i className="fas fa-clock text-4xl mb-3 block"></i>
                            No overtime data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {overtimeRequests.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                  <div className="flex gap-2">
                    <i className="fas fa-info-circle mt-0.5"></i>
                    <div>
                      <p className="font-semibold mb-1">Overtime Details:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>
                          <strong>Total Overtime Hours:</strong>{" "}
                          {overtimeRequests.reduce(
                            (sum, req) => sum + (req.hours || 0),
                            0,
                          )}{" "}
                          hours
                        </li>
                        <li>
                          <strong>Total Overtime Amount:</strong>{" "}
                          {overtimeRequests
                            .reduce(
                              (sum, req) =>
                                sum + (parseFloat(req.overtime_amount) || 0),
                              0,
                            )
                            .toFixed(2)}{" "}
                          {overtimeRequests[0]?.currency || "INR"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 - Deductions */}
          {reduxCurrentStep === 4 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-minus-circle text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Deductions
                </h3>
              </div>

              <div className="space-y-3">
                {deductions.map((d) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="md:col-span-4">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-1 block">
                        Type
                      </label>
                      <input
                        type="text"
                        value={d.type}
                        onChange={(e) =>
                          handleDeductionChange(d.id, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        placeholder="e.g., PF 12%"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-1 block">
                        Currency
                      </label>
                      <select
                        value={d.currency}
                        onChange={(e) =>
                          handleDeductionChange(
                            d.id,
                            "currency",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      >
                        {currencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-1 block">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={d.amount}
                        onChange={(e) =>
                          handleDeductionChange(d.id, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-1 block">
                        Statutory
                      </label>
                      <select
                        value={d.is_statutory}
                        onChange={(e) =>
                          handleDeductionChange(
                            d.id,
                            "is_statutory",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveDeduction(d.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddDeduction}
                className="mt-3 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Deduction
              </button>
            </div>
          )}

          {/* Step 5 - Summary */}
          {reduxCurrentStep === 5 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Payroll Summary
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review the payroll details before final submission.
                </p>

                {/* Employee Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <i className="fas fa-user mr-2 text-green-500"></i>
                      Employee Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{employeeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Employee ID:</span>
                        <span className="font-medium">{employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-medium">{department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Designation:</span>
                        <span className="font-medium">{designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pay Period:</span>
                        <span className="font-medium">
                          {payPeriodMonth} {payPeriodYear}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <i className="fas fa-money-bill-wave mr-2 text-green-500"></i>
                      Payment Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Date:</span>
                        <span className="font-medium">{formatDate(paymentDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Mode:</span>
                        <span className="font-medium">{paymentMode || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Working Days:</span>
                        <span className="font-medium">{totalWorkingDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Days Present:</span>
                        <span className="font-medium">{daysPresent}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gross Salary */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      <i className="fas fa-wallet mr-2"></i>
                      Gross Salary
                    </h4>
                    {countries.map((country, idx) => {
                      const subtotal = country.subtotal || 0;
                      if (subtotal > 0) {
                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm py-1"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {country.name}:
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {country.currency} {subtotal.toFixed(2)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div className="border-t border-blue-200 dark:border-blue-700 mt-2 pt-2 flex justify-between items-center font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">
                        Total Gross:
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {countries
                          .filter((c) => (c.subtotal || 0) > 0)
                          .map(
                            (c) =>
                              `${c.currency} ${(c.subtotal || 0).toFixed(2)}`,
                          )
                          .join(" + ")}
                      </span>
                    </div>
                  </div>

                  {/* Overtime */}
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                      <i className="fas fa-clock mr-2"></i>
                      Overtime
                    </h4>
                    {overtimeRequests
                      .filter((req) => parseFloat(req.overtime_amount || 0) > 0)
                      .map((req, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm py-1"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(req.date)}:
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {req.currency || "INR"}{" "}
                            {(parseFloat(req.overtime_amount) || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {overtimeRequests.filter(
                      (req) => parseFloat(req.overtime_amount || 0) > 0,
                    ).length === 0 && (
                      <div className="text-sm text-gray-400">No overtime</div>
                    )}
                    {overtimeRequests.filter(
                      (req) => parseFloat(req.overtime_amount || 0) > 0,
                    ).length > 0 && (
                      <div className="border-t border-orange-200 dark:border-orange-700 mt-2 pt-2 flex justify-between items-center font-semibold">
                        <span className="text-gray-700 dark:text-gray-300">
                          Total Overtime:
                        </span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {overtimeRequests
                            .filter(
                              (req) =>
                                parseFloat(req.overtime_amount || 0) > 0,
                            )
                            .map(
                              (req) =>
                                `${req.currency || "INR"} ${(parseFloat(req.overtime_amount) || 0).toFixed(2)}`,
                            )
                            .join(" + ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Deductions */}
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                      <i className="fas fa-minus-circle mr-2"></i>
                      Deductions
                    </h4>
                    {deductions
                      .filter((d) => parseFloat(d.amount || 0) > 0)
                      .map((d, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm py-1"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {d.type || "Unnamed"}:
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {d.currency}{" "}
                            {(parseFloat(d.amount) || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {deductions.filter((d) => parseFloat(d.amount || 0) > 0)
                      .length === 0 && (
                      <div className="text-sm text-gray-400">No deductions</div>
                    )}
                    {deductions.filter((d) => parseFloat(d.amount || 0) > 0)
                      .length > 0 && (
                      <div className="border-t border-red-200 dark:border-red-700 mt-2 pt-2 flex justify-between items-center font-semibold">
                        <span className="text-gray-700 dark:text-gray-300">
                          Total Deductions:
                        </span>
                        <span className="text-red-500">
                          {deductions
                            .filter((d) => parseFloat(d.amount || 0) > 0)
                            .map(
                              (d) =>
                                `${d.currency} ${(parseFloat(d.amount) || 0).toFixed(2)}`,
                            )
                            .join(" + ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Net Pay */}
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                      <i className="fas fa-check-circle mr-2"></i>
                      Net Pay
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Salary:</span>
                        <span>
                          {countries
                            .filter((c) => (c.subtotal || 0) > 0)
                            .map(
                              (c) =>
                                `${c.currency} ${(c.subtotal || 0).toFixed(2)}`,
                            )
                            .join(" + ")}
                        </span>
                      </div>
                      {overtimeRequests.filter(
                        (req) => parseFloat(req.overtime_amount || 0) > 0,
                      ).length > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>+ Overtime:</span>
                          <span>
                            {overtimeRequests
                              .filter(
                                (req) =>
                                  parseFloat(req.overtime_amount || 0) > 0,
                              )
                              .map(
                                (req) =>
                                  `${req.currency || "INR"} ${(parseFloat(req.overtime_amount) || 0).toFixed(2)}`,
                              )
                              .join(" + ")}
                          </span>
                        </div>
                      )}
                      {deductions.filter((d) => parseFloat(d.amount || 0) > 0)
                        .length > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>- Deductions:</span>
                          <span>
                            {deductions
                              .filter((d) => parseFloat(d.amount || 0) > 0)
                              .map(
                                (d) =>
                                  `${d.currency} ${(parseFloat(d.amount) || 0).toFixed(2)}`,
                              )
                              .join(" + ")}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-green-200 dark:border-green-700 mt-2 pt-2 flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-800 dark:text-gray-200">
                          Net Pay:
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {(() => {
                            const netPayByCurrency = {};

                            // Add gross amounts
                            countries.forEach((c) => {
                              const subtotal = c.subtotal || 0;
                              if (subtotal > 0) {
                                netPayByCurrency[c.currency] =
                                  (netPayByCurrency[c.currency] || 0) + subtotal;
                              }
                            });

                            // Add overtime
                            overtimeRequests.forEach((req) => {
                              const amount =
                                parseFloat(req.overtime_amount) || 0;
                              if (amount > 0) {
                                const currency = req.currency || "INR";
                                netPayByCurrency[currency] =
                                  (netPayByCurrency[currency] || 0) + amount;
                              }
                            });

                            // Subtract deductions
                            deductions.forEach((d) => {
                              const amount = parseFloat(d.amount) || 0;
                              if (amount > 0) {
                                netPayByCurrency[d.currency] =
                                  (netPayByCurrency[d.currency] || 0) - amount;
                              }
                            });

                            return Object.entries(netPayByCurrency)
                              .filter(([_, amount]) => amount !== 0)
                              .map(
                                ([currency, amount]) =>
                                  `${currency} ${amount.toFixed(2)}`,
                              )
                              .join(" + ");
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payslip Delivery Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                  <i className="fas fa-envelope text-blue-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      Payslip Delivery
                    </h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                      Upon submission, the generated payslip will be
                      automatically sent to the employee via Email only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            {reduxCurrentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                disabled={isLoading || isSubmitting}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-left text-xs md:text-sm"></i>
                <span>Previous</span>
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {reduxCurrentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  disabled={isLoading || isSubmitting || !selectedUserId}
                  className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next Step</span>
                  <i className="fas fa-arrow-right text-xs md:text-sm"></i>
                </button>
              ) : (
                <button
                  onClick={handleSubmitPayroll}
                  disabled={isSubmitting || !selectedUserId}
                  className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i
                    className={`fas ${isSubmitting ? "fa-spinner fa-spin" : "fa-file-invoice"} text-xs md:text-sm`}
                  ></i>
                  <span>
                    {isSubmitting ? "Submitting..." : "Generate Payslip"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPayroll;