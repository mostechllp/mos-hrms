import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
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
import LocationModal from "../components/modals/LocationModal";
import MapView from "../components/common/MapView";

// Register ChartJS components for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

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

  // Location related states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [punchType, setPunchType] = useState("punch-in");
  const [punchOutData, setPunchOutData] = useState(null);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

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

  // Handle location confirmation
  const handleLocationConfirm = async (locationData) => {
    setShowLocationModal(false);
    setIsSubmitting(true);

    if (punchType === "punch-in") {
      console.log("Sending location for punch in:", locationData);
      console.log("Timezone included:", locationData.timezone);
      const result = await dispatch(punchIn({ location: locationData }));
      setIsSubmitting(false);

      if (punchIn.fulfilled.match(result)) {
        showToastMessage(
          "Punched in successfully with location verification!",
          "success",
        );
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
    } else if (punchOutData) {
      const result = await dispatch(
        punchOut({
          ...punchOutData,
          location: locationData,
        }),
      );
      setIsSubmitting(false);

      if (punchOut.fulfilled.match(result)) {
        showToastMessage("Punched out successfully!", "success");
        setShowPunchOutModal(false);
        setPunchOutData(null);

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
        showToastMessage(result.payload || "Punch out failed", "error");
      }
    }
  };

  // Handle Punch In/Out
  const handlePunch = async () => {
    if (!isActuallyPunchedIn) {
      if (!canPunch) {
        showToastMessage("You cannot punch in at this time", "error");
        return;
      }
      setPunchType("punch-in");
      setShowLocationModal(true);
    } else {
      setPunchType("punch-out");
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
    setPunchOutData(data);
    setShowPunchOutModal(false);
    setShowLocationModal(true);
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

  // Helper function to normalize location data from different formats
  const normalizeLocation = (locationData) => {
    if (!locationData) return null;

    if (locationData.latitude && locationData.longitude) {
      return {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        address:
          locationData.address ||
          `${locationData.latitude}, ${locationData.longitude}`,
      };
    }

    if (locationData.punch_in_latitude || locationData.latitude) {
      return {
        latitude: parseFloat(
          locationData.punch_in_latitude || locationData.latitude,
        ),
        longitude: parseFloat(
          locationData.punch_in_longitude || locationData.longitude,
        ),
        address:
          locationData.punch_in_address ||
          locationData.address ||
          "Location recorded",
      };
    }

    return null;
  };

  // Render location info
  const renderLocationInfo = () => {
    const punchInLocation = normalizeLocation(
      todayAttendance.punch_in_location,
    );
    const punchOutLocation = normalizeLocation(
      todayAttendance.punch_out_location,
    );

    if (!punchInLocation && !punchOutLocation) return null;

    const handleShowMap = (location) => {
      setSelectedMapLocation(location);
      setShowLocationHistory(true);
    };

    return (
      <div className="location-info bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-7">
        <h3 className="text-base font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-green-500"></i>
          Today's Punch Locations
        </h3>

        {punchInLocation && (
          <div className="mb-3 pb-3 border-b border-[var(--border)]">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-500">
                  <i className="fas fa-sign-in-alt mr-1"></i> Punch In Location:
                </p>
                <p className="text-sm text-[var(--text)] mt-1">
                  {punchInLocation.address ||
                    `${punchInLocation.latitude}, ${punchInLocation.longitude}`}
                </p>
              </div>
              <button
                onClick={() => handleShowMap(punchInLocation)}
                className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <i className="fas fa-map mr-1"></i> View Map
              </button>
            </div>
          </div>
        )}

        {punchOutLocation && punchOutLocation.latitude && (
          <div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-500">
                  <i className="fas fa-sign-out-alt mr-1"></i> Punch Out
                  Location:
                </p>
                <p className="text-sm text-[var(--text)] mt-1">
                  {punchOutLocation.address ||
                    `${punchOutLocation.latitude}, ${punchOutLocation.longitude}`}
                </p>
              </div>
              <button
                onClick={() => handleShowMap(punchOutLocation)}
                className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <i className="fas fa-map mr-1"></i> View Map
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render map modal
  const renderMapModal = () => {
    if (!showLocationHistory || !selectedMapLocation) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--surface)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-map-marker-alt text-green-500 mr-2"></i>
              Location Map
            </h3>
            <button
              onClick={() => {
                setShowLocationHistory(false);
                setSelectedMapLocation(null);
              }}
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-[var(--text)] mb-3">
              {selectedMapLocation.address ||
                `${selectedMapLocation.latitude}, ${selectedMapLocation.longitude}`}
            </p>
            <MapView
              latitude={parseFloat(selectedMapLocation.latitude)}
              longitude={parseFloat(selectedMapLocation.longitude)}
              address={selectedMapLocation.address}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowLocationHistory(false);
                  setSelectedMapLocation(null);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

  // Prepare chart data from attendance history - Line chart version
  // Prepare chart data from attendance history - Line chart version
  const getChartData = () => {
    if (
      !dashboardData?.attendance_history ||
      dashboardData.attendance_history.length === 0
    ) {
      return {
        labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
          {
            label: "Hours Worked",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: primaryColor || "#2ecc71",
            backgroundColor: primaryColor ? `${primaryColor}20` : "#2ecc7120",
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: primaryColor || "#2ecc71",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      };
    }

    const last7Days = [];
    const hoursWorked = [];

    // Get last 7 days in DD/MM/YYYY format to match API
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      // Format date as DD/MM/YYYY to match API format
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push(dayName);

      const attendance = dashboardData.attendance_history.find(
        (a) => a.log_date === dateStr,
      );

      if (
        attendance &&
        attendance.punch_in &&
        attendance.punch_out &&
        attendance.punch_out !== "--"
      ) {
        let hours = 0;
        if (attendance.working_hours && attendance.working_hours !== "--") {
          const hoursMatch = attendance.working_hours.match(/(\d+)\s*hrs?/);
          const minsMatch = attendance.working_hours.match(/(\d+)\s*mins?/);

          if (hoursMatch) {
            hours = parseInt(hoursMatch[1], 10);
          }
          if (minsMatch) {
            hours += parseInt(minsMatch[1], 10) / 60;
          }
        } else {
          const parseTime = (timeStr) => {
            if (!timeStr || timeStr === "--") return null;
            const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const ampm = match[3].toUpperCase();

              if (ampm === "PM" && hours !== 12) hours += 12;
              if (ampm === "AM" && hours === 12) hours = 0;

              return { hours, minutes };
            }
            return null;
          };

          const punchIn = parseTime(attendance.punch_in);
          const punchOut = parseTime(attendance.punch_out);

          if (punchIn && punchOut) {
            let diffHours = punchOut.hours - punchIn.hours;
            let diffMins = punchOut.minutes - punchIn.minutes;

            if (diffMins < 0) {
              diffHours -= 1;
              diffMins += 60;
            }

            hours = diffHours + diffMins / 60;
          }
        }

        hoursWorked.push(Math.round(hours * 10) / 10);
      } else {
        hoursWorked.push(0);
      }
    }

    // Get the canvas context for gradient (this will work when chart renders)
    const getGradient = (context) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) {
        return primaryColor ? `${primaryColor}80` : "#2ecc7180";
      }
      const gradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top,
      );
      gradient.addColorStop(
        0,
        primaryColor ? `${primaryColor}20` : "#2ecc7120",
      );
      gradient.addColorStop(
        1,
        primaryColor ? `${primaryColor}80` : "#2ecc7180",
      );
      return gradient;
    };

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Hours Worked",
          data: hoursWorked,
          borderColor: primaryColor || "#2ecc71",
          backgroundColor: getGradient,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: primaryColor || "#2ecc71",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          font: {
            size: 11,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#ddd",
        borderColor: primaryColor || "#2ecc71",
        borderWidth: 1,
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
        max: 10,
        grid: {
          color: "rgba(0,0,0,0.05)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Hours",
          font: { size: 11, weight: "bold" },
          color: "#888",
        },
        ticks: {
          stepSize: 2,
          callback: (value) => `${value}h`,
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: "bold" },
          padding: 8,
        },
      },
    },
    elements: {
      line: {
        borderJoin: "round",
      },
      point: {
        hoverRadius: 8,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 5,
        right: 5,
      },
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

      {/* Location Info */}
      {renderLocationInfo()}

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
              {isOnBreak ? "On Break" : statusDisplay.text}
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

      {/* Chart and Recent Activity Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-7">
        {/* Chart Card */}
        <div className="chart-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-base font-semibold text-[var(--text)] mb-5 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-500"></i> My Attendance
            (Last 7 Days)
          </h3>
          <div
            className="chart-container"
            style={{ height: "320px", width: "100%", position: "relative" }}
          >
            <Line ref={chartRef} data={getChartData()} options={chartOptions} />
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
              </div>

              <div className="overflow-x-auto -mx-1 px-1 flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--surface2)] rounded-lg">
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        Punch In
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        Punch Out
                      </th>
                      <th className="text-left py-3 px-4 text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.attendance_history.map(
                      (attendance, index) => {
                        // Parse date from DD/MM/YYYY format
                        const dateParts = attendance.log_date.split("/");
                        const dateObj = new Date(
                          dateParts[2],
                          dateParts[1] - 1,
                          dateParts[0],
                        );

                        // Format date as "MMM DD" (e.g., "Jun 9")
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        );

                        const locationAddress = attendance.punch_in_address;

                        return (
                          <tr
                            key={index}
                            className="border-b border-[var(--border)]"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-[var(--text)] font-medium">
                                  {formattedDate}
                                </div>
                                <div className="text-xs text-[var(--muted)]">
                                  {dateObj.toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {attendance.punch_in &&
                              attendance.punch_in !== "--" ? (
                                <div className="text-[var(--text)] font-medium">
                                  {attendance.punch_in}
                                </div>
                              ) : (
                                <span className="text-[var(--muted)]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {locationAddress && (
                                <div className="text-xs text-[var(--muted)]">
                                  <i className="fas fa-map-marker-alt text-green-500 text-xs mr-1"></i>
                                  {locationAddress.substring(0, 40)}
                                  {locationAddress.length > 40 ? "..." : ""}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {attendance.punch_out &&
                              attendance.punch_out !== "--" ? (
                                <div className="text-[var(--text)] font-medium">
                                  {attendance.punch_out}
                                </div>
                              ) : (
                                <span className="text-[var(--muted)]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {attendance.working_hours !== "--" ? (
                                <div className="text-[var(--text)] font-bold">
                                  {attendance.working_hours}
                                </div>
                              ) : (
                                <span className="text-[var(--muted)]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
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

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setPunchOutData(null);
        }}
        onConfirm={handleLocationConfirm}
        type={punchType}
      />

      <PendingPunchOutModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onSubmit={handlePendingPunchOut}
        loading={pendingPunchSubmitting}
        pendingDate={pendingPunchDate}
      />

      {/* Map Modal */}
      {renderMapModal()}

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
