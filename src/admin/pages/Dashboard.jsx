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
import RecentFiles from "../components/dashboard/RecentFiles";
import { fetchDashboard } from "../store/slices/dashboardSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const { stats, charts, recentData, tasks, weekly_attendance, loading } =
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
    console.log("Dashboard Data:", { stats, charts, tasks, weekly_attendance, recentData });
  }, [stats, charts, tasks, weekly_attendance, recentData]);

  const formattedStats = stats && {
    totalEmployees: recentData?.employees?.length || 0,
    punchedInToday: stats.today.punched_in || 0,
    lateArrivals: stats.today.late || 0,
    absentToday: stats.today.absent || 0,
  };

  // Get weekly attendance from charts
  const weeklyData = charts?.weekly_attendance || null;

  return (
    <div className="dashboard-container p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      {formattedStats && <WelcomeBanner stats={formattedStats} user={user} />}

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
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

      {/* First Row Charts - 2 columns */}
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <div className="w-full min-w-0 overflow-hidden">
          <WeeklyAttendanceChart data={weeklyData} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <PunchChart punchData={charts?.punch_chart} />
        </div>
      </div>

      {/* Second Row Charts - 2 columns */}
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <div className="w-full min-w-0 overflow-hidden">
          <AttendanceStatsChart stats={stats} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <TaskDistributionChart tasks={tasks} />
        </div>
      </div>

      {/* Third Row - Recent Tasks & Files */}
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div className="w-full min-w-0 overflow-hidden">
          <RecentTasksList tasks={tasks} />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <RecentFiles recentData={recentData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;