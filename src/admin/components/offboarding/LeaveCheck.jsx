import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Save,
  Loader,
  Calendar,
  RefreshCw,
  Wallet,
  Palmtree,
} from "lucide-react";
import OffboardingHeader from "./OffboardingHeader";
import { showToast } from "../common/Toast";
import {
  fetchLeaveVerification,
  fetchOffboardingProgress,
  updateLeaveVerification,
} from "../../store/slices/offboardingSlice";

const LeaveCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const offboardingId =
    location.state?.id ||
    searchParams.get("id") ||
    localStorage.getItem("offboarding_id");

  const {
    leaveVerification,
    loading: fetching,
    error,
  } = useSelector((state) => state.offboarding || {});

  const [saving, setSaving] = useState(false);

  // Form state
  const [encashmentRequired, setEncashmentRequired] = useState(true);
  const [leaveChecked, setLeaveChecked] = useState(false);
  const [notes, setNotes] = useState("");

  // ─── Extract data from API response ─────────────────────────────
  const leaveAllocations = useMemo(
    () => leaveVerification?.leave_allocations ?? [],
    [leaveVerification],
  );

  // Total allocated days — sum of all "allocated_days" fields
  const totalAllocatedDays = useMemo(
    () =>
      leaveAllocations.reduce(
        (sum, a) => sum + parseFloat(a.allocated_days || 0),
        0,
      ),
    [leaveAllocations],
  );

  // Saved verification data (or null if not yet saved)
  const savedVerification = leaveVerification?.leave_verification ?? null;

  // ─── Fetch on mount ────────────────────────────────────────────
  useEffect(() => {
    if (offboardingId) {
      dispatch(fetchLeaveVerification(offboardingId));
    }
  }, [dispatch, offboardingId]);

  // ─── Hydrate form state from saved verification ────────────────
  useEffect(() => {
    if (savedVerification) {
      setEncashmentRequired(savedVerification.encashment_required ?? true);
      setLeaveChecked(
        savedVerification.leave_checked ??
          savedVerification.leave_history_verified ??
          false,
      );
      setNotes(savedVerification.notes || "");
    }
  }, [savedVerification]);

  // ─── Error toast ────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  // ─── Submit ─────────────────────────────────────────────────────
 const handleSaveAndContinue = async () => {
  if (!offboardingId) {
    showToast("Offboarding ID is missing", "error");
    return;
  }

  if (!leaveChecked) {
    showToast("Please verify the leave history before continuing", "error");
    return;
  }

  if (leaveAllocations.length === 0) {
    showToast("No leave allocations found for this employee", "error");
    return;
  }

  setSaving(true);
  try {
    await dispatch(
      updateLeaveVerification({
        id: offboardingId,
        leaveData: {
          pending_leave_balance: totalAllocatedDays,
          leave_allocation_ids: leaveAllocations.map((a) => a.id),
          encashment_required: encashmentRequired,
          leave_checked: leaveChecked,
          leave_history_verified: leaveChecked,
          notes,
          step: "leave_verification",
          status: "completed",
        },
      }),
    ).unwrap();

    // ✅ Refresh progress so the header/dashboard reflects the completed step
    try {
      await dispatch(fetchOffboardingProgress(offboardingId)).unwrap();
    } catch (progressErr) {
      // Non-fatal — the step was saved even if progress refresh failed
      console.warn("Progress refresh failed:", progressErr);
    }

    // ✅ Optionally re-fetch leave verification so the form reflects what was saved
    try {
      await dispatch(fetchLeaveVerification(offboardingId)).unwrap();
    } catch (refetchErr) {
      console.warn("Leave verification re-fetch failed:", refetchErr);
    }

    showToast("Leave Check completed successfully.", "success");
    setTimeout(() => {
      navigate(
        `/admin/employees/offboarding/access-removal?id=${offboardingId}`,
      );
    }, 1000);
  } catch (err) {
    console.error(err);
    showToast(
      typeof err === "string" ? err : "Failed to save leave check details",
      "error",
    );
  } finally {
    setSaving(false);
  }
};
  const handleRefresh = () => {
    if (offboardingId) {
      dispatch(fetchLeaveVerification(offboardingId));
      showToast("Refreshing leave balance...", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={3} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden">
          {/* ─── Header ─────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/80">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Leave Verification & Encashment
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Verify the employee's leave balance to calculate the final
                    encashment.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={fetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ─── Body ──────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Summary card — total balance */}
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl p-6">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                    Total Leave Balance
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Sum of all active leave allocations for the current year.
                  </p>
                </div>
                <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
                  {fetching ? (
                    <Loader className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      {totalAllocatedDays.toFixed(2)}{" "}
                      <span className="text-lg font-medium">Days</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Leave allocations list ─────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Leave Allocations
              </h3>

              {fetching ? (
                <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <Loader className="w-6 h-6 animate-spin mr-2" />
                  Loading allocations...
                </div>
              ) : leaveAllocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <Palmtree className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    No leave allocations found
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    This employee has no leave types allocated yet.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {/* Table header */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-6">Leave Type</div>
                    <div className="col-span-3 text-center">Year</div>
                    <div className="col-span-3 text-right">
                      Allocated Days
                    </div>
                  </div>

                  {/* Rows */}
                  {leaveAllocations.map((alloc) => {
                    const leaveTypeName =
                      alloc.leave_type?.name ||
                      `Leave Type #${alloc.leave_type_id}`;
                    return (
                      <div
                        key={alloc.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 sm:py-4 border-b last:border-b-0 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {/* Leave type */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <Palmtree className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {leaveTypeName}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 sm:hidden">
                              Year: {alloc.year}
                            </p>
                          </div>
                        </div>

                        {/* Year — desktop only (mobile shows under name) */}
                        <div className="hidden sm:flex col-span-3 items-center justify-center">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {alloc.year}
                          </span>
                        </div>

                        {/* Days */}
                        <div className="sm:col-span-3 flex sm:justify-end items-center justify-between sm:block">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:hidden">
                            Allocated:
                          </span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            {parseFloat(alloc.allocated_days).toFixed(2)}{" "}
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              days
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 bg-purple-50 dark:bg-purple-900/10 border-t-2 border-purple-200 dark:border-purple-800">
                    <div className="col-span-9 text-sm font-bold text-purple-900 dark:text-purple-300">
                      Total
                    </div>
                    <div className="sm:col-span-3 text-left sm:text-right text-base font-black text-purple-700 dark:text-purple-300">
                      {totalAllocatedDays.toFixed(2)} days
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Verification checklist ──────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Verification Checklist
              </h3>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={leaveChecked}
                    onChange={(e) => setLeaveChecked(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Leave History Verified
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    I have verified the employee's leave history and confirm the
                    remaining balance is accurate.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={encashmentRequired}
                    onChange={(e) => setEncashmentRequired(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Process for Encashment
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Check this if the unused leave balance should be processed as
                    encashment in the FnF settlement.
                  </p>
                </div>
              </label>
            </div>

            {/* ─── Remarks ──────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks regarding leave encashment..."
                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* ─── Footer ─────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3 flex-wrap">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/employees/offboarding/handover?id=${offboardingId}`,
                )
              }
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={saving || fetching || leaveAllocations.length === 0}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCheck;