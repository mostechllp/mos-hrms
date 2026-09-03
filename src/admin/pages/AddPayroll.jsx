import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import apiClient from "../../utils/apiClient";

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState("");
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
  
  // Payroll draft ID from API
  const [payrollDraftId, setPayrollDraftId] = useState(null);

  // Step 2 - Salary Components
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState(null);

  // Step 3 - Overtime
  const [overtimeData, setOvertimeData] = useState(null);
  const [overtimeLoading, setOvertimeLoading] = useState(false);
  const [totalOvertimeAmount, setTotalOvertimeAmount] = useState(0);

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
  
  // Leave Deductions from API
  const [leaveDeductions, setLeaveDeductions] = useState(null);
  const [leaveDeductionsLoading, setLeaveDeductionsLoading] = useState(false);

  // Step 5 - Summary
  const [localSummaryData, setLocalSummaryData] = useState({
    gross_earnings: 0,
    total_deductions: 0,
    combined: 0,
    net_pay: 0,
  });

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Salary Components" },
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
    setSelectedEmployeeId("");
    setSelectedEmployeeCode("");
    setPayrollDraftId(null);

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

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0.00";
    return parseFloat(amount).toFixed(2);
  };

  // Handle employee selection
  const handleEmployeeSelect = async (employeeId) => {
    setSelectedEmployee(employeeId);

    if (employeeId) {
      try {
        const result = await dispatch(fetchEmployeeById(employeeId)).unwrap();

        if (result) {
          setSelectedEmployeeId(result.id);
          if (result.user_id) {
            setSelectedUserId(result.user_id.toString());
          }
          if (result.employee_id) {
            setSelectedEmployeeCode(result.employee_id);
          }
          await fetchSalaryComponents(result.id);
          await fetchLeaveDeductions(result.id);
          
          // Save step 1 immediately after employee selection
          await saveStepToAPI(1);
        }
      } catch (error) {
        showToast("Failed to fetch employee details", error);
      }
    } else {
      clearEmployeeFields();
      setSelectedUserId("");
      setSelectedEmployeeId("");
      setSelectedEmployeeCode("");
      setSalaryComponents([]);
      setLeaveDeductions(null);
      setPayrollDraftId(null);
    }
  };

  // ✅ Save step to API
  const saveStepToAPI = async (step) => {
    if (!selectedUserId) {
      console.log("No user selected, skipping save");
      return false;
    }

    const monthNumber = monthNames[payPeriodMonth] || new Date().getMonth() + 1;
    const year = parseInt(payPeriodYear) || new Date().getFullYear();

    // Prepare step data based on current step
    let stepData = {};
    
    switch (step) {
      case 1:
        stepData = {
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
        stepData = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          salary_components: salaryComponents.map((comp) => ({
            id: comp.id,
            component_name: comp.component_name,
            value: parseFloat(comp.value) || 0,
          })),
          total_salary: salaryComponents.reduce(
            (sum, comp) => sum + (parseFloat(comp.value) || 0),
            0,
          ),
        };
        break;
      
      case 3:
        stepData = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          overtime_data: overtimeData,
          total_overtime_amount: totalOvertimeAmount,
        };
        break;
      
      case 4:
        const totalManualDeductions = deductions.reduce(
          (sum, d) => sum + parseFloat(d.amount || 0),
          0,
        );
        stepData = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          manual_deductions: deductions.map((d) => ({
            type: d.type,
            currency: d.currency,
            amount: parseFloat(d.amount) || 0,
            is_statutory: d.is_statutory || "no",
          })),
          total_manual_deductions: totalManualDeductions,
          leave_deductions: leaveDeductions,
        };
        break;
      
      case 5:
        const totalManualDeductionsSummary = deductions.reduce(
          (sum, d) => sum + parseFloat(d.amount || 0),
          0,
        );
        const totalLeaveDeductionsSummary = leaveDeductions?.lop_deduction_amount || 0;
        const totalAllDeductionsSummary = totalManualDeductionsSummary + totalLeaveDeductionsSummary;
        const totalSalary = salaryComponents.reduce(
          (sum, comp) => sum + (parseFloat(comp.value) || 0),
          0,
        );
        
        stepData = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          summary: {
            total_salary: totalSalary,
            overtime_amount: totalOvertimeAmount,
            manual_deductions: totalManualDeductionsSummary,
            leave_deductions: totalLeaveDeductionsSummary,
            total_deductions: totalAllDeductionsSummary,
            net_pay: totalSalary + totalOvertimeAmount - totalAllDeductionsSummary,
          },
          salary_components: salaryComponents.map((comp) => ({
            id: comp.id,
            component_name: comp.component_name,
            value: parseFloat(comp.value) || 0,
          })),
          overtime_details: overtimeData?.overtime_details || [],
          manual_deductions_details: deductions.map((d) => ({
            type: d.type,
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || "INR",
            is_statutory: d.is_statutory || "no",
          })),
          leave_deductions_details: leaveDeductions,
        };
        break;
      
      default:
        stepData = {};
    }

    try {
      const payload = {
        user_id: parseInt(selectedUserId),
        step: step,
        step_data: stepData,
      };

      // If we have a draft ID, include it
      if (payrollDraftId) {
        payload.id = payrollDraftId;
      }

      console.log(`Saving step ${step} to API:`, payload);

      const response = await apiClient.post('/admin/payroll/save-step', payload);

      if (response.data?.success) {
        // Store the draft ID for subsequent saves
        if (response.data.data?.id) {
          setPayrollDraftId(response.data.data.id);
        }
        console.log(`Step ${step} saved successfully:`, response.data);
        return true;
      } else {
        console.error('Failed to save step:', response.data?.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving step:', error);
      return false;
    }
  };

  // Fetch salary components using numeric employee ID
  const fetchSalaryComponents = async (employeeId) => {
    if (!employeeId) return;
    setComponentsLoading(true);
    try {
      const response = await apiClient.get(
        `/admin/salary-components/employee/${employeeId}`,
      );

      if (response.data?.status === "success") {
        const components = response.data.data || [];
        setSalaryComponents(components);
      } else {
        setSalaryComponents([]);
      }
    } catch (error) {
      console.error("Error fetching salary components:", error);
      showToast("Failed to fetch salary components", "error");
      setSalaryComponents([]);
    } finally {
      setComponentsLoading(false);
    }
  };

  // ✅ Fetch leave deductions using employee_id and month/year
  const fetchLeaveDeductions = async (employeeId) => {
    if (!employeeId) return;

    const monthNumber = monthNames[payPeriodMonth] || new Date().getMonth() + 1;
    const year = parseInt(payPeriodYear) || new Date().getFullYear();
    const monthStr = `${year}-${String(monthNumber).padStart(2, '0')}`;

    setLeaveDeductionsLoading(true);
    try {
      const response = await apiClient.get('/admin/payroll/leaves', {
        params: {
          employee_id: employeeId,
          month: monthStr
        }
      });

      if (response.data?.success) {
        setLeaveDeductions(response.data.data);
      } else {
        setLeaveDeductions(null);
      }
    } catch (error) {
      console.error('Error fetching leave deductions:', error);
      setLeaveDeductions(null);
    } finally {
      setLeaveDeductionsLoading(false);
    }
  };

  // Handle component value change
  const handleComponentChange = (componentId, field, value) => {
    setSalaryComponents((prev) =>
      prev.map((comp) =>
        comp.id === componentId ? { ...comp, [field]: value } : comp,
      ),
    );
  };

  // Save component using numeric employee ID
  const saveComponent = async (component) => {
    try {
      const payload = {
        employee_id: selectedEmployeeId,
        component_name: component.component_name,
        value: parseFloat(component.value) || 0,
      };

      let response;
      if (component.id) {
        response = await apiClient.put(
          `/admin/salary-components/${component.id}`,
          payload,
        );
      } else {
        response = await apiClient.post("/admin/salary-components", payload);
      }

      if (response.data?.status === "success") {
        showToast("Salary component saved successfully", "success");
        await fetchSalaryComponents(selectedEmployeeId);
        setEditingComponentId(null);
        // Save step 2 after component update
        await saveStepToAPI(2);
      } else {
        showToast(
          response.data?.message || "Failed to save component",
          "error",
        );
      }
    } catch (error) {
      console.error("Error saving component:", error);
      showToast(
        error.response?.data?.message || "Failed to save component",
        "error",
      );
    }
  };

  // Delete component from API
  const deleteComponent = async (componentId) => {
    if (!window.confirm("Are you sure you want to delete this component?"))
      return;

    try {
      const response = await apiClient.delete(
        `/admin/salary-components/${componentId}`,
      );
      if (response.data?.status === "success") {
        showToast("Component deleted successfully", "success");
        await fetchSalaryComponents(selectedEmployeeId);
        // Save step 2 after component deletion
        await saveStepToAPI(2);
      } else {
        showToast(
          response.data?.message || "Failed to delete component",
          "error",
        );
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      showToast(
        error.response?.data?.message || "Failed to delete component",
        "error",
      );
    }
  };

  // Add new component row
  const addNewComponent = () => {
    const newComponent = {
      id: null,
      component_name: "",
      value: 0,
      is_new: true,
    };
    setSalaryComponents((prev) => [...prev, newComponent]);
    setEditingComponentId("new");
  };

  // Fetch overtime using POST request with JSON body
  const fetchOvertimeData = async () => {
    if (!selectedEmployeeId) return;

    const monthNumber = monthNames[payPeriodMonth] || new Date().getMonth() + 1;
    const year = parseInt(payPeriodYear) || new Date().getFullYear();
    const monthStr = `${year}-${String(monthNumber).padStart(2, "0")}`;

    setOvertimeLoading(true);
    try {
      const response = await apiClient.post("/admin/payroll/overtime", {
        employee_id: parseInt(selectedEmployeeId),
        month: monthStr,
      });

      if (response.data?.success) {
        setOvertimeData(response.data.data);
        setTotalOvertimeAmount(response.data.data?.total_overtime_amount || 0);
      } else {
        setOvertimeData(null);
        setTotalOvertimeAmount(0);
      }
    } catch (error) {
      console.error("Error fetching overtime data:", error);
      setOvertimeData(null);
      setTotalOvertimeAmount(0);
    } finally {
      setOvertimeLoading(false);
    }
  };

  // Fetch overtime when step 3 is active
  useEffect(() => {
    if (
      reduxCurrentStep === 3 &&
      selectedEmployeeId &&
      payPeriodMonth &&
      payPeriodYear
    ) {
      fetchOvertimeData();
    }
  }, [reduxCurrentStep, selectedEmployeeId, payPeriodMonth, payPeriodYear]);

  // Fetch leave deductions when step 4 is active
  useEffect(() => {
    if (
      reduxCurrentStep === 4 &&
      selectedEmployeeId &&
      payPeriodMonth &&
      payPeriodYear
    ) {
      fetchLeaveDeductions(selectedEmployeeId);
    }
  }, [reduxCurrentStep, selectedEmployeeId, payPeriodMonth, payPeriodYear]);

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

      if (currentEmployee.id) {
        setSelectedEmployeeId(currentEmployee.id);
      }

      if (currentEmployee.user_id) {
        setSelectedUserId(currentEmployee.user_id.toString());
      }

      if (currentEmployee.employee_id) {
        setSelectedEmployeeCode(currentEmployee.employee_id);
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
          salary_components: salaryComponents.map((comp) => ({
            id: comp.id,
            component_name: comp.component_name,
            value: parseFloat(comp.value) || 0,
          })),
          total_salary: salaryComponents.reduce(
            (sum, comp) => sum + (parseFloat(comp.value) || 0),
            0,
          ),
        };
        break;

      case 3:
        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          overtime_data: overtimeData,
          total_overtime_amount: totalOvertimeAmount,
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
          ) + (leaveDeductions?.lop_deduction_amount || 0),
          leave_deductions: leaveDeductions,
        };
        break;

      case 5:
        const totalDeductionsFromAPI = leaveDeductions?.lop_deduction_amount || 0;
        const totalManualDeductions = deductions.reduce(
          (sum, d) => sum + parseFloat(d.amount || 0),
          0,
        );
        const totalAllDeductions = totalManualDeductions + totalDeductionsFromAPI;

        data = {
          pay_period_month: monthNumber,
          pay_period_year: year,
          summary: {
            total_salary: salaryComponents.reduce(
              (sum, comp) => sum + (parseFloat(comp.value) || 0),
              0,
            ),
            overtime_amount: totalOvertimeAmount,
            manual_deductions: totalManualDeductions,
            leave_deductions: totalDeductionsFromAPI,
            total_deductions: totalAllDeductions,
            net_pay:
              salaryComponents.reduce(
                (sum, comp) => sum + (parseFloat(comp.value) || 0),
                0,
              ) +
              totalOvertimeAmount -
              totalAllDeductions,
          },
          salary_components: salaryComponents.map((comp) => ({
            id: comp.id,
            component_name: comp.component_name,
            value: parseFloat(comp.value) || 0,
          })),
          overtime_details: overtimeData?.overtime_details || [],
          manual_deductions_details: deductions.map((d) => ({
            type: d.type,
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || "INR",
            is_statutory: d.is_statutory || "no",
          })),
          leave_deductions_details: leaveDeductions,
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
    
    // Save current step to API
    const saved = await saveStepToAPI(reduxCurrentStep);

    if (saved) {
      const nextStep = reduxCurrentStep + 1;
      if (nextStep <= 5) {
        dispatch(setCurrentStep(nextStep));
        showToast(`Step ${nextStep} - ${steps[nextStep - 1].label}`, "success");
      }
    } else {
      showToast("Failed to save current step data", "error");
    }
  };

  // Handle final submission
  // Handle final submission
const handleSubmitPayroll = async () => {
  if (!selectedUserId) {
    showToast("Please select an employee first", "error");
    return;
  }

  try {
    // Save step 5 first
    const saved = await saveStepToAPI(5);

    if (!saved) {
      showToast("Failed to save payroll data. Please try again.", "error");
      return;
    }

    const monthNumber = monthNames[payPeriodMonth] || new Date().getMonth() + 1;
    const year = parseInt(payPeriodYear) || new Date().getFullYear();

    const totalSalary = salaryComponents.reduce(
      (sum, comp) => sum + (parseFloat(comp.value) || 0),
      0,
    );

    const totalManualDeductions = deductions.reduce(
      (sum, d) => sum + parseFloat(d.amount || 0),
      0,
    );

    const totalLeaveDeductions = leaveDeductions?.lop_deduction_amount || 0;
    const totalAllDeductions = totalManualDeductions + totalLeaveDeductions;
    const netPay = totalSalary + totalOvertimeAmount - totalAllDeductions;

    // ✅ Payload for /admin/payroll/submit
    const payload = {
      user_id: parseInt(selectedUserId),
      pay_period_month: parseInt(monthNumber),
      pay_period_year: parseInt(year),
      gross_salary: parseFloat(totalSalary),
      overtime: parseFloat(totalOvertimeAmount),
      deductions: parseFloat(totalAllDeductions),
      net_pay: parseFloat(netPay),
      currency: "INR",
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

    // Save current step before moving forward
    const saved = await saveStepToAPI(reduxCurrentStep);

    if (saved) {
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
    return await saveStepToAPI(step);
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
    // Save step 4 after deduction removal
    saveStepToAPI(4);
  };

  // Calculate totals for summary
  const totalSalaryAmount = salaryComponents.reduce(
    (sum, comp) => sum + (parseFloat(comp.value) || 0),
    0,
  );
  const totalManualDeductions = deductions.reduce(
    (sum, d) => sum + parseFloat(d.amount || 0),
    0,
  );
  const totalLeaveDeductions = leaveDeductions?.lop_deduction_amount || 0;
  const totalAllDeductions = totalManualDeductions + totalLeaveDeductions;
  const totalNetPay =
    totalSalaryAmount + totalOvertimeAmount - totalAllDeductions;

  // ... (rest of the JSX remains the same - the UI is unchanged)
  // The JSX section is the same as before, so I won't repeat it all here
  
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

          {/* Step 2 - Salary Components */}
          {reduxCurrentStep === 2 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-coins text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Salary Components
                </h3>
                <span className="ml-auto text-xs text-gray-400">
                  {salaryComponents.length} components
                </span>
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
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Total:{" "}
                        {salaryComponents
                          .reduce(
                            (sum, comp) => sum + (parseFloat(comp.value) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                        Total Salary
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {componentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <>
                  {/* Salary Components Table */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            <th className="py-3 px-4 font-semibold">
                              Component Name
                            </th>
                            <th className="py-3 px-4 font-semibold text-center">
                              Amount
                            </th>
                            <th className="py-3 px-4 font-semibold text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {salaryComponents.length > 0 ? (
                            salaryComponents.map((comp) => (
                              <tr
                                key={comp.id || Math.random()}
                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                              >
                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                  {editingComponentId === comp.id ||
                                  (comp.is_new &&
                                    editingComponentId === "new") ? (
                                    <input
                                      type="text"
                                      value={comp.component_name}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          comp.id,
                                          "component_name",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                                      placeholder="Enter component name"
                                    />
                                  ) : (
                                    <span className="font-medium">
                                      {comp.component_name}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-center">
                                  {editingComponentId === comp.id ||
                                  (comp.is_new &&
                                    editingComponentId === "new") ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={comp.value}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          comp.id,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      className="w-32 px-2 py-1 text-sm text-center rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                                      placeholder="0.00"
                                    />
                                  ) : (
                                    <span className="font-mono">
                                      {(parseFloat(comp.value) || 0).toFixed(2)}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {editingComponentId === comp.id ||
                                  (comp.is_new &&
                                    editingComponentId === "new") ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => saveComponent(comp)}
                                        className="text-green-500 hover:text-green-600 transition-colors"
                                        title="Save"
                                      >
                                        <i className="fas fa-save"></i>
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (comp.is_new) {
                                            setSalaryComponents((prev) =>
                                              prev.filter(
                                                (c) => c.id !== comp.id,
                                              ),
                                            );
                                          }
                                          setEditingComponentId(null);
                                        }}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                        title="Cancel"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() =>
                                          setEditingComponentId(comp.id)
                                        }
                                        className="text-blue-500 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        onClick={() => deleteComponent(comp.id)}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                <i className="fas fa-coins text-4xl mb-3 block"></i>
                                No salary components found. Click "Add
                                Component" to create one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add Component Button */}
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={addNewComponent}
                      className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800 flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i> Add Component
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total:{" "}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {salaryComponents
                          .reduce(
                            (sum, comp) => sum + (parseFloat(comp.value) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3 - Overtime */}
          {/* Step 3 - Overtime */}
{reduxCurrentStep === 3 && (
  <div>
    <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
      <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
        <i className="fas fa-clock text-green-600 dark:text-green-400 text-xs md:text-sm"></i>
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
        Overtime Details
      </h3>
    </div>

    {overtimeLoading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    ) : overtimeData && overtimeData.overtime_details && overtimeData.overtime_details.length > 0 ? (
      <>
        {/* Total Overtime Amount - Big Display */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 md:p-8 mb-6 border border-indigo-200 dark:border-indigo-800 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Overtime Amount</div>
          <div className="text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
            ₹{totalOvertimeAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {overtimeData.total_overtime_formatted || "00:00"} total hours
          </div>
        </div>

        {/* Rate Details Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Salary</div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ₹{overtimeData.rates?.monthly_salary?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Salary</div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ₹{overtimeData.rates?.daily_salary?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Normal Hourly Rate</div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ₹{overtimeData.rates?.normal_hourly_rate?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Overtime Hourly Rate</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{overtimeData.rates?.overtime_hourly_rate?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        {/* Editable Overtime Fields */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fas fa-pen text-indigo-500"></i>
            Edit Overtime Totals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <i className="fas fa-clock mr-1 text-indigo-500"></i>
                Total Overtime (Hours)
              </label>
              <input
                type="text"
                value={overtimeData.total_overtime_formatted || "00:00"}
                onChange={(e) => {
                  setOvertimeData(prev => ({
                    ...prev,
                    total_overtime_formatted: e.target.value
                  }));
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="HH:MM"
              />
              <p className="text-xs text-gray-400 mt-1">Format: HH:MM (e.g., 02:30)</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <i className="fas fa-money-bill mr-1 text-indigo-500"></i>
                Total Overtime Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={totalOvertimeAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setTotalOvertimeAmount(value);
                  setOvertimeData(prev => ({
                    ...prev,
                    total_overtime_amount: value
                  }));
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the total overtime amount</p>
            </div>
          </div>
        </div>

        {/* Scrollable Overtime Details Table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <i className="fas fa-list text-indigo-500"></i>
            Overtime Entries
            <span className="ml-auto text-xs text-gray-500">
              {overtimeData.overtime_details.length} entries
            </span>
          </h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700/50 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Punch In</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Punch Out</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Total Hours</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Overtime</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Breaks</th>
                  </tr>
                </thead>
                <tbody>
                  {overtimeData.overtime_details.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {item.punch_in ? new Date(item.punch_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {item.punch_out ? new Date(item.punch_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-400">
                        {item.total_working_minutes ? (item.total_working_minutes / 60).toFixed(2) : '0'}h
                      </td>
                      <td className="px-4 py-2 font-semibold text-orange-600 dark:text-orange-400">
                        {item.overtime_duration || '00:00'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {item.breaks?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-8">
        <i className="fas fa-clock text-4xl text-gray-300 dark:text-gray-600 mb-3 block"></i>
        <p className="text-gray-500 dark:text-gray-400">No overtime records found for this period.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Make sure the employee has punched in/out during {payPeriodMonth} {payPeriodYear}
        </p>
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

              {/* Leave Deductions Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <i className="fas fa-calendar-times text-red-500"></i>
                    Leave Deductions
                  </h4>
                  <span className="text-xs text-gray-500">
                    {leaveDeductions?.leaves?.length || 0} leaves
                  </span>
                </div>

                {leaveDeductionsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                ) : leaveDeductions ? (
                  <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Leaves</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {leaveDeductions.total_leave_days_in_month || 0} days
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">LOP Days</div>
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {leaveDeductions.lop_days || 0} days
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">LOP Deduction</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          ₹{formatCurrency(leaveDeductions.lop_deduction_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">LOP Threshold</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {leaveDeductions.lop_threshold_days || 0} days
                        </div>
                      </div>
                    </div>

                    {/* Leave List */}
                    {leaveDeductions.leaves && leaveDeductions.leaves.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Leave Type</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Start Date</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">End Date</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Days</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaveDeductions.leaves.map((leave) => (
                              <tr key={leave.id} className="border-t border-gray-100 dark:border-gray-700">
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                  {leave.leave_type?.name || "N/A"}
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                  {formatDate(leave.start_date)}
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                  {formatDate(leave.end_date)}
                                </td>
                                <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                                  {leave.duration_days || 0}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    leave.status === "approved" 
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : leave.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}>
                                    {leave.status || "N/A"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    {/* Salary Info */}
                    {leaveDeductions.salary_info && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-red-200 dark:border-red-800">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Salary</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              ₹{formatCurrency(leaveDeductions.salary_info.monthly_salary)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Working Days</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {leaveDeductions.salary_info.working_days} days
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Salary</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              ₹{formatCurrency(leaveDeductions.salary_info.daily_salary)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <i className="fas fa-calendar-times text-3xl text-gray-300 dark:text-gray-600 mb-2 block"></i>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No leave deductions found for this period</p>
                  </div>
                )}
              </div>

              {/* Manual Deductions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-edit text-blue-500"></i>
                  Manual Deductions
                </h4>
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

              {/* Total Deductions Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Manual Deductions</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      ₹{totalManualDeductions.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Leave Deductions</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      ₹{totalLeaveDeductions.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-500">
                      ₹{totalAllDeductions.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
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
                        <span className="font-medium">
                          {formatDate(paymentDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Mode:</span>
                        <span className="font-medium">
                          {paymentMode || "N/A"}
                        </span>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Gross Salary */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      <i className="fas fa-wallet mr-2"></i>
                      Gross Salary
                    </h4>
                    {salaryComponents.length > 0 ? (
                      salaryComponents.map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm py-1"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {comp.component_name}:
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {(parseFloat(comp.value) || 0).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400">No components</div>
                    )}
                    <div className="border-t border-blue-200 dark:border-blue-700 mt-2 pt-2 flex justify-between items-center font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">
                        Total:
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {totalSalaryAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Overtime */}
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                      <i className="fas fa-clock mr-2"></i>
                      Overtime
                    </h4>
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        ₹{totalOvertimeAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {overtimeData?.total_overtime_formatted || "00:00"}
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                      <i className="fas fa-minus-circle mr-2"></i>
                      Deductions
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Manual:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          ₹{totalManualDeductions.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Leave (LOP):</span>
                        <span>₹{totalLeaveDeductions.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-red-200 dark:border-red-700 mt-2 pt-2 flex justify-between font-semibold">
                        <span className="text-gray-700 dark:text-gray-300">Total:</span>
                        <span className="text-red-600 dark:text-red-400">
                          ₹{totalAllDeductions.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                      <i className="fas fa-check-circle mr-2"></i>
                      Net Pay
                    </h4>
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{totalNetPay.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        After all deductions
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
                    {isSubmitting ? "Submitting..." : "Submit Payroll"}
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