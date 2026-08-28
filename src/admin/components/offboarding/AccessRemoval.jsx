import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle2, ArrowRight, Save, Loader, ShieldOff } from "lucide-react";
import OffboardingHeader from "./OffboardingHeader";
import { showToast } from "../common/Toast";
// import { updateOffboardingProgress } from "../../store/slices/offboardingSlice";

const AccessRemoval = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const offboardingId = location.state?.id || searchParams.get('id') || localStorage.getItem("offboarding_id");

  const [saving, setSaving] = useState(false);

  // Form State
  const [hrmsAccessRemoved, setHrmsAccessRemoved] = useState(false);
  const [emailDeactivated, setEmailDeactivated] = useState(false);
  const [otherAccessRemoved, setOtherAccessRemoved] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSaveAndContinue = async () => {
    if (!offboardingId) {
      navigate(`/admin/employees/final-settlement`);
      return;
    }

    setSaving(true);
    try {
      // await dispatch(
      //   updateOffboardingProgress({
      //     id: offboardingId,
      //     data: {
      //       step: "access_removal",
      //       status: "completed",
      //       details: {
      //         hrmsAccessRemoved,
      //         emailDeactivated,
      //         otherAccessRemoved,
      //         notes
      //       }
      //     },
      //   })
      // ).unwrap();

      showToast("Access removal confirmed successfully.", "success");
      setTimeout(() => {
        navigate(`/admin/employees/final-settlement?id=${offboardingId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast(error || "Failed to save access removal details", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={4} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ShieldOff className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Removal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Revoke HRMS, company email, and any other system/physical access on the last working day.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                IT & Access Revocation Checklist
              </h3>
              
              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input type="checkbox" checked={hrmsAccessRemoved} onChange={(e) => setHrmsAccessRemoved(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">HRMS Access Revoked</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The employee's HRMS login credentials have been disabled.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input type="checkbox" checked={emailDeactivated} onChange={(e) => setEmailDeactivated(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Company Email Deactivated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The employee's company email account has been deactivated or scheduled for deactivation.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input type="checkbox" checked={otherAccessRemoved} onChange={(e) => setOtherAccessRemoved(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Other Tools & Physical Access (Optional)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Any other software tools, VPNs, or physical access cards have been revoked.</p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revocation Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of accounts deactivated, or specific items still pending..."
                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/employees/offboarding/leave-check?id=${offboardingId}`)}
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

export default AccessRemoval;
