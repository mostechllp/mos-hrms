import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Save,
  Loader,
  FolderMinus,
} from "lucide-react";
import OffboardingHeader from "./OffboardingHeader";
import { showToast } from "../common/Toast";
import {
  fetchOffboardingProgress,
  fetchHandover,
  saveHandover,
  updateHandover,
} from "../../store/slices/offboardingSlice";

const Handover = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const offboardingId =
    location.state?.id ||
    searchParams.get("id") ||
    localStorage.getItem("offboarding_id");

  const { handover, loading: handoverLoading } = useSelector(
    (state) => state.offboarding,
  );

  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form state
  const [tasksHandedOver, setTasksHandedOver] = useState(false);
  const [filesHandedOver, setFilesHandedOver] = useState(false);
  const [managerConfirmed, setManagerConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  // ------------------------------------------------------------
  // Load existing handover on mount
  // ------------------------------------------------------------
  useEffect(() => {
    if (!offboardingId) {
      setInitialLoading(false);
      return;
    }

    const load = async () => {
      setInitialLoading(true);
      try {
        const result = await dispatch(fetchHandover(offboardingId)).unwrap();

        // Prefill the form if a handover exists
        if (result) {
          setTasksHandedOver(
            Boolean(
              result.task_and_projects ??
                result.tasksHandedOver ??
                result.tasks_handed_over,
            ),
          );
          setFilesHandedOver(
            Boolean(
              result.files_and_contents ??
                result.filesHandedOver ??
                result.files_handed_over,
            ),
          );
          setManagerConfirmed(
            Boolean(
              result.reporting_manager_confirmation ??
                result.managerConfirmed ??
                result.manager_confirmed,
            ),
          );
          setNotes(result.notes || "");
        }
      } catch (error) {
        // A 404 here just means "no handover yet" — treat it as a fresh start.
        // Any other error is worth surfacing.
        const msg = String(error || "");
        if (!msg.toLowerCase().includes("not found") && msg) {
          console.warn("Handover fetch failed:", msg);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [offboardingId, dispatch]);

  // ------------------------------------------------------------
  // Save or update
  // ------------------------------------------------------------
  const handleSaveAndContinue = async () => {
    if (!offboardingId) {
      showToast("Offboarding ID missing. Please restart the flow.", "error");
      return;
    }

    setSaving(true);
    try {
      // The existence of a fetched `handover` object tells us which path to take
      const existingId =
        handover?.id || handover?.handover_id || handover?.offboarding_id;
      const hasExisting = Boolean(existingId);

      if (hasExisting) {
        // Update: POST /admin/offboarding/{id}/handover
        await dispatch(
          updateHandover({
            id: offboardingId,
            data: {
              task_and_projects: tasksHandedOver,
              files_and_contents: filesHandedOver,
              reporting_manager_confirmation: managerConfirmed,
              notes: notes || "",
            },
          }),
        ).unwrap();
      } else {
        // Create: POST /admin/offboarding/save-handover
        await dispatch(
          saveHandover({
            offboarding_id: Number(offboardingId),
            task_and_projects: tasksHandedOver,
            files_and_contents: filesHandedOver,
            reporting_manager_confirmation: managerConfirmed,
            notes: notes || "",
          }),
        ).unwrap();
      }

      // Refresh progress so the header/dashboard reflect the completed step
      try {
        await dispatch(fetchOffboardingProgress(offboardingId)).unwrap();
      } catch (progressErr) {
        console.warn("Progress refresh failed:", progressErr);
      }

      showToast("Handover step completed successfully.", "success");
      setTimeout(() => {
        navigate(
          `/admin/employees/offboarding/leave-check?id=${offboardingId}`,
        );
      }, 1000);
    } catch (error) {
      console.error("Handover save error:", error);
      showToast(error || "Failed to save handover details", "error");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------
  if (initialLoading || handoverLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={2} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading handover details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={2} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <FolderMinus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Handover Process
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ensure all pending work, files, and responsibilities are
                  handed over before the last working day.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Handover Checklist
              </h3>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={tasksHandedOver}
                    onChange={(e) => setTasksHandedOver(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Ongoing Tasks & Projects
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Employee has identified and handed over all ongoing tasks
                    and responsibilities.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={filesHandedOver}
                    onChange={(e) => setFilesHandedOver(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Files & Context
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All relevant files, client context, and access credentials
                    have been fully handed over.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={managerConfirmed}
                    onChange={(e) => setManagerConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                    Reporting Manager Confirmation
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    The reporting manager confirms that the handover is fully
                    complete.
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Handover Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks regarding the handover..."
                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/employees/offboarding-initiation?id=${offboardingId}`,
                )
              }
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
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

export default Handover;