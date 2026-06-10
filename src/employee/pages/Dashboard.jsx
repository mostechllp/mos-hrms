import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  punchIn,
  punchOut,
  fetchDashboardData,
  pendingPunchOut,
} from "../store/slices/attendanceSlice";
import { PunchOutModal } from "../components/modals/PunchOutModal";
import PendingPunchOutModal from "../components/attendance/PendingPunchoutModal";
import { useAppTheme } from "../../context/ThemeContext";
import {
  fetchMyTasks,
  updateTaskStatus as updateEmployeeTaskStatus,
} from "../store/slices/taskSlice";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, dashboardData } = useSelector(
    (state) => state.EmpAttendance,
  );
  const { primaryColor, primaryDark } = useAppTheme();

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  });

  // Helper function to adjust color brightness
  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color && color.startsWith("#")) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color || "#2ecc71";
    }

    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));

    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
  };

  // Create gradient based on primary color
  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor || "#2ecc71"}, ${primaryDark || adjustColor(primaryColor || "#2ecc71", -20)})`,
  };

  // Use dashboard data as source of truth (not Redux isPunchedIn)
  const todayAttendance = dashboardData?.today_attendance || {};
  // Fix: Only consider punched out if there's actually a punch_out_time value
  const isActuallyPunchedIn =
    todayAttendance.punched_in === true &&
    (todayAttendance.punched_out !== true ||
      todayAttendance.punch_out_time === "--");
  const punchInTimeFromApi = todayAttendance.punch_in_time;
  const canPunch = dashboardData?.can_punch ?? true;

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showPunchOutModal, setShowPunchOutModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tick, setTick] = useState(0);
  const [currentDuration, setCurrentDuration] = useState("00h 00m 00s");
  const [isOnBreak, setIsOnBreak] = useState(
    localStorage.getItem("attendance-on-break") === "true",
  );
  const [breakStartTime, setBreakStartTime] = useState(
    localStorage.getItem("attendance-break-start-time"),
  );
  const [totalBreakMs, setTotalBreakMs] = useState(
    parseInt(localStorage.getItem("attendance-total-break-ms") || "0", 10),
  );
  const [numberOfBreaks, setNumberOfBreaks] = useState(
    parseInt(localStorage.getItem("attendance-breaks-count") || "0", 10),
  );
  const [breakHistory, setBreakHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("attendance-break-history")) || [];
    } catch (e) {
      return [];
    }
  });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingPunchDate, setPendingPunchDate] = useState("");
  const [pendingPunchSubmitting, setPendingPunchSubmitting] = useState(false);
  const chartRef = useRef(null);

  // Helper function to format time in 12-hour format
  const formatTo12Hour = (timeString) => {
    if (!timeString) return "";
    try {
      // Parse time string (expected format: "HH:MM" or "HH:MM:SS")
      let hours, minutes;
      if (timeString.includes(":")) {
        const parts = timeString.split(":");
        hours = parseInt(parts[0], 10);
        minutes = parts[1];
      } else {
        return timeString;
      }

      const ampm = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  // Show toast notification
  const showToastMessage = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Add to Dashboard component
  useEffect(() => {
    const checkPendingPunchOut = async () => {
      if (dashboardData?.pending_punch_out) {
        setPendingPunchDate(dashboardData.pending_punch_out.date);
        setShowPendingModal(true);
      } else if (
        !canPunch &&
        !isActuallyPunchedIn &&
        dashboardData?.error_message
      ) {
        const errorMsg = dashboardData.error_message;
        if (errorMsg.includes("pending punch-out")) {
          const dateMatch = errorMsg.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            setPendingPunchDate(dateMatch[1]);
            setShowPendingModal(true);
          }
        }
      }
    };

    if (dashboardData) {
      checkPendingPunchOut();
    }
  }, [dashboardData]);

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
      setTick((prev) => prev + 1);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Punch In/Out
  const handlePunch = async () => {
    if (!isActuallyPunchedIn) {
      if (!canPunch) {
        showToastMessage("You cannot punch in at this time", "error");
        return;
      }

      setIsSubmitting(true);
      const result = await dispatch(punchIn());
      setIsSubmitting(false);

      if (punchIn.fulfilled.match(result)) {
        showToastMessage("Punched in successfully!", "success");
        await dispatch(fetchDashboardData());
      } else {
        const errorMsg = result.payload || "Punch in failed";
        if (
          errorMsg.includes("pending punch-out") ||
          errorMsg.includes("forgot to punch out")
        ) {
          const dateMatch = errorMsg.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            setPendingPunchDate(dateMatch[1]);
            setShowPendingModal(true);
          } else {
            showToastMessage(errorMsg, "error");
          }
        } else {
          showToastMessage(errorMsg, "error");
        }
      }
    } else {
      setShowPunchOutModal(true);
    }
  };

  const handlePendingPunchOut = async (data) => {
    setPendingPunchSubmitting(true);

    const result = await dispatch(
      pendingPunchOut({
        tasks_completed: data.tasks_completed,
        plan_tomorrow: data.plan_tomorrow,
        pending_works: data.pending_works || "",
        punch_out_time: data.punch_out_time,
        date: pendingPunchDate,
      }),
    );

    setPendingPunchSubmitting(false);

    if (pendingPunchOut.fulfilled.match(result)) {
      showToastMessage(
        `Successfully punched out for ${pendingPunchDate}! You can now punch in today.`,
        "success",
      );
      setShowPendingModal(false);

      // Clear any break state
      setIsOnBreak(false);
      setTotalBreakMs(0);
      setNumberOfBreaks(0);
      setBreakHistory([]);
      localStorage.removeItem("attendance-on-break");
      localStorage.removeItem("attendance-break-start-time");
      localStorage.removeItem("attendance-total-break-ms");
      localStorage.removeItem("attendance-breaks-count");
      localStorage.removeItem("attendance-break-history");

      // Refresh dashboard data
      await dispatch(fetchDashboardData());

      // Now the user can punch in for today
      setTimeout(() => {
        showToastMessage("You can now punch in for today", "success");
      }, 1000);
    } else {
      showToastMessage(
        result.payload || "Failed to complete pending punch out",
        "error",
      );
    }
  };

  const handleBreakToggle = () => {
    if (!isOnBreak) {
      const nowStr = new Date().toISOString();
      setIsOnBreak(true);
      setBreakStartTime(nowStr);
      setNumberOfBreaks((prev) => {
        const newCount = prev + 1;
        localStorage.setItem("attendance-breaks-count", newCount.toString());
        return newCount;
      });
      localStorage.setItem("attendance-on-break", "true");
      localStorage.setItem("attendance-break-start-time", nowStr);
      showToastMessage("⏸️ Break Started", "success");
    } else {
      const breakStart = new Date(breakStartTime);
      const breakEnd = new Date();
      const diff = breakEnd - breakStart;
      const newTotal = totalBreakMs + diff;

      const newHistory = [
        ...breakHistory,
        {
          start: breakStartTime,
          end: breakEnd.toISOString(),
          durationMs: diff,
        },
      ];
      setBreakHistory(newHistory);
      localStorage.setItem(
        "attendance-break-history",
        JSON.stringify(newHistory),
      );

      setIsOnBreak(false);
      setTotalBreakMs(newTotal);
      localStorage.setItem("attendance-on-break", "false");
      localStorage.setItem("attendance-total-break-ms", newTotal.toString());
      localStorage.removeItem("attendance-break-start-time");
      showToastMessage("▶️ Work Resumed", "success");
    }
  };

  const handlePunchOutSubmit = async (data) => {
    console.group("🔍 PUNCH OUT SUBMIT DEBUG");
    console.log("📤 Submitting punch out with data:", {
      tasks_completed: data.tasks_completed,
      plan_tomorrow: data.plan_tomorrow,
      pending_tasks: data.pending_tasks || "",
    });

    setIsSubmitting(true);
    const result = await dispatch(
      punchOut({
        tasks_completed: data.tasks_completed,
        plan_tomorrow: data.plan_tomorrow,
        pending_tasks: data.pending_tasks || "",
      }),
    );

    console.log("📥 Punch out result:", result);
    console.groupEnd();

    setIsSubmitting(false);

    if (punchOut.fulfilled.match(result)) {
      console.log("✅ Punch out successful! Response:", result.payload);
      showToastMessage("Punched out successfully!", "success");
      setShowPunchOutModal(false);

      setIsOnBreak(false);
      setTotalBreakMs(0);
      setNumberOfBreaks(0);
      setBreakHistory([]);
      localStorage.removeItem("attendance-on-break");
      localStorage.removeItem("attendance-break-start-time");
      localStorage.removeItem("attendance-total-break-ms");
      localStorage.removeItem("attendance-breaks-count");
      localStorage.removeItem("attendance-break-history");

      await dispatch(fetchDashboardData());

      showToastMessage(
        "Task report has been saved! You can view it in Task Reports section.",
        "success",
      );
    } else {
      console.error("❌ Punch out failed:", result.payload);
      showToastMessage(result.payload || "❌ Punch out failed", "error");
    }
  };

  // Format punch time with proper timezone handling
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

  const formatPunchTime = (time) => {
    // If time is already in "HH:MM AM" format, return as is
    if (typeof time === "string" && time.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
      return time;
    }

    const date = parsePunchTime(time);
    if (!date || isNaN(date.getTime())) return time || "—";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Update the fetchEmployeeTasks function to limit to 2 tasks
  const fetchEmployeeTasks = async () => {
    setTasksLoading(true);
    try {
      // Fetch only 2 tasks for dashboard overview
      const result = await dispatch(fetchMyTasks({ per_page: 2, page: 1 }));
      if (fetchMyTasks.fulfilled.match(result)) {
        const data = result.payload?.data || result.payload;
        // Handle the new task structure with project object
        const taskList = data?.data || data || [];

        // Transform tasks to have client_name and website_url from project if not directly available
        const transformedTasks = taskList.map((task) => ({
          ...task,
          client_name: task.client_name || task.project?.client_name || "",
          website_url: task.website_url || task.project?.website_url || "",
        }));

        setTasks(transformedTasks);
        setTaskStats(data?.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  // Add this function for status update
  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    const result = await dispatch(
      updateEmployeeTaskStatus({ id: taskId, status: newStatus }),
    );
    if (updateEmployeeTaskStatus.fulfilled.match(result)) {
      showToastMessage(
        `Task marked as ${newStatus.replace("_", " ")}`,
        "success",
      );
      fetchEmployeeTasks(); // Refresh tasks
    } else {
      showToastMessage(result.payload || "Failed to update status", "error");
    }
  };

  // Add useEffect to fetch tasks on mount
  useEffect(() => {
    fetchEmployeeTasks();
  }, []);

  // Prepare chart data from attendance history
  const getChartData = () => {
    if (
      !dashboardData?.attendance_history ||
      dashboardData.attendance_history.length === 0
    ) {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Hours Worked",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: primaryColor || "#2ecc71",
            borderRadius: 8,
            barPercentage: 0.6,
          },
        ],
      };
    }

    const last7Days = [];
    const hoursWorked = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push(dayName);

      const attendance = dashboardData.attendance_history.find(
        (a) => a.log_date === dateStr,
      );
      if (attendance && attendance.punch_in && attendance.punch_out) {
        const punchInTimeDate = parsePunchTime(attendance.punch_in);
        const punchOutTimeDate = parsePunchTime(attendance.punch_out);
        if (
          punchInTimeDate &&
          punchOutTimeDate &&
          !isNaN(punchInTimeDate.getTime()) &&
          !isNaN(punchOutTimeDate.getTime())
        ) {
          const hours = (punchOutTimeDate - punchInTimeDate) / (1000 * 60 * 60);
          hoursWorked.push(Math.round(hours * 10) / 10);
        } else {
          hoursWorked.push(0);
        }
      } else {
        hoursWorked.push(0);
      }
    }

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Hours Worked",
          data: hoursWorked,
          backgroundColor: primaryColor || "#2ecc71",
          borderRadius: 8,
          barPercentage: 0.6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: primaryColor || "#2ecc71",
        callbacks: {
          label: (context) => {
            const hours = context.raw;
            return hours > 0 ? `${hours} hours` : "No data";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 9,
        title: { display: true, text: "Hours", font: { size: 11 } },
        ticks: { stepSize: 2 },
      },
      x: { ticks: { font: { size: 11 } } },
    },
  };

  // Get employee name
  const getEmployeeName = () => {
    if (dashboardData?.employee) {
      return `${dashboardData.employee.first_name} ${dashboardData.employee.last_name}`;
    }
    return user?.name || "User";
  };

  // Get employee role/ID
  const getEmployeeRole = () => {
    if (dashboardData?.employee) {
      return `Employee ID: ${dashboardData.employee.employee_id}`;
    }
    return user?.role?.name || user?.role || "Employee";
  };

  // Determine if button should be disabled
  const isButtonDisabled = () => {
    if (loading || isSubmitting) return true;
    if (!isActuallyPunchedIn && !canPunch) return true;
    return false;
  };

  // Get button text
  const getButtonText = () => {
    if (loading || isSubmitting) return "Processing...";
    return isActuallyPunchedIn ? "Punch Out" : "Punch In";
  };

  // Get status display
  const getStatusDisplay = () => {
    if (isActuallyPunchedIn) {
      return { text: "Punched In ✓", color: "text-green-500" };
    }
    if (todayAttendance.punched_out === true) {
      return { text: "Punched Out ✓", color: "text-blue-500" };
    }
    return { text: "Not Punched In", color: "text-red-500" };
  };

  const statusDisplay = getStatusDisplay();
  const displayPunchTime = punchInTimeFromApi || todayAttendance.punch_in_time;

  // Update duration every second when punched in
  // Initialize duration when component loads or punch-in state changes
  useEffect(() => {
    if (isActuallyPunchedIn && displayPunchTime) {
      // Force an immediate duration calculation
      const updateDuration = () => {
        const newDuration = getDuration();
        setCurrentDuration(newDuration);
      };
      updateDuration();

      // Set up interval for real-time updates
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    } else {
      // If not punched in, show zero duration
      setCurrentDuration("00h 00m 00s");
    }
  }, [
    isActuallyPunchedIn,
    displayPunchTime,
    totalBreakMs,
    isOnBreak,
    breakStartTime,
  ]);

  const getDuration = () => {
    if (!displayPunchTime) return "00h 00m 00s";

    const startTime = parsePunchTime(displayPunchTime);
    if (!startTime || isNaN(startTime.getTime())) return "00h 00m 00s";

    let endTime;
    if (isActuallyPunchedIn) {
      if (isOnBreak && breakStartTime) {
        endTime = new Date(breakStartTime);
      } else {
        endTime = new Date();
      }
    } else if (
      todayAttendance.punched_out === true &&
      todayAttendance.punch_out_time !== "--"
    ) {
      // Only consider punched out if there's an actual punch out time
      const outTime =
        todayAttendance.punch_out_time || todayAttendance.punch_out;
      if (outTime && outTime !== "--") {
        endTime = parsePunchTime(outTime);
      } else {
        // If no valid punch out time, treat as still punched in
        endTime = new Date();
      }
    } else {
      return "00h 00m 00s";
    }

    if (!endTime || isNaN(endTime.getTime())) return "00h 00m 00s";

    let diff = Math.max(0, endTime - startTime);
    diff -= totalBreakMs;
    diff = Math.max(0, diff);

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };
  const formatBreakDuration = (ms) => {
    let currentTotalMs = ms;
    if (isOnBreak && breakStartTime) {
      currentTotalMs += Math.max(0, new Date() - new Date(breakStartTime));
    }

    if (currentTotalMs <= 0) return "00h 00m 00s";

    const h = Math.floor(currentTotalMs / 3600000);
    const m = Math.floor((currentTotalMs % 3600000) / 60000);
    const s = Math.floor((currentTotalMs % 60000) / 1000);

    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  // Debug log to see what time we're getting
  useEffect(() => {
    if (displayPunchTime) {
      console.log("Raw punch time from API:", displayPunchTime);
      console.log("Formatted punch time:", formatPunchTime(displayPunchTime));
    }
  }, [displayPunchTime]);

  return (
    <div>
      {/* Welcome Banner with Theme Support */}
      <div
        className="welcome-banner rounded-xl p-5 md:p-7 mb-7 flex flex-col md:flex-row justify-between items-center gap-5"
        style={gradientStyle}
      >
        <div className="welcome-left flex items-center gap-5 flex-wrap">
          <div className="welcome-avatar w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <i className="fas fa-user text-white text-3xl"></i>
          </div>
          <div className="welcome-text">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Welcome, {getEmployeeName()}! 👋
            </h2>
            <p className="text-white/90 text-xs md:text-sm">
              {getEmployeeRole()}
            </p>
          </div>
        </div>
        <div className="datetime-info text-center md:text-right text-white">
          <div className="time text-2xl md:text-3xl font-bold">
            {currentTime}
          </div>
          <div className="date text-xs opacity-90">{currentDate}</div>
        </div>
      </div>

      {/* Punch Card */}
      <div className="punch-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-6 mb-7 flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="punch-stats flex gap-8 md:gap-10 flex-wrap justify-center">
          <div className="punch-item text-center">
            <div className="punch-label text-xs text-[var(--muted)] mb-2">
              Today's Date
            </div>
            <div className="punch-value text-sm font-semibold text-[var(--text)]">
              {currentDate}
            </div>
          </div>
          <div className="punch-item text-center">
            <div className="punch-label text-xs text-[var(--muted)] mb-2">
              Punch In Time
            </div>
            <div
              className={`punch-value text-2xl font-bold ${isActuallyPunchedIn ? "text-green-500" : "text-[var(--text)]"}`}
            >
              {formatPunchTime(displayPunchTime)}
            </div>
          </div>
          <div className="punch-item text-center">
            <div className="punch-label text-xs text-[var(--muted)] mb-2">
              Duration
            </div>
            <div className={`punch-value text-2xl font-bold text-blue-500`}>
              {currentDuration}
            </div>
          </div>
          <div className="punch-item text-center">
            <div className="punch-label text-xs text-[var(--muted)] mb-2">
              Status
            </div>
            <div
              className={`punch-value text-lg font-bold ${isOnBreak ? "text-amber-500" : statusDisplay.color}`}
            >
              {isOnBreak ? "On Break ☕" : statusDisplay.text}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {isActuallyPunchedIn && (
            <button
              onClick={handleBreakToggle}
              className={`break-btn border-none text-white py-3 px-6 rounded-full font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md ${isOnBreak ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              <i className={`fas ${isOnBreak ? "fa-play" : "fa-pause"}`}></i>
              {isOnBreak ? "Resume Work" : "Take Break"}
            </button>
          )}
          <button
            onClick={handlePunch}
            disabled={isButtonDisabled() || isOnBreak}
            className={`punch-btn border-none text-white py-3 px-8 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isActuallyPunchedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            <i className="fas fa-fingerprint"></i>
            {getButtonText()}
          </button>
        </div>
      </div>

      {/* Break Details Card */}
      {(numberOfBreaks > 0 || isOnBreak) && (
        <div className="break-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-6 mb-7 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-5 w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                <i className="fas fa-coffee"></i>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base font-semibold text-[var(--text)]">
                  Break Details
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Your break summary for today
                </p>
              </div>
            </div>

            <div className="flex gap-8 md:gap-12 flex-wrap justify-center sm:justify-end flex-1 w-full sm:w-auto">
              {isOnBreak && breakStartTime && (
                <div className="break-stat text-center">
                  <div className="text-xs text-[var(--muted)] mb-1">
                    Started At
                  </div>
                  <div className="text-lg font-bold text-[var(--text)]">
                    {formatTo12Hour(
                      new Date(breakStartTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }),
                    )}
                  </div>
                </div>
              )}
              <div className="break-stat text-center">
                <div className="text-xs text-[var(--muted)] mb-1">
                  Total Break Time
                </div>
                <div className="text-xl font-bold text-amber-500">
                  {formatBreakDuration(totalBreakMs)}
                </div>
              </div>
              <div className="break-stat text-center">
                <div className="text-xs text-[var(--muted)] mb-1">
                  Breaks Taken
                </div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {numberOfBreaks}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] w-full text-sm">
            <div className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <i className="fas fa-list-ul text-[var(--muted)]"></i> History
            </div>
            <div className="flex flex-col gap-2">
              {breakHistory.map((b, i) => (
                <div
                  key={i}
                  className="text-[var(--text)] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"></span>
                  Break {i + 1}:{" "}
                  {formatTo12Hour(
                    new Date(b.start).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                  )}{" "}
                  -{" "}
                  {formatTo12Hour(
                    new Date(b.end).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                  )}{" "}
                  ({Math.round(b.durationMs / 60000)} min)
                </div>
              ))}
              {isOnBreak && breakStartTime && (
                <div className="text-amber-500 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Break {breakHistory.length + 1}:{" "}
                  {formatTo12Hour(
                    new Date(breakStartTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                  )}{" "}
                  - Ongoing (
                  {Math.floor((new Date() - new Date(breakStartTime)) / 60000)}{" "}
                  min)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-3 gap-5 mb-7">
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="stat-icon w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-number text-3xl font-extrabold text-green-600">
            {dashboardData?.attendance_history?.filter(
              (a) => a.punch_in && a.punch_out,
            ).length || 0}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Days Present
          </div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="stat-icon w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-number text-3xl font-extrabold text-blue-500">
            {dashboardData?.leave_stats?.total_taken || 0}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Leaves Taken
          </div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="stat-icon w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="stat-number text-3xl font-extrabold text-amber-500">
            {dashboardData?.leave_stats?.balance || 0}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Leave Balance
          </div>
        </div>
      </div>

      {/* My Tasks Overview Section */}
      {/* <div className="my-tasks-section mt-7 mb-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
            <i className="fas fa-tasks text-green-500"></i> My Tasks
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
              {taskStats.total} Total
            </span>
          </h3>
          <button
            onClick={() => navigate("/employee/tasks")}
            className="text-sm text-green-500 hover:text-green-600 font-medium flex items-center gap-1"
          >
            View All <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>

        {tasksLoading ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-green-500"></i>
            <p className="text-sm text-[var(--muted)] mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <i className="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
            <p className="text-[var(--text)] font-medium">
              No tasks assigned yet
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              When tasks are assigned, they'll appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.status !== "completed";
              const priorityColors = {
                high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                medium:
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              };

              return (
                <div
                  key={task.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--text)]">
                        {task.name}
                      </h4>
                      {task.client_name && (
                        <p className="text-xs text-[var(--muted)] mt-1">
                          <i className="fas fa-building mr-1"></i>{" "}
                          {task.client_name}
                        </p>
                      )}
                      {task.website_url && (
                        <a
                          href={task.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline block mt-0.5"
                        >
                          <i className="fas fa-globe mr-1"></i>{" "}
                          {task.website_url}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}
                      >
                        {task.priority?.charAt(0).toUpperCase() +
                          task.priority?.slice(1) || "Medium"}
                      </span>
                      {isOverdue && (
                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"></i> Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {task.remarks && (
                    <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">
                      {task.remarks}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                    <div className="flex gap-3 text-xs text-[var(--muted)]">
                      <span title="Assigned Date">
                        <i className="fas fa-calendar-alt mr-1"></i>{" "}
                        {new Date(task.assigned_date).toLocaleDateString()}
                      </span>
                      {task.due_date && (
                        <span
                          className={isOverdue ? "text-red-500" : ""}
                          title="Due Date"
                        >
                          <i className="fas fa-hourglass-half mr-1"></i> Due:{" "}
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleTaskStatusUpdate(task.id, e.target.value)
                      }
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats Row */}
      {/* {taskStats.total > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-amber-600">
                {taskStats.pending || 0}
              </div>
              <div className="text-xs text-amber-600">Pending</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {taskStats.in_progress || 0}
              </div>
              <div className="text-xs text-blue-600">In Progress</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {taskStats.completed || 0}
              </div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {taskStats.overdue || 0}
              </div>
              <div className="text-xs text-red-600">Overdue</div>
            </div>
          </div>
        )}
      </div>  */}

      {/* Chart and Recent Activity Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-7">
        {/* Chart Card */}
        <div className="chart-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-base font-semibold text-[var(--text)] mb-5 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-500"></i> My Attendance
            (Last 7 Days)
          </h3>
          <div className="chart-container h-64 relative">
            <Bar ref={chartRef} data={getChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity Section */}
        {dashboardData?.attendance_history &&
          dashboardData.attendance_history.length > 0 && (
            <div className="recent-activity bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                  <i className="fas fa-history text-blue-500"></i>
                  Recent Activity
                </h3>
                {dashboardData.attendance_history.length > 5 && (
                  <span className="text-xs text-[var(--muted)]">
                    Showing last 5 entries
                  </span>
                )}
              </div>

              <div className="overflow-x-auto -mx-1 px-1 flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--surface2)] rounded-lg">
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider rounded-l-lg">
                        <i className="fas fa-calendar-day mr-2"></i>Date
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        <i className="fas fa-sign-in-alt mr-2"></i>Punch In
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        <i className="fas fa-sign-out-alt mr-2"></i>Punch Out
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider rounded-r-lg">
                        <i className="fas fa-clock mr-2"></i>Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.attendance_history
                      .slice(0, 5)
                      .map((attendance, index) => {
                        const pIn = parsePunchTime(attendance.punch_in);
                        const pOut = parsePunchTime(attendance.punch_out);
                        const hours =
                          pIn &&
                          pOut &&
                          !isNaN(pIn.getTime()) &&
                          !isNaN(pOut.getTime())
                            ? ((pOut - pIn) / (1000 * 60 * 60)).toFixed(1)
                            : null;

                        // Get status badge
                        const getStatusBadge = () => {
                          if (
                            attendance.punch_in &&
                            attendance.punch_out &&
                            attendance.punch_out !== "--"
                          ) {
                            return {
                              text: "Completed",
                              color:
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              icon: "fa-check-circle",
                            };
                          } else if (
                            attendance.punch_in &&
                            (!attendance.punch_out ||
                              attendance.punch_out === "--")
                          ) {
                            return {
                              text: "Incomplete",
                              color:
                                "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                              icon: "fa-hourglass-half",
                            };
                          }
                          return {
                            text: "Absent",
                            color:
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            icon: "fa-times-circle",
                          };
                        };

                        const status = getStatusBadge();
                        const isToday =
                          attendance.log_date ===
                          new Date().toISOString().split("T")[0];

                        return (
                          <tr
                            key={index}
                            className={`border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-all duration-200 group ${
                              isToday ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[var(--text)] font-medium">
                                  {new Date(
                                    attendance.log_date,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: attendance.log_date.includes(
                                      new Date().getFullYear(),
                                    )
                                      ? undefined
                                      : "numeric",
                                  })}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                                    Today
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--muted)] mt-0.5">
                                {new Date(
                                  attendance.log_date,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {attendance.punch_in &&
                              attendance.punch_in !== "--" ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <i className="fas fa-arrow-right text-green-600 dark:text-green-400 text-xs"></i>
                                  </div>
                                  <div>
                                    <div className="text-[var(--text)] font-medium">
                                      {formatPunchTime(attendance.punch_in)}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      AM/PM
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <i className="fas fa-minus text-gray-400 text-xs"></i>
                                  </div>
                                  <span className="text-[var(--muted)]">—</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {attendance.punch_out &&
                              attendance.punch_out !== "--" ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <i className="fas fa-arrow-left text-red-600 dark:text-red-400 text-xs"></i>
                                  </div>
                                  <div>
                                    <div className="text-[var(--text)] font-medium">
                                      {formatPunchTime(attendance.punch_out)}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      AM/PM
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <i className="fas fa-minus text-gray-400 text-xs"></i>
                                  </div>
                                  <span className="text-[var(--muted)]">—</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {hours ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      parseFloat(hours) >= 8
                                        ? "bg-green-100 dark:bg-green-900/30"
                                        : parseFloat(hours) >= 4
                                          ? "bg-blue-100 dark:bg-blue-900/30"
                                          : "bg-yellow-100 dark:bg-yellow-900/30"
                                    }`}
                                  >
                                    <i
                                      className={`fas fa-hourglass-half text-sm ${
                                        parseFloat(hours) >= 8
                                          ? "text-green-600 dark:text-green-400"
                                          : parseFloat(hours) >= 4
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-yellow-600 dark:text-yellow-400"
                                      }`}
                                    ></i>
                                  </div>
                                  <div>
                                    <div className="text-[var(--text)] font-bold">
                                      {hours}
                                      <span className="text-xs font-normal text-[var(--muted)] ml-0.5">
                                        hrs
                                      </span>
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      {parseFloat(hours) >= 8
                                        ? "Full Day"
                                        : parseFloat(hours) >= 4
                                          ? "Half Day"
                                          : "Short Day"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <i
                                      className={`fas ${status.icon} text-gray-400 text-xs`}
                                    ></i>
                                  </div>
                                  <div>
                                    <span
                                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}
                                    >
                                      {status.text}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Footer with summary stats */}
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <div className="flex gap-4 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Incomplete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Absent</span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Punch Out Modal */}
      <PunchOutModal
        isOpen={showPunchOutModal}
        onClose={() => setShowPunchOutModal(false)}
        onSubmit={handlePunchOutSubmit}
        loading={isSubmitting}
      />

      <PendingPunchOutModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onSubmit={handlePendingPunchOut}
        loading={pendingPunchSubmitting}
        pendingDate={pendingPunchDate}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 bg-[var(--surface)] text-[var(--text)] py-3 px-5 rounded-full text-sm font-medium shadow-lg border-l-4 z-50 flex items-center gap-2 animate-slide-up ${
            toast.type === "success" ? "border-green-500" : "border-red-500"
          }`}
        >
          <i
            className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}
          ></i>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
