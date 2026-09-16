/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const PriorityDistributionChart = ({ tasks = [] }) => {
  const isDark = useIsDarkMode();

  // Group tasks by priority
  const priorityMap = {};
  tasks.forEach((task) => {
    const priority = task?.priority || "unassigned";
    if (priorityMap[priority]) {
      priorityMap[priority] += 1;
    } else {
      priorityMap[priority] = 1;
    }
  });

  const data = Object.keys(priorityMap).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: priorityMap[key],
  }));

  // Two palettes — brighter tones in dark mode so bars stay vivid on dark bg
  const COLORS = isDark
    ? {
        High: "#F87171",        // red-400
        Medium: "#FBBF24",      // amber-400
        Low: "#34D399",         // emerald-400
        Unassigned: "#9CA3AF",  // gray-400
      }
    : {
        High: "#EF4444",        // red-500
        Medium: "#F59E0B",      // amber-500
        Low: "#10B981",         // emerald-500
        Unassigned: "#9CA3AF",  // gray-400
      };

  const getColor = (name) => COLORS[name] || (isDark ? "#9CA3AF" : "#6B7280");

  // Theme-aware color tokens
  const theme = {
    grid: isDark ? "#374151" : "#E5E7EB",       // gray-700 / gray-200
    axis: isDark ? "#D1D5DB" : "#4B5563",       // gray-300 / gray-600
    cursor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
          Task Priority Distribution
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          No task data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Task Priority Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.grid}
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke={theme.axis}
              tick={{ fill: theme.axis, fontSize: 12 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={{ stroke: theme.grid }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              stroke={theme.axis}
              tick={{ fill: theme.axis, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={{ stroke: theme.grid }}
            />
            <Tooltip
              formatter={(value) => `${value} tasks`}
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
              itemStyle={{ color: theme.tooltipText }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriorityDistributionChart;