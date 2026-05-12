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
import RecentFiles from "../components/dashboard/RecentFiles";
import { fetchDashboard } from "../store/slices/dashboardSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const { stats, charts, recentData, loading } = useSelector(
    (state) => state.dashboard,
  );

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

  const formattedStats = stats && {
    totalEmployees: recentData?.employees?.length || 0,
    punchedInToday: stats.today.punched_in,
    lateArrivals: stats.today.late,
    absentToday: stats.today.absent,
  };

  return (
    <>
      {formattedStats && <WelcomeBanner stats={formattedStats} user={user} />}

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <StatsCard
          title="Total Employees"
          value={formattedStats?.totalEmployees}
          icon="fas fa-users"
          color="green"
        />
        <StatsCard
          title="Punched In Today"
          value={formattedStats?.punchedInToday}
          icon="fas fa-fingerprint"
          color="blue"
        />
        <StatsCard
          title="Late Arrivals"
          value={formattedStats?.lateArrivals}
          icon="fas fa-clock"
          color="amber"
        />
        <StatsCard
          title="Absent Today"
          value={formattedStats?.absentToday}
          icon="fas fa-user-slash"
          color="red"
        />
      </div>

      {/* Charts Grid - 1 column on mobile/tablet, 2 on desktop */}
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <div className="w-full min-w-0 overflow-hidden">
          <AttendanceChart />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <PunchChart />
        </div>
      </div>

      <RecentFiles />
    </>
  );
};

export default Dashboard;
