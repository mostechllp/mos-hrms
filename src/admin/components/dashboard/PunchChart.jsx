import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PunchChart = ({ punchData }) => {
  console.log('PunchChart data:', punchData); // Debug log

  const todayData = punchData?.today || { punched_in: 0, punched_out: 0 };
  const yesterdayData = punchData?.yesterday || { punched_in: 0, punched_out: 0 };

  const chartData = [
    { name: 'Today Punched In', value: todayData.punched_in || 0 },
    { name: 'Today Punched Out', value: todayData.punched_out || 0 },
    { name: 'Yesterday Punched In', value: yesterdayData.punched_in || 0 },
    { name: 'Yesterday Punched Out', value: yesterdayData.punched_out || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Punch Status Comparison
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No punch data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Punch Status Comparison
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PunchChart;