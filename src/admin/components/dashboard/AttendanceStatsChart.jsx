import React, { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Small helper — reactively detect if dark mode is on
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains("dark"));
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const AttendanceStatsChart = ({ stats }) => {
  const isDark = useIsDarkMode();

  const data = stats
    ? [
        {
          subject: "Present",
          Today: stats.today?.present || 0,
          Yesterday: stats.yesterday?.present || 0,
          fullMark: 20,
        },
        {
          subject: "Absent",
          Today: stats.today?.absent || 0,
          Yesterday: stats.yesterday?.absent || 0,
          fullMark: 20,
        },
        {
          subject: "Late",
          Today: stats.today?.late || 0,
          Yesterday: stats.yesterday?.late || 0,
          fullMark: 20,
        },
        {
          subject: "Punched In",
          Today: stats.today?.punched_in || 0,
          Yesterday: stats.yesterday?.punched_in || 0,
          fullMark: 20,
        },
        {
          subject: "Punched Out",
          Today: stats.today?.punched_out || 0,
          Yesterday: stats.yesterday?.punched_out || 0,
          fullMark: 20,
        },
      ]
    : [];

  const hasData = data.some((item) => item.Today > 0 || item.Yesterday > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Attendance Distribution
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No attendance data available
        </div>
      </div>
    );
  }

  // Theme-aware color tokens
  const theme = {
    grid: isDark ? "#374151" : "#E5E7EB",          // gray-700 / gray-200
    axis: isDark ? "#D1D5DB" : "#4B5563",          // gray-300 / gray-600
    radiusAxis: isDark ? "#6B7280" : "#9CA3AF",    // gray-500 / gray-400
    today: "#6366F1",                              // indigo-500 (brighter)
    todayFill: "#6366F1",
    yesterday: "#10B981",                          // emerald-500
    yesterdayFill: "#10B981",
    todayFillOpacity: isDark ? 0.35 : 0.5,
    yesterdayFillOpacity: isDark ? 0.3 : 0.45,
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
    legendText: isDark ? "#D1D5DB" : "#374151",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Attendance Distribution
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            {/* Grid rings + spokes */}
            <PolarGrid stroke={theme.grid} />

            {/* Category labels around the radar */}
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: theme.axis, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: theme.grid }}
            />

            {/* Numeric radius ticks */}
            <PolarRadiusAxis
              angle={30}
              domain={[0, "auto"]}
              tick={{ fill: theme.radiusAxis, fontSize: 11 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={{ stroke: theme.grid }}
            />

            {/* Tooltip — theme-aware surface */}
            <Tooltip
              contentStyle={{
                backgroundColor: theme.tooltipBg,
                border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: "10px",
                color: theme.tooltipText,
                boxShadow: isDark
                  ? "0 8px 24px rgba(0,0,0,0.5)"
                  : "0 8px 24px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: theme.tooltipText, fontWeight: 600 }}
              itemStyle={{ color: theme.tooltipText }}
            />

            {/* Legend — theme-aware text */}
            <Legend
              wrapperStyle={{
                color: theme.legendText,
                fontSize: "13px",
                paddingTop: "8px",
              }}
              formatter={(value) => (
                <span style={{ color: theme.legendText }}>{value}</span>
              )}
            />

            {/* Today radar */}
            <Radar
              name="Today"
              dataKey="Today"
              stroke={theme.today}
              fill={theme.todayFill}
              fillOpacity={theme.todayFillOpacity}
              strokeWidth={2}
            />

            {/* Yesterday radar */}
            <Radar
              name="Yesterday"
              dataKey="Yesterday"
              stroke={theme.yesterday}
              fill={theme.yesterdayFill}
              fillOpacity={theme.yesterdayFillOpacity}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceStatsChart;