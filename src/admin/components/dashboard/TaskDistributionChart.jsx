import React, { useMemo, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

const TaskDistributionChart = ({ tasks }) => {
  const isDark = useIsDarkMode();

  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const priorityCount = { high: 0, medium: 0, low: 0 };

    tasks.forEach((task) => {
      if (task.priority === "high") priorityCount.high++;
      else if (task.priority === "medium") priorityCount.medium++;
      else if (task.priority === "low") priorityCount.low++;
    });

    return [
      { name: "High Priority", value: priorityCount.high },
      { name: "Medium Priority", value: priorityCount.medium },
      { name: "Low Priority", value: priorityCount.low },
    ].filter((item) => item.value > 0);
  }, [tasks]);

  // Priority colors — slightly brighter in dark mode for better pop
  const COLORS = isDark
    ? ["#F87171", "#FBBF24", "#34D399"] // red-400 / amber-400 / emerald-400
    : ["#EF4444", "#F59E0B", "#10B981"]; // red-500 / amber-500 / emerald-500

  // Theme-aware color tokens
  const theme = {
    label: isDark ? "#E5E7EB" : "#374151",           // gray-200 / gray-700
    labelShadow: isDark ? "rgba(0,0,0,0.6)" : "none",
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#F3F4F6" : "#111827",
    legendText: isDark ? "#D1D5DB" : "#374151",
  };

  // Custom label renderer — needed because Recharts ignores fontColor easily
  const renderLabel = ({ name, percent, x, y, textAnchor }) => {
    const pct = (percent * 100).toFixed(0);
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={theme.label}
        fontSize={12}
        fontWeight={500}
      >
        {`${name} ${pct}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Task Priority Distribution
      </h3>
      <div className="h-64 md:h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                innerRadius={isDark ? 45 : 0}   // donut look in dark for elegance
                paddingAngle={2}
                dataKey="value"
                stroke={isDark ? "#1F2937" : "#FFFFFF"}   // gap color between slices
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

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
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No tasks available
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDistributionChart;