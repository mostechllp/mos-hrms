import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle2, ArrowRight, Save, Loader, Calendar } from "lucide-react";
import OffboardingHeader from "./OffboardingHeader";
import { showToast } from "../common/Toast";
// import { updateOffboardingProgress } from "../../store/slices/offboardingSlice";

const LeaveCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const offboardingId = location.state?.id || searchParams.get('id') || localStorage.getItem("offboarding_id");

  const [saving, setSaving] = useState(false);
  
  // State for leave check
  const [leaveBalance, setLeaveBalance] = useState("12"); // In a real scenario, this would be fetched from API
  const [encashmentRequired, setEncashmentRequired] = useState(true);
  const [leaveChecked, setLeaveChecked] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSaveAndContinue = async () => {
    if (!offboardingId) {
      navigate(`/admin/employees/offboarding/access-removal`);
      return;
    }

    setSaving(true);
    try {
      // await dispatch(
      //   updateOffboardingProgress({
      //     id: offboardingId,
      //     data: {
      //       step: "leave_check",
      //       status: "completed",
      //       details: {
      //         leaveChecked,
      //         leaveEncashment,
      //         notes
      //       }
      //     },
      //   })
      // ).unwrap();

      showToast("Leave Check completed successfully.", "success");
      setTimeout(() => {
        navigate(`/admin/employees/offboarding/access-removal?id=${offboardingId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast(error || "Failed to save leave check details", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={3} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Verification & Encashment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Verify the employee's pending leave balance to calculate the final encashment.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Pending Leave Balance</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Calculated as of the last working day.</p>
                </div>
                <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
                  {leaveBalance} <span className="text-lg font-medium">Days</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Verification Checklist
              </h3>
              
              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input type="checkbox" checked={leaveChecked} onChange={(e) => setLeaveChecked(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Leave History Verified</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">I have verified the employee's leave history and confirm the remaining balance is accurate.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input type="checkbox" checked={encashmentRequired} onChange={(e) => setEncashmentRequired(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Process for Encashment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check this if the unused leave balance should be processed as encashment in the FnF settlement.</p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks regarding leave encashment..."
                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/employees/offboarding/handover?id=${offboardingId}`)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
