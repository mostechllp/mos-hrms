import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRight,
  Loader,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import DateInput from "../common/DateInput";
import {
  fetchOffboardingById,
  updateSettlement,
  fetchOffboardingProgress,
  fetchSettlement,
} from "../../store/slices/offboardingSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchDesignations } from "../../store/slices/designationSlice";

// ------------------------------------------------------------
// Editable input
// ------------------------------------------------------------
const EditableInput = ({
  label,
  value,
  onChange,
  type = "text",
  currency,
  suffix,
  placeholder,
  hint,
  step,
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      {currency && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
          {currency}
        </span>
      )}
      <input
        type={type}
        step={step}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${currency ? "pl-14" : "pl-4"} ${
          suffix ? "pr-14" : "pr-4"
        } py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

// ------------------------------------------------------------
// Editable select
// ------------------------------------------------------------
const EditableSelect = ({
  label,
  value,
  onChange,
  options,
  loading,
  placeholder = "Select...",
  hint,
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={onChange}
        disabled={loading}
        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none disabled:opacity-50"
      >
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

// ------------------------------------------------------------
// Read-only field
// ------------------------------------------------------------
const ReadOnlyField = ({ label, value }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </label>
    <input
      type="text"
      value={value ?? ""}
      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-semibold focus:outline-none cursor-not-allowed"
      readOnly
    />
  </div>
);

const FinalSettlement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const offboardingId = location.state?.id || searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDeductions, setCustomDeductions] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [form, setForm] = useState({
    employee_name: "",
    employee_id: "",
    department: "",
    designation: "",
    joining_date: "",
    last_working_day: "",
    service_years: "",
    service_months: "",
    service_days: "",
    total_service_days: "",
    total_service_years: "",
    notice_period_days: "",
    notice_start_date: "",
    notice_end_date: "",
    shortfall_days: "",
    days_served: "",
    basic_salary: "",
    gross_salary: "",
    per_day_salary: "",
    currency: "AED",
    days_worked: "",
    working_days: "",
    leave_taken: "",
    leave_allocated: "",
    unpaid_leave_days: "",
    leave_balance_days: "",
    leave_encashment_days: "",
    leave_encashment_per_day: "",
    leave_encashment_amount: "",
    gratuity_eligible: false,
    gratuity_completed_years: "",
    gratuity_daily_basic: "",
    gratuity_amount: "",
    gratuity_formula: "",
    overtime_amount: "",
    base_total_deductions: "",
    api_total_payable: "",
  });

  const {
    loading: offboardingLoading,
    settlement,
    calculatedSettlement,
  } = useSelector((state) => state.offboarding);

  const { departments = [], loading: departmentsLoading } = useSelector(
    (state) => state.departments || {},
  );
  const { designations = [], loading: designationsLoading } = useSelector(
    (state) => state.designations || {},
  );

  const effectiveId = offboardingId || localStorage.getItem("offboarding_id");

  // Fetch offboarding + progress on mount
  useEffect(() => {
    if (!effectiveId) {
      showToast(
        "No offboarding session found. Please start from initiation.",
        "warning",
      );
      return;
    }
    dispatch(fetchOffboardingById(effectiveId));
    dispatch(fetchOffboardingProgress(effectiveId));
  }, [dispatch, effectiveId]);

  // Fetch departments + designations once
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  // Fetch settlement exactly once per offboarding id
  const settlementFetchedFor = useRef(null);
  useEffect(() => {
    if (!effectiveId) return;
    if (settlementFetchedFor.current === effectiveId) return;
    settlementFetchedFor.current = effectiveId;
    dispatch(fetchSettlement(effectiveId));
  }, [dispatch, effectiveId]);

  // Hydrate the form once settlement arrives
  useEffect(() => {
    if (!calculatedSettlement) return;

    const d = calculatedSettlement;
    const emp = d.employee || {};
    const sal = d.salary || {};
    const sp = d.service_period || {};
    const np = d.notice_period || {};
    const att = d.attendance || {};
    const lv = d.leave || {};
    const le = d.leave_encashment || {};
    const gr = d.gratuity || {};
    const ot = d.overtime || {};

    setForm({
      employee_name: emp.name || "",
      employee_id: emp.employee_id || "",
      department: emp.department || "",
      designation: emp.designation || "",
      joining_date: emp.joining_date || "",
      last_working_day: emp.last_working_day || "",

      service_years: sp.years ?? "",
      service_months: sp.months ?? "",
      service_days: sp.days ?? "",
      total_service_days: sp.total_days ?? "",
      total_service_years: sp.total_years ?? "",
      notice_period_days: np.notice_period_days ?? "",
      notice_start_date: np.notice_start_date || "",
      notice_end_date: np.notice_end_date || "",
      shortfall_days: np.shortfall_days ?? "",
      days_served: np.days_served ?? "",

      basic_salary: sal.basic_salary ?? "",
      gross_salary: sal.gross_salary ?? "",
      per_day_salary: sal.per_day_salary ?? "",
      currency: sal.currency || "AED",

      days_worked: att.days_worked ?? "",
      working_days: att.working_days ?? "",
      leave_taken: lv.leave_taken ?? "",
      leave_allocated: lv.leave_allocated ?? "",
      unpaid_leave_days: lv.unpaid_leave_days ?? "",
      leave_balance_days: lv.leave_balance_days ?? "",

      leave_encashment_days: le.leave_balance_days ?? "",
      leave_encashment_per_day: le.per_day_salary ?? "",
      leave_encashment_amount: le.amount ?? "",
      gratuity_eligible: Boolean(gr.eligible),
      gratuity_completed_years: gr.completed_years ?? "",
      gratuity_daily_basic: gr.daily_basic_salary ?? "",
      gratuity_amount: gr.amount ?? "",
      gratuity_formula: gr.formula || "",
      overtime_amount: ot.amount ?? "",

      base_total_deductions: d.total_deductions ?? "",
      api_total_payable: d.total_payable ?? "",
    });
  }, [calculatedSettlement]);

  useEffect(() => {
    if (settlement?.remarks != null) {
      setRemarks(settlement.remarks);
    }
  }, [settlement]);

  useEffect(() => {
    const saved = settlement?.deductions;
    if (Array.isArray(saved) && saved.length > 0) {
      setCustomDeductions(
        saved.map((d, idx) => ({
          id: d.id ?? Date.now() + idx,
          name: d.name ?? "",
          amount: d.amount != null ? String(d.amount) : "",
        })),
      );
    }
  }, [settlement]);

  // ── Helpers
  const num = (v) => Number(v || 0);
  const money = (v) =>
    num(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddDeductionRow = () => {
    setCustomDeductions([
      ...customDeductions,
      { id: Date.now(), name: "", amount: "" },
    ]);
  };
  const handleRemoveDeduction = (id) =>
    setCustomDeductions(customDeductions.filter((d) => d.id !== id));
  const handleDeductionChange = (id, field, value) =>
    setCustomDeductions(
      customDeductions.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );

  // ── Dropdown option lists (built from Redux slices)
  const departmentOptions = useMemo(() => {
    if (!Array.isArray(departments)) return [];
    return departments
      .filter((d) => d && d.name)
      .map((d) => ({ value: d.name, label: d.name }));
  }, [departments]);

  const designationOptions = useMemo(() => {
    if (!Array.isArray(designations)) return [];
    return designations
      .filter((d) => d && d.name)
      .map((d) => ({ value: d.name, label: d.name }));
  }, [designations]);

  // ── Live totals
  const liveTotals = useMemo(() => {
    const leaveEncashmentAmount = num(form.leave_encashment_amount);
    const gratuityAmount = num(form.gratuity_amount);
    const overtimeAmount = num(form.overtime_amount);

    const totalPayable =
      leaveEncashmentAmount + gratuityAmount + overtimeAmount ||
      num(form.api_total_payable);

    const customDeductionsTotal = customDeductions.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
    const baseDeductions = num(form.base_total_deductions);
    const totalDeductions = baseDeductions + customDeductionsTotal;

    const netPayable = totalPayable - totalDeductions;

    return { totalPayable, totalDeductions, netPayable };
  }, [form, customDeductions]);

  // ── Submit
  const handleUpdateSettlement = async () => {
    if (!effectiveId) {
      showToast("Missing offboarding id", "error");
      return;
    }

    const invalid = customDeductions.some(
      (d) => !d.name?.trim() || !(parseFloat(d.amount) > 0),
    );
    if (invalid) {
      showToast(
        "Please fill in every deduction's name and a valid amount.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const deductionsPayload = customDeductions.map((d, idx) => ({
        name: d.name.trim(),
        amount: Number(parseFloat(d.amount) || 0),
        currency: form.currency,
        sort_order: idx + 1,
      }));

      const totalCustomDeductions = deductionsPayload.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const baseDeductions = num(form.base_total_deductions);
      const totalDeductions = baseDeductions + totalCustomDeductions;
      const totalPayable = liveTotals.totalPayable;
      const netPayable = totalPayable - totalDeductions;

      const payload = {
        offboarding_id: effectiveId,
        total_payable: totalPayable,
        total_deductions: totalDeductions,
        net_payable: netPayable,
        deductions: deductionsPayload,

        employee: {
          name: form.employee_name,
          employee_id: form.employee_id,
          department: form.department,
          designation: form.designation,
          joining_date: form.joining_date,
          last_working_day: form.last_working_day,
        },
        service_period: {
          years: num(form.service_years),
          months: num(form.service_months),
          days: num(form.service_days),
          total_days: num(form.total_service_days),
          total_years: num(form.total_service_years),
        },
        notice_period: {
          notice_period_days: num(form.notice_period_days),
          notice_start_date: form.notice_start_date || null,
          notice_end_date: form.notice_end_date || null,
          shortfall_days: num(form.shortfall_days),
          days_served: num(form.days_served),
        },
        salary: {
          basic_salary: num(form.basic_salary),
          gross_salary: num(form.gross_salary),
          per_day_salary: num(form.per_day_salary),
          currency: form.currency,
        },
        attendance: {
          days_worked: num(form.days_worked),
          working_days: num(form.working_days),
        },
        leave: {
          leave_taken: num(form.leave_taken),
          leave_allocated: num(form.leave_allocated),
          unpaid_leave_days: num(form.unpaid_leave_days),
          leave_balance_days: num(form.leave_balance_days),
        },
        leave_encashment: {
          leave_balance_days: num(form.leave_encashment_days),
          per_day_salary: num(form.leave_encashment_per_day),
          amount: num(form.leave_encashment_amount),
        },
        gratuity: {
          eligible: Boolean(form.gratuity_eligible),
          completed_years: num(form.gratuity_completed_years),
          daily_basic_salary: num(form.gratuity_daily_basic),
          formula: form.gratuity_formula || null,
          amount: num(form.gratuity_amount),
        },
        overtime: {
          amount: num(form.overtime_amount),
        },

        status: "approved",
        settlement_status: "approved",
        remarks: remarks?.trim() || null,
      };

      await dispatch(
        updateSettlement({ id: effectiveId, settlementData: payload }),
      ).unwrap();

      await dispatch(fetchOffboardingProgress(effectiveId));

      showToast("Final settlement updated successfully", "success");
      setTimeout(() => {
        navigate(`/admin/employees/letters-and-clearance?id=${effectiveId}`);
      }, 1500);
    } catch (error) {
      console.error("Update settlement error:", error);
      showToast(error || "Failed to update settlement.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading gate
  if (offboardingLoading || !calculatedSettlement) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={5} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading settlement details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currency = form.currency || "AED";

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={5} />

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Final Settlement
            </h1>
          </div>

          <div className="space-y-8">
            {/* 1. Employee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableInput
                label="Employee Name"
                value={form.employee_name}
                onChange={(e) => setField("employee_name", e.target.value)}
              />
              <EditableInput
                label="Employee ID"
                value={form.employee_id}
                onChange={(e) => setField("employee_id", e.target.value)}
              />
              <EditableSelect
                label="Department"
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
                options={departmentOptions}
                loading={departmentsLoading}
                placeholder="Select department"
              />
              <EditableSelect
                label="Designation"
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                options={designationOptions}
                loading={designationsLoading}
                placeholder="Select designation"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Joining Date
                </label>
                <DateInput
                  value={form.joining_date}
                  onChange={(val) => setField("joining_date", val)}
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white dark:bg-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Last Working Day
                </label>
                <DateInput
                  value={form.last_working_day}
                  onChange={(val) => setField("last_working_day", val)}
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 2. Service & Notice */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Service & Notice Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-3 gap-2">
                <EditableInput
                  label="Years"
                  type="number"
                  value={form.service_years}
                  onChange={(e) => setField("service_years", e.target.value)}
                />
                <EditableInput
                  label="Months"
                  type="number"
                  value={form.service_months}
                  onChange={(e) => setField("service_months", e.target.value)}
                />
                <EditableInput
                  label="Days"
                  type="number"
                  value={form.service_days}
                  onChange={(e) => setField("service_days", e.target.value)}
                />
              </div>
              <EditableInput
                label="Total Service Days"
                type="number"
                value={form.total_service_days}
                onChange={(e) => setField("total_service_days", e.target.value)}
                suffix="days"
              />
              <EditableInput
                label="Total Service (Decimal Years)"
                type="number"
                step="0.01"
                value={form.total_service_years}
                onChange={(e) =>
                  setField("total_service_years", e.target.value)
                }
                suffix="yrs"
              />
              <EditableInput
                label="Notice Period (Days)"
                type="number"
                value={form.notice_period_days}
                onChange={(e) =>
                  setField("notice_period_days", e.target.value)
                }
                suffix="days"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice Start Date
                </label>
                <DateInput
                  value={form.notice_start_date}
                  onChange={(val) => setField("notice_start_date", val)}
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white dark:bg-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice End Date
                </label>
                <DateInput
                  value={form.notice_end_date}
                  onChange={(val) => setField("notice_end_date", val)}
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white dark:bg-gray-900"
                />
              </div>
              <EditableInput
                label="Shortfall Days"
                type="number"
                value={form.shortfall_days}
                onChange={(e) => setField("shortfall_days", e.target.value)}
              />
              <EditableInput
                label="Days Served"
                type="number"
                value={form.days_served}
                onChange={(e) => setField("days_served", e.target.value)}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 3. Salary */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Salary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableInput
                label="Basic Salary"
                type="number"
                value={form.basic_salary}
                onChange={(e) => setField("basic_salary", e.target.value)}
                currency={currency}
              />
              <EditableInput
                label="Gross Salary"
                type="number"
                value={form.gross_salary}
                onChange={(e) => setField("gross_salary", e.target.value)}
                currency={currency}
              />
              <EditableInput
                label="Per Day Salary"
                type="number"
                value={form.per_day_salary}
                onChange={(e) => setField("per_day_salary", e.target.value)}
                currency={currency}
              />
              <EditableInput
                label="Currency"
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                placeholder="AED / INR / USD"
              />
            </div>

            {/* Salary Components */}
            {Array.isArray(calculatedSettlement.salary_components) &&
              calculatedSettlement.salary_components.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                    Salary Components
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {calculatedSettlement.salary_components.map((comp, i) => (
                      <ReadOnlyField
                        key={comp.id ?? comp.name ?? i}
                        label={comp.name || comp.label || `Component ${i + 1}`}
                        value={`${currency} ${money(
                          comp.amount ?? comp.value,
                        )}`}
                      />
                    ))}
                  </div>
                </>
              )}

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 4. Attendance & Leave */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Attendance & Leave
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableInput
                label="Days Worked"
                type="number"
                value={form.days_worked}
                onChange={(e) => setField("days_worked", e.target.value)}
              />
              <EditableInput
                label="Working Days"
                type="number"
                value={form.working_days}
                onChange={(e) => setField("working_days", e.target.value)}
              />
              <EditableInput
                label="Leave Taken"
                type="number"
                value={form.leave_taken}
                onChange={(e) => setField("leave_taken", e.target.value)}
                suffix="days"
              />
              <EditableInput
                label="Leave Allocated"
                type="number"
                value={form.leave_allocated}
                onChange={(e) => setField("leave_allocated", e.target.value)}
                suffix="days"
              />
              <EditableInput
                label="Unpaid Leave Days"
                type="number"
                value={form.unpaid_leave_days}
                onChange={(e) => setField("unpaid_leave_days", e.target.value)}
                suffix="days"
              />
              <EditableInput
                label="Leave Balance"
                type="number"
                value={form.leave_balance_days}
                onChange={(e) => setField("leave_balance_days", e.target.value)}
                suffix="days"
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 5. Earnings */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Earnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Leave Encashment
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <EditableInput
                    label="Days"
                    type="number"
                    value={form.leave_encashment_days}
                    onChange={(e) =>
                      setField("leave_encashment_days", e.target.value)
                    }
                  />
                  <EditableInput
                    label="Per Day"
                    type="number"
                    value={form.leave_encashment_per_day}
                    onChange={(e) =>
                      setField("leave_encashment_per_day", e.target.value)
                    }
                    currency={currency}
                  />
                </div>
                <EditableInput
                  label="Amount"
                  type="number"
                  value={form.leave_encashment_amount}
                  onChange={(e) =>
                    setField("leave_encashment_amount", e.target.value)
                  }
                  currency={currency}
                />
              </div>

              <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Gratuity
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.gratuity_eligible)}
                    onChange={(e) =>
                      setField("gratuity_eligible", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Eligible for gratuity
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <EditableInput
                    label="Completed Years"
                    type="number"
                    value={form.gratuity_completed_years}
                    onChange={(e) =>
                      setField("gratuity_completed_years", e.target.value)
                    }
                  />
                  <EditableInput
                    label="Daily Basic"
                    type="number"
                    value={form.gratuity_daily_basic}
                    onChange={(e) =>
                      setField("gratuity_daily_basic", e.target.value)
                    }
                    currency={currency}
                  />
                </div>
                <EditableInput
                  label="Amount"
                  type="number"
                  value={form.gratuity_amount}
                  onChange={(e) =>
                    setField("gratuity_amount", e.target.value)
                  }
                  currency={currency}
                />
                <EditableInput
                  label="Formula (reference)"
                  value={form.gratuity_formula}
                  onChange={(e) =>
                    setField("gratuity_formula", e.target.value)
                  }
                />
              </div>

              <EditableInput
                label="Overtime"
                type="number"
                value={form.overtime_amount}
                onChange={(e) => setField("overtime_amount", e.target.value)}
                currency={currency}
              />

              <ReadOnlyField
                label="Gross Final Payable (computed)"
                value={`${currency} ${money(liveTotals.totalPayable)}`}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 6. Deductions */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Deductions
              </h2>
              <button
                onClick={handleAddDeductionRow}
                className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-1.5 px-3 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Deduction
              </button>
            </div>

            <div className="space-y-4">
              <EditableInput
                label="Standard / Base Deductions"
                type="number"
                value={form.base_total_deductions}
                onChange={(e) =>
                  setField("base_total_deductions", e.target.value)
                }
                currency={currency}
                hint="Deductions calculated by the system. Override if needed."
              />

              {customDeductions.map((deduction) => (
                <div
                  key={deduction.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Deduction Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Equipment damage"
                      value={deduction.name}
                      onChange={(e) =>
                        handleDeductionChange(
                          deduction.id,
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Amount ({currency}) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={deduction.amount}
                        onChange={(e) =>
                          handleDeductionChange(
                            deduction.id,
                            "amount",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={() => handleRemoveDeduction(deduction.id)}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 7. Remarks */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Remarks / Internal Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes regarding this settlement..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 min-h-[100px] focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* 8. Live totals */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mt-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold text-gray-600 dark:text-gray-400">
                  <span>TOTAL PAYABLE</span>
                  <span>
                    {currency} {money(liveTotals.totalPayable)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-red-500 dark:text-red-400 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <span>TOTAL DEDUCTIONS</span>
                  <span>
                    - {currency} {money(liveTotals.totalDeductions)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Net Payable
                  </span>
                  <span className="text-2xl font-black text-green-600 dark:text-green-500">
                    {currency} {money(liveTotals.netPayable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() =>
                  navigate(
                    `/admin/employees/offboarding/access-removal?id=${effectiveId}`,
                  )
                }
                className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleUpdateSettlement}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Update Final Settlement
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSettlement;