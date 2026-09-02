import { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiClock } from "react-icons/fi";
import { showToast } from "../common/Toast";

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
  employeeBreaks = [], // Break data from API
}) => {
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [pendingWorks, setPendingWorks] = useState("");
  const [isOvertimeConfirmed, setIsOvertimeConfirmed] = useState(false);
  const [workingMs, setWorkingMs] = useState(0);
  const [totalBreakMsFromAPI, setTotalBreakMsFromAPI] = useState(0);

  // Calculate total break minutes from API data
  useEffect(() => {
    if (employeeBreaks && employeeBreaks.length > 0) {
      const totalMinutes = employeeBreaks.reduce((sum, breakItem) => {
        // If break has duration_minutes, use it
        if (breakItem.duration_minutes) {
          return sum + breakItem.duration_minutes;
        }
        // Otherwise calculate from start and end times
        if (breakItem.start_time && breakItem.end_time) {
          const start = new Date(breakItem.start_time);
          const end = new Date(breakItem.end_time);
          const diffMs = end - start;
          if (diffMs > 0) {
            return sum + (diffMs / 60000); // Convert to minutes
          }
        }
        return sum;
      }, 0);
      
      setTotalBreakMsFromAPI(totalMinutes * 60 * 1000); // Convert to milliseconds
      console.log(`📊 Total break time from API: ${totalMinutes} minutes`);
    }
  }, [employeeBreaks]);

  // Format duration helper (Xh Ym)
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Helper function to parse punch time with proper timezone handling
  const parsePunchTime = (time) => {
    if (!time) return null;
    try {
      // Handle "HH:MM AM/PM" format (e.g., "08:59 AM")
      if (
        typeof time === "string" &&
        time.match(/(\d{1,2}:\d{2})\s*(AM|PM)/i)
      ) {
        const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();

          if (ampm === "PM" && hours !== 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;

          const now = new Date();
          return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            0,
          );
        }
      }

      // Handle "HH:MM:SS" format (24-hour)
      if (typeof time === "string" && time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const now = new Date();
        const [hours, minutes, seconds] = time.split(":");
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(hours, 10),
          parseInt(minutes, 10),
          parseInt(seconds, 10),
        );
      }

      // Handle ISO string with T
      if (typeof time === "string" && time.includes("T")) {
        if (!time.match(/(Z|[+-]\d{2}:\d{2})$/)) {
          return new Date(`${time}Z`);
        }
        return new Date(time);
      }

      // Handle date with space
      if (typeof time === "string" && time.includes(" ")) {
        const isoTime = time.replace(" ", "T");
        if (!isoTime.match(/(Z|[+-]\d{2}:\d{2})$/)) {
          return new Date(`${isoTime}Z`);
        }
        return new Date(isoTime);
      }

      if (time instanceof Date) {
        return time;
      }
      return new Date(time);
    } catch (e) {
      console.error("Error parsing time:", time, e);
      return null;
    }
  };

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

    const dayIndex = date.getDay();
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
      const decimalMatch = workingHoursStr.match(/(\d+\.?\d*)\s*(?:hrs?|h|hours?)/i);
      if (decimalMatch) {
        totalMinutes = Math.round(parseFloat(decimalMatch[1]) * 60);
      }
    }

    console.log(`📊 Parsed "${workingHoursStr}" → ${totalMinutes} minutes → ${totalMinutes * 60 * 1000} ms`);
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
    console.log("📋 Daily working hours limit (from settings):", settingsLimit, "ms");
    return settingsLimit;
  };

  const LIMIT_MS = getWorkingHoursLimit();
  
  // Get actual worked hours from API
  const actualWorkedMs = getActualWorkedMsFromAPI();

  // Get working duration including break time
  const getTotalDurationMs = () => {
    if (!punchInTime) return 0;

    const startTime = parsePunchTime(punchInTime);
    if (!startTime || isNaN(startTime.getTime())) return 0;

    // End time is now (since we're punching out)
    const endTime = new Date();

    let diff = Math.max(0, endTime - startTime);
    
    // Total duration includes both work time AND break time
    // So we don't subtract break time
    // Instead, we'll add break time from API if available
    
    // Use break time from API (more accurate)
    const breakTimeMs = totalBreakMsFromAPI > 0 ? totalBreakMsFromAPI : (totalBreakMs || 0);
    
    // Total = time from punch-in to now (including breaks)
    // No subtraction needed
    console.log(`📊 Total duration (including breaks): ${formatDuration(diff)}`);
    
    return diff;
  };

  // Get working duration excluding break time (actual work time)
  const getWorkingDurationMs = () => {
    if (!punchInTime) return 0;

    const startTime = parsePunchTime(punchInTime);
    if (!startTime || isNaN(startTime.getTime())) return 0;

    const endTime = new Date();

    let diff = Math.max(0, endTime - startTime);
    
    // Use break time from API if available
    const breakTimeMs = totalBreakMsFromAPI > 0 ? totalBreakMsFromAPI : (totalBreakMs || 0);
    
    // Subtract break time to get actual work time
    diff = Math.max(0, diff - breakTimeMs);
    
    return diff;
  };

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
  }, [isOpen, punchInTime, totalBreakMs, isOnBreak, breakStartTime, totalBreakMsFromAPI]);

  // Calculate total duration including breaks
  const totalDurationMs = getTotalDurationMs();
  
  // Use API working hours for work time, fallback to frontend calculation
  const effectiveWorkedMs = actualWorkedMs !== null ? actualWorkedMs : workingMs;
  
  // For overtime check, use total duration (including breaks) vs limit
  // This is the key change: overtime = (work time + break time) - limit
  const totalTimeWithBreaks = totalDurationMs;
  
  // Check if total time (work + breaks) exceeds limit
  const isOvertimeThresholdExceeded = totalTimeWithBreaks > LIMIT_MS;

  // For display, show both: work time and break time
  const breakTimeDisplay = totalBreakMsFromAPI > 0 ? totalBreakMsFromAPI : (totalBreakMs || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tasksCompleted.trim()) {
      showToast("Please fill in Tasks Completed Today", "error");
      return;
    }

    const finalOvertime = isOvertimeThresholdExceeded && isOvertimeConfirmed;
    const finalOvertimeHours = finalOvertime
      ? formatDuration(totalTimeWithBreaks - LIMIT_MS)
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
            {(totalTimeWithBreaks > 0) && (
              <div className={`mb-6 p-4 rounded-xl border ${
                isOvertimeThresholdExceeded 
                  ? "bg-amber-500/10 border-amber-500/20" 
                  : "bg-blue-500/10 border-blue-500/20"
              }`}>
                <h4 className={`text-sm font-bold mb-2.5 flex items-center gap-1.5 ${
                  isOvertimeThresholdExceeded ? "text-amber-500" : "text-blue-500"
                }`}>
                  <FiClock size={16} /> 
                  {isOvertimeThresholdExceeded ? "⚠️ Overtime Detected" : "Working Hours Summary"}
                </h4>
                
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3 text-[var(--text)]">
                  <div className="p-2 bg-[var(--surface2)] rounded-lg">
                    <span className="text-[var(--muted)] block mb-0.5">
                      Daily Limit
                    </span>
                    <span className="font-semibold text-gray-400">
                      {formatDuration(LIMIT_MS)}
                    </span>
                  </div>
                  <div className="p-2 bg-[var(--surface2)] rounded-lg">
                    <span className="text-[var(--muted)] block mb-0.5">
                      Work Time
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
                      {formatDuration(breakTimeDisplay)}
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg font-bold ${
                    isOvertimeThresholdExceeded 
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
                      : "bg-green-500/20 text-green-600 dark:text-green-400"
                  }`}>
                    <span className="block mb-0.5">
                      {isOvertimeThresholdExceeded ? "Overtime" : "Remaining"}
                    </span>
                    <span>
                      {isOvertimeThresholdExceeded 
                        ? formatDuration(totalTimeWithBreaks - LIMIT_MS)
                        : formatDuration(LIMIT_MS - totalTimeWithBreaks)
                      }
                    </span>
                  </div>
                </div>

                {/* Show total duration breakdown */}
                <div className="text-center text-xs text-[var(--muted)]">
                  Total Duration (Work + Break): <span className="font-semibold text-[var(--text)]">{formatDuration(totalTimeWithBreaks)}</span>
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
                      Is this extra {formatDuration(totalTimeWithBreaks - LIMIT_MS)} actually to be counted as Overtime? (Includes break time)
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