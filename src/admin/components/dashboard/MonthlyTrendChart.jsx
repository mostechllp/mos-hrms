/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Shared hook — reactively detect if dark mode is on
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

const MonthlyTrendChart = ({ tasks = [] }) => {
  const isDark = useIsDarkMode();

  // Group tasks by month
  const monthMap = {};
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  tasks.forEach((task) => {
    if (task?.created_at) {
      const date = new Date(task.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = monthNames[date.getMonth()] + " " + date.getFullYear();

      if (monthMap[monthKey]) {
        monthMap[monthKey].count += 1;
        const priority = task?.priority || "unassigned";
        if (monthMap[monthKey][priority] !== undefined) {
          monthMap[monthKey][priority] += 1;
        } else {
          monthMap[monthKey][priority] = 1;
        }
      } else {
        monthMap[monthKey] = {
          month: monthName,
          count: 1,
          high: task?.priority === "high" ? 1 : 0,
          medium: task?.priority === "medium" ? 1 : 0,
          low: task?.priority === "low" ? 1 : 0,
          unassigned:
            !task?.priority || task?.priority === "unassigned" ? 1 : 0,
        };
      }
    }
  });

  const data = Object.keys(monthMap)
    .sort()
    .map((key) => monthMap[key]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
          Monthly Task Trend
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          No task data available
        </div>
      </div>
    );
  }

  // Theme-aware color tokens
  const theme = {
    grid: isDark ? "#374151" : "#E5E7EB",         // gray-700 / gray-200
    axis: isDark ? "#D1D5DB" : "#4B5563",         // gray-300 / gray-600
    cursor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
    legendText: isDark ? "#D1D5DB" : "#374151",
    dotStroke: isDark ? "#1F2937" : "#FFFFFF",    // matches card bg
    // Line colors — brighter in dark, standard in light
    total: isDark ? "#818CF8" : "#4F46E5",        // indigo-400 / indigo-600
    high: isDark ? "#F87171" : "#EF4444",         // red-400 / red-500
    medium: isDark ? "#FBBF24" : "#F59E0B",       // amber-400 / amber-500
    low: isDark ? "#34D399" : "#10B981",          // emerald-400 / emerald-500
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Monthly Task Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />

            <XAxis
              dataKey="month"
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
              formatter={(value) => `${value} tasks`}
              cursor={{ stroke: theme.cursor, strokeWidth: 2 }}
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

            {/* Total — thickest line, most prominent */}
            <Line
              type="monotone"
              dataKey="count"
              stroke={theme.total}
              strokeWidth={2.5}
              dot={{ r: 4, fill: theme.total, stroke: theme.dotStroke, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: theme.dotStroke, strokeWidth: 2 }}
              name="Total Tasks"
            />

            {/* Priority lines — thinner, differentiated by color */}
            <Line
              type="monotone"
              dataKey="high"
              stroke={theme.high}
              strokeWidth={2}
              strokeDasharray="0"
              dot={{ r: 3.5, fill: theme.high, stroke: theme.dotStroke, strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: theme.dotStroke, strokeWidth: 2 }}
              name="High Priority"
            />
            <Line
              type="monotone"
              dataKey="medium"
              stroke={theme.medium}
              strokeWidth={2}
              dot={{ r: 3.5, fill: theme.medium, stroke: theme.dotStroke, strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: theme.dotStroke, strokeWidth: 2 }}
              name="Medium Priority"
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke={theme.low}
              strokeWidth={2}
              dot={{ r: 3.5, fill: theme.low, stroke: theme.dotStroke, strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: theme.dotStroke, strokeWidth: 2 }}
              name="Low Priority"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;