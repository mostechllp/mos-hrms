import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import {
  fetchOffboardingById,
  updateSettlement,
  fetchOffboardingProgress,
  fetchSettlement,
} from "../../store/slices/offboardingSlice";

const FinalSettlement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const offboardingId = location.state?.id || searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDeductions, setCustomDeductions] = useState([]);
  const [remarks, setRemarks] = useState("");

  const {
    loading: offboardingLoading,
    settlement,
    calculatedSettlement,
  } = useSelector((state) => state.offboarding);

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

  // Fetch settlement exactly once per offboarding id
  const settlementFetchedFor = useRef(null);
  useEffect(() => {
    if (!effectiveId) return;
    if (settlementFetchedFor.current === effectiveId) return;
    settlementFetchedFor.current = effectiveId;
    dispatch(fetchSettlement(effectiveId));
  }, [dispatch, effectiveId]);

  // Hydrate remarks once settlement arrives
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

  // Deduction helpers
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

  // Submit
  const handleUpdateSettlement = async () => {
  if (!effectiveId) {
    showToast("Missing offboarding id", "error");
    return;
  }

  // Validate custom deductions
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
    // Build structured deductions array
    const deductionsPayload = customDeductions.map((d, idx) => ({
      // keep a stable client ref if the backend wants it
      // id: d.id,
      name: d.name.trim(),
      amount: Number(parseFloat(d.amount) || 0),
      currency: currency,
      // optional ordering hint
      sort_order: idx + 1,
    }));

    const totalCustomDeductions = deductionsPayload.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const baseDeductions = num(calculatedSettlement?.total_deductions);
    const totalDeductions = baseDeductions + totalCustomDeductions;

    const totalPayable = num(calculatedSettlement?.total_payable);
    const netPayable = totalPayable - totalDeductions;

    const payload = {
      offboarding_id: effectiveId,

      // totals (unchanged API contract)
      total_payable: totalPayable,
      total_deductions: totalDeductions,
      net_payable: netPayable,

      // NEW: structured deduction list
      deductions: deductionsPayload,

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- number helper (replaces all the || 0 + Number() noise) ---
  const num = (v) => Number(v || 0);
  const money = (v) =>
    num(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

  // Loading gate
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

  const data = calculatedSettlement;
  const emp = data.employee || {};
  const currency = data?.salary?.currency || "AED";

  const totalCustomDeductions = customDeductions.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );
  const finalTotalPayable = num(data.total_payable);
  const finalTotalDeductions = num(data.total_deductions) + totalCustomDeductions;
  const finalNetPayable = finalTotalPayable - finalTotalDeductions;

  const ReadOnlyInput = ({ label, value }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
        readOnly
      />
    </div>
  );

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
              <ReadOnlyInput label="Employee Name" value={emp.name} />
              <ReadOnlyInput label="Employee ID" value={emp.employee_id} />
              <ReadOnlyInput label="Department" value={emp.department} />
              <ReadOnlyInput label="Designation" value={emp.designation} />
              <ReadOnlyInput
                label="Joining Date"
                value={formatDate(emp.joining_date)}
              />
              <ReadOnlyInput
                label="Last Working Day"
                value={formatDate(emp.last_working_day)}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 2. Service & Notice */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Service & Notice Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyInput
                label="Service Completed"
                value={`${data.service_period.years} yr ${data.service_period.months} mo ${data.service_period.days} d`}
              />
              <ReadOnlyInput
                label="Total Service Days"
                value={`${data.service_period.total_days} days`}
              />
              <ReadOnlyInput
                label="Total Service (Decimal Years)"
                value={`${num(data.service_period.total_years).toFixed(2)} yrs`}
              />
              <ReadOnlyInput
                label="Notice Period (Days)"
                value={data.notice_period.notice_period_days}
              />
              <ReadOnlyInput
                label="Notice Window"
                value={`${formatDate(
                  data.notice_period.notice_start_date,
                )} to ${formatDate(data.notice_period.notice_end_date)}`}
              />
              <ReadOnlyInput
                label="Shortfall / Days Served"
                value={`${data.notice_period.shortfall_days ?? 0} shortfall / ${
                  data.notice_period.days_served ?? 0
                } served`}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 3. Salary */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Salary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyInput
                label="Basic Salary"
                value={`${currency} ${money(data.salary.basic_salary)}`}
              />
              <ReadOnlyInput
                label="Gross Salary"
                value={`${currency} ${money(data.salary.gross_salary)}`}
              />
              <ReadOnlyInput
                label="Per Day Salary"
                value={`${currency} ${money(data.salary.per_day_salary)}`}
              />
              <ReadOnlyInput label="Currency" value={currency} />
            </div>

            {/* Salary Components (if any) */}
            {Array.isArray(data.salary_components) &&
              data.salary_components.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                    Salary Components
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.salary_components.map((comp, i) => (
                      <ReadOnlyInput
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
              <ReadOnlyInput
                label="Days Worked / Working Days"
                value={`${data.attendance.days_worked} / ${data.attendance.working_days}`}
              />
              <ReadOnlyInput
                label="Leave Taken / Allocated"
                value={`${data.leave.leave_taken} / ${data.leave.leave_allocated}`}
              />
              <ReadOnlyInput
                label="Unpaid Leave Days"
                value={data.leave.unpaid_leave_days}
              />
              <ReadOnlyInput
                label="Leave Balance"
                value={`${data.leave.leave_balance_days} days`}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-8"></div>

            {/* 5. Earnings */}
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Earnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyInput
                label={`Leave Encashment (${data.leave_encashment.leave_balance_days} days × ${currency} ${money(
                  data.leave_encashment.per_day_salary,
                )})`}
                value={`${currency} ${money(data.leave_encashment.amount)}`}
              />
              <ReadOnlyInput
                label={
                  data.gratuity.eligible
                    ? `Gratuity (${data.gratuity.completed_years} yr × 15/26 × ${currency} ${money(
                        data.gratuity.daily_basic_salary,
                      )})`
                    : `Gratuity (Not eligible — ${data.gratuity.completed_years} yrs)`
                }
                value={`${currency} ${money(data.gratuity.amount)}`}
              />
              <ReadOnlyInput
                label="Overtime"
                value={`${currency} ${money(data.overtime.amount)}`}
              />
              <ReadOnlyInput
                label="Gross Final Payable"
                value={`${currency} ${money(finalTotalPayable)}`}
              />
            </div>

            {data.gratuity.formula && (
              <p className="text-xs text-gray-400 dark:text-gray-500 -mt-4">
                Gratuity formula: {data.gratuity.formula}
              </p>
            )}

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
              {num(data.total_deductions) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReadOnlyInput
                    label="Standard Deductions"
                    value={`${currency} ${money(data.total_deductions)}`}
                  />
                </div>
              )}

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
                      Amount ({currency}){" "}
                      <span className="text-red-500">*</span>
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

            {/* 8. Totals */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mt-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold text-gray-600 dark:text-gray-400">
                  <span>TOTAL PAYABLE</span>
                  <span>
                    {currency} {money(finalTotalPayable)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-red-500 dark:text-red-400 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <span>TOTAL DEDUCTIONS</span>
                  <span>
                    - {currency} {money(finalTotalDeductions)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Net Payable
                  </span>
                  <span className="text-2xl font-black text-green-600 dark:text-green-500">
                    {currency} {money(finalNetPayable)}
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
                Cancel
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