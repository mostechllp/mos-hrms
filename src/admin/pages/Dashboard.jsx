/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../store/slices/employeeSlice";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsCard from "../components/dashboard/StatsCard";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import PunchChart from "../components/dashboard/PunchChart";
import WeeklyAttendanceChart from "../components/dashboard/WeeklyAttendanceChart";
import AttendanceStatsChart from "../components/dashboard/AttendanceStatsChart";
import TaskDistributionChart from "../components/dashboard/TaskDistributionChart";
import RecentTasksList from "../components/dashboard/RecentTasksList";
import DepartmentDistributionChart from "../components/dashboard/DepartmentDistributionChart";
import ProjectStatusChart from "../components/dashboard/ProjectStatusChart";
import PriorityDistributionChart from "../components/dashboard/PriorityDistributionChart";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import { fetchDashboard } from "../store/slices/dashboardSlice";

// ─── COLOR PALETTE ──────────────────────────────────────────────────────
export const COLORS = {
  blue: "#2a78d6",
  aqua: "#1baf7a",
  yellow: "#eda100",
  violet: "#4a3aa7",
  red: "#e34948",
  green: "#008300",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

export const STATUS_COLORS = {
  "On time": "#2a78d6",
  Late: "#eda100",
  Absent: "#e34948",
  WFH: "#1baf7a",
  Leave: "#4a3aa7",
};

export const CHART_COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#e34948",
  "#4a3aa7",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────
const formatTime = (minutes) => {
  if (!minutes || minutes === 0) return "0h";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusBadge = (status) => {
  const statusMap = {
    on_time: { label: "On time", className: "badge-success" },
    "on-time": { label: "On time", className: "badge-success" },
    ontime: { label: "On time", className: "badge-success" },
    late: { label: "Late", className: "badge-warn" },
    absent: { label: "Absent", className: "badge-danger" },
    wfh: { label: "WFH", className: "badge-blue" },
    leave: { label: "Leave", className: "badge-violet" },
  };
  return statusMap[status] || { label: status, className: "badge-gray" };
};

export const formatDateDisplay = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const { stats, charts, recentData, tasks, weekly_attendance, loading, projects } =
    useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [dispatch]);

  // Debug: Log the data to verify it's coming through
  useEffect(() => {
    console.log("Dashboard Data:", { stats, charts, tasks, weekly_attendance, recentData, projects });
  }, [stats, charts, tasks, weekly_attendance, recentData, projects]);

  const formattedStats = stats && {
    totalEmployees: recentData?.employees?.length || 0,
    punchedInToday: stats.today.punched_in || 0,
    lateArrivals: stats.today.late || 0,
    absentToday: stats.today.absent || 0,
  };

  // Get weekly attendance from charts
  const weeklyData = charts?.weekly_attendance || null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ─── WELCOME BANNER ──────────────────────────────────────────────── */}
      {formattedStats && <WelcomeBanner stats={formattedStats} user={user} />}

      {/* ─── ROW 1: Overview (4 cards in a single row) ──────────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-4 mb-2">
        Overview
      </div>
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-0 md:mt-0">
        <StatsCard
          title="Total Employees"
          value={formattedStats?.totalEmployees || 0}
          icon="fas fa-users"
          color="green"
        />
        <StatsCard
          title="Punched In Today"
          value={formattedStats?.punchedInToday || 0}
          icon="fas fa-fingerprint"
          color="blue"
        />
        <StatsCard
          title="Late Arrivals"
          value={formattedStats?.lateArrivals || 0}
          icon="fas fa-clock"
          color="amber"
        />
        <StatsCard
          title="Absent Today"
          value={formattedStats?.absentToday || 0}
          icon="fas fa-user-slash"
          color="red"
        />
      </div>

      {/* ─── ROW 2: Weekly Overview & Punch Activity ────────────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-2">
        Weekly Overview
      </div>
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-0 md:mt-0">
        <div className="w-full min-w-0 overflow-hidden">
          <WeeklyAttendanceChart data={weeklyData} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <PunchChart punchData={charts?.punch_chart} />
        </div>
      </div>

      {/* ─── ROW 3: Attendance Analytics & Task Distribution ────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-2">
        Analytics
      </div>
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-0 md:mt-0">
        <div className="w-full min-w-0 overflow-hidden">
          <AttendanceStatsChart stats={stats} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <TaskDistributionChart tasks={tasks} />
        </div>
      </div>

      {/* ─── ROW 4: Department & Project Status ──────────────────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-2">
        Department & Projects
      </div>
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-0 md:mt-0">
        <div className="w-full min-w-0 overflow-hidden">
          <DepartmentDistributionChart employees={recentData?.employees || []} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <ProjectStatusChart projects={projects || []} />
        </div>
      </div>

      {/* ─── ROW 5: Priority & Monthly Trend ────────────────────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-2">
        Task Insights
      </div>
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-0 md:mt-0">
        <div className="w-full min-w-0 overflow-hidden">
          <PriorityDistributionChart tasks={tasks || []} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <MonthlyTrendChart tasks={tasks || []} />
        </div>
      </div>

      {/* ─── ROW 6: Recent Tasks ──────────────────────────────────────────── */}
      <div className="section-label text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-2">
        Recent Tasks
      </div>
      <div className="mt-0 md:mt-0">
        <RecentTasksList tasks={tasks} />
      </div>
    </div>
  );
};

export default Dashboard;