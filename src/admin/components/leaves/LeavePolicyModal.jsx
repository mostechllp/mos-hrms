import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import { fetchLeaveTypesForMgmt } from "@admin/store/slices/LeaveSlice";
import {
  ACCRUAL_TYPE_OPTIONS,
  PROBATION_ACTION_OPTIONS,
  createLeavePolicy,
  updateLeavePolicy,
  clearPolicyError,
} from "@admin/store/slices/leavePolicySlice";

const emptyForm = {
  leave_type_id: "",
  annual_allocation: 18,
  enable_accrual: false,
  accrual_type: "monthly",
  accrual_days: 1.5,
  apply_during_probation: false,
  probation_action: "hold",
  release_after_probation: false,
  enable_carry_forward: false,
  unlimited_carry_forward: false,
  maximum_carry_forward: "",
  status: true,
};

const LeavePolicyModal = ({ isOpen, onClose, editingPolicy = null }) => {
  const dispatch = useDispatch();
  const { leaveTypes = [], loading: typesLoading } = useSelector(
    (state) => state.leaves || {},
  );
  const { saving, error } = useSelector((state) => state.leavePolicies || {});

  const [form, setForm] = useState(emptyForm);
  const isEdit = !!editingPolicy?.id;

  // Load leave types whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchLeaveTypesForMgmt());
  }, [isOpen, dispatch]);

  // Seed form when editing / clear when creating
  useEffect(() => {
    if (!isOpen) return;
    if (editingPolicy) {
      setForm({
        leave_type_id: editingPolicy.leave_type_id ?? "",
        annual_allocation: editingPolicy.annual_allocation ?? 18,
        enable_accrual: !!editingPolicy.enable_accrual,
        accrual_type: editingPolicy.accrual_type ?? "monthly",
        accrual_days: editingPolicy.accrual_days ?? 1.5,
        apply_during_probation: !!editingPolicy.apply_during_probation,
        probation_action: editingPolicy.probation_action ?? "hold",
        release_after_probation: !!editingPolicy.release_after_probation,
        enable_carry_forward: !!editingPolicy.enable_carry_forward,
        unlimited_carry_forward: !!editingPolicy.unlimited_carry_forward,
        maximum_carry_forward: editingPolicy.maximum_carry_forward ?? "",
        status: editingPolicy.status !== false,
      });
    } else {
      setForm(emptyForm);
    }
    dispatch(clearPolicyError());
  }, [isOpen, editingPolicy, dispatch]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.leave_type_id) {
      showToast("Please select a leave type", "error");
      return;
    }
    if (form.enable_carry_forward && !form.unlimited_carry_forward) {
      const max = Number(form.maximum_carry_forward);
      if (!Number.isFinite(max) || max <= 0) {
        showToast("Enter a valid maximum carry forward value", "error");
        return;
      }
    }

    const thunk = isEdit
      ? updateLeavePolicy({ id: editingPolicy.id, form })
      : createLeavePolicy(form);

    const result = await dispatch(thunk);
    const action = isEdit ? updateLeavePolicy : createLeavePolicy;

    if (action.fulfilled.match(result)) {
      showToast(
        isEdit ? "Leave policy updated!" : "Leave policy created!",
        "success",
      );
      onClose();
    } else {
      showToast(result.payload || "Failed to save leave policy", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/70">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-shield-halved text-green-500"></i>
            {isEdit ? "Edit Leave Policy" : "Create Leave Policy"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Leave Type */}
            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.leave_type_id}
                onChange={(e) =>
                  handleChange("leave_type_id", e.target.value)
                }
                disabled={typesLoading}
                className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                required
              >
                <option value="">
                  {typesLoading ? "Loading..." : "Select Leave Type"}
                </option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Allocation */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Annual Allocation
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.annual_allocation}
                onChange={(e) =>
                  handleChange("annual_allocation", e.target.value)
                }
                className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="e.g. 18"
              />
            </div>

            {/* Enable Accrual */}
            <div className="flex items-center pt-6 md:pt-7">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enable_accrual}
                  onChange={(e) =>
                    handleChange("enable_accrual", e.target.checked)
                  }
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Enable Accrual
                </span>
              </label>
            </div>

            {form.enable_accrual && (
              <>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Accrual Type
                  </label>
                  <select
                    value={form.accrual_type}
                    onChange={(e) =>
                      handleChange("accrual_type", e.target.value)
                    }
                    className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  >
                    {ACCRUAL_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Accrual Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.accrual_days}
                    onChange={(e) =>
                      handleChange("accrual_days", e.target.value)
                    }
                    className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="e.g. 1.5"
                  />
                </div>
              </>
            )}

            {/* Apply During Probation */}
            <div className="flex items-center pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.apply_during_probation}
                  onChange={(e) =>
                    handleChange("apply_during_probation", e.target.checked)
                  }
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Apply During Probation
                </span>
              </label>
            </div>

            {form.apply_during_probation && (
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Probation Action
                </label>
                <select
                  value={form.probation_action}
                  onChange={(e) =>
                    handleChange("probation_action", e.target.value)
                  }
                  className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                >
                  {PROBATION_ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Release After Probation */}
            <div className="flex items-center pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.release_after_probation}
                  onChange={(e) =>
                    handleChange("release_after_probation", e.target.checked)
                  }
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Release After Probation
                </span>
              </label>
            </div>

            {/* Enable Carry Forward */}
            <div className="flex items-center pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enable_carry_forward}
                  onChange={(e) =>
                    handleChange("enable_carry_forward", e.target.checked)
                  }
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Enable Carry Forward
                </span>
              </label>
            </div>

            {form.enable_carry_forward && (
              <>
                <div className="flex items-center pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.unlimited_carry_forward}
                      onChange={(e) =>
                        handleChange(
                          "unlimited_carry_forward",
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Unlimited Carry Forward
                    </span>
                  </label>
                </div>

                {!form.unlimited_carry_forward && (
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Maximum Carry Forward (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.maximum_carry_forward}
                      onChange={(e) =>
                        handleChange(
                          "maximum_carry_forward",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      placeholder="e.g. 5"
                    />
                  </div>
                )}
              </>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={form.status ? "active" : "inactive"}
                onChange={(e) =>
                  handleChange("status", e.target.value === "active")
                }
                className="w-full px-3 md:px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 mt-4">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {isEdit ? "Update Policy" : "Create Policy"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeavePolicyModal;