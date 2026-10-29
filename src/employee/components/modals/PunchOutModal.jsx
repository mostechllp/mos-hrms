import { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiClock } from "react-icons/fi";
import { showToast } from "../common/Toast";
import {
  parseAttendanceTime,
  getTodayInTimezone,
  getDatePartInTimezone,
  getStoredWorkTimezone,
} from "../../utils/timezone";

// Punch Out Modal Component
export const PunchOutModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  punchInTime,
  totalBreakMs,
  isOnBreak,
  breakStartTime,
  workingHours, // Object from Redux: { monday: { enabled, start, end }, ... }
  workingHoursFromAPI, // "10 hrs" or "6 hrs 48 mins" from API
  employeeBreaks = null, // Break data from API: { breaks: [...] } (or a plain array)
  timezone = null, // IANA timezone of the shift (e.g. "Asia/Dubai")
}) => {
  // Timezone the shift runs in - never the device's own timezone
  const workTimezone = timezone || getStoredWorkTimezone() || null;

  const [tasksCompleted, setTasksCompleted] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [pendingWorks, setPendingWorks] = useState("");
  const [isOvertimeConfirmed, setIsOvertimeConfirmed] = useState(false);
  const [workingMs, setWorkingMs] = useState(0);

  // Format duration helper (Xh Ym)
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Parse punch times in the timezone the shift ran in (utils/timezone.js)
  const parsePunchTime = (time) => parseAttendanceTime(time, workTimezone);

  const DEFAULT_LIMIT_HOURS = [0, 9, 9, 9, 9, 9, 4];

  const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const getLimitMs = () => {
    if (!punchInTime) return 9 * 3600000;
    const date = parsePunchTime(punchInTime);
    if (!date || isNaN(date.getTime())) return 9 * 3600000;

    // Day of week of the punch-in date, as seen in the work timezone
    const [py, pm, pd] = getDatePartInTimezone(date, workTimezone || undefined)
      .split("-")
      .map(Number);
    const dayIndex = new Date(Date.UTC(py, pm - 1, pd)).getUTCDay();
    const dayKey = DAY_KEYS[dayIndex];

    const parseHM = (t) => {
      if (!t) return 0;
      const parts = t.split(":");
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return (h * 3600 + m * 60) * 1000;
    };

    if (workingHours) {
      if (Array.isArray(workingHours)) {
        const daySchedule = workingHours.find(
          (item) => item && item.day && item.day.toLowerCase() === dayKey,
        );

        if (daySchedule) {
          const isEnabled =
            daySchedule.is_enabled === true ||
            daySchedule.is_enabled === 1 ||
            daySchedule.is_enabled === "1";
          if (!isEnabled) return 0;

          if (daySchedule.start_time && daySchedule.end_time) {
            const limitMs =
              parseHM(daySchedule.end_time) - parseHM(daySchedule.start_time);
            return limitMs > 0 ? limitMs : 0;
          }
        }
      } else if (typeof workingHours === "object") {
        const daySchedule = workingHours[dayKey];

        if (daySchedule) {
          const isEnabled =
            daySchedule.enabled === true || daySchedule.enabled === 1;
          if (!isEnabled) return 0;

          if (daySchedule.start && daySchedule.end) {
            const limitMs =
              parseHM(daySchedule.end) - parseHM(daySchedule.start);
            return limitMs > 0 ? limitMs : 0;
          }
        }
      }
    }

    return DEFAULT_LIMIT_HOURS[dayIndex] * 3600000;
  };

  // Parse API working hours string to milliseconds
  const parseWorkingHoursFromAPI = (workingHoursStr) => {
    if (!workingHoursStr) return null;

    let totalMinutes = 0;

    // Match "X hrs" pattern (handles "10 hrs", "10hrs", "10 h", "10h")
    const hoursMatch = workingHoursStr.match(/(\d+)\s*(?:hrs?|h)/i);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }

    // Match "X mins" pattern (handles "48 mins", "48mins", "48 m", "48m")
    const minsMatch = workingHoursStr.match(/(\d+)\s*(?:mins?|m)/i);
    if (minsMatch) {
      totalMinutes += parseInt(minsMatch[1], 10);
    }

    // If no hours or minutes found, try to parse as a decimal hours
    if (totalMinutes === 0) {
      const decimalMatch = workingHoursStr.match(
        /(\d+\.?\d*)\s*(?:hrs?|h|hours?)/i,
      );
      if (decimalMatch) {
        totalMinutes = Math.round(parseFloat(decimalMatch[1]) * 60);
      }
    }

    console.log(
      `📊 Parsed "${workingHoursStr}" → ${totalMinutes} minutes → ${totalMinutes * 60 * 1000} ms`,
    );
    return totalMinutes > 0 ? totalMinutes * 60 * 1000 : null;
  };

  // Get the actual worked hours from API (in milliseconds)
  const getActualWorkedMsFromAPI = () => {
    if (!workingHoursFromAPI) return null;
    return parseWorkingHoursFromAPI(workingHoursFromAPI);
  };

  // Get the working hours limit (daily limit from settings)
  const getWorkingHoursLimit = () => {
    const settingsLimit = getLimitMs();
    console.log(
      "📋 Daily working hours limit (from settings):",
      settingsLimit,
      "ms",
    );
    return settingsLimit;
  };

  // Get actual worked hours from API
  const actualWorkedMs = getActualWorkedMsFromAPI();

  useEffect(() => {
    if (isOpen && punchInTime) {
      const updateTimes = () => {
        // We'll update the workingMs state with the actual work time (excluding breaks)
        // But for overtime calculation, we need total time (including breaks)
        setWorkingMs(getWorkingDurationMs());
      };
      updateTimes();
      const interval = setInterval(updateTimes, 1000);
      return () => clearInterval(interval);
    } else {
      setWorkingMs(0);
      setIsOvertimeConfirmed(false);
    }
  }, [
    isOpen,
    punchInTime,
    totalBreakMs,
    isOnBreak,
    breakStartTime,
    employeeBreaks,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Constants
  // ─────────────────────────────────────────────────────────────
  const ALLOWED_BREAK_MS = 60 * 60 * 1000; // 1 hour grace break (from policy)

  // Daily required hours from settings
  const LIMIT_MS = getWorkingHoursLimit();

  // ─────────────────────────────────────────────────────────────
  // Duration calculations
  // ─────────────────────────────────────────────────────────────

  // Total elapsed from punch-in to now (INCLUDES all break time)
  const getTotalDurationMs = () => {
    if (!punchInTime) return 0;
    const startTime = parsePunchTime(punchInTime);
    if (!startTime || isNaN(startTime.getTime())) return 0;
    return Math.max(0, new Date() - startTime);
  };

  // Server is the source of truth for breaks (HR can edit them).
  // Accepts either { breaks: [...] } (what the API returns) or a plain array.
  const getServerBreaks = () => {
    let list = null;
    if (Array.isArray(employeeBreaks)) list = employeeBreaks;
    else if (employeeBreaks && Array.isArray(employeeBreaks.breaks))
      list = employeeBreaks.breaks;
    if (!list) return null; // not loaded yet

    // The API returns breaks from ALL days (and a lifetime total_break_minutes),
    // so keep only today's. Use the break's own `date` field (the attendance day),
    // NOT start_time, because HR edits can move start_time to another day.
    const todayStr = getTodayInTimezone(workTimezone);
    return list.filter(
      (b) => b && String(b.date || b.start_time || "").slice(0, 10) === todayStr,
    );
  };

  // Total break taken, computed from the server's (possibly HR-edited) breaks.
  // An HR-edited duration_minutes wins; an open break counts up to "now".
  // Only if breaks were never loaded do we fall back to the local counter.
  const getActualBreakMs = () => {
    const serverBreaks = getServerBreaks();
    if (!serverBreaks) return totalBreakMs || 0;

    return serverBreaks.reduce((sum, b) => {
      if (!b) return sum;
      if (b.end_time && b.duration_minutes != null && b.duration_minutes !== "") {
        return sum + Number(b.duration_minutes) * 60000;
      }
      if (b.start_time) {
        const start = parsePunchTime(b.start_time);
        const end = b.end_time ? parsePunchTime(b.end_time) : new Date();
        const diff = end - start;
        if (diff > 0) return sum + diff;
      }
      return sum;
    }, 0);
  };

  // Only the break beyond the 1h grace is chargeable
  const getChargeableBreakMs = () =>
    Math.max(0, getActualBreakMs() - ALLOWED_BREAK_MS);

  // Effective work time = elapsed − chargeable break
  // The first 1h of break is invisible to this calculation.
  const getWorkingDurationMs = () =>
    Math.max(0, getTotalDurationMs() - getChargeableBreakMs());

  // ─────────────────────────────────────────────────────────────
  // Values used by the render block
  // ─────────────────────────────────────────────────────────────
  const totalDurationMs = getTotalDurationMs();
  const actualBreakMs = getActualBreakMs();
  const chargeableBreakMs = getChargeableBreakMs();

  const effectiveWorkedMs = getWorkingDurationMs();

  // Overtime: only when effective work exceeds the daily requirement
  const isOvertimeThresholdExceeded = effectiveWorkedMs > LIMIT_MS;
  const overtimeMs = isOvertimeThresholdExceeded
    ? effectiveWorkedMs - LIMIT_MS
    : 0;
  const totalTimeWithBreaks = totalDurationMs;

  // For display, show both: work time and break time
  const breakTimeDisplay = actualBreakMs;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tasksCompleted.trim()) {
      showToast("Please fill in Tasks Completed Today", "error");
      return;
    }

    const finalOvertime = isOvertimeThresholdExceeded && isOvertimeConfirmed;
    const finalOvertimeHours = finalOvertime
      ? formatDuration(overtimeMs)
      : null;

    console.group("🔍 PUNCH OUT SUBMIT");
    console.log("📤 Submitting with data:", {
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null,
      is_overtime: finalOvertime,
      overtime_hours: finalOvertimeHours,
      working_hours_from_api: workingHoursFromAPI,
      total_time_with_breaks: formatDuration(totalTimeWithBreaks),
      break_time: formatDuration(breakTimeDisplay),
      work_time: formatDuration(effectiveWorkedMs),
      daily_limit_ms: LIMIT_MS,
    });
    console.groupEnd();

    onSubmit({
      tasks_completed: tasksCompleted,
      plan_tomorrow: planTomorrow || null,
      pending_tasks: pendingWorks || null,
      is_overtime: finalOvertime,
      overtime_hours: finalOvertimeHours,
    });

    setTasksCompleted("");
    setPlanTomorrow("");
    setPendingWorks("");
    setIsOvertimeConfirmed(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[var(--surface)] rounded-xl w-full max-w-lg shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)] flex-shrink-0">
          <h3 className="text-xl font-bold text-[var(--text)]">Punch Out</h3>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5">
            {/* Working Hours Info - Shows both work time and break time */}
            {totalTimeWithBreaks > 0 && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  isOvertimeThresholdExceeded
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                <h4
                  className={`text-sm font-bold mb-2.5 flex items-center gap-1.5 ${
                    isOvertimeThresholdExceeded
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                >
                  <FiClock size={16} />
                  {isOvertimeThresholdExceeded
                    ? "⚠️ Overtime Detected"
                    : "Working Hours Summary"}
                </h4>

                <div
                  className={`grid ${
                    isOvertimeThresholdExceeded ? "grid-cols-4" : "grid-cols-3"
                  } gap-2 text-center text-xs mb-3 text-[var(--text)]`}
                >
                  <div className="p-2 bg-[var(--surface2)] rounded-lg">
                    <span className="text-[var(--muted)] block mb-0.5">
                      Working Hours
                    </span>
                    <span className="font-semibold text-gray-400">
                      {formatDuration(LIMIT_MS)}
                    </span>
                  </div>
                  <div className="p-2 bg-[var(--surface2)] rounded-lg">
                    <span className="text-[var(--muted)] block mb-0.5">
                      Worked Hours
                    </span>
                    <span className="font-semibold text-green-500">
                      {formatDuration(effectiveWorkedMs)}
                    </span>
                  </div>
                  <div className="p-2 bg-[var(--surface2)] rounded-lg">
                    <span className="text-[var(--muted)] block mb-0.5">
                      Break Time
                    </span>
                    <span className="font-semibold text-amber-500">
                      {formatDuration(actualBreakMs)}
                    </span>
                    <span className="block text-[10px] text-[var(--muted)] mt-0.5">
                      {chargeableBreakMs > 0
                        ? `${formatDuration(ALLOWED_BREAK_MS)} allowed · ${formatDuration(
                            chargeableBreakMs,
                          )} counted`
                        : `${formatDuration(ALLOWED_BREAK_MS)} allowed · fully within grace`}
                    </span>
                  </div>
                  {/* Overtime tile only - no "Remaining" tile */}
                  {isOvertimeThresholdExceeded && (
                    <div className="p-2 rounded-lg font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <span className="block mb-0.5">Overtime</span>
                      <span>{formatDuration(overtimeMs)}</span>
                    </div>
                  )}
                </div>

                {/* Show total duration breakdown */}
                <div className="text-center text-xs text-[var(--muted)]">
                  Total Duration (Work + Break):{" "}
                  <span className="font-semibold text-[var(--text)]">
                    {formatDuration(totalDurationMs)}
                  </span>
                  {chargeableBreakMs > 0 && (
                    <span className="ml-1 text-red-500">
                      · {formatDuration(chargeableBreakMs)} of break above grace
                    </span>
                  )}
                </div>

                {/* Show overtime checkbox only when threshold is exceeded */}
                {isOvertimeThresholdExceeded && (
                  <label className="flex items-start gap-2.5 cursor-pointer select-none mt-2 p-1.5 hover:bg-amber-500/5 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name="is_overtime"
                      checked={isOvertimeConfirmed}
                      onChange={(e) => setIsOvertimeConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500/20 border-[var(--border)] bg-[var(--surface2)] cursor-pointer h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[var(--text)] leading-tight">
                      Is this extra {formatDuration(overtimeMs)} actually to be
                      counted as Overtime? (Break time excluded beyond the 1h
                      grace)
                    </span>
                  </label>
                )}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Tasks Completed Today <span className="text-red-500">*</span>
              </label>
              <textarea
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
                placeholder="What tasks did you complete today?"
                rows="4"
                className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-y"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Pending Works{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <textarea
                value={pendingWorks}
                onChange={(e) => setPendingWorks(e.target.value)}
                placeholder="What tasks are still pending? (Optional)"
                rows="3"
                className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-y"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                List any incomplete tasks that need to be carried forward
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Plan for Tomorrow{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <textarea
                value={planTomorrow}
                onChange={(e) => setPlanTomorrow(e.target.value)}
                placeholder="What are your plans for tomorrow? (Optional)"
                rows="4"
                className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-y"
              />
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t border-[var(--border)] flex-shrink-0">
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