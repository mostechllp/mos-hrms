/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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

const ProjectStatusChart = ({ projects = [] }) => {
  const isDark = useIsDarkMode();

  // Group projects by status
  const statusMap = {};
  projects.forEach((project) => {
    const status = project?.status || "Unknown";
    if (statusMap[status]) {
      statusMap[status] += 1;
    } else {
      statusMap[status] = 1;
    }
  });

  const data = Object.keys(statusMap).map((key) => ({
    name: key,
    value: statusMap[key],
  }));

  // Two color palettes — lighter tones for dark mode so they pop against dark bg
  const COLORS = isDark
    ? {
        Active: "#34D399",      // emerald-400
        Completed: "#818CF8",    // indigo-400
        "On Hold": "#FBBF24",    // amber-400
        Cancelled: "#F87171",    // red-400
        Unknown: "#9CA3AF",      // gray-400
      }
    : {
        Active: "#10B981",       // emerald-500
        Completed: "#4F46E5",    // indigo-600
        "On Hold": "#F59E0B",    // amber-500
        Cancelled: "#EF4444",    // red-500
        Unknown: "#9CA3AF",      // gray-400
      };

  const getColor = (status) => COLORS[status] || (isDark ? "#9CA3AF" : "#6B7280");

  // Theme-aware color tokens
  const theme = {
    label: isDark ? "#E5E7EB" : "#374151",           // gray-200 / gray-700
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
    legendText: isDark ? "#D1D5DB" : "#374151",
    sliceGap: isDark ? "#1F2937" : "#FFFFFF",        // matches card bg
  };

  // Custom label renderer — needed because Recharts renders labels as black SVG text by default
  const renderLabel = ({ name, percent, x, y, textAnchor }) => (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill={theme.label}
      fontSize={12}
      fontWeight={500}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
          Project Status Overview
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          No project data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Project Status Overview
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              innerRadius={isDark ? 45 : 0}    // donut in dark for a modern look
              paddingAngle={2}                  // subtle gap between slices
              dataKey="value"
              stroke={theme.sliceGap}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => `${value} projects`}
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectStatusChart;