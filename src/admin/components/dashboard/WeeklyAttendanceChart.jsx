import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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

const WeeklyAttendanceChart = ({ data }) => {
  const isDark = useIsDarkMode();

  // Handle different data structures
  let chartData = [];

  if (data) {
    if (
      data.labels &&
      Array.isArray(data.labels) &&
      data.data &&
      Array.isArray(data.data)
    ) {
      chartData = data.labels.map((label, index) => ({
        day: label,
        attendance: data.data[index] || 0,
      }));
    } else if (Array.isArray(data)) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      chartData = data.map((value, index) => ({
        day: days[index] || `Day ${index + 1}`,
        attendance: value || 0,
      }));
    }
  }

  const hasData = chartData.some((item) => item.attendance > 0);

  if (chartData.length === 0 || !hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Weekly Attendance Overview
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No attendance data available
        </div>
      </div>
    );
  }

  // Theme-aware color tokens
  const theme = {
    grid: isDark ? "#374151" : "#E5E7EB", // gray-700 / gray-200
    axis: isDark ? "#D1D5DB" : "#6B7280", // gray-300 / gray-500
    bar: "#4F46E5", // indigo-600 (works well on both)
    barHover: "#6366F1", // indigo-500
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF", // gray-800 / white
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
    legendText: isDark ? "#D1D5DB" : "#374151",
    cursor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Weekly Attendance Overview
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.grid}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke={theme.axis}
              tick={{ fill: theme.axis, fontSize: 12 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={{ stroke: theme.grid }}
            />
            <YAxis
              stroke={theme.axis}
              tick={{ fill: theme.axis, fontSize: 12 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={{ stroke: theme.grid }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: theme.cursor }}
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
              itemStyle={{ color: theme.bar }}
            />
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
            <Bar
              dataKey="attendance"
              fill={theme.bar}
              name="Present Days"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            >
              {/* Optional: per-bar fill or gradient hooks */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={theme.bar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAttendanceChart;