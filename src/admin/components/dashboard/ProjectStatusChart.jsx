/* eslint-disable no-unused-vars */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ProjectStatusChart = ({ projects = [] }) => {
  // Group projects by status
  const statusMap = {};
  projects.forEach(project => {
    const status = project?.status || 'Unknown';
    if (statusMap[status]) {
      statusMap[status] += 1;
    } else {
      statusMap[status] = 1;
    }
  });

  const data = Object.keys(statusMap).map(key => ({
    name: key,
    value: statusMap[key]
  }));

  const COLORS = {
    'Active': '#10B981',
    'Completed': '#4F46E5',
    'On Hold': '#F59E0B',
    'Cancelled': '#EF4444',
    'Unknown': '#9CA3AF'
  };

  const getColor = (status) => COLORS[status] || '#9CA3AF';

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Status Overview</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No project data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Status Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} projects`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectStatusChart;