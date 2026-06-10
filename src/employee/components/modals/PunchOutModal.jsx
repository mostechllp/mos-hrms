import { useState } from "react";
import {
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { showToast } from "../common/Toast";

// Punch Out Modal Component
export const PunchOutModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [pendingWorks, setPendingWorks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only validate tasks completed
    if (!tasksCompleted.trim()) {
      showToast("Please fill in Tasks Completed Today", "error");
      return;
    }
    
    console.group("🔍 PUNCH OUT MODAL DEBUG");
    console.log("📤 Submitting with data:", {
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null
    });
    console.groupEnd();
    
    onSubmit({
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null,
    });
    
    // Clear form after submit
    setTasksCompleted("");
    setPlanTomorrow("");
    setPendingWorks("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] rounded-xl w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--text)]">Punch Out</h3>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Tasks Completed Today <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="What tasks did you complete today?"
              rows="4"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Pending Works <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={pendingWorks}
              onChange={(e) => setPendingWorks(e.target.value)}
              placeholder="What tasks are still pending? (Optional)"
              rows="3"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              List any incomplete tasks that need to be carried forward
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Plan for Tomorrow <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              placeholder="What are your plans for tomorrow? (Optional)"
              rows="4"
              className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] font-semibold hover:bg-[var(--surface3)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !tasksCompleted.trim()}
              className="flex-1 py-2.5 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Confirm Punch Out
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
